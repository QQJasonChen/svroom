import Link from "next/link";
import { notFound } from "next/navigation";
import InlineClip from "@/components/InlineClip";
import Speak from "@/components/Speak";
import { Src } from "@/components/Src";
import { findings, getFinding } from "@/lib/findings";

export function generateStaticParams() {
  return findings.length > 0
    ? findings.map((f) => ({ id: f.id }))
    : [{ id: "placeholder" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const f = getFinding(id);
  if (!f) return {};
  return { title: `${f.zh}｜語料數據發現`, description: f.headline };
}

export default async function FindingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const f = getFinding(id);
  if (!f) notFound();

  const pct = Math.round((f.stat.episodes / f.stat.total) * 100);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/finding/"
        className="text-[12.5px] text-ink-3 hover:text-rust transition-colors"
      >
        ← 語料數據發現
      </Link>

      <header className="mt-5 pb-8 border-b border-rule">
        <h1 className="font-serif text-[2.2rem] leading-tight tracking-tight">
          {f.zh}
        </h1>
        {f.en && (
          <p className="mt-1 font-serif text-[15px] text-ink-3">{f.en}</p>
        )}

        {/* 數字先行——這一層跟其他層的差別就在這裡 */}
        <div className="mt-7 border border-rule rounded-sm px-5 py-5 bg-paper-2/40">
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-3">
            <Stat n={f.stat.count.toLocaleString()} label="次" />
            <Stat n={`${f.stat.episodes}/${f.stat.total}`} label={`集（${pct}%）`} />
            {f.stat.median !== undefined && (
              <Stat n={f.stat.median} label="每集中位數" />
            )}
          </div>
          <p className="mt-4 text-[15px] leading-relaxed">{f.headline}</p>
          <p className="mt-2 text-[11.5px] text-ink-3">
            掃過全部 {f.stat.total} 集逐字稿統計得出，非抽樣估計。
          </p>
        </div>
      </header>

      <section className="mt-8">
        <p className="mb-2.5">
          <Src kind="ours">為什麼這個數字重要</Src>
        </p>
        <p className="text-[15px] leading-[1.9] text-ink-2 whitespace-pre-line">
          {f.why}
        </p>
      </section>

      <section className="mt-8 bg-rust-soft border-l-2 border-rust px-5 py-4 rounded-r-sm">
        <p className="rule-label mb-1.5" style={{ color: "var(--color-rust)" }}>
          台灣人的對照
        </p>
        <p className="text-[15px] leading-relaxed whitespace-pre-line">
          {f.taiwan}
        </p>
      </section>

      <section className="mt-10">
        <p className="mb-1.5">
          <Src kind="corpus">他們實際上怎麼用</Src>
        </p>
        <p className="text-[12.5px] text-ink-3 mb-6">
          同一件事有這幾種講法。每一句都是逐字稿原文，點開能聽本人講。
        </p>

        <div className="space-y-11">
          {f.types.map((t, i) => (
            <div key={i}>
              <div className="flex items-baseline gap-3 pb-2 border-b border-rule">
                <span className="font-serif text-[1.3rem] text-rust tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-serif text-[1.35rem] tracking-tight">
                  {t.zh}
                </h2>
                {t.share && (
                  <span className="ml-auto text-[12px] text-ink-3">
                    {t.share}
                  </span>
                )}
              </div>
              {t.note && (
                <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                  {t.note}
                </p>
              )}
              <div className="mt-5 space-y-5">
                {t.examples.map((e, j) => (
                  <div key={j}>
                    <div className="flex items-start gap-3">
                      <blockquote className="quote pl-4 border-l-2 border-rust/40 flex-1 min-w-0">
                        {e.quote}
                      </blockquote>
                      <Speak
                        text={e.quote}
                        id={`fx-${f.id}-${i}-${j}`}
                        className="shrink-0 mt-1"
                      />
                    </div>
                    <div className="mt-2 pl-4 flex flex-wrap items-center gap-x-3 text-[12px] text-ink-3">
                      <span className="text-ink-2">{e.guest}</span>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string | number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-serif text-[1.9rem] tabular-nums leading-none text-rust">
        {n}
      </span>
      <span className="text-[12.5px] text-ink-3">{label}</span>
    </div>
  );
}
