import Link from "next/link";
import { jargonGroups, jargonInGroup, jargonStats } from "@/lib/jargon";

export const metadata = {
  title: "PM 職場黑話｜矽谷會議室",
  description:
    "double click on that、table stakes、single-threaded——台灣 PM 天天聽到，但沒人教。每個詞都附真實用例。",
};

export default function JargonIndex() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <p className="rule-label mb-5">PM 職場黑話</p>
          <h1 className="font-serif text-[2.2rem] sm:text-[3rem] leading-[1.1] tracking-tight max-w-3xl">
            每個字你都懂，
            <br />
            <span className="text-rust">合起來卻不知道在講什麼</span>。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            「Can you double click on that?」不是叫你按兩下。「That's table stakes」不是在講賭桌。
            這些詞在矽谷會議裡每天出現，但沒有任何教材教——因為它們不在字典的商業英文章節裡，
            只活在真實對話中。
          </p>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-ink-2">
            這份清單是<strong className="text-ink font-medium">掃過全部 311 集的實際出現頻率決定的</strong>，
            不是憑印象挑的。每個詞的英文用例
            <strong className="text-ink font-medium">一句都沒有編</strong>，
            全是逐字稿原句，附講者與時間戳，可以就地播來聽。
          </p>
          {jargonStats.written > 0 && (
            <p className="mt-6 text-[13px] text-ink-3">
              {jargonStats.written} 個詞 · {jargonStats.usages} 則真實用例
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        {jargonStats.written === 0 ? (
          <p className="text-[15px] text-ink-2">內容整理中。</p>
        ) : (
          <div className="space-y-12">
            {jargonGroups.map((g) => {
              const list = jargonInGroup(g.id);
              if (list.length === 0) return null;
              return (
                <div key={g.id}>
                  <h2 className="font-serif text-[1.6rem] tracking-tight mb-1">
                    {g.zh}
                  </h2>
                  <p className="text-[14px] text-ink-2 mb-5">{g.blurb}</p>
                  <div className="grid gap-px bg-rule border border-rule sm:grid-cols-2">
                    {list.map((t) => (
                      <Link
                        key={t.id}
                        href={`/jargon/${t.id}/`}
                        className="bg-paper px-4 py-3.5 hover:bg-rust-soft transition-colors group"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-[15px] text-rust">
                            {t.term}
                          </span>
                          <span className="ml-auto text-[11px] tabular-nums text-ink-3">
                            {t.usage.length} 例
                          </span>
                        </div>
                        <p className="mt-0.5 text-[13.5px] font-medium">{t.zh}</p>
                        {t.trap && (
                          <p className="mt-1 text-[12px] leading-relaxed text-ink-3">
                            ⚠ {t.trap}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
