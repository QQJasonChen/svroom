import findingsFile from "../../data/findings.json";

export type FindingExample = {
  quote: string;
  guest: string;
  timestamp: string | null;
  episode: string | null;
  url: string | null;
  seek: boolean;
  isSearch?: boolean;
};

export type FindingType = {
  zh: string;
  /** 這一型大約佔多少（有統計依據的粗估） */
  share: string | null;
  note: string | null;
  examples: FindingExample[];
};

export type Finding = {
  id: string;
  zh: string;
  en: string | null;
  /** 掃過全部 311 集數出來的數字——這一層的起點 */
  stat: { count: number; episodes: number; total: number; median?: number };
  headline: string;
  why: string;
  /** 台灣人的對照 */
  taiwan: string;
  types: FindingType[];
};

export const findings: Finding[] = (findingsFile.findings ?? []) as Finding[];

export const getFinding = (id: string) => findings.find((f) => f.id === id);

export const findingStats = {
  count: findings.length,
  types: findings.reduce((n, f) => n + f.types.length, 0),
  examples: findings.reduce(
    (n, f) => n + f.types.reduce((m, t) => m + t.examples.length, 0),
    0,
  ),
};
