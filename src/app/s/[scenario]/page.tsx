import Link from "next/link";
import { notFound } from "next/navigation";
import CardView from "@/components/CardView";
import {
  cardsForScenario,
  conceptsForScenario,
  getScenario,
  scenarios,
  writingForScenario,
} from "@/lib/scenarios";

export function generateStaticParams() {
  return scenarios.map((s) => ({ scenario: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario } = await params;
  const s = getScenario(scenario);
  if (!s) return {};
  return { title: `${s.zh}｜矽谷會議室`, description: s.hook };
}

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ scenario: string }>;
}) {
  const { scenario } = await params;
  const s = getScenario(scenario);
  if (!s) notFound();

  const spoken = cardsForScenario(s);
  const written = writingForScenario(s);
  const concepts = conceptsForScenario(s);
  const total =
    spoken.reduce((n, g) => n + g.cards.length, 0) +
    written.reduce((n, g) => n + g.cards.length, 0);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/"
        className="text-[12.5px] text-ink-3 hover:text-rust transition-colors"
      >
        ← 所有情境
      </Link>

      <header className="mt-5 pb-7 border-b border-rule">
        <h1 className="font-serif text-[2.2rem] leading-tight tracking-tight">
          {s.zh}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-rust">{s.hook}</p>
        <p className="mt-4 text-[14.5px] leading-[1.85] text-ink-2">{s.why}</p>
        <p className="mt-5 text-[12.5px] text-ink-3">
          這一包有 {total} 張卡
          {concepts.length > 0 ? `、${concepts.length} 個 PM 概念` : ""}
        </p>
      </header>

      {concepts.length > 0 && (
        <section className="mt-8">
          <p className="rule-label mb-3">先搞懂這幾個概念</p>
          <div className="grid gap-px bg-rule border border-rule sm:grid-cols-2">
            {concepts.map((c) => (
              <Link
                key={c.id}
                href={`/pm/${c.id}/`}
                className="bg-paper px-4 py-3.5 hover:bg-rust-soft transition-colors"
              >
                <span className="text-[14px] font-medium">{c.zh}</span>
                <span className="ml-2 text-[11px] text-ink-3">{c.term}</span>
                <p className="mt-1 text-[12px] text-ink-3 leading-relaxed">
                  {c.oneLiner}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {spoken.map((g) => (
        <section key={g.fnId} className="mt-11">
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="font-serif text-[1.35rem] tracking-tight">
              {g.fnZh}
            </h2>
            <Link
              href={`/f/${g.fnId}/`}
              className="text-[12px] text-ink-3 hover:text-rust transition-colors"
            >
              看全部 →
            </Link>
          </div>
          <div className="space-y-5">
            {g.cards.map((card, i) => (
              <CardView key={card.id} card={card} n={i + 1} />
            ))}
          </div>
        </section>
      ))}

      {written.length > 0 && (
        <section className="mt-14 pt-8 border-t border-rule">
          <h2 className="font-serif text-[1.5rem] tracking-tight mb-1">
            這個情境的書面版
          </h2>
          <p className="text-[13px] text-ink-3 mb-6">
            同一件事寫下來的時候，用字不一樣。
          </p>
          {written.map((g) => (
            <div key={g.fnId} className="mb-9">
              <div className="flex items-baseline gap-3 mb-4">
                <h3 className="font-serif text-[1.2rem] tracking-tight">
                  {g.fnZh}
                </h3>
                <Link
                  href={`/w/${g.fnId}/`}
                  className="text-[12px] text-ink-3 hover:text-rust transition-colors"
                >
                  看全部 →
                </Link>
              </div>
              <div className="space-y-5">
                {g.cards.map((card, i) => (
                  <CardView key={card.id} card={card} n={i + 1} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <nav className="mt-14 pt-7 border-t border-rule">
        <p className="rule-label mb-3">其他情境</p>
        <div className="flex flex-wrap gap-2">
          {scenarios
            .filter((x) => x.id !== s.id)
            .map((x) => (
              <Link
                key={x.id}
                href={`/s/${x.id}/`}
                className="text-[13px] border border-rule px-3 py-1.5 rounded-sm hover:border-rust hover:text-rust transition-colors"
              >
                {x.zh}
              </Link>
            ))}
        </div>
      </nav>
    </div>
  );
}
