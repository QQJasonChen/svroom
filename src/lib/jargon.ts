import jargonFile from "../../data/jargon.json";
import taxonomy from "../../data/jargon-taxonomy.json";
import { getFn } from "./cards";

export type JargonUsage = {
  quote: string;
  guest: string;
  timestamp: string | null;
  episode: string | null;
  url: string | null;
  seek: boolean;
  isSearch?: boolean;
};

export type Jargon = {
  id: string;
  group: string;
  term: string;
  zh: string;
  meaning: string;
  when: string | null;
  /** 台灣人容易誤解的地方 */
  trap: string | null;
  usage: JargonUsage[];
  relatedFunctions: string[];
};

export type JargonGroup = {
  id: string;
  zh: string;
  blurb: string;
  terms: { id: string; term: string; hint: string }[];
};

export const jargonGroups: JargonGroup[] = taxonomy.groups;
export const jargonTerms: Jargon[] = (jargonFile.terms ?? []) as Jargon[];

const byId = new Map(jargonTerms.map((t) => [t.id, t]));
export const jargonIndex = jargonGroups.flatMap((g) =>
  g.terms.map((t) => ({ ...t, group: g.id, groupZh: g.zh })),
);
const metaById = new Map(jargonIndex.map((t) => [t.id, t]));

export const getJargon = (id: string) => byId.get(id);
export const getJargonMeta = (id: string) => metaById.get(id);

export function jargonInGroup(groupId: string) {
  const order = jargonGroups.find((g) => g.id === groupId)?.terms ?? [];
  return order.map((t) => byId.get(t.id)).filter((t): t is Jargon => !!t);
}

/** 某個語言功能場合會聽到哪些黑話 */
export function jargonForFunction(fnId: string) {
  return jargonTerms.filter((t) => t.relatedFunctions.includes(fnId));
}

export function functionsForJargon(t: Jargon) {
  return t.relatedFunctions
    .map((id) => ({ id, entry: getFn(id) }))
    .filter((x) => !!x.entry);
}

export const jargonStats = {
  total: jargonIndex.length,
  written: jargonTerms.length,
  usages: jargonTerms.reduce((n, t) => n + t.usage.length, 0),
};
