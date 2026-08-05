#!/usr/bin/env node
/**
 * 把 data/raw/batch-*.json 合併成 data/cards.json。
 *
 * 這支腳本同時是**授權防護網**：Lenny 的語料是付費訂閱內容，
 * 條款禁止「散布原始內容或其中相當大的部分」。所以這裡硬性檢查：
 *   1. 每則引文 ≤ MAX_QUOTE_WORDS 個英文字
 *   2. 每位講者累計引文 ≤ MAX_WORDS_PER_GUEST 個字
 *   3. 每則引文必須有出處（guest + source_file）
 * 違反的卡片直接砍掉並報告，不進 build。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW_DIR = join(ROOT, "data", "raw");
const OUT = join(ROOT, "data", "cards.json");

const MAX_QUOTE_WORDS = 60;
const MAX_WORDS_PER_GUEST = 500;

const functionsFile = JSON.parse(
  readFileSync(join(ROOT, "data", "functions.json"), "utf8"),
);
const validFunctions = new Set(
  functionsFile.groups.flatMap((g) => g.functions.map((f) => f.id)),
);
const groupOf = new Map(
  functionsFile.groups.flatMap((g) => g.functions.map((f) => [f.id, g.id])),
);

// 出處連結必須是真的能點開的網址，不能用檔名硬猜。
// 從語料庫的 index.json 讀真實 post_url；讀不到就讓卡片沒有連結，
// 而不是給一個 404——標錯出處比沒有連結更糟。
const ARCHIVE =
  process.env.LENNY_ARCHIVE ||
  join(ROOT, "..", "lennys-newsletterpodcastdata-all");

const sourceByFile = new Map();
try {
  const idx = JSON.parse(readFileSync(join(ARCHIVE, "index.json"), "utf8"));
  for (const item of [...(idx.podcasts || []), ...(idx.newsletters || [])]) {
    if (!item.filename) continue;
    // 索引裡多數 podcast 沒有 post_url、只有 youtube_url，而其中 38 筆的
    // 影片 id 含空白（髒資料）。壞網址一律丟掉——寧可沒連結也不要 404。
    const candidate = item.post_url || item.youtube_url || null;
    const url = candidate && !/\s/.test(candidate) ? candidate : null;
    sourceByFile.set(item.filename.replace(/^(podcasts|newsletters)\//, ""), {
      url,
      episode: item.title || null,
    });
  }
  const withUrl = [...sourceByFile.values()].filter((s) => s.url).length;
  console.log(
    `  出處索引：${sourceByFile.size} 集，其中 ${withUrl} 集有可用連結`,
  );
} catch {
  console.warn(
    `⚠ 讀不到語料索引（${ARCHIVE}/index.json），卡片會缺少集數標題與連結。\n` +
      `  設 LENNY_ARCHIVE 環境變數指到 archive 目錄可修正。`,
  );
}

const wordCount = (s) => (s || "").trim().split(/\s+/).filter(Boolean).length;

const slug = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

if (!existsSync(RAW_DIR)) {
  console.error(`✗ 找不到 ${RAW_DIR}——語料還沒採集。`);
  process.exit(1);
}

const files = readdirSync(RAW_DIR)
  .filter((f) => f.startsWith("batch-") && f.endsWith(".json"))
  .sort();

if (files.length === 0) {
  console.error("✗ data/raw/ 裡沒有 batch-*.json");
  process.exit(1);
}

const rejected = [];
const seenQuote = new Set();
const seenPattern = new Set();
const guestWords = new Map();
const cards = [];

for (const file of files) {
  let batch;
  try {
    batch = JSON.parse(readFileSync(join(RAW_DIR, file), "utf8"));
  } catch (e) {
    console.error(`✗ ${file} 不是合法 JSON：${e.message}`);
    process.exitCode = 1;
    continue;
  }
  if (!Array.isArray(batch)) {
    console.error(`✗ ${file} 最外層不是陣列，跳過`);
    process.exitCode = 1;
    continue;
  }

  for (const raw of batch) {
    const reject = (reason) => rejected.push({ file, reason, quote: raw.quote });

    // --- 必填欄位 ---
    for (const field of ["function", "quote", "zh", "why", "guest"]) {
      if (!raw[field] || typeof raw[field] !== "string" || !raw[field].trim()) {
        reject(`缺少必填欄位 ${field}`);
        continue;
      }
    }
    if (!raw.function || !raw.quote || !raw.zh || !raw.why || !raw.guest) continue;

    // --- 分類必須存在 ---
    if (!validFunctions.has(raw.function)) {
      reject(`未知的 function：${raw.function}`);
      continue;
    }

    // --- 授權防護：單則引文長度 ---
    const qw = wordCount(raw.quote);
    if (qw > MAX_QUOTE_WORDS) {
      reject(`引文 ${qw} 字，超過上限 ${MAX_QUOTE_WORDS}`);
      continue;
    }

    // --- 授權防護：出處必須完整 ---
    if (!raw.source_file) {
      reject("沒有 source_file，無法標出處");
      continue;
    }

    // --- 去重 ---
    const qKey = raw.quote.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seenQuote.has(qKey)) {
      reject("重複引文");
      continue;
    }
    const pKey = `${raw.function}::${(raw.pattern || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}`;
    if (raw.pattern && seenPattern.has(pKey)) {
      reject(`同一 function 下重複句型：${raw.pattern}`);
      continue;
    }

    // --- 授權防護：單一講者累計引文量 ---
    const used = guestWords.get(raw.guest) || 0;
    if (used + qw > MAX_WORDS_PER_GUEST) {
      reject(`講者 ${raw.guest} 引文累計超過 ${MAX_WORDS_PER_GUEST} 字`);
      continue;
    }
    guestWords.set(raw.guest, used + qw);

    seenQuote.add(qKey);
    if (raw.pattern) seenPattern.add(pKey);

    const id = `${raw.function}-${slug(raw.guest)}-${cards.length}`;

    cards.push({
      id,
      fn: raw.function,
      group: groupOf.get(raw.function),
      pattern: raw.pattern || null,
      quote: raw.quote.trim(),
      zh: raw.zh.trim(),
      why: raw.why.trim(),
      register: ["spoken-casual", "spoken-formal", "written"].includes(raw.register)
        ? raw.register
        : "spoken-casual",
      difficulty: [1, 2, 3].includes(raw.difficulty) ? raw.difficulty : 2,
      swaps: Array.isArray(raw.swaps) ? raw.swaps.filter(Boolean).slice(0, 4) : [],
      pmNote: raw.pm_note && raw.pm_note !== "null" ? raw.pm_note : null,
      guest: raw.guest.trim(),
      timestamp: raw.timestamp || null,
      // 導流回原始出處，這是授權的禮貌也是內容誠信。
      // 集數標題一定有，連結不一定——沒有連結也不能沒有出處。
      episode: sourceByFile.get(raw.source_file)?.episode || null,
      url: sourceByFile.get(raw.source_file)?.url || null,
    });
  }
}

// --- 統計 ---
const byFn = new Map();
for (const c of cards) byFn.set(c.fn, (byFn.get(c.fn) || 0) + 1);

const payload = {
  generated_at: new Date().toISOString(),
  count: cards.length,
  cards,
};

writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");

console.log(`✓ 合併 ${files.length} 個批次 → ${cards.length} 張卡`);
console.log(`  引文總字數：${[...guestWords.values()].reduce((a, b) => a + b, 0)}（來自 ${guestWords.size} 位講者）`);

const missing = [...validFunctions].filter((f) => !byFn.has(f));
if (missing.length) {
  console.log(`\n⚠ 還沒有卡片的 function（${missing.length} 個）：`);
  console.log(`  ${missing.join(", ")}`);
}

const thin = [...byFn.entries()].filter(([, n]) => n < 5).sort((a, b) => a[1] - b[1]);
if (thin.length) {
  console.log(`\n⚠ 卡片數 <5 的 function：`);
  for (const [fn, n] of thin) console.log(`  ${fn}: ${n}`);
}

if (rejected.length) {
  console.log(`\n✗ 剔除 ${rejected.length} 張：`);
  const byReason = new Map();
  for (const r of rejected) {
    const key = r.reason.replace(/：.*/, "");
    byReason.set(key, (byReason.get(key) || 0) + 1);
  }
  for (const [reason, n] of [...byReason.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason}: ${n}`);
  }
}

if (cards.length === 0) {
  console.error("\n✗ 一張卡都沒有，build 中止");
  process.exit(1);
}
