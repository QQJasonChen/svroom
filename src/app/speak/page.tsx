import Link from "next/link";
import { groups, stats, countFor, countForGroup } from "@/lib/cards";
import { writingStats } from "@/lib/writing";

export const metadata = {
  title: "開口說｜矽谷會議室",
  description:
    "按「你當下想做什麼」分類的 30 個語言功能——說服、擋需求、優雅插話、承認不知道。",
};

export default function SpeakPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
          <p className="rule-label mb-4">開口說</p>
          <h1 className="font-serif text-[2.2rem] sm:text-[2.8rem] leading-[1.12] tracking-tight max-w-3xl">
            不按主題分，
            <span className="text-rust">按你當下想做什麼</span>分。
          </h1>
          <p className="mt-6 max-w-2xl text-[15.5px] leading-[1.85] text-ink-2">
            你不會在會議中想著「我要用商業詞彙」，你會想的是「我要擋掉這個需求」「我要不失禮貌地反對」。
            所以這裡的 {stats.covered} 個分類就長成這樣。每張卡都附逐字稿原文、出處，可以就地播放本人怎麼講。
          </p>
          <p className="mt-4 text-[13px] text-ink-3">
            {stats.cards} 張句型卡 · 另有{" "}
            <Link href="/w/" className="underline underline-offset-2 hover:text-rust">
              {writingStats.cards} 張書面寫法卡
            </Link>{" "}
            ·{" "}
            <Link href="/vs/" className="underline underline-offset-2 hover:text-rust">
              同一件事，講 vs 寫的對照
            </Link>
          </p>
        </div>
      </section>

      {/* 功能總覽 */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="space-y-12">
          {groups.map((g) => {
            const n = countForGroup(g.id);
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
                    {n} 張
                  </span>
                </div>
                <p className="text-[14px] text-ink-2 mb-5">{g.blurb}</p>

                <div className="grid gap-px bg-rule border border-rule sm:grid-cols-2 lg:grid-cols-3">
                  {g.functions.map((f) => {
                    const count = countFor(f.id);
                    const empty = count === 0;
                    const inner = (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`text-[14.5px] font-medium ${empty ? "text-ink-3" : ""}`}
                          >
                            {f.zh}
                          </span>
                          <span className="ml-auto text-[11px] tabular-nums text-ink-3">
                            {empty ? "整理中" : count}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] text-ink-3 leading-relaxed">
                          {f.scene}
                        </p>
                      </>
                    );
                    return empty ? (
                      <div
                        key={f.id}
                        className="bg-paper px-4 py-3.5 opacity-55"
                        aria-disabled
                      >
                        {inner}
                      </div>
                    ) : (
                      <Link
                        key={f.id}
                        href={`/f/${f.id}/`}
                        className="bg-paper px-4 py-3.5 hover:bg-rust-soft transition-colors"
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
