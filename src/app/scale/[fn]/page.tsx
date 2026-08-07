import Link from "next/link";
import { notFound } from "next/navigation";
import InlineClip from "@/components/InlineClip";
import Speak from "@/components/Speak";
import { Src } from "@/components/Src";
import { getFn } from "@/lib/cards";
import { getScale, scales } from "@/lib/scales";

export function generateStaticParams() {
  return scales.length > 0
    ? scales.map((s) => ({ fn: s.fn }))
    : [{ fn: "saying-no" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fn: string }>;
}) {
  const { fn } = await params;
  const s = getScale(fn);
  if (!s) return {};
  return {
    title: `${s.zh}的五種力道｜矽谷會議室`,
    description: s.axis,
  };
}

export default async function ScalePage({
  params,
}: {
  params: Promise<{ fn: string }>;
}) {
  const { fn } = await params;
  const s = getScale(fn);
  if (!s) notFound();
  const entry = getFn(s.fn);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/scale/"
        className="text-[12.5px] text-ink-3 hover:text-rust transition-colors"
      >
        ← 力道刻度尺
      </Link>

      <header className="mt-5 pb-7 border-b border-rule">
        <h1 className="font-serif text-[2.2rem] leading-tight tracking-tight">
          {s.zh}的五種力道
        </h1>
        <p className="mt-5 text-[15px] leading-[1.9] text-ink-2 whitespace-pre-line">
          {s.intro}
        </p>
        {s.axis && (
          <div className="mt-5 border-l-2 border-rust pl-4">
            <p className="rule-label mb-1" style={{ color: "var(--color-rust)" }}>
              這把尺量的是什麼
            </p>
            <p className="text-[14.5px] leading-relaxed">{s.axis}</p>
          </div>
        )}
      </header>

      {/* 刻度條 */}
      <nav className="mt-8 flex gap-px bg-rule border border-rule rounded-sm overflow-hidden">
        {s.levels.map((lv) => (
          <a
            key={lv.n}
            href={`#lv${lv.n}`}
            className="flex-1 bg-paper px-2 py-2.5 text-center hover:bg-rust-soft transition-colors"
          >
            <span className="block font-serif text-[1.1rem] text-rust tabular-nums">
              {lv.n}
            </span>
            <span className="block mt-0.5 text-[10.5px] text-ink-3 leading-tight">
              {lv.force}
            </span>
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-12">
        {s.levels.map((lv) => (
          <section key={lv.n} id={`lv${lv.n}`} className="scroll-mt-6">
            <div className="flex items-baseline gap-3 pb-2.5 border-b border-rule">
              <span className="font-serif text-[1.6rem] text-rust tabular-nums">
                {lv.n}
              </span>
              <h2 className="font-serif text-[1.4rem] tracking-tight">{lv.zh}</h2>
              {lv.force && (
                <span className="ml-auto text-[12px] text-ink-3">{lv.force}</span>
              )}
            </div>

            {lv.when && (
              <p className="mt-3.5 text-[14.5px] leading-relaxed text-ink-2">
                {lv.when}
              </p>
            )}

            {lv.risk && (
              <div className="mt-3.5 bg-rust-soft border-l-2 border-rust px-4 py-3 rounded-r-sm">
                <p
                  className="rule-label mb-1"
                  style={{ color: "var(--color-rust)" }}
                >
                  用錯的代價
                </p>
                <p className="text-[14px] leading-relaxed">{lv.risk}</p>
              </div>
            )}

            <div className="mt-5">
              <p className="mb-2.5">
                <Src kind="corpus">這一級的真實說法</Src>
              </p>
              <div className="space-y-5">
                {lv.examples.map((e, i) => (
                  <div key={i}>
                    <div className="flex items-start gap-3">
                      <blockquote className="quote pl-4 border-l-2 border-rust/40 flex-1 min-w-0">
                        {e.quote}
                      </blockquote>
                      <Speak
                        text={e.quote}
                        id={`sc-${s.fn}-${lv.n}-${i}`}
                        className="shrink-0 mt-1"
                      />
                    </div>
                    <div className="mt-2 pl-4 flex flex-wrap items-center gap-x-3 text-[12px] text-ink-3">
                      <span className="text-ink-2">
                        {e.guest ?? "出自下列文章"}
                      </span>
                      {e.timestamp && (
                        <span className="tabular-nums">{e.timestamp}</span>
                      )}
                      {e.url && (
                        <InlineClip
                          url={e.url}
                          timestamp={e.timestamp}
                          episode={e.episode}
                          seek={e.seek}
                          isSearch={e.isSearch}
                        />
                      )}
                      {e.episode && (
                        <p className="w-full text-[11.5px] leading-snug opacity-75">
                          {e.episode}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {entry && (
        <nav className="mt-14 pt-7 border-t border-rule">
          <Link
            href={`/f/${s.fn}/`}
            className="text-[13px] border border-rule px-3 py-1.5 rounded-sm hover:border-rust hover:text-rust transition-colors"
          >
            {entry.fn.zh}的全部句型 →
          </Link>
        </nav>
      )}
    </div>
  );
}
