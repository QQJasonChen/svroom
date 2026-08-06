import Link from "next/link";
import { findings, findingStats } from "@/lib/findings";

export const metadata = {
  title: "語料數據發現｜矽谷會議室",
  description:
    "不是「我覺得台灣人不會什麼」，是掃過全部 311 集數出來的。數字先行，然後才是解讀。",
};

export default function FindingIndex() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <p className="rule-label mb-5">語料數據發現</p>
          <h1 className="font-serif text-[2.2rem] sm:text-[3rem] leading-[1.1] tracking-tight max-w-3xl">
            不是我覺得，
            <br />
            是<span className="text-rust">數出來的</span>。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            這個站其他地方的分析，起點都是一個假設——「台灣人大概不擅長 X」，然後去語料裡找證據。
            那樣有個問題：<strong className="font-semibold text-ink">找得到的都是我原本就想得到的</strong>。
          </p>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            這一層倒過來做：先掃過全部 311 集、統計各種語用行為的出現頻率，
            讓資料自己浮出哪些行為對這群人來說是<strong className="font-semibold text-ink">呼吸一樣的事</strong>——
            然後才問「那台灣人為什麼不做」。
          </p>
          {findingStats.count > 0 && (
            <p className="mt-6 text-[13px] text-ink-3">
              {findingStats.count} 條發現 · {findingStats.types} 個用法型別 ·{" "}
              {findingStats.examples} 則真實例句
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        {findings.length === 0 ? (
          <p className="text-[15px] text-ink-2">內容整理中。</p>
        ) : (
          <div className="space-y-px bg-rule border border-rule">
            {findings.map((f) => {
              const pct = Math.round((f.stat.episodes / f.stat.total) * 100);
              return (
                <Link
                  key={f.id}
                  href={`/finding/${f.id}/`}
                  className="block bg-paper px-5 sm:px-7 py-6 hover:bg-rust-soft transition-colors group"
                >
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2 className="font-serif text-[1.5rem] tracking-tight">
                      {f.zh}
                    </h2>
                    <span className="text-[12.5px] text-ink-3 tabular-nums">
                      {f.stat.count.toLocaleString()} 次 · {f.stat.episodes}/
                      {f.stat.total} 集（{pct}%）
                    </span>
                    <span className="ml-auto text-ink-3 group-hover:text-rust">
                      →
                    </span>
                  </div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">
                    {f.headline}
                  </p>
                  <p className="mt-1.5 text-[12px] text-ink-3">
                    {f.types.length} 種用法
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
