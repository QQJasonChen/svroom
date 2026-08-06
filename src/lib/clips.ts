import clipsFile from "../../data/clips.json";

export type Clip = {
  /** YouTube video id */
  v: string;
  /** 起播秒數（由段落時間碼＋字數位置內插推算，已回退 2 秒） */
  t: number;
  /** 說話者 */
  sp: string;
  /** 集數標題 */
  ep: string | null;
  /** 這一句 */
  line: string;
};

export type ClipCategory = { id: string; zh: string; blurb: string };

export type ClipPhrase = {
  /** 正規化後的片語，搜尋用 */
  p: string;
  /** 意圖分類：同意／反對／提問… */
  cat: string;
  /** 顯示用的原樣片語 */
  display: string;
  /** 這個說法對應到哪些語言功能 */
  fns: string[];
  /** 這個說法在語料裡實際出現幾次（可能大於收錄的片段數） */
  total: number;
  /** 收錄的片段涵蓋幾集 */
  episodes: number;
  /** 收錄的片段涵蓋幾位講者 */
  speakers: number;
  hits: Clip[];
};

export const clipPhrases: ClipPhrase[] = clipsFile.phrases as ClipPhrase[];
export const clipCount: number = clipsFile.count;
export const clipCategories: ClipCategory[] = (clipsFile.categories ??
  []) as ClipCategory[];

/** 少見的說法——語料裡出現 ≤3 次，通常也是比較進階的 */
export const isRare = (p: ClipPhrase) => p.total <= 3;

/** 依意圖分類分組，空的類別不出現 */
export function phrasesByCategory(list: ClipPhrase[] = clipPhrases) {
  return clipCategories
    .map((c) => ({ ...c, phrases: list.filter((p) => p.cat === c.id) }))
    .filter((c) => c.phrases.length > 0);
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * 搜尋說法。空字串回傳片段最多的前幾個，當作預設清單。
 *
 * 刻意**只比對說法本身**，不比對片段內容——否則搜 "push" 會跑出一堆
 * 不含 push 的說法（只因為它某一段引文裡有），使用者完全看不懂為什麼。
 */
export function searchPhrases(q: string, limit = 40) {
  const needle = norm(q);
  if (!needle) return clipPhrases.slice(0, limit);
  return clipPhrases
    .filter((p) => p.p.includes(needle) || norm(p.display).includes(needle))
    .slice(0, limit);
}

/** 某個語言功能底下有哪些說法可以聽 */
export function phrasesForFunction(fnId: string) {
  return clipPhrases.filter((p) => p.fns.includes(fnId));
}

/** 一段片段大概要播多久：英語口說約每秒 2.6 個字，前後各留一點 */
export function clipDuration(line: string) {
  const w = line.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(5, Math.round(w / 2.6) + 3);
}
