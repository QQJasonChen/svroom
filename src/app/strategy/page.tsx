import Link from "next/link";
import { examplesFor, strategies } from "@/lib/strategies";

export const metadata = {
  title: "核心語言策略｜矽谷會議室",
  description:
    "1,100 張句型卡背後，其實只有 7 個模式。學會這 7 個，剩下的都是變體。",
};

export default function StrategyIndex() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <p className="rule-label mb-5">總論</p>
          <h1 className="font-serif text-[2.2rem] sm:text-[3rem] leading-[1.1] tracking-tight max-w-3xl">
            一千多張卡背後，
            <br />
            其實只有 <span className="text-rust">7 個模式</span>。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            這個站的語料是由 15 組獨立採集完成的，彼此不知道對方在做什麼。有意思的是，
            它們各自回報「這批講者最值得學的語言習慣」時，30 條觀察
            <strong className="font-semibold text-ink">高度收斂到同樣幾個模式</strong>。
          </p>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            那些模式就是下面這 7 個。它們是跨越所有卡片的元規則——
            先看懂這一頁，再去看句型，你會發現大部分卡片只是同一招的變體。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="space-y-px bg-rule border border-rule">
          {strategies.map((s) => (
            <Link
              key={s.id}
              href={`/strategy/${s.id}/`}
              className="block bg-paper px-5 sm:px-7 py-6 hover:bg-rust-soft transition-colors group"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-[1.5rem] text-rust tabular-nums shrink-0">
                  {String(s.n).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h2 className="font-serif text-[1.4rem] tracking-tight leading-snug">
                    {s.zh}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-ink-3 tracking-wide">
                    {s.en}
                  </p>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-2">
                    {s.hook}
                  </p>
                  <p className="mt-2 text-[12px] text-ink-3">
                    {examplesFor(s).length} 個真實例句
                  </p>
                </div>
                <span className="ml-auto self-center text-ink-3 group-hover:text-rust">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
