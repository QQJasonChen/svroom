import Link from "next/link";
import { notFound } from "next/navigation";
import CardView from "@/components/CardView";
import { Src } from "@/components/Src";
import {
  examplesFor,
  functionsFor,
  getStrategy,
  strategies,
} from "@/lib/strategies";

export function generateStaticParams() {
  return strategies.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = getStrategy(id);
  if (!s) return {};
  return { title: `${s.zh}｜核心語言策略`, description: s.hook };
}

export default async function StrategyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = getStrategy(id);
  if (!s) notFound();

  const examples = examplesFor(s, 10);
  const fns = functionsFor(s);
  const idx = strategies.findIndex((x) => x.id === s.id);
  const prev = strategies[idx - 1];
  const next = strategies[idx + 1];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/strategy/"
        className="text-[12.5px] text-ink-3 hover:text-rust transition-colors"
      >
        ← 核心語言策略
      </Link>

      <header className="mt-5 pb-7 border-b border-rule">
        <span className="font-serif text-[1.5rem] text-rust tabular-nums">
          {String(s.n).padStart(2, "0")}
        </span>
        <h1 className="mt-1 font-serif text-[2.2rem] leading-tight tracking-tight">
          {s.zh}
        </h1>
        <p className="mt-1 text-[13px] text-ink-3 tracking-wide">{s.en}</p>
        <p className="mt-5 text-[16.5px] leading-relaxed text-rust">{s.hook}</p>
      </header>

      <div className="mt-8 space-y-8">
        <section>
          <p className="mb-2.5"><Src kind="ours">為什麼有效</Src></p>
          <p className="text-[15px] leading-[1.9] text-ink-2 whitespace-pre-line">
            {s.body}
          </p>
        </section>

        <section className="bg-rust-soft border-l-2 border-rust px-4 py-3.5 rounded-r-sm">
          <p className="rule-label mb-1.5" style={{ color: "var(--color-rust)" }}>
            台灣人的預設做法
          </p>
          <p className="text-[14.5px] leading-relaxed">{s.taiwan}</p>
        </section>

        {fns.length > 0 && (
          <section>
            <p className="rule-label mb-3">最常用在這些場合</p>
            <div className="flex flex-wrap gap-2">
              {fns.map(({ id: fid, entry }) => (
                <Link
                  key={fid}
                  href={`/f/${fid}/`}
                  className="text-[13px] border border-rule px-3 py-1.5 rounded-sm hover:border-rust hover:text-rust transition-colors"
                >
                  {entry!.fn.zh}
                </Link>
              ))}
            </div>
          </section>
        )}

        {examples.length > 0 && (
          <section className="pt-4">
            <p className="mb-1.5"><Src kind="corpus">語料裡的實例</Src></p>
            <p className="text-[12.5px] text-ink-3 mb-5">
              這些是<strong className="text-ink-2">從逐字稿實際比對出來的</strong>，
              不是為了說明而編的例句。每一張都能點開聽本人講。
            </p>
            <div className="space-y-5">
              {examples.map((c, i) => (
                <CardView key={c.id} card={c} n={i + 1} />
              ))}
            </div>
          </section>
        )}
      </div>

      <nav className="mt-14 pt-7 border-t border-rule flex gap-4 text-[13px]">
        {prev && (
          <Link
            href={`/strategy/${prev.id}/`}
            className="text-ink-2 hover:text-rust transition-colors"
          >
            ← {prev.zh}
          </Link>
        )}
        {next && (
          <Link
            href={`/strategy/${next.id}/`}
            className="ml-auto text-ink-2 hover:text-rust transition-colors"
          >
            {next.zh} →
          </Link>
        )}
      </nav>
    </div>
  );
}
