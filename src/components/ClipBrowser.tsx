"use client";

import { useEffect, useMemo, useState } from "react";
import ClipPlayer from "./ClipPlayer";
import { clipPhrases, type ClipPhrase, searchPhrases } from "@/lib/clips";

export default function ClipBrowser({
  initialPhrase,
}: {
  initialPhrase?: string;
}) {
  const [q, setQ] = useState("");
  // 靜態輸出沒有伺服器端 query，所以在客戶端讀網址參數。
  // ?fn=<語言功能> 由功能頁帶進來，只列該功能底下的說法。
  const [fnFilter, setFnFilter] = useState<string | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setFnFilter(p.get("fn"));
    const phrase = p.get("p");
    if (phrase) setQ(phrase);
  }, []);

  const pool = useMemo(
    () => (fnFilter ? clipPhrases.filter((p) => p.fns.includes(fnFilter)) : null),
    [fnFilter],
  );

  const results = useMemo(() => {
    if (!pool) return searchPhrases(q, 60);
    const needle = q.trim().toLowerCase();
    return pool
      .filter((p) => !needle || p.p.includes(needle))
      .slice(0, 60);
  }, [q, pool]);

  const [selected, setSelected] = useState<ClipPhrase | null>(
    () => searchPhrases(initialPhrase ?? "", 1)[0] ?? null,
  );

  const active = selected ?? results[0] ?? null;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 order-2 lg:order-1">
        {active ? (
          <>
            <div className="mb-4">
              <p className="rule-label mb-1">正在聽</p>
              <h2 className="font-serif text-[1.6rem] text-rust leading-snug">
                {active.display}
              </h2>
              <p className="mt-1 text-[12.5px] text-ink-3">
                收錄 {active.hits.length} 段，來自 {active.episodes} 集、
                {active.speakers} 位講者
                {active.total > active.hits.length && (
                  <span className="opacity-75">
                    （語料裡共出現 {active.total} 次）
                  </span>
                )}
              </p>
            </div>
            <ClipPlayer clips={active.hits} label={active.p} />
          </>
        ) : (
          <p className="text-[14px] text-ink-2 py-12 text-center">
            沒有符合的說法，換個關鍵字試試。
          </p>
        )}
      </div>

      <aside className="order-1 lg:order-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜說法本身，例如 the way I think"
          className="w-full border border-rule bg-paper px-3.5 py-2.5 text-[14px] rounded-sm placeholder:text-ink-3 focus:outline-none focus:border-rust"
        />
        <p className="mt-2 mb-3 text-[12px] text-ink-3">
          {results.length} 個說法
          {q.trim() && results.length === 0 && (
            <span className="block mt-1">
              這裡只搜「說法」本身。想搜句子內容請用{" "}
              <a
                href="/search/"
                className="underline underline-offset-2 hover:text-rust"
              >
                全站搜尋
              </a>
              。
            </span>
          )}
        </p>
        <div className="max-h-[70vh] overflow-y-auto border border-rule rounded-sm divide-y divide-rule">
          {results.map((p) => (
            <button
              key={p.p}
              onClick={() => setSelected(p)}
              className={`w-full text-left px-3.5 py-2.5 transition-colors ${
                active?.p === p.p
                  ? "bg-rust-soft text-rust"
                  : "hover:bg-paper-2"
              }`}
            >
              <span className="font-serif text-[14px] leading-snug">
                {p.display}
              </span>
              <span className="ml-2 text-[11px] tabular-nums text-ink-3">
                {p.hits.length} 段
              </span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
