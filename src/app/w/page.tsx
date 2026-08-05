import Link from "next/link";
import {
  writingGroups,
  writingStats,
  writingCountFor,
} from "@/lib/writing";

export const metadata = {
  title: "書面英文｜矽谷會議室",
  description:
    "Slack、email、PRD、週報、績效自評——PM 一天寫的英文比講的多，但這塊幾乎沒人做教材。",
};

export default function WritingPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <p className="rule-label mb-5">書面英文</p>
          <h1 className="font-serif text-[2.2rem] sm:text-[3rem] leading-[1.1] tracking-tight max-w-3xl">
            寫下來的英文
            <br />
            <span className="text-rust">沒有語氣可以幫你緩衝</span>。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            當面講錯了可以看臉色補救，寫下來只有一次機會——而且對方可能三天後才讀、還會被轉發。
            你一天寫的英文（Slack、email、PRD、週報、自評）其實比講的多，但這塊幾乎沒有教材。
          </p>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-ink-2">
            這一層的語料來自 367 篇產品管理長文——不是「教你怎麼寫」的段落，而是
            <strong className="font-medium text-ink">作者自己的行文本身</strong>。
          </p>

          {writingStats.cards > 0 && (
            <div className="mt-9 flex flex-wrap items-baseline gap-x-8 gap-y-3 text-[13px]">
              <span className="flex items-baseline gap-1.5">
                <span className="font-serif text-[1.6rem] tabular-nums leading-none">
                  {writingStats.cards}
                </span>
                <span className="text-ink-3">句型卡</span>
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="font-serif text-[1.6rem] tabular-nums leading-none">
                  {writingStats.covered}
                </span>
                <span className="text-ink-3">寫作場景</span>
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        {writingStats.cards === 0 ? (
          <p className="text-[15px] text-ink-2">內容整理中。</p>
        ) : (
          <div className="space-y-12">
            {writingGroups.map((g) => (
              <div key={g.id}>
                <div className="flex items-baseline gap-3 mb-1">
                  <h2 className="font-serif text-[1.6rem] tracking-tight">
                    {g.zh}
                  </h2>
                  <span className="text-[12px] text-ink-3 tracking-wide">
                    {g.en}
                  </span>
                </div>
                <p className="text-[14px] text-ink-2 mb-5">{g.blurb}</p>

                <div className="grid gap-px bg-rule border border-rule sm:grid-cols-2 lg:grid-cols-3">
                  {g.functions.map((f) => {
                    const count = writingCountFor(f.id);
                    const inner = (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span
                            className={`text-[14.5px] font-medium ${count === 0 ? "text-ink-3" : ""}`}
                          >
                            {f.zh}
                          </span>
                          <span className="ml-auto text-[11px] tabular-nums text-ink-3">
                            {count === 0 ? "整理中" : count}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] text-ink-3 leading-relaxed">
                          {f.scene}
                        </p>
                      </>
                    );
                    return count === 0 ? (
                      <div key={f.id} className="bg-paper px-4 py-3.5 opacity-55">
                        {inner}
                      </div>
                    ) : (
                      <Link
                        key={f.id}
                        href={`/w/${f.id}/`}
                        className="bg-paper px-4 py-3.5 hover:bg-rust-soft transition-colors"
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
