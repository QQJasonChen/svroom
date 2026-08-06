"use client";

import { useMemo, useState } from "react";
import InlineClip from "./InlineClip";
import Speak from "./Speak";
import { Src } from "./Src";
import { type Question, type QuestionCat } from "@/lib/questions";

export default function AskBrowser({
  cats,
  questions,
}: {
  cats: QuestionCat[];
  questions: Question[];
}) {
  const [tab, setTab] = useState<string>(cats[0]?.id ?? "");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of questions) m.set(q.cat, (m.get(q.cat) ?? 0) + 1);
    return m;
  }, [questions]);

  const shown = cats.filter((c) => (counts.get(c.id) ?? 0) > 0);
  const active = shown.find((c) => c.id === tab) ?? shown[0];
  const list = questions.filter((q) => q.cat === active?.id);

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 border-b border-rule">
        {shown.map((c) => {
          const on = active?.id === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setTab(c.id)}
              className={`shrink-0 px-3.5 py-2 text-[13.5px] rounded-t-sm border-b-2 transition-colors ${
                on
                  ? "border-rust text-rust font-medium"
                  : "border-transparent text-ink-2 hover:text-rust"
              }`}
            >
              {c.zh}
              <span className="ml-1.5 text-[11px] tabular-nums opacity-60">
                {counts.get(c.id)}
              </span>
            </button>
          );
        })}
      </div>

      {active && (
        <p className="mt-3 mb-7 text-[14px] text-ink-2">{active.blurb}</p>
      )}

      <div className="space-y-5">
        {list.map((q, i) => (
          <article
            key={q.id}
            className="border border-rule bg-paper-2/40 rounded-sm overflow-hidden"
          >
            <div className="px-5 sm:px-7 pt-5 pb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] tabular-nums text-ink-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Src kind="corpus">他真的這樣問過</Src>
                <Speak text={q.q} id={q.id} className="ml-auto" />
              </div>

              <blockquote className="quote pl-4 border-l-2 border-rust/40">
                {q.q}
              </blockquote>

              <div className="mt-3 pl-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-ink-3">
                <span className="text-ink-2">Lenny Rachitsky</span>
                {q.askedTo && <span>問 {q.askedTo}</span>}
                {q.timestamp && (
                  <span className="tabular-nums">{q.timestamp}</span>
                )}
                {q.url && (
                  <InlineClip
                    url={q.url}
                    timestamp={q.timestamp}
                    episode={q.episode}
                    seek={q.seek}
                    isSearch={q.isSearch}
                  />
                )}
              </div>
            </div>

            <div className="px-5 sm:px-7 py-5 border-t border-rule bg-paper/60 space-y-3">
              <Src kind="ours">我們的拆解</Src>
              <p className="text-[15px] leading-relaxed text-ink-2">{q.zh}</p>
              {q.pattern && (
                <div>
                  <p className="rule-label mb-1">抽出來的句型</p>
                  <p className="font-serif text-[15px] text-rust leading-snug">
                    {q.pattern}
                  </p>
                </div>
              )}
              {q.why && (
                <div>
                  <p className="rule-label mb-1">這個問法厲害在哪</p>
                  <p className="text-[14px] leading-relaxed">{q.why}</p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
