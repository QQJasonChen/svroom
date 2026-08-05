"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CardView from "./CardView";
import { type Card } from "@/lib/cards";
import { cardsForDay, dayKey } from "@/lib/today";

const DONE_KEY = "svroom.today.v1";

export default function Today() {
  // 日期必須在客戶端算：build 時算會永遠停在 build 那天
  const [key, setKey] = useState<string | null>(null);
  const [list, setList] = useState<Card[]>([]);
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    const k = dayKey(new Date());
    setKey(k);
    setList(cardsForDay(k, 5));
    try {
      const raw = window.localStorage.getItem(DONE_KEY);
      const saved = raw ? JSON.parse(raw) : null;
      setDone(saved?.day === k ? saved.ids : []);
    } catch {
      /* 隱私模式就算了 */
    }
  }, []);

  const mark = (id: string) => {
    setDone((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        window.localStorage.setItem(
          DONE_KEY,
          JSON.stringify({ day: key, ids: next }),
        );
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  if (!key) {
    return (
      <div className="h-64 flex items-center justify-center text-ink-3 text-sm">
        載入中…
      </div>
    );
  }

  const finished = done.length >= list.length;

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3 mb-6">
        <p className="text-[13px] text-ink-3 tabular-nums">
          {done.length} / {list.length} 完成
        </p>
        <div className="flex-1 min-w-[120px] h-1 bg-rule rounded-full overflow-hidden">
          <div
            className="h-full bg-rust transition-all duration-300"
            style={{ width: `${(done.length / list.length) * 100}%` }}
          />
        </div>
        {finished && (
          <Link
            href="/practice/"
            className="text-[13px] text-rust underline underline-offset-2"
          >
            今天的練完了，去複習 →
          </Link>
        )}
      </div>

      <div className="space-y-5">
        {list.map((c, i) => {
          const isDone = done.includes(c.id);
          return (
            <div
              key={c.id}
              className={isDone ? "opacity-55 transition-opacity" : ""}
            >
              <CardView card={c} n={i + 1} />
              <button
                onClick={() => mark(c.id)}
                className={`mt-2 w-full py-2.5 text-[13px] rounded-sm border transition-colors ${
                  isDone
                    ? "border-rule text-ink-3"
                    : "border-rust text-rust hover:bg-rust hover:text-paper"
                }`}
              >
                {isDone ? "✓ 今天學過了（點一下取消）" : "我唸過一次了"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
