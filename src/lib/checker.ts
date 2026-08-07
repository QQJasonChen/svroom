import rulesFile from "../../data/checker-rules.json";
import { getTrap, getTrapMeta } from "./traps";

export type Rule = {
  trap: string;
  pattern: string;
  /** 要命中幾次才算問題（用於「用太多」型的規則） */
  minHits?: number;
  /** 只有在整段文字**沒有**這個 pattern 時才算問題（用於「少了退路／少了死線」） */
  needsAbsence?: string;
  label: string;
  why: string;
};

export type Hit = {
  rule: Rule;
  /** 命中的字串片段，用來在原文標色 */
  matches: { text: string; index: number }[];
  /** 對應的陷阱內容（可能還沒寫） */
  trapZh: string | null;
  heardAs: string | null;
  better: { en: string; zh: string; note?: string }[];
};

export const rules: Rule[] = rulesFile.rules;

/**
 * 檢查一段英文草稿踩到哪些中文腦陷阱。
 *
 * 全部在瀏覽器端跑——使用者的草稿不會離開他的電腦，也不打任何 API。
 * 設計上寧可漏不可誤報：`minHits` 讓「用太多」型的規則不會因為出現一次就報，
 * `needsAbsence` 讓「少了什麼」型的規則在使用者其實有寫時保持安靜。
 */
export function check(text: string): Hit[] {
  const out: Hit[] = [];
  if (!text.trim()) return out;

  for (const rule of rules) {
    const re = new RegExp(rule.pattern, "gi");
    const matches: { text: string; index: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m[0].trim()) matches.push({ text: m[0], index: m.index });
      if (m.index === re.lastIndex) re.lastIndex++; // 防止零寬度匹配卡住
    }
    if (matches.length === 0) continue;
    if (rule.minHits && matches.length < rule.minHits) continue;
    if (rule.needsAbsence && new RegExp(rule.needsAbsence, "i").test(text)) continue;

    const t = getTrap(rule.trap);
    const meta = getTrapMeta(rule.trap);
    out.push({
      rule,
      matches,
      trapZh: meta?.zh_instinct ?? null,
      heardAs: t?.heardAs ?? null,
      better: t?.better ?? [],
    });
  }

  // 命中多的排前面（通常也是問題比較明顯的）
  return out.sort((a, b) => b.matches.length - a.matches.length);
}

/** 把原文切成一般片段與命中片段，方便標色 */
export function highlight(text: string, hits: Hit[]) {
  const marks = hits
    .flatMap((h) => h.matches.map((m) => ({ ...m, trap: h.rule.trap })))
    .sort((a, b) => a.index - b.index);

  const parts: { text: string; trap: string | null }[] = [];
  let cursor = 0;
  for (const mk of marks) {
    if (mk.index < cursor) continue; // 重疊的只標第一個
    if (mk.index > cursor) parts.push({ text: text.slice(cursor, mk.index), trap: null });
    parts.push({ text: mk.text, trap: mk.trap });
    cursor = mk.index + mk.text.length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), trap: null });
  return parts;
}

export const SAMPLE = `Hi Sarah,

Sorry to bother you — I just have a quick question. We've been looking at the onboarding flow and customers said the current version is confusing. I think we should probably redesign it, and I think it would be much better if we simplify the first screen.

Could you please take a look at the mockups? I'll try to get the full spec done as soon as possible.

Thanks in advance!`;
