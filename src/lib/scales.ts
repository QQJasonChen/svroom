import scalesFile from "../../data/scales.json";
import { getFn } from "./cards";

export type ScaleExample = {
  quote: string;
  guest: string | null;
  timestamp: string | null;
  episode: string | null;
  url: string | null;
  seek: boolean;
  isSearch?: boolean;
};

export type ScaleLevel = {
  n: number;
  zh: string;
  force: string | null;
  when: string | null;
  /** 用錯的代價——已進步的學習者要的就是這個 */
  risk: string | null;
  examples: ScaleExample[];
};

export type Scale = {
  fn: string;
  zh: string;
  intro: string;
  /** 力道由弱到強的判準是什麼 */
  axis: string;
  levels: ScaleLevel[];
};

export const scales: Scale[] = (scalesFile.scales ?? []) as Scale[];

export const getScale = (fn: string) => scales.find((s) => s.fn === fn);

export function scaleWithFn(s: Scale) {
  return { ...s, entry: getFn(s.fn) };
}

export const scaleStats = {
  count: scales.length,
  levels: scales.reduce((n, s) => n + s.levels.length, 0),
  examples: scales.reduce(
    (n, s) => n + s.levels.reduce((m, l) => m + l.examples.length, 0),
    0,
  ),
};
