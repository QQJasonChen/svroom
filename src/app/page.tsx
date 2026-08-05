import Link from "next/link";
import { groups, stats, countFor, countForGroup } from "@/lib/cards";
import { conceptStats } from "@/lib/concepts";
import { scenarios, scenarioCardCount } from "@/lib/scenarios";
import { writingStats } from "@/lib/writing";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <p className="rule-label mb-5">從真實對話學商業英文</p>
          <h1 className="font-serif text-[2.4rem] sm:text-[3.4rem] leading-[1.08] tracking-tight max-w-3xl">
            你不是英文不好。
            <br />
            你是<span className="text-rust">沒聽過別人怎麼講</span>。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            會議上想反對一個提案，腦中只剩「I don&apos;t think so」。想爭取資源，只擠得出「Can we have more people?」——
            問題不在單字量，在於你沒看過母語者在<strong className="font-semibold text-ink">同樣的處境</strong>下真的怎麼說。
          </p>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            這裡把矽谷產品經理與創辦人的真實對話，拆成 {stats.functions} 個
            <strong className="font-semibold text-ink">「語言功能」</strong>
            ——說服、擋需求、給難聽的回饋、承認不知道——每一個都附上真人的原句、拆解，以及順帶學到的 PM 知識。
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px]">
            <Stat n={stats.cards + writingStats.cards} label="句型卡" />
            <Stat n={stats.covered + writingStats.covered} label="語言功能" />
            <Stat n={conceptStats.written} label="PM 概念" />
            <Stat n={stats.guests} label="位講者" />
            <Link
              href="/practice/"
              className="ml-auto bg-rust text-paper px-5 py-2.5 text-[13px] font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              直接開始練習 →
            </Link>
          </div>
        </div>
      </section>

      {/* 情境入口：先解決「這麼多卡，我從哪開始」 */}
      <section className="border-b border-rule bg-paper-2/40">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-serif text-[1.7rem] tracking-tight">
            你這週要開什麼會？
          </h2>
          <p className="mt-2 text-[14px] text-ink-2">
            不用從頭讀到尾。挑一個你真的會遇到的處境，該學的都在裡面了。
          </p>

          <div className="mt-6 grid gap-px bg-rule border border-rule sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((s) => (
              <Link
                key={s.id}
                href={`/s/${s.id}/`}
                className={`px-4 py-4 transition-colors ${
                  s.featured
                    ? "bg-rust-soft hover:bg-rust hover:text-paper"
                    : "bg-paper hover:bg-rust-soft"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-[14.5px] font-medium">{s.zh}</span>
                  <span className="ml-auto text-[11px] tabular-nums opacity-60">
                    {scenarioCardCount(s)}
                  </span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed opacity-75">
                  {s.hook}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 為什麼這樣設計 */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-10 grid gap-7 sm:grid-cols-3">
          <Point
            title="不按主題分，按「你要做什麼」分"
            body="傳統教材分「商業會議」「電子郵件」。這裡分的是「你想反對別人」「你想爭取資源」——你打開的當下就在那個處境裡。"
          />
          <Point
            title="每一句都是真人講過的"
            body="不是編出來的教科書例句。是 Marty Cagan、April Dunford 這些人在被追問時，即興講出來的話。附時間戳，可以回去聽語氣。"
          />
          <Point
            title="學語言，順便長 PM 腦"
            body="學「怎麼談取捨」時，例句內容本身就是 PM 在講優先順序怎麼排。語言是載體，專業判斷是內容。"
          />
        </div>
      </section>

      {/* 另一半：PM 知識層 */}
      {conceptStats.written > 0 && (
        <section className="border-b border-rule">
          <div className="mx-auto max-w-5xl px-5 py-12 flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex-1">
              <p className="rule-label mb-2">這個站的另一半</p>
              <h2 className="font-serif text-[1.7rem] tracking-tight leading-snug">
                PM 知識庫：{conceptStats.written} 個核心概念
              </h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-ink-2 max-w-xl">
                從問題定義、策略取捨到向上管理。每個概念除了中文解說，都附「
                <strong className="font-medium text-ink">在英文會議上怎麼把它講出來</strong>
                」的句型，以及台灣 PM 最常踩的坑。跟語言功能雙向連結——
                學句型時看得到背後的判斷，學概念時知道怎麼開口。
              </p>
            </div>
            <Link
              href="/pm/"
              className="shrink-0 border border-ink px-5 py-2.5 text-[13px] rounded-sm hover:bg-ink hover:text-paper transition-colors"
            >
              進 PM 知識庫 →
            </Link>
          </div>
        </section>
      )}

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

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-serif text-[1.6rem] tabular-nums leading-none">
        {n}
      </span>
      <span className="text-ink-3">{label}</span>
    </div>
  );
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-[14px] font-semibold mb-2 leading-snug">{title}</h3>
      <p className="text-[13.5px] leading-relaxed text-ink-2">{body}</p>
    </div>
  );
}
