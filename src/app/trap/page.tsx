import Link from "next/link";
import { trapGroups, trapsInGroup, trapStats } from "@/lib/traps";

export const metadata = {
  title: "中文腦陷阱｜矽谷會議室",
  description:
    "台灣人會這樣說 → 對方實際聽到什麼 → 該怎麼說。針對中文思維直譯到英文會出的事。",
};

export default function TrapIndex() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <p className="rule-label mb-5">中文腦陷阱</p>
          <h1 className="font-serif text-[2.2rem] sm:text-[3rem] leading-[1.1] tracking-tight max-w-3xl">
            你講的每個字都對，
            <br />
            <span className="text-rust">但對方聽到的不是那個意思</span>。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            「這個有困難」直譯成 This is difficult，對方不會理解成拒絕——他會開始幫你想辦法。
            這種落差不是單字量問題，也不是文法問題，是
            <strong className="font-semibold text-ink">兩種語言的運作機制不同</strong>。
          </p>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-ink-2">
            華語母語者的干擾是有系統的：委婉的方式不同、責任歸屬的講法不同、
            確定性靠語氣詞而不是靠選字、結論的位置相反、禮貌的方向相反，
            再加上中文沒有的時態與冠詞。這一頁把它們一條一條拆開。
          </p>
          {trapStats.written > 0 && (
            <p className="mt-6 text-[13px] text-ink-3">
              {trapStats.written} 條陷阱 · {trapStats.withCorpus} 條附語料佐證
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        {trapStats.written === 0 ? (
          <p className="text-[15px] text-ink-2">內容整理中。</p>
        ) : (
          <div className="space-y-12">
            {trapGroups.map((g) => {
              const list = trapsInGroup(g.id);
              if (list.length === 0) return null;
              return (
                <div key={g.id}>
                  <div className="flex items-baseline gap-3 mb-1">
                    <h2 className="font-serif text-[1.6rem] tracking-tight">
                      {g.zh}
                    </h2>
                    <span className="text-[12px] text-ink-3 tracking-wide">
                      {g.en}
                    </span>
                  </div>
                  <p className="text-[14px] text-ink-2 mb-5 max-w-3xl">
                    {g.blurb}
                  </p>

                  <div className="space-y-px bg-rule border border-rule">
                    {list.map((t) => (
                      <Link
                        key={t.id}
                        href={`/trap/${t.id}/`}
                        className="block bg-paper px-4 sm:px-5 py-4 hover:bg-rust-soft transition-colors group"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-[14.5px] font-medium">
                            「{t.zhInstinct}」
                          </span>
                          {t.enLiteral && (
                            <span className="font-serif text-[13.5px] text-ink-3">
                              {t.enLiteral}
                            </span>
                          )}
                          <span className="ml-auto text-ink-3 group-hover:text-rust">
                            →
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                          {t.heardAs}
                        </p>
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
