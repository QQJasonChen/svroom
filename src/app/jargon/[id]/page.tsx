import Link from "next/link";
import { notFound } from "next/navigation";
import InlineClip from "@/components/InlineClip";
import Speak from "@/components/Speak";
import { Src } from "@/components/Src";
import {
  functionsForJargon,
  getJargon,
  getJargonMeta,
  jargonGroups,
  jargonIndex,
} from "@/lib/jargon";

export function generateStaticParams() {
  return jargonIndex.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = getJargonMeta(id);
  if (!meta) return {};
  const t = getJargon(id);
  return {
    title: `${meta.term}｜PM 職場黑話`,
    description: t?.meaning ?? meta.hint,
  };
}

export default async function JargonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = getJargonMeta(id);
  if (!meta) notFound();

  const t = getJargon(id);
  const group = jargonGroups.find((g) => g.id === meta.group);
  const fns = t ? functionsForJargon(t) : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/jargon/"
        className="text-[12.5px] text-ink-3 hover:text-rust transition-colors"
      >
        ← PM 職場黑話{group ? ` · ${group.zh}` : ""}
      </Link>

      {!t ? (
        <div className="mt-10 border border-rule rounded-sm px-6 py-10 text-center">
          <p className="text-[15px] text-ink-2">這個詞的內容還在整理中。</p>
        </div>
      ) : (
        <>
          <header className="mt-5 pb-7 border-b border-rule">
            <div className="flex items-start gap-3">
              <h1 className="font-serif text-[2.1rem] leading-tight tracking-tight text-rust flex-1">
                {t.term}
              </h1>
              <Speak text={t.term} id={`j-${t.id}`} className="mt-2" />
            </div>
            {t.zh && <p className="mt-2 text-[17px]">{t.zh}</p>}
          </header>

          <section className="mt-8">
            <p className="mb-2.5">
              <Src kind="ours">在會議上實際是什麼意思</Src>
            </p>
            <p className="text-[15px] leading-[1.9] text-ink-2 whitespace-pre-line">
              {t.meaning}
            </p>
          </section>

          {t.when && (
            <section className="mt-7">
              <p className="rule-label mb-1.5">什麼場合會聽到</p>
              <p className="text-[14.5px] leading-relaxed text-ink-2">{t.when}</p>
            </section>
          )}

          {t.trap && (
            <section className="mt-7 bg-rust-soft border-l-2 border-rust px-4 py-3.5 rounded-r-sm">
              <p
                className="rule-label mb-1.5"
                style={{ color: "var(--color-rust)" }}
              >
                台灣人容易誤解的地方
              </p>
              <p className="text-[14.5px] leading-relaxed">{t.trap}</p>
            </section>
          )}

          <section className="mt-9">
            <p className="mb-1.5">
              <Src kind="corpus">他們實際上怎麼用</Src>
            </p>
            <p className="text-[12.5px] text-ink-3 mb-4">
              以下每一句都是逐字稿原文，沒有一句是編的。點開就能聽本人講。
            </p>
            <div className="space-y-6">
              {t.usage.map((u, i) => (
                <div key={i}>
                  <div className="flex items-start gap-3">
                    <blockquote className="quote pl-4 border-l-2 border-rust/40 flex-1 min-w-0">
                      {u.quote}
                    </blockquote>
                    <Speak
                      text={u.quote}
                      id={`ju-${t.id}-${i}`}
                      className="shrink-0 mt-1"
                    />
                  </div>
                  <div className="mt-2 pl-4 flex flex-wrap items-center gap-x-3 text-[12px] text-ink-3">
                    <span className="text-ink-2">{u.guest}</span>
                    {u.timestamp && (
                      <span className="tabular-nums">{u.timestamp}</span>
                    )}
                    {u.url && (
                      <InlineClip
                        url={u.url}
                        timestamp={u.timestamp}
                        episode={u.episode}
                        seek={u.seek}
                        isSearch={u.isSearch}
                      />
                    )}
                    {u.episode && (
                      <p className="w-full text-[11.5px] leading-snug opacity-75">
                        {u.episode}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {fns.length > 0 && (
            <nav className="mt-12 pt-7 border-t border-rule">
              <p className="rule-label mb-3">最常在這些場合聽到</p>
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
            </nav>
          )}
        </>
      )}
    </div>
  );
}
