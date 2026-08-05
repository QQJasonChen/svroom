import Link from "next/link";
import { notFound } from "next/navigation";
import CardView from "@/components/CardView";
import {
  getWritingFn,
  writingCards,
  writingCardsFor,
  writingGroups,
} from "@/lib/writing";

export function generateStaticParams() {
  // 只為有卡片的功能產頁；一張都沒有時給一個佔位參數，
  // 否則 output:export 會因為空陣列而中止整個 build
  const covered = [...new Set(writingCards.map((c) => c.fn))];
  return covered.length > 0
    ? covered.map((fn) => ({ fn }))
    : [{ fn: "w-tldr" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fn: string }>;
}) {
  const { fn } = await params;
  const entry = getWritingFn(fn);
  if (!entry) return {};
  return {
    title: `${entry.fn.zh}｜書面英文｜矽谷會議室`,
    description: `${entry.fn.scene}——${entry.fn.en} 的實際寫法與拆解。`,
  };
}

export default async function WritingFunctionPage({
  params,
}: {
  params: Promise<{ fn: string }>;
}) {
  const { fn } = await params;
  const entry = getWritingFn(fn);
  if (!entry) notFound();

  const list = writingCardsFor(fn);
  const group = writingGroups.find((g) => g.id === entry.group.id)!;
  const siblings = group.functions.filter(
    (f) => f.id !== fn && writingCards.some((c) => c.fn === f.id),
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/w/"
        className="text-[12.5px] text-ink-3 hover:text-rust transition-colors"
      >
        ← 書面英文 · {group.zh}
      </Link>

      <header className="mt-5 pb-7 border-b border-rule">
        <h1 className="font-serif text-[2.2rem] leading-tight tracking-tight">
          {entry.fn.zh}
        </h1>
        <p className="mt-1 text-[13px] text-ink-3 tracking-wide">
          {entry.fn.en}
        </p>
        <div className="mt-6 flex gap-3">
          <span className="rule-label shrink-0 w-14 pt-0.5">使用場景</span>
          <p className="text-[14.5px] leading-relaxed text-ink-2">
            {entry.fn.scene}
          </p>
        </div>
      </header>

      {list.length === 0 ? (
        <p className="mt-8 text-[15px] text-ink-2">這個場景的內容還在整理中。</p>
      ) : (
        <>
          <p className="mt-7 mb-5 text-[12.5px] text-ink-3">
            {list.length} 張寫法卡，由易到難
          </p>
          <div className="space-y-5">
            {list.map((card, i) => (
              <CardView key={card.id} card={card} n={i + 1} />
            ))}
          </div>
        </>
      )}

      {siblings.length > 0 && (
        <nav className="mt-14 pt-7 border-t border-rule">
          <p className="rule-label mb-3">同一組的其他場景</p>
          <div className="flex flex-wrap gap-2">
            {siblings.map((f) => (
              <Link
                key={f.id}
                href={`/w/${f.id}/`}
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
