"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Speak from "./Speak";
import { Src } from "./Src";
import { check, highlight, rules, SAMPLE } from "@/lib/checker";

export default function Checker() {
  const [text, setText] = useState("");
  const hits = useMemo(() => check(text), [text]);
  const parts = useMemo(() => highlight(text, hits), [text, hits]);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={() => setText(SAMPLE)}
          className="text-[13px] border border-rule px-3 py-1.5 rounded-sm hover:border-rust hover:text-rust transition-colors"
        >
          用範例試試
        </button>
        {text && (
          <button
            onClick={() => setText("")}
            className="text-[13px] text-ink-3 hover:text-rust transition-colors"
          >
            清空
          </button>
        )}
        <span className="ml-auto text-[12px] text-ink-3 tabular-nums">
          {words} 字
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="把你要寄出去的 email、Slack 訊息或文件段落貼進來⋯⋯"
        className="w-full border border-rule bg-paper px-4 py-3.5 text-[15px] leading-relaxed rounded-sm placeholder:text-ink-3 focus:outline-none focus:border-rust font-serif"
      />

      <p className="mt-2 text-[11.5px] text-ink-3">
        全部在你的瀏覽器裡跑。文字不會上傳、不會經過任何 API、我們也看不到。
      </p>

      {text.trim() && (
        <div className="mt-9">
          {hits.length === 0 ? (
            <div className="border border-rule rounded-sm px-5 py-8 text-center">
              <p className="text-[15px]">沒有踩到我們收錄的陷阱。</p>
              <p className="mt-2 text-[13px] text-ink-3">
                這份檢查只認得 {rules.length} 種**有固定語言特徵**的問題（道歉開場、
                just／quick、I'll try、比較級沒基準⋯⋯）。
                需要判斷語意的（結論位置、冠詞、單複數）它看不出來。
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-3 mb-5">
                <h2 className="font-serif text-[1.5rem] tracking-tight">
                  找到 {hits.length} 個地方
                </h2>
                <span className="text-[12.5px] text-ink-3">
                  不是文法錯，是對方會聽成別的意思
                </span>
              </div>

              {/* 標色後的原文 */}
              <div className="border border-rule bg-paper-2/40 rounded-sm px-5 py-4 mb-8">
                <p className="rule-label mb-2.5">你的草稿</p>
                <p className="font-serif text-[15px] leading-[1.9] whitespace-pre-wrap">
                  {parts.map((p, i) =>
                    p.trap ? (
                      <mark
                        key={i}
                        className="bg-rust-soft text-rust rounded-sm px-0.5"
                      >
                        {p.text}
                      </mark>
                    ) : (
                      <span key={i}>{p.text}</span>
                    ),
                  )}
                </p>
              </div>

              <div className="space-y-5">
                {hits.map((h) => (
                  <article
                    key={h.rule.trap}
                    className="border border-rule rounded-sm overflow-hidden"
                  >
                    <div className="px-5 py-4 bg-paper-2/40">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-[14.5px] font-medium">
                          {h.rule.label}
                        </span>
                        <span className="text-[11.5px] text-ink-3 tabular-nums">
                          命中 {h.matches.length} 處
                        </span>
                        <Link
                          href={`/trap/${h.rule.trap}/`}
                          className="ml-auto text-[12px] text-ink-3 hover:text-rust underline underline-offset-2"
                        >
                          看完整說明 →
                        </Link>
                      </div>
                      <p className="mt-2 flex flex-wrap gap-1.5">
                        {h.matches.slice(0, 5).map((m, i) => (
                          <span
                            key={i}
                            className="font-serif text-[13px] text-rust bg-rust-soft px-1.5 py-0.5 rounded-sm"
                          >
                            {m.text.trim()}
                          </span>
                        ))}
                      </p>
                    </div>

                    <div className="px-5 py-4 border-t border-rule space-y-3">
                      <div>
                        <p
                          className="rule-label mb-1"
                          style={{ color: "var(--color-rust)" }}
                        >
                          對方會讀成
                        </p>
                        <p className="text-[14px] leading-relaxed">
                          {h.heardAs ?? h.rule.why}
                        </p>
                      </div>

                      {h.better.length > 0 && (
                        <div>
                          <p className="mb-1.5">
                            <Src kind="ours">改成這樣說</Src>
                          </p>
                          <ul className="space-y-2">
                            {h.better.slice(0, 3).map((b, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="font-serif text-[14.5px] leading-snug">
                                    {b.en}
                                  </p>
                                  <p className="mt-0.5 text-[12.5px] text-ink-2">
                                    {b.zh}
                                  </p>
                                </div>
                                <Speak
                                  text={b.en}
                                  id={`ck-${h.rule.trap}-${i}`}
                                  className="shrink-0 mt-0.5"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
