import type { Card } from "@/lib/cards";
import { difficultyLabel, registerLabel } from "@/lib/cards";
import InlineClip from "./InlineClip";
import Speak from "./Speak";
import { Src, TraceLink } from "./Src";

/**
 * 一張卡有兩種來源完全不同的內容，版面必須讓人一眼分得出來：
 *   上半 = 逐字稿原文（Lenny 那邊真的有人講過的話）＋出處＋就地播放
 *   下半 = 我們的拆解（翻譯、語用分析、替代說法都是我們寫的）
 * 出處刻意緊貼在引文下方，而不是放到卡片最底部，才綁得住。
 */
export default function CardView({ card, n }: { card: Card; n?: number }) {
  // 有 [X] 佔位符的才是真的「句型」（可換內容重用）；
  // 沒有的是固定的慣用句。混為一談會讓「句型」這個承諾變空。
  const isTemplate =
    !!card.pattern?.includes("[") || (!card.pattern && card.quote.includes("["));
  const written = card.register === "written";

  return (
    <article className="border border-rule bg-paper-2/40 rounded-sm overflow-hidden">
      {/* ── 逐字稿原文 ─────────────────────────── */}
      <div className="px-5 sm:px-7 pt-5 pb-5">
        <div className="flex items-center gap-2 mb-3">
          {n !== undefined && (
            <span className="text-[11px] tabular-nums text-ink-3">
              {String(n).padStart(2, "0")}
            </span>
          )}
          <Src kind="corpus">{written ? "文章原文" : "逐字稿原文"}</Src>
          <Speak text={card.quote} id={card.id} className="ml-auto" />
        </div>

        <blockquote className="quote pl-4 border-l-2 border-rust/40">
          {card.quote}
        </blockquote>

        <div className="mt-3 pl-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-3">
          <span className="text-ink-2">{card.guest}</span>
          {card.timestamp && (
            <span className="tabular-nums">{card.timestamp}</span>
          )}
          {card.url && (
            <InlineClip
              url={card.url}
              timestamp={card.timestamp}
              episode={card.episode}
              seek={card.seek}
            />
          )}
          {card.episode && (
            <p className="w-full text-[11.5px] leading-snug opacity-75">
              {card.episode}
            </p>
          )}
        </div>
      </div>

      {/* ── 我們的拆解 ─────────────────────────── */}
      <div className="px-5 sm:px-7 py-5 border-t border-rule bg-paper/60 space-y-4">
        <div className="flex items-center gap-2">
          <Src kind="ours">我們的拆解</Src>
          <span className="ml-auto flex items-center gap-2 text-[11px] text-ink-3">
            <span>{registerLabel[card.register]}</span>
            <span>{difficultyLabel[card.difficulty]}</span>
          </span>
        </div>

        <p className="text-[15px] leading-relaxed text-ink-2">{card.zh}</p>

        {card.pattern && (
          <div>
            <p className="rule-label mb-1">
              {isTemplate ? "抽出來的句型" : "可以整句用的慣用句"}
            </p>
            <p className="font-serif text-[15px] text-rust leading-snug">
              {card.pattern}
            </p>
          </div>
        )}

        <div>
          <p className="rule-label mb-1">
            {written ? "為什麼這樣寫" : "為什麼這樣講"}
          </p>
          <p className="text-[14px] leading-relaxed">{card.why}</p>
        </div>

        {card.swaps.length > 0 && (
          <div>
            <p className="rule-label mb-1">
              {written ? "也可以這樣寫" : "也可以這樣說"}
            </p>
            <ul className="space-y-1.5">
              {card.swaps.map((s, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-serif text-[14px] text-ink-2 leading-snug">
                    {s}
                  </span>
                  <TraceLink text={s} label="查語料" />
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
    </article>
  );
}
