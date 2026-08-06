import questionsFile from "../../data/questions.json";

export type QuestionCat = { id: string; zh: string; blurb: string };

export type Question = {
  id: string;
  cat: string;
  /** Lenny 真的問過的原句，一個字沒改 */
  q: string;
  zh: string;
  why: string | null;
  pattern: string | null;
  askedTo: string | null;
  timestamp: string | null;
  episode: string | null;
  url: string | null;
  seek: boolean;
  isSearch?: boolean;
};

export const questionCats: QuestionCat[] = questionsFile.categories;
export const questions: Question[] = (questionsFile.questions ??
  []) as Question[];

export function questionsByCat(cat: string) {
  return questions.filter((q) => q.cat === cat);
}

export const questionStats = {
  count: questions.length,
  covered: new Set(questions.map((q) => q.cat)).size,
  episodes: new Set(questions.map((q) => q.episode).filter(Boolean)).size,
};
