import cardsFile from "../../data/cards.json";
import functionsFile from "../../data/functions.json";

export type Register = "spoken-casual" | "spoken-formal" | "written";

export type Card = {
  id: string;
  fn: string;
  group: string;
  pattern: string | null;
  quote: string;
  zh: string;
  why: string;
  register: Register;
  difficulty: number;
  /** @deprecated 我們編的替代說法，已不再顯示；保留是因為挖原聲片段時用得到 */
  swaps: string[];
  /** 同一個功能底下的真實替代說法（來自語料，附講者） */
  alts: { id: string; quote: string; guest: string; zh: string }[];
  pmNote: string | null;
  guest: string;
  timestamp: string | null;
  episode: string | null;
  url: string | null;
  /** 出處連結是不是導到搜尋頁（電子報的直連在來源索引裡多半是壞的） */
  isSearch?: boolean;
  /** 網址是否已帶時間碼，可以直接跳到那一句 */
  seek: boolean;
};

export type Fn = {
  id: string;
  zh: string;
  en: string;
  scene: string;
  pm_hook: string;
};

export type Group = {
  id: string;
  zh: string;
  en: string;
  blurb: string;
  functions: Fn[];
};

export const groups: Group[] = functionsFile.groups;
export const cards: Card[] = cardsFile.cards as Card[];

const fnIndex = new Map<string, { fn: Fn; group: Group }>();
for (const g of groups) {
  for (const f of g.functions) fnIndex.set(f.id, { fn: f, group: g });
}

export function getFn(id: string) {
  return fnIndex.get(id);
}

export function cardsFor(fnId: string) {
  return cards
    .filter((c) => c.fn === fnId)
    .sort((a, b) => a.difficulty - b.difficulty);
}

export function countFor(fnId: string) {
  return cards.reduce((n, c) => (c.fn === fnId ? n + 1 : n), 0);
}

export function countForGroup(groupId: string) {
  return cards.reduce((n, c) => (c.group === groupId ? n + 1 : n), 0);
}

export const stats = {
  cards: cards.length,
  functions: fnIndex.size,
  covered: new Set(cards.map((c) => c.fn)).size,
  guests: new Set(cards.map((c) => c.guest)).size,
};

export const registerLabel: Record<Register, string> = {
  "spoken-casual": "口語",
  "spoken-formal": "正式口語",
  written: "書面",
};

export const difficultyLabel: Record<number, string> = {
  1: "好上手",
  2: "中等",
  3: "進階",
};
