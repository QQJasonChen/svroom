"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Card, Group } from "@/lib/cards";
import { difficultyLabel } from "@/lib/cards";
import {
  type CardState,
  type Grade,
  grade as gradeCard,
  isDue,
  load,
  save,
  summarize,
} from "@/lib/srs";

type Props = { cards: Card[]; groups: Group[] };

// 決定性洗牌，避免 SSR/CSR 內容不一致；種子每次開新一輪才變
function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeDeck({ cards, groups }: Props) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<Record<string, CardState>>({});
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [revealed, setRevealed] = useState(false);
  const [idx, setIdx] = useState(0);
  const [seed, setSeed] = useState(1);
  const [done, setDone] = useState(0);

  useEffect(() => {
    setState(load());
    setSeed(Math.floor(Math.random() * 1e9) + 1);
    setReady(true);
  }, []);

  const pool = useMemo(
    () =>
      groupFilter === "all"
        ? cards
        : cards.filter((c) => c.group === groupFilter),
    [cards, groupFilter],
  );

  const queue = useMemo(() => {
    if (!ready) return [];
    const due = pool.filter((c) => isDue(state, c.id));
    // 到期的先練；全部練完就整池重來，不要讓人卡在空畫面
    return shuffle(due.length > 0 ? due : pool, seed);
    // state 變動不重排，否則每評一張卡整副牌會跳掉
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, ready, seed]);

  const card = queue[idx];
  const summary = useMemo(
    () => summarize(state, pool.map((c) => c.id)),
    [state, pool],
  );

  const answer = useCallback(
    (g: Grade) => {
      if (!card) return;
      setState((prev) => {
        const next = { ...prev, [card.id]: gradeCard(prev[card.id], g) };
        save(next);
        return next;
      });
      setRevealed(false);
      setDone((d) => d + 1);
      setIdx((i) => i + 1);
    },
    [card],
  );

  // 鍵盤操作：空白翻卡，1/2/3 評分
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setRevealed((r) => !r);
      } else if (revealed && ["1", "2", "3"].includes(e.key)) {
        answer(({ "1": "again", "2": "ok", "3": "got" } as const)[e.key as "1"]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, answer]);

  const restart = () => {
    setSeed(Math.floor(Math.random() * 1e9) + 1);
    setIdx(0);
    setRevealed(false);
  };

  if (!ready) {
    return <div className="h-96 flex items-center justify-center text-ink-3 text-sm">載入中…</div>;
  }

  return (
    <div>
      {/* 控制列 */}
      <div className="flex flex-wrap items-center gap-2 pb-5 mb-7 border-b border-rule">
        <select
          value={groupFilter}
          onChange={(e) => {
            setGroupFilter(e.target.value);
            setIdx(0);
            setRevealed(false);
          }}
          className="text-[13px] border border-rule bg-paper px-2.5 py-1.5 rounded-sm"
        >
          <option value="all">全部主題</option>
          {groups
            .filter((g) => cards.some((c) => c.group === g.id))
            .map((g) => (
              <option key={g.id} value={g.id}>
                {g.zh}
              </option>
            ))}
        </select>

        <div className="ml-auto flex items-center gap-3 text-[12px] text-ink-3 tabular-nums">
          <span>本輪 {done}</span>
          <span className="text-rust">學習中 {summary.learning}</span>
          <span style={{ color: "var(--color-slate)" }}>已熟 {summary.known}</span>
        </div>
      </div>

      {!card ? (
        <div className="py-20 text-center space-y-4">
          <p className="font-serif text-[1.6rem]">這一輪練完了</p>
          <p className="text-[14px] text-ink-2">
            本輪練了 {done} 張。已熟 {summary.known} 張、學習中 {summary.learning} 張。
          </p>
          <button
            onClick={restart}
            className="bg-rust text-paper px-5 py-2.5 text-[13px] rounded-sm hover:opacity-90"
          >
            再來一輪
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4 text-[11.5px] text-ink-3">
            <span className="tabular-nums">
              {idx + 1} / {queue.length}
            </span>
            <span>·</span>
            <span>{difficultyLabel[card.difficulty]}</span>
          </div>

          {/* 正面：中文情境，逼你先自己想英文 */}
          <div className="border border-rule rounded-sm px-6 sm:px-8 py-9 bg-paper-2/40 min-h-[240px] flex flex-col justify-center">
            <p className="rule-label mb-4">這句英文怎麼說？</p>
            <p className="text-[17px] leading-[1.85]">{card.zh}</p>

            {revealed && (
              <div className="mt-8 pt-7 border-t border-rule space-y-5">
                <blockquote className="quote pl-4 border-l-2 border-rust/35">
                  {card.quote}
                </blockquote>

                {card.pattern && (
                  <p className="font-serif text-[14.5px] text-rust">
                    句型：{card.pattern}
                  </p>
                )}

                <div>
                  <p className="rule-label mb-1.5">為什麼這樣講</p>
                  <p className="text-[14px] leading-relaxed text-ink-2">
                    {card.why}
                  </p>
                </div>

                <p className="text-[12px] text-ink-3">
                  {card.guest}
                  {card.timestamp ? ` · ${card.timestamp}` : ""}
                  {card.url && (
                    <>
                      {" · "}
                      <a
                        href={card.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-rust"
                      >
                        聽原句 ↗
                      </a>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* 操作 */}
          <div className="mt-5">
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="w-full bg-ink text-paper py-3 text-[14px] rounded-sm hover:opacity-90 transition-opacity"
              >
                看答案
                <span className="ml-2 opacity-50 text-[12px]">空白鍵</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <GradeBtn onClick={() => answer("again")} k="1" label="想不出來" />
                <GradeBtn onClick={() => answer("ok")} k="2" label="有印象" />
                <GradeBtn onClick={() => answer("got")} k="3" label="會了" primary />
              </div>
            )}
          </div>

          <p className="mt-5 text-[12px] text-ink-3">
            這張卡屬於{" "}
            <Link
              href={`/f/${card.fn}/`}
              className="underline underline-offset-2 hover:text-rust"
            >
              同主題的其他句型
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

function GradeBtn({
  onClick,
  label,
  k,
  primary,
}: {
  onClick: () => void;
  label: string;
  k: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3 text-[13.5px] rounded-sm border transition-colors ${
        primary
          ? "bg-rust text-paper border-rust hover:opacity-90"
          : "border-rule hover:border-rust hover:text-rust"
      }`}
    >
      {label}
      <span className="ml-1.5 opacity-50 text-[11px]">{k}</span>
    </button>
  );
}
