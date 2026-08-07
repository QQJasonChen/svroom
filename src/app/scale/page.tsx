import Link from "next/link";
import { scales, scaleStats } from "@/lib/scales";

export const metadata = {
  title: "力道刻度尺｜矽谷會議室",
  description:
    "同一個意思有五種力道。選錯不是不禮貌，是燒掉信用或燒掉關係。每一級都標明用錯的代價。",
};

export default function ScaleIndex() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <p className="rule-label mb-5">力道刻度尺</p>
          <h1 className="font-serif text-[2.2rem] sm:text-[3rem] leading-[1.1] tracking-tight max-w-3xl">
            講得出來之後，
            <br />
            下一關是<span className="text-rust">講對力道</span>。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            <span className="font-serif">I&apos;m not sure I agree</span>、
            <span className="font-serif">I&apos;d push back on that</span>、
            <span className="font-serif">That&apos;s not going to work</span>
            ——這是三個完全不同的等級。
            <strong className="font-semibold text-ink">選錯不是不禮貌，是燒掉信用或燒掉關係。</strong>
          </p>
          <p className="mt-4 max-w-2xl text-[15px] leading-[1.8] text-ink-2">
            台灣人在英文裡幾乎沒有這把尺，因為中文的力道靠語氣詞和關係調節，英文靠選字。
            所以我們常常拿最輕的一級，去達成需要第三級的效果——然後不知道為什麼沒有用。
          </p>
          {scaleStats.count > 0 && (
            <p className="mt-6 text-[13px] text-ink-3">
              {scaleStats.count} 把尺 · {scaleStats.levels} 個等級 ·{" "}
              {scaleStats.examples} 則真實例句
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        {scales.length === 0 ? (
          <p className="text-[15px] text-ink-2">內容整理中。</p>
        ) : (
          <div className="space-y-px bg-rule border border-rule">
            {scales.map((s) => (
              <Link
                key={s.fn}
                href={`/scale/${s.fn}/`}
                className="block bg-paper px-5 sm:px-7 py-6 hover:bg-rust-soft transition-colors group"
              >
                <div className="flex items-baseline gap-3">
                  <h2 className="font-serif text-[1.5rem] tracking-tight">
                    {s.zh}
                  </h2>
                  <span className="text-[12px] text-ink-3">
                    {s.levels.length} 級
                  </span>
                  <span className="ml-auto text-ink-3 group-hover:text-rust">
                    →
                  </span>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
                  {s.axis}
                </p>
                <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-[12px] text-ink-3">
                  {s.levels.map((lv) => (
                    <span key={lv.n}>
                      <span className="text-rust tabular-nums">{lv.n}</span>{" "}
                      {lv.zh}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
