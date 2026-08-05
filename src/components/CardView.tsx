import type { Card } from "@/lib/cards";
import { difficultyLabel, registerLabel } from "@/lib/cards";
import Speak from "./Speak";

export default function CardView({ card, n }: { card: Card; n?: number }) {
  // 有 [X] 佔位符的才是真的「句型」（可換內容重用）；
  // 沒有的是固定的慣用句。混為一談會讓「句型」這個承諾變空。
  // 書面卡常常整句就是模板，佔位符在原句裡，所以兩邊都看。
  const isTemplate =
    !!card.pattern?.includes("[") || (!card.pattern && card.quote.includes("["));

  return (
    <article className="border border-rule bg-paper-2/40 rounded-sm">
      <div className="px-5 sm:px-7 py-6 space-y-5">
        {card.pattern && (
          <div className="flex items-start gap-3">
            {n !== undefined && (
              <span className="shrink-0 mt-0.5 text-[11px] tabular-nums text-ink-3 w-5">
                {String(n).padStart(2, "0")}
              </span>
            )}
            <div className="min-w-0">
              <span className="rule-label">
                {isTemplate ? "句型" : "慣用句"}
              </span>
              <p className="font-serif text-[15px] text-rust leading-snug mt-0.5">
                {card.pattern}
              </p>
            </div>
          </div>
        )}

        {/* 原句 */}
        <div className="flex items-start gap-3">
          <blockquote className="quote pl-4 border-l-2 border-rust/35 flex-1 min-w-0">
            {card.quote}
          </blockquote>
          <Speak text={card.quote} id={card.id} className="shrink-0 mt-1" />
        </div>

        <p className="text-[15px] leading-relaxed text-ink-2">{card.zh}</p>

        <div className="pt-1 space-y-3 border-t border-rule">
          <div className="pt-3">
            <p className="rule-label mb-1.5">
              {card.register === "written" ? "為什麼這樣寫" : "為什麼這樣講"}
            </p>
            <p className="text-[14px] leading-relaxed">{card.why}</p>
          </div>

          {card.swaps.length > 0 && (
            <div>
              <p className="rule-label mb-1.5">
                {card.register === "written" ? "也可以這樣寫" : "也可以這樣說"}
              </p>
              <ul className="space-y-1">
                {card.swaps.map((s, i) => (
                  <li
                    key={i}
                    className="font-serif text-[14px] text-ink-2 leading-snug"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {card.pmNote && (
            <div className="bg-slate-soft border-l-2 border-slate px-3.5 py-2.5 rounded-r-sm">
              <p className="rule-label mb-1" style={{ color: "var(--color-slate)" }}>
                PM 筆記
              </p>
              <p className="text-[13.5px] leading-relaxed text-ink-2">
                {card.pmNote}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-7 py-3 border-t border-rule text-[12px] text-ink-3 space-y-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-ink-2">{card.guest}</span>
          {card.timestamp && (
            <span className="tabular-nums">{card.timestamp}</span>
          )}
          <span>{registerLabel[card.register]}</span>
          <span>{difficultyLabel[card.difficulty]}</span>
          {card.url && (
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto underline underline-offset-2 hover:text-rust"
            >
              {card.register === "written"
                ? "讀原文 ↗"
                : card.seek && card.timestamp
                  ? `從 ${card.timestamp.replace(/^00:/, "")} 聽起 ↗`
                  : "聽原句 ↗"}
            </a>
          )}
        </div>
        {card.episode && (
          <p className="text-[11.5px] leading-snug opacity-80">
            {card.episode}
          </p>
        )}
      </div>
    </article>
  );
}
