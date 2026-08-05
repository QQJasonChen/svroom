import Link from "next/link";
import CardView from "@/components/CardView";
import { allPairs } from "@/lib/pairs";

export const metadata = {
  title: "講 vs 寫｜矽谷會議室",
  description:
    "同一件事，講出來和寫下來用的字完全不同。並排看才知道差在哪。",
};

export default function VsPage() {
  const pairs = allPairs(3);

  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <p className="rule-label mb-5">講 vs 寫</p>
          <h1 className="font-serif text-[2.2rem] sm:text-[3rem] leading-[1.1] tracking-tight max-w-3xl">
            同一件事，
            <br />
            <span className="text-rust">講出來和寫下來不一樣</span>。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            「說不」這件事，當面講可以靠語氣和表情軟化；寫成一封信，那些全部消失，
            只剩下你選的字。多數教材只教其中一種，於是很多人把口說的說法直接寫進 email，
            或把書面的句子講出口——兩種都會出事。
          </p>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-ink-2">
            這一頁把同一個處境的兩個版本並排。左邊來自 podcast 的真實對話，
            右邊來自產品管理長文的實際行文。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 space-y-20">
        {pairs.map((p) => (
          <div key={p.id}>
            <div className="pb-5 border-b border-rule">
              <h2 className="font-serif text-[1.8rem] tracking-tight">{p.zh}</h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2 max-w-3xl">
                {p.note}
              </p>
            </div>

            <div className="mt-7 grid gap-8 lg:grid-cols-2">
              <div>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="rule-label">開口說</span>
                  <Link
                    href={`/f/${p.spokenId}/`}
                    className="text-[12.5px] text-ink-2 hover:text-rust transition-colors"
                  >
                    {p.spokenZh} →
                  </Link>
                </div>
                <div className="space-y-5">
                  {p.spoken.map((c) => (
                    <CardView key={c.id} card={c} />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="rule-label">動筆寫</span>
                  <Link
                    href={`/w/${p.writtenId}/`}
                    className="text-[12.5px] text-ink-2 hover:text-rust transition-colors"
                  >
                    {p.writtenZh} →
                  </Link>
                </div>
                <div className="space-y-5">
                  {p.written.map((c) => (
                    <CardView key={c.id} card={c} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
