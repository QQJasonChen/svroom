import Link from "next/link";
import { stats } from "@/lib/cards";
import { clipCount } from "@/lib/clips";
import { conceptStats } from "@/lib/concepts";
import { scenarios, scenarioCardCount } from "@/lib/scenarios";
import { Src } from "@/components/Src";
import { strategies } from "@/lib/strategies";
import { writingStats } from "@/lib/writing";
import { trapStats } from "@/lib/traps";
import { jargonStats } from "@/lib/jargon";
import { questionStats } from "@/lib/questions";
import { findingStats } from "@/lib/findings";
import { scaleStats } from "@/lib/scales";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
          <p className="rule-label mb-5">從真實對話學商業英文</p>
          <h1 className="font-serif text-[2.4rem] sm:text-[3.4rem] leading-[1.08] tracking-tight max-w-3xl">
            太輕易的同意，
            <br />
            <span className="text-rust">我們已經太會了</span>。
          </h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            會議上想反對一個提案，腦中只剩「I don&apos;t think so」，於是點頭。想擋掉一個需求，
            只擠得出「This is difficult」，於是被當成求助。
            <strong className="font-semibold text-ink">問題不在單字量</strong>——
            是你沒看過母語者在同樣的處境下，怎麼把不同意講完而關係還在。
          </p>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.85] text-ink-2">
            這個站的重心就放在這裡：<strong className="font-semibold text-ink">說不、反對、挑戰前提、守住立場</strong>。
            學這幾件事，比多背一百個單字有用。
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/today/"
              className="bg-rust text-paper px-6 py-3 text-[14px] font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              今天的 5 句 →
            </Link>
            <Link
              href="/check/"
              className="border border-ink px-6 py-3 text-[14px] font-medium rounded-sm hover:bg-ink hover:text-paper transition-colors"
            >
              檢查我的英文 →
            </Link>
            <span className="text-[12.5px] text-ink-3">
              貼上你要寄出去的信，看看踩了哪些坑。
            </span>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px]">
            <Stat n={stats.cards + writingStats.cards} label="句型卡" />
            <Stat n={clipCount} label="原聲片段" />
            <Stat n={conceptStats.written} label="PM 概念" />
            <Stat n={stats.guests} label="位講者" />
          </div>
        </div>
      </section>

      {/* 這個站有兩種內容——先講清楚，免得讀的人分不出哪句有出處 */}
      <section className="border-b border-rule bg-paper-2/40">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <h2 className="font-serif text-[1.4rem] tracking-tight mb-4">
            先講清楚：這裡有兩種內容
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl">
            <div>
              <Src kind="corpus" />
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-2">
                矽谷產品經理與創辦人<strong className="text-ink font-medium">真的講過或寫過</strong>的句子。一律標示講者、時間戳與集數，
                而且可以<strong className="text-ink font-medium">直接在卡片上播出來聽本人講</strong>。
              </p>
            </div>
            <div>
              <Src kind="ours" />
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-2">
                翻譯、語用拆解、整理出來的句型與 PM 概念解說。這些是我們寫的，
                不是原文；每一句我們寫的英文旁邊都有
                <strong className="text-ink font-medium">「查語料」</strong>
                可以回頭確認語料裡有沒有人這樣講。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 三步入口 */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-serif text-[1.7rem] tracking-tight mb-1">
            從哪裡開始
          </h2>
          <p className="text-[14px] text-ink-2 mb-6">
            內容不少，但不必從頭讀到尾。照這個順序就好。
          </p>
          <div className="grid gap-px bg-rule border border-rule sm:grid-cols-3">
            <Step
              n="1"
              href="/today/"
              title="每天五句，唸出來"
              body="不用決定從哪開始。同一天打開永遠是同一組，跨天自動換。"
            />
            <Step
              n="2"
              href="/trap/"
              title="先知道自己會踩什麼坑"
              body={`${trapStats.written || ""} 條中文腦陷阱——你講的每個字都對，但對方聽到的不是那個意思。`}
            />
            <Step
              n="3"
              href="/strategy/"
              title="想看全貌再讀總論"
              body={`一千多張卡背後其實只有 ${strategies.length} 個模式，剩下都是變體。`}
            />
          </div>
        </div>
      </section>

      {/* 情境入口 */}
      <section id="scenarios" className="border-b border-rule bg-paper-2/40">
        <div className="mx-auto max-w-5xl px-5 py-12">
          <h2 className="font-serif text-[1.7rem] tracking-tight">
            你這週要開什麼會？
          </h2>
          <p className="mt-2 text-[14px] text-ink-2">
            挑一個處境，語言功能、書面寫法、PM 概念都綁在裡面了。
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

      {/* 三層內容 */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="font-serif text-[1.7rem] tracking-tight mb-1">
          或者直接翻
        </h2>
        <p className="text-[14px] text-ink-2 mb-6">
          三層內容互相連結——學句型時看得到背後的判斷，學概念時知道怎麼開口。
        </p>
        <div className="grid gap-px bg-rule border border-rule sm:grid-cols-2">
          <Panel
            href="/speak/"
            label="開口說"
            n={stats.cards}
            unit="張句型卡"
            body={`${stats.covered} 個語言功能，按「你當下想做什麼」分類——說服、擋需求、優雅插話、承認不知道。`}
          />
          <Panel
            href="/w/"
            label="動筆寫"
            n={writingStats.cards}
            unit="張寫法卡"
            body={`${writingStats.covered} 個寫作場景。Slack、email、PRD、週報、自評——你一天寫的英文比講的多。`}
          />
          <Panel
            href="/pm/"
            label="PM 知識"
            n={conceptStats.written}
            unit="個核心概念"
            body="每個概念都附「在英文會議上怎麼把它講出來」，以及台灣 PM 最常踩的坑。"
          />
          <Panel
            href="/finding/"
            label="語料數據發現"
            n={findingStats.count}
            unit="條"
            body="不是「我覺得台灣人不會什麼」，是掃過全部 311 集數出來的。先有數字，再有解讀。"
          />
          <Panel
            href="/trap/"
            label="中文腦陷阱"
            n={trapStats.written}
            unit="條"
            body="台灣人會這樣說 → 對方實際聽到什麼 → 該怎麼說。針對中文思維直譯到英文會出的事。"
          />
          <Panel
            href="/scale/"
            label="力道刻度尺"
            n={scaleStats.count}
            unit="把尺"
            body={`I'm not sure I agree／I'd push back on that／That's not going to work 是三個不同等級。${scaleStats.levels} 級，每級都標明用錯的代價。`}
          />
          <Panel
            href="/jargon/"
            label="PM 職場黑話"
            n={jargonStats.written}
            unit="個詞"
            body="double click on that、table stakes、single-threaded——天天聽到但沒人教。清單由 311 集的實際頻率決定，英文用例一句都沒編。"
          />
          <Panel
            href="/ask/"
            label="主持人怎麼問"
            n={questionStats.count}
            unit="則提問"
            body="追問、挖深、換角度、把對方拉回主題。Lenny 真的問過的句子，原封不動萃取。"
          />
          <Panel
            href="/clips/"
            label="原聲片段"
            n={clipCount}
            unit="個片段"
            body="挑一個說法，連續聽十幾個人親口講它。語氣、停頓、輕重音——這些文字學不到。"
          />
        </div>

        <Link
          href="/vs/"
          className="mt-px block bg-paper border border-rule border-t-0 px-5 py-5 hover:bg-rust-soft transition-colors group"
        >
          <div className="flex items-baseline gap-3">
            <span className="text-[15px] font-medium">講 vs 寫</span>
            <span className="text-[13px] text-ink-2">
              同一件事，講出來和寫下來用的字完全不同。12 組並排對照。
            </span>
            <span className="ml-auto text-ink-3 group-hover:text-rust">→</span>
          </div>
        </Link>
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

function Step({
  n,
  href,
  title,
  body,
}: {
  n: string;
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="bg-paper px-5 py-5 hover:bg-rust-soft transition-colors"
    >
      <span className="font-serif text-[1.3rem] text-rust tabular-nums">{n}</span>
      <p className="mt-1 text-[14.5px] font-medium leading-snug">{title}</p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">{body}</p>
    </Link>
  );
}

function Panel({
  href,
  label,
  n,
  unit,
  body,
}: {
  href: string;
  label: string;
  n: number;
  unit: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="bg-paper px-5 py-5 hover:bg-rust-soft transition-colors group"
    >
      <div className="flex items-baseline gap-2">
        <span className="text-[15px] font-medium">{label}</span>
        <span className="text-[12px] text-ink-3 tabular-nums">
          {n} {unit}
        </span>
        <span className="ml-auto text-ink-3 group-hover:text-rust">→</span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{body}</p>
    </Link>
  );
}
