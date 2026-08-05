import { type Card, cards } from "./cards";
import { writingCards } from "./writing";

/**
 * 「今天的 5 句」——這個站唯一需要的預設動作。
 *
 * 內容有一千多張卡、七個入口，但一個學習者每天只需要一個明確的開始。
 * 選卡規則刻意做成**日期決定的**：同一天打開永遠是同一組（今天沒練完
 * 明天回來還在），跨天自動換一組。不需要伺服器、不需要帳號。
 */

const POOL = [...cards, ...writingCards];

/** 以日期字串當種子的決定性洗牌 */
function seededPick<T>(arr: T[], n: number, seed: number): T[] {
  const idx = arr.map((_, i) => i);
  let s = seed || 1;
  for (let i = idx.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, n).map((i) => arr[i]);
}

export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function seedFrom(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * 今天要練的卡。難度由淺到深排，讓人有個好的開始。
 * 在伺服器端（build 時）算會固定在 build 那天，所以由客戶端傳入日期。
 */
export function cardsForDay(key: string, n = 5): Card[] {
  return seededPick(POOL, n, seedFrom(key)).sort(
    (a, b) => a.difficulty - b.difficulty,
  );
}

export const poolSize = POOL.length;
