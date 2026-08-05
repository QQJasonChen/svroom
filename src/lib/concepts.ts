import conceptsFile from "../../data/concepts.json";
import taxonomy from "../../data/concepts-taxonomy.json";
import { cards } from "./cards";

export type HowToSay = { en: string; zh: string; note?: string };

export type ConceptQuote = {
  text: string;
  guest: string;
  timestamp: string | null;
  episode: string | null;
  url: string | null;
  seek: boolean;
};

export type Concept = {
  id: string;
  group: string;
  term: string;
  zh: string;
  oneLiner: string;
  body: string;
  pitfall: string | null;
  howToSay: HowToSay[];
  quote: ConceptQuote | null;
  relatedFunctions: string[];
};

export type ConceptGroup = {
  id: string;
  zh: string;
  en: string;
  blurb: string;
  concepts: { id: string; term: string; zh: string }[];
};

export const conceptGroups: ConceptGroup[] = taxonomy.groups;
export const concepts: Concept[] = (conceptsFile.concepts ?? []) as Concept[];

const byId = new Map(concepts.map((c) => [c.id, c]));

/** 分類法裡的所有概念（含還沒採集內容的），用來產頁面與導覽 */
export const conceptIndex: {
  id: string;
  term: string;
  zh: string;
  group: string;
  groupZh: string;
}[] = conceptGroups.flatMap((g) =>
  g.concepts.map((c) => ({
    id: c.id,
    term: c.term,
    zh: c.zh,
    group: g.id,
    groupZh: g.zh,
  })),
);

const metaById = new Map(conceptIndex.map((c) => [c.id, c]));

export function getConcept(id: string) {
  return byId.get(id);
}

export function getConceptMeta(id: string) {
  return metaById.get(id);
}

export function conceptsInGroup(groupId: string) {
  // 依分類法的順序排，而不是採集回來的順序
  const order = conceptGroups.find((g) => g.id === groupId)?.concepts ?? [];
  return order.map((c) => byId.get(c.id)).filter((c): c is Concept => !!c);
}

/** 某個語言功能反向連到哪些 PM 概念 */
export function conceptsForFunction(fnId: string) {
  return concepts.filter((c) => c.relatedFunctions.includes(fnId));
}

export const conceptStats = {
  total: conceptGroups.reduce((n, g) => n + g.concepts.length, 0),
  written: concepts.length,
  withQuote: concepts.filter((c) => c.quote).length,
};

/** 概念頁上要顯示的相關句型卡（每個功能取最多 3 張） */
export function sampleCardsForConcept(c: Concept) {
  const out = [];
  for (const fn of c.relatedFunctions) {
    out.push(...cards.filter((card) => card.fn === fn).slice(0, 3));
  }
  return out.slice(0, 6);
}
