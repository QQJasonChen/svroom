#!/usr/bin/env node
/**
 * 原聲片段索引（playphrase 模式的 podcast 版）。
 *
 * 想法來自 dutch-playphrase：搜一個說法 → 連續播放母語者親口講它的片段。
 * 差別在於荷蘭版搜的是 YouTube 公開字幕，這裡搜的是付費私有語料，
 * 所以做法必須不同：
 *
 *   我們**不做通用全文搜尋、也不散布逐字稿**。
 *   查詢集是已經挖出來的句型（cards / writing 的 pattern 與 swaps），
 *   索引只存「這個句型在哪一集、第幾秒、誰講的」＋那一句本身。
 *   真正的內容由 YouTube 自己的播放器播出，不經過我們。
 *
 * 授權上沿用同一條線：**任何一部作品貢獻的字數都不超過它的 4%**，
 * 而且是跟卡片層共用同一個額度（讀 data/cards.json 已用掉的量）。
 *
 * 逐字稿只有講者段落的時間碼（中位數間隔 20 秒），所以單句時間用
 * 「字數位置在段落中的比例」內插推算，再回退 2 秒當前導。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARCHIVE =
  process.env.LENNY_ARCHIVE ||
  join(ROOT, "..", "lennys-newsletterpodcastdata-all");
const PODCASTS = join(ARCHIVE, "podcasts");

const SOURCE_QUOTA_RATIO = 0.04;
const SOURCE_QUOTA_MAX = 600;
const MAX_HITS_PER_PHRASE = 14;
const MIN_PHRASE_WORDS = 4;
const MAX_PHRASE_WORDS = 7;
const MIN_LINE_WORDS = 5;
const MAX_LINE_WORDS = 45;
const LEAD_IN_SECONDS = 2;

if (!existsSync(PODCASTS)) {
  console.error(`✗ 找不到語料 ${PODCASTS}——跳過原聲片段索引。`);
  writeFileSync(
    join(ROOT, "data", "clips.json"),
    JSON.stringify({ count: 0, phrases: [] }, null, 2) + "\n",
  );
  process.exit(0);
}

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const words = (s) => s.split(/\s+/).filter(Boolean);

// ---------- 1. 查詢集：從已挖出的句型抽出可搜尋的固定片語 ----------
const cardFiles = ["cards.json", "writing.json"]
  .map((f) => join(ROOT, "data", f))
  .filter(existsSync);

const phraseSet = new Map(); // normalized phrase -> { display, fns:Set }

// 有教學價值的不是「通用字串」而是**帶立場的語塊**：說話者用它來標記
// 自己的態度、把話軟化、或宣告接下來要做什麼。特徵是「人稱＋心理/言說動詞」，
// 或是一組已知的語篇標記。純功能詞組合（a lot of、what is the）沒有價值。
const PRONOUNS = new Set("i we you me us my our your".split(" "));
const STANCE = new Set(
  ("think thought say saying said mean means know knew guess feel felt want wanted " +
    "push pushing frame framing see seeing wonder argue believe agree disagree love hate " +
    "admit suspect assume worry care bet suppose tend try trying like " +
    "hear heard talk talked ask asked tell told remember realize realized " +
    "look looking go going come coming keep kept start started end ended " +
    "recommend suggest imagine expect hope wish learn learned notice figure " +
    "call called describe put putting made make making took take taking").split(" "),
);
const MARKERS = [
  "don't get me wrong", "to be clear", "that said", "having said that",
  "the way i", "what i'd", "what i would", "my sense is", "if anything",
  "the thing is", "here's the thing", "i'd argue", "i'd push", "the reality is",
  "to be fair", "for what it's worth", "the honest answer", "i'll caveat",
  "one thing i", "the way we", "what we found", "it turns out",
  "the question is", "what happens is", "the answer is", "in my experience",
  "at the end of the day", "the short answer", "the long answer",
  "let me give you", "let me start", "i'll give you", "here's what",
  "the point is", "the problem is", "the challenge is", "the trick is",
  "you have to", "you need to", "you've got to", "we ended up",
];

const isStanceChunk = (w) => {
  if (w.some((x) => /\d/.test(x))) return false;
  const s = w.join(" ");
  if (MARKERS.some((m) => s.startsWith(m) || s.includes(m))) return true;
  return w.some((x) => PRONOUNS.has(x)) && w.some((x) => STANCE.has(x));
};

function register(text, fn) {
  const w = words(norm(text));
  // 統一的品質閘門：不論來自句型片段還是引文挖掘，都必須是「帶立場的語塊」。
  // 沒有這道關卡，[X] 切出來的碎片（is a lot of、this is the）會灌爆查詢集。
  if (w.length < MIN_PHRASE_WORDS || !isStanceChunk(w)) return;
  const use = w.slice(0, MAX_PHRASE_WORDS).join(" ");
  if (!phraseSet.has(use)) {
    phraseSet.set(use, {
      display: text
        .trim()
        .replace(/^[\s,.;:!?"'“”‘’—-]+/, "")
        .replace(/[\s,;:"'“”‘’—-]+$/, ""),
      fns: new Set(),
    });
  }
  if (fn) phraseSet.get(use).fns.add(fn);
}

/** 句型骨架裡 [X] 之間的每一段固定文字都可以拿來搜，不只第一段 */
function addPhrase(raw, fn) {
  if (!raw) return;
  for (const seg of raw.split(/\[[^\]]*\]/)) register(seg, fn);
}

// 從引文本身挖「重複出現」的功能片語——這些是真正被反覆使用的骨架，
// 比單張卡的句型更能代表語料庫的說話方式。
const ngramCount = new Map();
const ngramSample = new Map();

for (const f of cardFiles) {
  const data = JSON.parse(readFileSync(f, "utf8"));
  for (const c of data.cards ?? []) {
    addPhrase(c.pattern, c.fn);
    for (const s of c.swaps ?? []) addPhrase(s, c.fn);

    const nw = words(norm(c.quote));
    for (let len = 4; len <= 6; len++) {
      for (let i = 0; i + len <= nw.length; i++) {
        const g = nw.slice(i, i + len);
        if (!isStanceChunk(g)) continue;
        const key = g.join(" ");
        ngramCount.set(key, (ngramCount.get(key) || 0) + 1);
        if (!ngramSample.has(key)) ngramSample.set(key, c.fn);
      }
    }
  }
}

let mined = 0;
for (const [g, n] of ngramCount) {
  // 要有兩張以上不同的卡都用到，才算「反覆使用的骨架」而非一次性說法
  if (n < 2) continue;
  if (!phraseSet.has(g)) mined++;
  register(g, ngramSample.get(g));
}
console.log(`  其中 ${mined} 個是從引文挖出的高頻功能片語`);

console.log(`  查詢集：${phraseSet.size} 個可搜尋片語（來自句型與替代說法）`);

// 用前三個字當索引鍵，掃語料時才不必對每個片語都做一次比對
const byPrefix = new Map();
for (const p of phraseSet.keys()) {
  const key = words(p).slice(0, MIN_PHRASE_WORDS).join(" ");
  if (!byPrefix.has(key)) byPrefix.set(key, []);
  byPrefix.get(key).push(p);
}

// ---------- 2. 來源索引與剩餘額度 ----------
const index = JSON.parse(readFileSync(join(ARCHIVE, "index.json"), "utf8"));
const meta = new Map();
for (const it of index.podcasts ?? []) {
  const name = it.filename.split("/").pop();
  const url = it.post_url || it.youtube_url || null;
  const vid =
    url && /youtube\.com|youtu\.be/.test(url) && !/\s/.test(url)
      ? (url.match(/[?&]v=([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/) || [])[1]
      : null;
  meta.set(name, {
    vid,
    title: it.title || null,
    guest: it.guest || null,
    quota: Math.min(SOURCE_QUOTA_MAX, Math.round((it.word_count || 0) * SOURCE_QUOTA_RATIO)),
  });
}

// 卡片層已經用掉的額度要扣掉——兩個功能共用同一條 4% 線
const used = new Map();
for (const f of cardFiles) {
  const data = JSON.parse(readFileSync(f, "utf8"));
  for (const c of data.cards ?? []) {
    if (!c.episode) continue;
    for (const [name, m] of meta) {
      if (m.title === c.episode) {
        used.set(name, (used.get(name) || 0) + words(c.quote).length);
        break;
      }
    }
  }
}

// ---------- 3. 掃語料 ----------
const TURN_RE = /\*\*([^*]+)\*\* \((\d+):(\d+):(\d+)\):\s*\n?/g;
const hits = new Map(); // phrase -> [{ep, t, sp, line}]
let scanned = 0;

for (const file of readdirSync(PODCASTS).filter((f) => f.endsWith(".md")).sort()) {
  const m = meta.get(file);
  if (!m?.vid) continue; // 沒有可用影片就沒有「原聲」可播，不必索引
  if ((used.get(file) || 0) >= m.quota) continue;

  const text = readFileSync(join(PODCASTS, file), "utf8");
  const turns = [];
  let match;
  TURN_RE.lastIndex = 0;
  while ((match = TURN_RE.exec(text))) {
    turns.push({
      speaker: match[1].trim(),
      start: +match[2] * 3600 + +match[3] * 60 + +match[4],
      from: TURN_RE.lastIndex,
    });
  }
  for (let i = 0; i < turns.length; i++) {
    turns[i].body = text.slice(turns[i].from, turns[i + 1]?.from ?? text.length);
    turns[i].end = turns[i + 1]?.start ?? turns[i].start + 30;
  }
  scanned++;

  for (const turn of turns) {
    const dur = Math.max(1, turn.end - turn.start);
    // 一個段落拆成句子，逐句判斷是否命中查詢集
    const sentences = turn.body
      .replace(/\*\*[^*]+\*\*/g, " ")
      .split(/(?<=[.!?])\s+/);
    let wordCursor = 0;
    const turnWords = words(turn.body).length || 1;

    for (const sentence of sentences) {
      const sw = words(sentence);
      const at = wordCursor;
      wordCursor += sw.length;
      if (sw.length < MIN_LINE_WORDS || sw.length > MAX_LINE_WORDS) continue;

      const n = norm(sentence);
      const nw = words(n);
      let matched = null;
      for (let i = 0; i + MIN_PHRASE_WORDS <= nw.length; i++) {
        const key = nw.slice(i, i + MIN_PHRASE_WORDS).join(" ");
        const cands = byPrefix.get(key);
        if (!cands) continue;
        for (const p of cands) {
          if (n.includes(p)) {
            matched = p;
            break;
          }
        }
        if (matched) break;
      }
      if (!matched) continue;

      const list = hits.get(matched) ?? [];
      if (list.length >= MAX_HITS_PER_PHRASE) continue;

      const spent = used.get(file) || 0;
      if (spent + sw.length > m.quota) continue;
      used.set(file, spent + sw.length);

      // 段落只有一個時間碼，用「這句在段落裡的字數位置」內插推算
      const t = Math.max(
        0,
        Math.round(turn.start + (at / turnWords) * dur) - LEAD_IN_SECONDS,
      );

      list.push({
        v: m.vid,
        t,
        sp: turn.speaker,
        ep: m.title,
        line: sentence.trim().replace(/\s+/g, " "),
      });
      hits.set(matched, list);
    }
  }
}

// ---------- 4. 輸出 ----------
const phrases = [...hits.entries()]
  .filter(([, list]) => list.length >= 2) // 只出現一次的沒有「聽很多人講」的價值
  .map(([p, list]) => ({
    p,
    display: phraseSet.get(p).display,
    fns: [...phraseSet.get(p).fns],
    hits: list,
  }))
  .sort((a, b) => b.hits.length - a.hits.length);

const totalClips = phrases.reduce((n, p) => n + p.hits.length, 0);
const totalWords = phrases.reduce(
  (n, p) => n + p.hits.reduce((m, h) => m + words(h.line).length, 0),
  0,
);

writeFileSync(
  join(ROOT, "data", "clips.json"),
  JSON.stringify({ count: totalClips, phrases }, null, 2) + "\n",
);

console.log(
  `✓ 原聲片段：${totalClips} 個片段、${phrases.length} 個說法（掃了 ${scanned} 集）`,
);
console.log(
  `  片段字數 ${totalWords}，單集最多用掉 ${Math.max(0, ...used.values())} 字`,
);
const over = [...used.entries()].filter(([f, w]) => w > (meta.get(f)?.quota ?? 0));
if (over.length) {
  console.error(`✗ 有 ${over.length} 集超出 4% 額度，這是 bug`);
  process.exitCode = 1;
}
