/**
 * 極簡 Leitner 盒式 SRS，狀態存在 localStorage。
 * 刻意不做帳號、不做同步——這是免費的個人學習工具，資料留在使用者自己的瀏覽器。
 */
export type Grade = "again" | "ok" | "got";

export type CardState = {
  box: number; // 0..4
  due: number; // epoch ms
  seen: number;
};

const KEY = "svroom.srs.v1";
const DAY = 86_400_000;
const INTERVALS = [0, 1 * DAY, 3 * DAY, 7 * DAY, 21 * DAY];

export function load(): Record<string, CardState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, CardState>) : {};
  } catch {
    return {};
  }
}

export function save(state: Record<string, CardState>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 隱私模式或空間滿了就算了，不要炸掉練習流程 */
  }
}

export function grade(prev: CardState | undefined, g: Grade): CardState {
  const seen = (prev?.seen ?? 0) + 1;
  let box = prev?.box ?? 0;
  if (g === "got") box = Math.min(box + 1, INTERVALS.length - 1);
  else if (g === "again") box = 0;
  // "ok" 留在原盒，再看一次
  return { box, seen, due: Date.now() + INTERVALS[box] };
}

export function isDue(state: Record<string, CardState>, id: string) {
  const s = state[id];
  return !s || s.due <= Date.now();
}

export function summarize(state: Record<string, CardState>, ids: string[]) {
  let learning = 0;
  let known = 0;
  for (const id of ids) {
    const s = state[id];
    if (!s) continue;
    if (s.box >= 3) known++;
    else learning++;
  }
  return { learning, known, untouched: ids.length - learning - known };
}
