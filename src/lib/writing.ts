import writingFile from "../../data/writing.json";
import taxonomy from "../../data/writing-taxonomy.json";
import type { Card } from "./cards";

export type WritingFn = {
  id: string;
  zh: string;
  en: string;
  scene: string;
};

export type WritingGroup = {
  id: string;
  zh: string;
  en: string;
  blurb: string;
  functions: WritingFn[];
};

export const writingGroups: WritingGroup[] = taxonomy.groups;
export const writingCards: Card[] = (writingFile.cards ?? []) as Card[];

const index = new Map<string, { fn: WritingFn; group: WritingGroup }>();
for (const g of writingGroups) {
  for (const f of g.functions) index.set(f.id, { fn: f, group: g });
}

export function getWritingFn(id: string) {
  return index.get(id);
}

export function writingCardsFor(fnId: string) {
  return writingCards
    .filter((c) => c.fn === fnId)
    .sort((a, b) => a.difficulty - b.difficulty);
}

export function writingCountFor(fnId: string) {
  return writingCards.reduce((n, c) => (c.fn === fnId ? n + 1 : n), 0);
}

export const writingStats = {
  cards: writingCards.length,
  functions: index.size,
  covered: new Set(writingCards.map((c) => c.fn)).size,
};
