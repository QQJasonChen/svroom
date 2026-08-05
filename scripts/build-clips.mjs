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
const MAX_HITS_PER_PHRASE = 8;
// 可教的語塊是「中等頻率」的：don't get me wrong 在 311 集裡出現幾十次，
// 而 i think if you 出現幾百次。出現太頻繁的不是語塊，是任意切出來的碎片
// ——正好是最沒有教學價值的那些。所以設頻率上限把它們濾掉。
const MAX_TRUE_OCCURRENCES = 60;
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

// 一個說法要能「拿來起頭」。開頭是接續詞的（is that i think、say what do you）
// 是從句子中間切出來的碎片，不是可以教的語塊。
const BAD_OPENERS = new Set(
  ("is are was were be been am do does did that which who whom whose and or so " +
    "than then say says said of as at on for with about into from by very much " +
    "just really actually kind sort thing things way ways lot bit more most").split(" "),
);

const isStanceChunk = (w) => {
  if (w.some((x) => /\d/.test(x))) return false;
  const s = w.join(" ");
  if (MARKERS.some((m) => s.startsWith(m))) return true;
  if (BAD_OPENERS.has(w[0])) return false;
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

/**
 * 只收句型的**開頭**那一段。
 * [X] 中間切出來的碎片（is a lot of、what you just said）不是可以拿來
 * 起頭的說法，收進來只會灌爆查詢集。
 */
function addPhrase(raw, fn) {
  if (!raw) return;
  register(raw.split(/\[/)[0], fn);
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
  // 要有兩張以上不同的卡都用到，才算「反覆使用的骨架」。
  if (n < 2) continue;
  if (!phraseSet.has(g)) mined++;
  register(g, ngramSample.get(g));
}
console.log(`  其中 ${mined} 個是從引文挖出的高頻功能片語`);


// ---------- 說法的分門別類 ----------
// 學的人不會想「我要學一個高頻語塊」，他會想「我現在要同意／要反對／要追問」。
// 所以分類用的是**當下的意圖**。
//
// 這份清單同時做兩件事：
//   1. seeds 直接進查詢集去語料裡撈——分類自己負責把該類的說法找出來
//   2. 配不上任何一類的說法一律丟掉——分類同時是品質過濾器
// 沒有第 2 點的話，會混進 "it and i think"、"yeah i mean i" 這種切碎的殘渣。
const CATEGORIES = [
  {
    id: "agree",
    zh: "表示同意",
    blurb: "附和不是只有 I agree。同意的力道有很多層。",
    seeds: [
      "i completely agree with", "i totally agree", "i think that's right",
      "that's exactly right", "that makes a lot of sense", "you're absolutely right",
      "i couldn't agree more", "that's a great point", "i'm with you on",
      "yes and i would", "the answer is yes", "i love that",
    ],
  },
  {
    id: "disagree",
    zh: "表示反對或保留",
    blurb: "英文的反對幾乎都先給一個緩衝，才敢下重話。",
    seeds: [
      "don't get me wrong", "i don't think that", "i would push back",
      "i'd push back on", "i'm not sure i", "i don't want to say",
      "i have a different", "the answer is no", "i disagree with",
      "i'm not convinced that", "that's not how i", "i wouldn't go that far",
      "i take issue with", "where i'd differ is",
    ],
  },
  {
    id: "opinion",
    zh: "提出看法",
    blurb: "把主張端出來，而且讓它聽起來像分析不是喜好。",
    seeds: [
      "the way i think about", "what i would say", "the way i see it",
      "my sense is that", "i would argue that", "here's how i think",
      "the way i'd frame", "i think we should", "if i had to",
      "my view on this", "what i keep coming", "the thing i'd say",
    ],
  },
  {
    id: "ask",
    zh: "提問與追問",
    blurb: "問對問題比給對答案更能改變一場會議。",
    seeds: [
      "can you tell me", "how do you know", "what do you mean",
      "why do you think", "help me understand", "what would have to",
      "the question is how", "what are we trying", "how are you measuring",
      "what would you do", "can you say more", "walk me through",
      "what's the thing that", "how did you get",
    ],
  },
  {
    id: "clarify",
    zh: "澄清與確認",
    blurb: "沒聽懂的時候，怎麼問才不顯得沒跟上。",
    seeds: [
      "what i'm hearing is", "just to make sure", "let me know if",
      "if i understand correctly", "just to be clear", "so what you're saying",
      "let me play that", "i want to make sure", "am i right that",
      "let me see if", "to put it another",
    ],
  },
  {
    id: "setup",
    zh: "鋪陳與舉例",
    blurb: "在講重點之前，先幫聽的人擺好位置。",
    seeds: [
      "let me tell you", "i'll give you a", "here's a good example",
      "the way it works", "at the end of the day", "when we talk about",
      "when i talk to", "let me give you", "so the story is",
      "the best example of", "think about it this",
    ],
  },
  {
    id: "hedge",
    zh: "承認不確定",
    blurb: "承認不知道是資深的訊號，但要會講。",
    seeds: [
      "i don't know if", "i could be wrong", "i'm not an expert",
      "my guess is that", "i know this is", "i don't have the",
      "i haven't figured out", "this is just my", "take this with a",
      "i want to caveat", "i'm speculating here", "i genuinely don't know",
    ],
  },
];

const catOf = new Map();
for (const c of CATEGORIES) {
  for (const seed of c.seeds) {
    const key = words(norm(seed)).slice(0, MAX_PHRASE_WORDS).join(" ");
    if (!catOf.has(key)) catOf.set(key, c.id);
    // 種子直接進查詢集，讓分類自己去語料裡撈
    if (!phraseSet.has(key)) {
      phraseSet.set(key, { display: seed, fns: new Set() });
    }
  }
}

/** 一個說法屬於哪一類；配不上就回 null（會被丟掉） */
function classify(p) {
  if (catOf.has(p)) return catOf.get(p);
  for (const [key, id] of catOf) {
    if (p.startsWith(key) || key.startsWith(p)) return id;
  }
  return null;
}

console.log(`  查詢集：${phraseSet.size} 個可搜尋片語（含 ${CATEGORIES.reduce((n,c)=>n+c.seeds.length,0)} 個分類種子）`);

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
const trueCount = new Map(); // phrase -> 語料裡實際出現幾次（不受收錄上限影響）
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

      // 真實出現次數要全數計，不能因為存夠了就不算——
      // 否則統計會變成「上限值」，等於在騙人。
      trueCount.set(matched, (trueCount.get(matched) || 0) + 1);

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
  .filter(([p, list]) => {
    if (list.length < 2) return false; // 只有一段就沒有「聽很多人講」的價值
    const n = trueCount.get(p) || list.length;
    return n <= MAX_TRUE_OCCURRENCES; // 太泛的不是語塊
  })
  .map(([p, list]) => ({
    p,
    cat: classify(p),
    display: phraseSet.get(p).display,
    fns: [...phraseSet.get(p).fns],
    /** 語料裡實際出現次數（可能大於收錄的片段數） */
    total: trueCount.get(p) || list.length,
    /** 收錄的片段涵蓋幾集、幾位講者 */
    episodes: new Set(list.map((h) => h.ep)).size,
    speakers: new Set(list.map((h) => h.sp)).size,
    hits: list,
  }))
  // 配不上任何一類的丟掉——分類同時是品質過濾器
  .filter((x) => x.cat)
  // 收錄片段多的排前面，同數量時偏好「不那麼泛」的
  .sort((a, b) => b.hits.length - a.hits.length || a.total - b.total);

const totalClips = phrases.reduce((n, p) => n + p.hits.length, 0);
const totalWords = phrases.reduce(
  (n, p) => n + p.hits.reduce((m, h) => m + words(h.line).length, 0),
  0,
);

writeFileSync(
  join(ROOT, "data", "clips.json"),
  JSON.stringify(
    {
      count: totalClips,
      categories: CATEGORIES.map(({ id, zh, blurb }) => ({ id, zh, blurb })),
      phrases,
    },
    null,
    2,
  ) + "\n",
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
