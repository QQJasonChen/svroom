import Link from "next/link";
import { notFound } from "next/navigation";
import CardView from "@/components/CardView";
import InlineClip from "@/components/InlineClip";
import { Src, TraceLink } from "@/components/Src";
import { getFn } from "@/lib/cards";
import {
  conceptGroups,
  conceptIndex,
  getConcept,
  getConceptMeta,
  sampleCardsForConcept,
} from "@/lib/concepts";

// 分類法裡的每個概念都產頁面，即使內容還沒採集完——
// 這樣導覽不會有死連結，也避免空陣列讓 output:export 整個 build 失敗。
export function generateStaticParams() {
  return conceptIndex.map((c) => ({ concept: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ concept: string }>;
}) {
  const { concept } = await params;
  const meta = getConceptMeta(concept);
  if (!meta) return {};
  const c = getConcept(concept);
  return {
    title: `${meta.zh}（${meta.term}）｜矽谷會議室`,
    description: c?.oneLiner ?? `${meta.term}——產品管理概念與英文說法。`,
  };
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ concept: string }>;
}) {
  const { concept } = await params;
  const meta = getConceptMeta(concept);
  if (!meta) notFound();

  const c = getConcept(concept);
  const group = conceptGroups.find((g) => g.id === meta.group);
  const related = c ? sampleCardsForConcept(c) : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/pm/"
        className="text-[12.5px] text-ink-3 hover:text-rust transition-colors"
      >
        ← PM 知識庫{group ? ` · ${group.zh}` : ""}
      </Link>

      <header className="mt-5 pb-7 border-b border-rule">
        <h1 className="font-serif text-[2.2rem] leading-tight tracking-tight">
          {meta.zh}
        </h1>
        <p className="mt-1 text-[13px] text-ink-3 tracking-wide">{meta.term}</p>
        {c && <p className="mt-5 text-[16px] leading-relaxed">{c.oneLiner}</p>}
      </header>

      {!c && (
        <div className="mt-10 border border-rule rounded-sm px-6 py-10 text-center">
          <p className="text-[15px] text-ink-2">這個概念的內容還在整理中。</p>
          <Link
            href="/pm/"
            className="inline-block mt-4 text-[13px] text-rust underline underline-offset-2"
          >
            回 PM 知識庫看已完成的概念
          </Link>
        </div>
      )}

      {c && (
      <div className="mt-8 space-y-9">
        <section>
          <p className="mb-2.5">
            <Src kind="ours">這是什麼</Src>
          </p>
          <p className="text-[15px] leading-[1.9] text-ink-2 whitespace-pre-line">
            {c.body}
          </p>
        </section>

        {c.pitfall && (
          <section className="bg-rust-soft border-l-2 border-rust px-4 py-3.5 rounded-r-sm">
            <p className="rule-label mb-1.5" style={{ color: "var(--color-rust)" }}>
              常見的坑
            </p>
            <p className="text-[14.5px] leading-relaxed">{c.pitfall}</p>
          </section>
        )}

        {c.howToSay.length > 0 && (
          <section>
            <p className="mb-2">
              <Src kind="ours">在英文會議上怎麼講</Src>
            </p>
            <p className="text-[12.5px] text-ink-3 mb-4">
              知道概念不等於講得出來。下面這幾句是
              <strong className="text-ink-2">我們依語料整理出來的可用句型</strong>，
              不是逐字稿原句——原句在下一段。
            </p>
            <ul className="space-y-4">
              {c.howToSay.map((h, i) => (
                <li
                  key={i}
                  className="border border-rule bg-paper-2/40 rounded-sm px-4 py-3.5"
                >
                  <p className="font-serif text-[16px] leading-snug">{h.en}</p>
                  <p className="mt-1.5 text-[13.5px] text-ink-2">{h.zh}</p>
                  {h.note && (
                    <p className="mt-1.5 text-[12px] text-ink-3">用在：{h.note}</p>
                  )}
                  <p className="mt-2">
                    <TraceLink text={h.en} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {c.quote && (
          <section>
            <p className="mb-1.5">
              <Src kind="corpus">逐字稿原文</Src>
            </p>
            <p className="text-[12.5px] text-ink-3 mb-3">
              這個概念是從這段話裡抓出來的。
            </p>
            <blockquote className="quote pl-4 border-l-2 border-rust/35">
              {c.quote.text}
            </blockquote>
            <p className="mt-3 text-[12px] text-ink-3">
              {c.quote.guest}
              {c.quote.timestamp ? ` · ${c.quote.timestamp}` : ""}
              {c.quote.url && (
                <>
                  {" · "}
                  <InlineClip
                    url={c.quote.url}
                    timestamp={c.quote.timestamp}
                    episode={c.quote.episode}
                    seek={c.quote.seek}
                  />
                </>
              )}
            </p>
            {c.quote.episode && (
              <p className="mt-1 text-[11.5px] text-ink-3 opacity-80">
                {c.quote.episode}
              </p>
            )}
          </section>
        )}

        {related.length > 0 && (
          <section className="pt-7 border-t border-rule">
            <p className="mb-1.5">
              <Src kind="corpus">語料裡的實際說法</Src>
            </p>
            <p className="text-[12.5px] text-ink-3 mb-4">
              下面每一張都附逐字稿原句與出處，可以就地播放。
              要在會議上主張這個概念，通常會用到這幾種語言功能：
              {c.relatedFunctions.map((f, i) => {
                const entry = getFn(f);
                if (!entry) return null;
                return (
                  <span key={f}>
                    {i > 0 && "、"}
                    <Link
                      href={`/f/${f}/`}
                      className="text-ink-2 underline underline-offset-2 hover:text-rust"
                    >
                      {entry.fn.zh}
                    </Link>
                  </span>
                );
              })}
            </p>
            <div className="space-y-5">
              {related.map((card) => (
                <CardView key={card.id} card={card} />
              ))}
            </div>
          </section>
        )}
      </div>
      )}
    </div>
  );
}
