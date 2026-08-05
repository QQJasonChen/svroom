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

/** "00:12:34" 或 "12:34" → 秒數；解析不出來回 null */
function toSeconds(ts) {
  if (!ts) return null;
  const parts = String(ts).trim().split(":").map(Number);
  if (parts.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

/**
 * 讓「聽原句」直接跳到那一句。
 * 只有 YouTube 支援用網址帶時間碼；Substack 的文章頁沒有這種參數，
 * 硬加只會得到一個沒作用的網址，所以那些維持原樣。
 * 回退 2 秒，免得一點開就已經講到一半。
 */
function withTimestamp(url, ts) {
  if (!url || !/(?:^|\.)youtube\.com|youtu\.be/.test(url)) return { url, seek: false };
  const sec = toSeconds(ts);
  if (sec === null) return { url, seek: false };
  const at = Math.max(0, sec - 2);
  const sep = url.includes("?") ? "&" : "?";
  return { url: `${url}${sep}t=${at}s`, seek: true };
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

// 書面英文層。跟口說層分開的分類法，但共用同一條授權管線與引文預算。
const writingTax = JSON.parse(
  readFileSync(join(ROOT, "data", "writing-taxonomy.json"), "utf8"),
);
const validWriting = new Set(
  writingTax.groups.flatMap((g) => g.functions.map((f) => f.id)),
);
const writingGroupOf = new Map(
  writingTax.groups.flatMap((g) => g.functions.map((f) => [f.id, g.id])),
);
const writingCards = [];

// ===================== PM 知識層 =====================
// 概念卡跟句型卡共用同一個「單一講者引文預算」，否則授權上限會被繞過。
// 差別在於：概念卡的教學價值在 body / how_to_say，引文只是佐證，
// 所以引文超額時只丟掉引文，不丟掉整個概念。
const conceptsTax = JSON.parse(
  readFileSync(join(ROOT, "data", "concepts-taxonomy.json"), "utf8"),
);
const conceptMeta = new Map();
for (const g of conceptsTax.groups) {
  for (const c of g.concepts) conceptMeta.set(c.id, { ...c, group: g.id });
}

const conceptFiles = readdirSync(RAW_DIR)
  .filter((f) => f.startsWith("concepts-") && f.endsWith(".json"))
  .sort();

const concepts = [];
const conceptIssues = [];
const seenConcept = new Set();

for (const file of conceptFiles) {
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
    const meta = conceptMeta.get(raw.id);
    if (!meta) {
      conceptIssues.push(`${file}: 未知概念 id「${raw.id}」`);
      continue;
    }
    if (seenConcept.has(raw.id)) {
      conceptIssues.push(`${file}: 概念「${raw.id}」重複`);
      continue;
    }
    if (!raw.body || !raw.one_liner) {
      conceptIssues.push(`${file}: 概念「${raw.id}」缺 body 或 one_liner`);
      continue;
    }

    const howToSay = (Array.isArray(raw.how_to_say) ? raw.how_to_say : [])
      .filter((h) => h && h.en && h.zh)
      .slice(0, 4);
    if (howToSay.length === 0) {
      conceptIssues.push(`${file}: 概念「${raw.id}」沒有可用的 how_to_say`);
    }

    // 引文的授權檢查——過不了就只捨棄引文
    let quote = null;
    if (raw.quote && raw.guest && raw.source_file) {
      const qw = wordCount(raw.quote);
      const used = guestWords.get(raw.guest) || 0;
      if (qw > MAX_QUOTE_WORDS) {
        conceptIssues.push(`${file}:「${raw.id}」引文 ${qw} 字超標，已移除引文`);
      } else if (used + qw > MAX_WORDS_PER_GUEST) {
        conceptIssues.push(
          `${file}:「${raw.id}」講者 ${raw.guest} 引文預算已滿，已移除引文`,
        );
      } else {
        guestWords.set(raw.guest, used + qw);
        const src = sourceByFile.get(raw.source_file);
        quote = {
          text: raw.quote.trim(),
          guest: raw.guest.trim(),
          timestamp: raw.timestamp || null,
          episode: src?.episode || null,
          ...withTimestamp(src?.url || null, raw.timestamp),
        };
      }
    }

    seenConcept.add(raw.id);
    concepts.push({
      id: raw.id,
      group: meta.group,
      term: meta.term,
      zh: meta.zh,
      oneLiner: raw.one_liner.trim(),
      body: raw.body.trim(),
      pitfall: raw.pitfall ? raw.pitfall.trim() : null,
      howToSay,
      quote,
      relatedFunctions: (Array.isArray(raw.related_functions)
        ? raw.related_functions
        : []
      )
        .filter((f) => validFunctions.has(f))
        .slice(0, 4),
    });
  }
}

if (conceptFiles.length > 0) {
  const total = conceptMeta.size;
  const missing = [...conceptMeta.keys()].filter((id) => !seenConcept.has(id));
  console.log(
    `\n✓ PM 知識層：${concepts.length}/${total} 個概念，${concepts.filter((c) => c.quote).length} 個有原文佐證`,
  );
  if (missing.length) {
    console.log(`⚠ 還沒內容的概念（${missing.length}）：${missing.join(", ")}`);
  }
  if (conceptIssues.length) {
    console.log(`⚠ 概念層問題 ${conceptIssues.length} 筆：`);
    for (const m of conceptIssues.slice(0, 10)) console.log(`  ${m}`);
    if (conceptIssues.length > 10) console.log(`  …另 ${conceptIssues.length - 10} 筆`);
  }
}

writeFileSync(
  join(ROOT, "data", "concepts.json"),
  JSON.stringify({ count: concepts.length, concepts }, null, 2) + "\n",
);


/**
 * 收一批卡片。口說層與書面層共用這條管線——同一套必填檢查、同一套
 * 授權上限、同一個講者引文預算。差別只在合法的 function 集合與輸出陣列。
 */
function ingest({ fileList, validSet, groupMap, out, label }) {
  for (const file of fileList) {
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
      const reject = (reason) =>
        rejected.push({ file, reason, quote: raw.quote, label });

      // --- 必填欄位 ---
      if (!raw.function || !raw.quote || !raw.zh || !raw.why || !raw.guest) {
        reject("缺少必填欄位");
        continue;
      }

      // --- 分類必須存在 ---
      if (!validSet.has(raw.function)) {
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

      // --- 去重（跨層共用，避免同一句在兩層各出現一次）---
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

      const src = sourceByFile.get(raw.source_file);

      out.push({
        id: `${raw.function}-${slug(raw.guest)}-${out.length}`,
        fn: raw.function,
        group: groupMap.get(raw.function),
        pattern: raw.pattern || null,
        quote: raw.quote.trim(),
        zh: raw.zh.trim(),
        why: raw.why.trim(),
        register: ["spoken-casual", "spoken-formal", "written"].includes(raw.register)
          ? raw.register
          : label === "writing"
            ? "written"
            : "spoken-casual",
        difficulty: [1, 2, 3].includes(raw.difficulty) ? raw.difficulty : 2,
        swaps: Array.isArray(raw.swaps) ? raw.swaps.filter(Boolean).slice(0, 4) : [],
        pmNote: raw.pm_note && raw.pm_note !== "null" ? raw.pm_note : null,
        guest: raw.guest.trim(),
        timestamp: raw.timestamp || null,
        // 導流回原始出處，這是授權的禮貌也是內容誠信。
        // 集數標題一定有，連結不一定——沒有連結也不能沒有出處。
        episode: src?.episode || null,
        ...withTimestamp(src?.url || null, raw.timestamp),
      });
    }
  }
}

ingest({
  fileList: files,
  validSet: validFunctions,
  groupMap: groupOf,
  out: cards,
  label: "spoken",
});

const writingFiles = readdirSync(RAW_DIR)
  .filter((f) => f.startsWith("writing-") && f.endsWith(".json"))
  .sort();

ingest({
  fileList: writingFiles,
  validSet: validWriting,
  groupMap: writingGroupOf,
  out: writingCards,
  label: "writing",
});

writeFileSync(
  join(ROOT, "data", "writing.json"),
  JSON.stringify({ count: writingCards.length, cards: writingCards }, null, 2) + "\n",
);

if (writingFiles.length > 0) {
  const covered = new Set(writingCards.map((c) => c.fn));
  console.log(
    `\n✓ 書面英文層：${writingCards.length} 張卡，涵蓋 ${covered.size}/${validWriting.size} 個功能`,
  );
  const missing = [...validWriting].filter((f) => !covered.has(f));
  if (missing.length) console.log(`⚠ 還沒卡片的書面功能：${missing.join(", ")}`);
} else {
  console.log("\n⚠ 還沒有書面英文語料（data/raw/writing-*.json）");
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
