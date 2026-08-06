"use client";

import { useEffect, useMemo, useState } from "react";
import ClipPlayer from "./ClipPlayer";
import {
  clipCategories,
  clipPhrases,
  type ClipPhrase,
  isRare,
  searchPhrases,
} from "@/lib/clips";

export default function ClipBrowser({
  initialPhrase,
}: {
  initialPhrase?: string;
}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<string>("all");

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

  const searched = useMemo(() => {
    if (!pool) return searchPhrases(q, 400);
    const needle = q.trim().toLowerCase();
    return pool.filter((p) => !needle || p.p.includes(needle));
  }, [q, pool]);

  const results = useMemo(
    () => (tab === "all" ? searched : searched.filter((p) => p.cat === tab)),
    [searched, tab],
  );

  // 每個分類在目前搜尋結果下還剩幾個，Tab 上直接標出來
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of searched) m.set(p.cat, (m.get(p.cat) ?? 0) + 1);
    return m;
  }, [searched]);

  const [selected, setSelected] = useState<ClipPhrase | null>(
    () => searchPhrases(initialPhrase ?? "", 1)[0] ?? null,
  );

  const active =
    (selected && results.some((r) => r.p === selected.p) ? selected : null) ??
    results[0] ??
    null;
  const activeCat = clipCategories.find((c) => c.id === active?.cat);

  const tabs = [
    { id: "all", zh: "全部", blurb: "" },
    ...clipCategories.filter((c) => (counts.get(c.id) ?? 0) > 0),
  ];

  return (
    <div>
      {/* 分類 Tab：橫向一排，點一下就換，不必捲側欄 */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 border-b border-rule">
        {tabs.map((c) => {
          const n = c.id === "all" ? searched.length : counts.get(c.id) ?? 0;
          const on = tab === c.id;
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
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {tab !== "all" && activeCat && (
        <p className="mt-3 text-[13px] text-ink-2">{activeCat.blurb}</p>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 order-2 lg:order-1">
          {active ? (
            <>
              <div className="mb-4">
                <p className="rule-label mb-1">
                  正在聽{activeCat ? ` · ${activeCat.zh}` : ""}
                </p>
                <h2 className="font-serif text-[1.6rem] text-rust leading-snug">
                  {active.display}
                  {isRare(active) && (
                    <span className="ml-2 align-middle text-[10px] font-sans font-semibold tracking-[0.1em] uppercase border border-rust/40 text-rust px-1.5 py-0.5 rounded-sm">
                      少見
                    </span>
                  )}
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
              這一類沒有符合的說法。
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
            {q.trim() && searched.length === 0 && (
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
          <div className="max-h-[72vh] overflow-y-auto border border-rule rounded-sm divide-y divide-rule">
            {results.map((p) => (
              <button
                key={p.p}
                onClick={() => setSelected(p)}
                className={`w-full text-left px-3.5 py-2.5 transition-colors ${
                  active?.p === p.p ? "bg-rust-soft text-rust" : "hover:bg-paper-2"
                }`}
              >
                <span className="font-serif text-[14px] leading-snug">
                  {p.display}
                </span>
                {isRare(p) && (
                  <span className="ml-1.5 text-[10px] text-rust opacity-80">
                    少見
                  </span>
                )}
                <span className="ml-2 text-[11px] tabular-nums text-ink-3">
                  {p.hits.length} 段
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
