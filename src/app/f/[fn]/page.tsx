import Link from "next/link";
import { notFound } from "next/navigation";
import CardView from "@/components/CardView";
import { cards, cardsFor, getFn, groups } from "@/lib/cards";

export function generateStaticParams() {
  // 只為「有卡片」的功能產頁面，避免 build 出一堆空頁
  return [...new Set(cards.map((c) => c.fn))].map((fn) => ({ fn }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fn: string }>;
}) {
  const { fn } = await params;
  const entry = getFn(fn);
  if (!entry) return {};
  return {
    title: `${entry.fn.zh}｜矽谷會議室`,
    description: `${entry.fn.scene}——${entry.fn.en} 的真實英文說法與拆解。`,
  };
}

export default async function FunctionPage({
  params,
}: {
  params: Promise<{ fn: string }>;
}) {
  const { fn } = await params;
  const entry = getFn(fn);
  if (!entry) notFound();

  const list = cardsFor(fn);
  const group = groups.find((g) => g.id === entry.group.id)!;
  const siblings = group.functions.filter(
    (f) => f.id !== fn && cards.some((c) => c.fn === f.id),
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/"
        className="text-[12.5px] text-ink-3 hover:text-rust transition-colors"
      >
        ← {group.zh}
      </Link>

      <header className="mt-5 pb-7 border-b border-rule">
        <h1 className="font-serif text-[2.2rem] leading-tight tracking-tight">
          {entry.fn.zh}
        </h1>
        <p className="mt-1 text-[13px] text-ink-3 tracking-wide">
          {entry.fn.en}
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex gap-3">
            <span className="rule-label shrink-0 w-14 pt-0.5">使用場景</span>
            <p className="text-[14.5px] leading-relaxed text-ink-2">
              {entry.fn.scene}
            </p>
          </div>
          <div className="flex gap-3">
            <span className="rule-label shrink-0 w-14 pt-0.5">PM 掛鉤</span>
            <p className="text-[14.5px] leading-relaxed text-ink-2">
              {entry.fn.pm_hook}
            </p>
          </div>
        </div>
      </header>

      <p className="mt-7 mb-5 text-[12.5px] text-ink-3">
        {list.length} 張句型卡，由易到難
      </p>

      <div className="space-y-5">
        {list.map((card, i) => (
          <CardView key={card.id} card={card} n={i + 1} />
        ))}
      </div>

      {siblings.length > 0 && (
        <nav className="mt-14 pt-7 border-t border-rule">
          <p className="rule-label mb-3">同一組的其他功能</p>
          <div className="flex flex-wrap gap-2">
            {siblings.map((f) => (
              <Link
                key={f.id}
                href={`/f/${f.id}/`}
                className="text-[13px] border border-rule px-3 py-1.5 rounded-sm hover:border-rust hover:text-rust transition-colors"
              >
                {f.zh}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
