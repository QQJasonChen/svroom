"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Card, Group } from "@/lib/cards";
import CardView from "./CardView";

export default function SearchCards({
  cards,
  groups,
}: {
  cards: Card[];
  groups: Group[];
}) {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");

  const fnLabel = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of groups) for (const f of g.functions) m.set(f.id, f.zh);
    return m;
  }, [groups]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let list = group === "all" ? cards : cards.filter((c) => c.group === group);
    if (needle) {
      list = list.filter((c) =>
        [c.zh, c.quote, c.pattern ?? "", c.why, ...c.swaps, fnLabel.get(c.fn) ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }
    return list;
  }, [q, group, cards, fnLabel]);

  const showing = results.slice(0, 40);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜中文、英文、句型都可以 — 例如「不同意」或 push back"
          className="flex-1 border border-rule bg-paper px-3.5 py-2.5 text-[14px] rounded-sm placeholder:text-ink-3 focus:outline-none focus:border-rust"
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="border border-rule bg-paper px-2.5 py-2.5 text-[13px] rounded-sm"
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
      </div>

      <p className="text-[12.5px] text-ink-3 mb-6">
        {q.trim() || group !== "all"
          ? `${results.length} 個結果${results.length > showing.length ? `（顯示前 ${showing.length} 個，再打細一點會更準）` : ""}`
          : `共 ${cards.length} 張卡，輸入關鍵字開始找`}
      </p>

      {showing.length === 0 ? (
        <div className="py-16 text-center text-ink-3 text-[14px]">
          <p>沒有符合的卡片。</p>
          <p className="mt-2">試試更短的關鍵字，或改用英文搜。</p>
        </div>
      ) : (
        <div className="space-y-5">
          {showing.map((c) => (
            <div key={c.id}>
              <Link
                href={`/f/${c.fn}/`}
                className="inline-block mb-1.5 text-[11.5px] text-ink-3 hover:text-rust transition-colors"
              >
                {fnLabel.get(c.fn)} →
              </Link>
              <CardView card={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
