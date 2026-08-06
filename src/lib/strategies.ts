import strategiesFile from "../../data/strategies.json";
import { type Card, cards, getFn } from "./cards";
import { writingCards } from "./writing";

export type Strategy = {
  id: string;
  n: number;
  zh: string;
  en: string;
  hook: string;
  body: string;
  taiwan: string;
  /** 用來從語料實際比對出例句的關鍵字 */
  match: string[];
  functions: string[];
};

export const strategies: Strategy[] = strategiesFile.strategies;

export function getStrategy(id: string) {
  return strategies.find((s) => s.id === id);
}

const all = [...cards, ...writingCards];

/**
 * 例句不寫死在資料檔裡，而是每次 build 從語料實際比對出來——
 * 這樣語料更新時總論會自動跟上，不會變成一份會過期的靜態文章。
 */
export function examplesFor(s: Strategy, limit = 8): Card[] {
  const hits: { card: Card; score: number }[] = [];
  for (const c of all) {
    const hay = `${c.quote} ${c.pattern ?? ""} ${c.why}`.toLowerCase();
    let score = 0;
    for (const m of s.match) if (hay.includes(m)) score += 2;
    // 屬於這個策略常用的功能，加一點權重
    if (s.functions.includes(c.fn)) score += 1;
    if (score >= 2) hits.push({ card: c, score });
  }
  // 同一個講者最多兩張，免得整頁都是同一個人
  const perGuest = new Map<string, number>();
  return hits
    .sort((a, b) => b.score - a.score || a.card.difficulty - b.card.difficulty)
    .filter(({ card }) => {
      // 無法確認作者的卡用集數當去重鍵，避免整頁都來自同一篇文章
      const key = card.guest ?? card.episode ?? card.id;
      const n = perGuest.get(key) ?? 0;
      if (n >= 2) return false;
      perGuest.set(key, n + 1);
      return true;
    })
    .slice(0, limit)
    .map((h) => h.card);
}

export function functionsFor(s: Strategy) {
  return s.functions
    .map((id) => ({ id, entry: getFn(id) }))
    .filter((x) => !!x.entry);
}

export const strategyStats = {
  count: strategies.length,
  examples: strategies.reduce((n, s) => n + examplesFor(s).length, 0),
};
