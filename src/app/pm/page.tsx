import Link from "next/link";
import { conceptGroups, conceptsInGroup, conceptStats } from "@/lib/concepts";

export const metadata = {
  title: "PM 知識庫｜矽谷會議室",
  description:
    "45 個產品管理核心概念，每個都附「這個概念在英文會議上怎麼講」，以及矽谷第一線的原文佐證。",
};

export default function PMPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <p className="rule-label mb-5">PM 知識庫</p>
          <h1 className="font-serif text-[2.2rem] sm:text-[3rem] leading-[1.1] tracking-tight max-w-3xl">
            懂這個概念，
            <br />
            跟<span className="text-rust">能用英文把它講清楚</span>，是兩件事。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            這裡收 {conceptStats.total} 個產品管理的核心概念。每一個除了中文解說，都附上
            <strong className="font-semibold text-ink">「在英文會議上怎麼把它講出來」</strong>
            的句型，以及矽谷第一線的原文佐證。
          </p>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-ink-2">
            還有一欄叫「常見的坑」——寫的是台灣 PM 在這個概念上最常誤解的地方，不是教科書定義。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="space-y-12">
          {conceptGroups.map((g) => {
            const written = conceptsInGroup(g.id);
            const writtenIds = new Set(written.map((c) => c.id));
            return (
              <div key={g.id}>
                <div className="flex items-baseline gap-3 mb-1">
                  <h2 className="font-serif text-[1.6rem] tracking-tight">
                    {g.zh}
                  </h2>
                  <span className="text-[12px] text-ink-3 tracking-wide">
                    {g.en}
                  </span>
                  <span className="ml-auto text-[12px] tabular-nums text-ink-3">
                    {written.length}/{g.concepts.length}
                  </span>
                </div>
                <p className="text-[14px] text-ink-2 mb-5">{g.blurb}</p>

                <div className="grid gap-px bg-rule border border-rule sm:grid-cols-2 lg:grid-cols-3">
                  {g.concepts.map((c) => {
                    const full = written.find((w) => w.id === c.id);
                    const inner = (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`text-[14.5px] font-medium ${!full ? "text-ink-3" : ""}`}
                          >
                            {c.zh}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-ink-3 tracking-wide">
                          {c.term}
                        </p>
                        <p className="mt-1.5 text-[12px] text-ink-3 leading-relaxed">
                          {full ? full.oneLiner : "整理中"}
                        </p>
                      </>
                    );
                    return (
                      <Link
                        key={c.id}
                        href={`/pm/${c.id}/`}
                        className={`bg-paper px-4 py-3.5 transition-colors ${
                          writtenIds.has(c.id)
                            ? "hover:bg-rust-soft"
                            : "opacity-55 hover:opacity-80"
                        }`}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
