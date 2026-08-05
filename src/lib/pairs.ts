import { type Card, cardsFor, getFn } from "./cards";
import { getWritingFn, writingCardsFor } from "./writing";

/**
 * 同一個處境的「口說版」與「書面版」。
 *
 * 這是這批語料獨有的東西：podcast 給口語、newsletter 給書面，
 * 同一件事在兩個管道用的字完全不同。並排看才會發現差在哪。
 */
const PAIRS: { id: string; zh: string; note: string; spoken: string; written: string }[] = [
  {
    id: "no",
    zh: "說不",
    note: "當面說不可以靠語氣軟化；寫下來只剩字，所以要把「不是做不到，是要你選」講清楚。",
    spoken: "saying-no",
    written: "w-decline",
  },
  {
    id: "bad-news",
    zh: "報壞消息",
    note: "口頭可以邊講邊看反應；書面沒有回頭路，順序就是一切——先事實，後建議，道歉只給一句。",
    spoken: "bad-news",
    written: "w-failure",
  },
  {
    id: "tradeoffs",
    zh: "談取捨",
    note: "口說靠對稱句型讓取捨聽起來像判斷力；書面要把選項攤成表，並指定一個建議。",
    spoken: "trade-offs",
    written: "w-options",
  },
  {
    id: "case",
    zh: "提出建議",
    note: "會議裡可以邊講邊調整；文件裡必須在最後一行寫死「我要你做什麼、什麼時候之前」。",
    spoken: "making-the-case",
    written: "w-recommendation",
  },
  {
    id: "ask",
    zh: "要資源",
    note: "當面開口靠關係；書面請求靠「掛路牌 → 講成本 → 給出口」三段結構。",
    spoken: "asking-for-resources",
    written: "w-request",
  },
  {
    id: "impact",
    zh: "講自己的成績",
    note: "口頭可以邊講邊拆功勞；自評必須自己接到公司目標那一層，沒人會幫你補推論。",
    spoken: "talking-impact",
    written: "w-self-review",
  },
  {
    id: "feedback",
    zh: "給回饋",
    note: "當面可以觀察對方臉色收力；寫下來的回饋會被存檔、被轉發、被拿去 calibration 讀。",
    spoken: "hard-feedback",
    written: "w-feedback",
  },
  {
    id: "hedge",
    zh: "表達保留",
    note: "口說有語氣當緩衝；書面只剩用字，所以母語者用一整套括號與自我校正的工具。",
    spoken: "admitting-uncertainty",
    written: "w-hedging",
  },
  {
    id: "problem",
    zh: "定義問題",
    note: "口頭定義問題可以來回對焦；文件的問題陳述是後面每一次爭論的裁判。",
    spoken: "framing-problem",
    written: "w-problem-statement",
  },
  {
    id: "update",
    zh: "收斂與更新",
    note: "會議收尾要用問句留餘地；書面更新要用結構讓人三十秒讀完。",
    spoken: "summarizing",
    written: "w-status",
  },
  {
    id: "objection",
    zh: "處理反對",
    note: "現場可以接招；文件要在對方讀到之前就自己把反對講完。",
    spoken: "handling-objections",
    written: "w-preempt",
  },
  {
    id: "evidence",
    zh: "用數據撐住主張",
    note: "口說可以先給結論再補來源；書面要同時給限制，否則被問一句就崩。",
    spoken: "backing-with-evidence",
    written: "w-evidence",
  },
];

export type Pair = {
  id: string;
  zh: string;
  note: string;
  spokenId: string;
  writtenId: string;
  spokenZh: string;
  writtenZh: string;
  spoken: Card[];
  written: Card[];
};

export function allPairs(perSide = 3): Pair[] {
  const out: Pair[] = [];
  for (const p of PAIRS) {
    const sf = getFn(p.spoken);
    const wf = getWritingFn(p.written);
    if (!sf || !wf) continue;
    const spoken = cardsFor(p.spoken).slice(0, perSide);
    const written = writingCardsFor(p.written).slice(0, perSide);
    // 兩邊都要有東西才值得並排
    if (spoken.length === 0 || written.length === 0) continue;
    out.push({
      id: p.id,
      zh: p.zh,
      note: p.note,
      spokenId: p.spoken,
      writtenId: p.written,
      spokenZh: sf.fn.zh,
      writtenZh: wf.fn.zh,
      spoken,
      written,
    });
  }
  return out;
}
