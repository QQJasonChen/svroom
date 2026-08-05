import scenariosFile from "../../data/scenarios.json";
import { type Card, cards, getFn } from "./cards";
import { getConcept } from "./concepts";
import { getWritingFn, writingCards } from "./writing";

export type Scenario = {
  id: string;
  zh: string;
  en: string;
  featured?: boolean;
  hook: string;
  why: string;
  functions: string[];
  writing: string[];
  concepts: string[];
  maxPerFunction: number;
};

export const scenarios: Scenario[] = scenariosFile.scenarios;

export function getScenario(id: string) {
  return scenarios.find((s) => s.id === id);
}

/**
 * 挑這個情境要用的卡：每個功能取幾張，簡單的優先。
 * 刻意用「功能 + 難度」而不是寫死卡片 id——id 每次 build 會重新編號。
 */
export function cardsForScenario(s: Scenario) {
  const out: { fnId: string; fnZh: string; cards: Card[] }[] = [];
  for (const fnId of s.functions) {
    const entry = getFn(fnId);
    if (!entry) continue;
    const picked = cards
      .filter((c) => c.fn === fnId)
      .sort((a, b) => a.difficulty - b.difficulty)
      .slice(0, s.maxPerFunction);
    if (picked.length) out.push({ fnId, fnZh: entry.fn.zh, cards: picked });
  }
  return out;
}

export function writingForScenario(s: Scenario) {
  const out: { fnId: string; fnZh: string; cards: Card[] }[] = [];
  for (const fnId of s.writing) {
    const entry = getWritingFn(fnId);
    if (!entry) continue;
    const picked = writingCards
      .filter((c) => c.fn === fnId)
      .sort((a, b) => a.difficulty - b.difficulty)
      .slice(0, 3);
    if (picked.length) out.push({ fnId, fnZh: entry.fn.zh, cards: picked });
  }
  return out;
}

export function conceptsForScenario(s: Scenario) {
  return s.concepts.map((id) => getConcept(id)).filter((c) => !!c);
}

export function scenarioCardCount(s: Scenario) {
  return (
    cardsForScenario(s).reduce((n, g) => n + g.cards.length, 0) +
    writingForScenario(s).reduce((n, g) => n + g.cards.length, 0)
  );
}
