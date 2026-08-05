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

export type ClipPhrase = {
  /** 正規化後的片語，搜尋用 */
  p: string;
  /** 顯示用的原樣片語 */
  display: string;
  /** 這個說法對應到哪些語言功能 */
  fns: string[];
  hits: Clip[];
};

export const clipPhrases: ClipPhrase[] = clipsFile.phrases as ClipPhrase[];
export const clipCount: number = clipsFile.count;

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** 搜尋說法。空字串回傳片段最多的前幾個，當作預設清單。 */
export function searchPhrases(q: string, limit = 40) {
  const needle = norm(q);
  if (!needle) return clipPhrases.slice(0, limit);
  return clipPhrases
    .filter(
      (p) =>
        p.p.includes(needle) ||
        norm(p.display).includes(needle) ||
        p.hits.some((h) => norm(h.line).includes(needle)),
    )
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
