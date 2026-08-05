import trapsFile from "../../data/traps.json";
import taxonomy from "../../data/traps-taxonomy.json";
import { getFn } from "./cards";

export type Better = { en: string; zh: string; note?: string };

export type TrapCorpus = {
  isSearch?: boolean;
  quote: string;
  guest: string;
  timestamp: string | null;
  episode: string | null;
  url: string | null;
  seek: boolean;
};

export type Trap = {
  id: string;
  group: string;
  /** misread = 這句英文沒錯，只是對方解讀不同；error = 真的用錯了 */
  kind: "misread" | "error";
  zhInstinct: string;
  enLiteral: string | null;
  /** 對方實際聽到的是什麼——這一層最有價值的欄位 */
  heardAs: string;
  why: string;
  better: Better[];
  corpus: TrapCorpus | null;
  relatedFunctions: string[];
};

export type TrapGroup = {
  id: string;
  zh: string;
  en: string;
  blurb: string;
  traps: { id: string; zh_instinct: string; hint: string }[];
};

export const trapGroups: TrapGroup[] = taxonomy.groups;
export const traps: Trap[] = (trapsFile.traps ?? []) as Trap[];

const byId = new Map(traps.map((t) => [t.id, t]));

export const trapIndex = trapGroups.flatMap((g) =>
  g.traps.map((t) => ({ ...t, group: g.id, groupZh: g.zh })),
);
const metaById = new Map(trapIndex.map((t) => [t.id, t]));

export function getTrap(id: string) {
  return byId.get(id);
}
export function getTrapMeta(id: string) {
  return metaById.get(id);
}
export function trapsInGroup(groupId: string) {
  const order = trapGroups.find((g) => g.id === groupId)?.traps ?? [];
  return order.map((t) => byId.get(t.id)).filter((t): t is Trap => !!t);
}

/** 某個語言功能會踩到哪些中文腦陷阱 */
export function trapsForFunction(fnId: string) {
  return traps.filter((t) => t.relatedFunctions.includes(fnId));
}

export function functionsForTrap(t: Trap) {
  return t.relatedFunctions
    .map((id) => ({ id, entry: getFn(id) }))
    .filter((x) => !!x.entry);
}

export const trapStats = {
  total: trapIndex.length,
  written: traps.length,
  withCorpus: traps.filter((t) => t.corpus).length,
};
