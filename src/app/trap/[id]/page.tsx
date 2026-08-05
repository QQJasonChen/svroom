import Link from "next/link";
import { notFound } from "next/navigation";
import InlineClip from "@/components/InlineClip";
import { Src } from "@/components/Src";
import Speak from "@/components/Speak";
import {
  functionsForTrap,
  getTrap,
  getTrapMeta,
  trapGroups,
  trapIndex,
} from "@/lib/traps";

export function generateStaticParams() {
  return trapIndex.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = getTrapMeta(id);
  if (!meta) return {};
  const t = getTrap(id);
  return {
    title: `「${meta.zh_instinct}」｜中文腦陷阱`,
    description: t?.heardAs ?? meta.hint,
  };
}

export default async function TrapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = getTrapMeta(id);
  if (!meta) notFound();

  const t = getTrap(id);
  const group = trapGroups.find((g) => g.id === meta.group);
  const fns = t ? functionsForTrap(t) : [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/trap/"
        className="text-[12.5px] text-ink-3 hover:text-rust transition-colors"
      >
        ← 中文腦陷阱{group ? ` · ${group.zh}` : ""}
      </Link>

      {!t ? (
        <div className="mt-10 border border-rule rounded-sm px-6 py-10 text-center">
          <p className="text-[15px] text-ink-2">這一條的內容還在整理中。</p>
        </div>
      ) : (
        <>
          {/* 中文直覺 → 直譯 → 對方聽到什麼 */}
          <header className="mt-5 pb-7 border-b border-rule">
            <p className="rule-label mb-2">台灣人通常會這樣說</p>
            <h1 className="font-serif text-[1.9rem] leading-snug tracking-tight">
              「{t.zhInstinct}」
            </h1>
            {t.enLiteral && (
              <div className="mt-4 flex items-start gap-3">
                <p className="quote flex-1 pl-4 border-l-2 border-ink-3/30 text-ink-2">
                  {t.enLiteral}
                </p>
                <Speak text={t.enLiteral} id={`lit-${t.id}`} className="mt-1" />
              </div>
            )}

            {/* 這是整層最容易被誤解的地方：多數陷阱的英文句子完全沒有錯，
                不講清楚的話，讀者會以為我們在說這句是爛英文，然後不信任整層 */}
            <p className="mt-4 text-[13.5px] leading-relaxed text-ink-3 border border-rule rounded-sm px-3.5 py-2.5">
              {t.kind === "misread" ? (
                <>
                  <strong className="text-ink-2">這句英文沒有錯，也不失禮。</strong>{" "}
                  文法正確、母語者也會這樣講。問題不在句子本身，
                  在於它<strong className="text-ink-2">少了一個東西</strong>，
                  而那個東西在中文裡不需要、在英文裡卻承擔了關鍵功能。
                </>
              ) : (
                <>
                  <strong className="text-ink-2">這一條跟其他的不同：這裡是真的用錯了。</strong>{" "}
                  但重點不是文法規則本身（那你早就學過），是
                  <strong className="text-ink-2">錯了會造成什麼實際誤解</strong>。
                </>
              )}
            </p>
          </header>

          <section className="mt-7 bg-rust-soft border-l-2 border-rust px-5 py-4 rounded-r-sm">
            <p className="rule-label mb-1.5" style={{ color: "var(--color-rust)" }}>
              對方實際聽到的是
            </p>
            <p className="text-[15.5px] leading-relaxed">{t.heardAs}</p>
          </section>

          <section className="mt-8">
            <p className="mb-2.5">
              <Src kind="ours">為什麼會這樣</Src>
            </p>
            <p className="text-[15px] leading-[1.9] text-ink-2 whitespace-pre-line">
              {t.why}
            </p>
          </section>

          {t.better.length > 0 && (
            <section className="mt-9">
              <p className="mb-2">
                <Src kind="ours">改成這樣說</Src>
              </p>
              <ul className="space-y-4">
                {t.better.map((b, i) => (
                  <li
                    key={i}
                    className="border border-rule bg-paper-2/40 rounded-sm px-4 py-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <p className="font-serif text-[16px] leading-snug flex-1">
                        {b.en}
                      </p>
                      <Speak text={b.en} id={`b-${t.id}-${i}`} className="mt-0.5" />
                    </div>
                    <p className="mt-1.5 text-[13.5px] text-ink-2">{b.zh}</p>
                    {b.note && (
                      <p className="mt-1.5 text-[12px] text-ink-3">用在：{b.note}</p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {t.corpus && (
            <section className="mt-9">
              <p className="mb-1.5">
                <Src kind="corpus">語料裡真的有人這樣講</Src>
              </p>
              <p className="text-[12.5px] text-ink-3 mb-3">
                上面那些改法不是我們憑空想的。這是原文裡的實際用法：
              </p>
              <blockquote className="quote pl-4 border-l-2 border-rust/40">
                {t.corpus.quote}
              </blockquote>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 text-[12px] text-ink-3">
                <span className="text-ink-2">{t.corpus.guest}</span>
                {t.corpus.timestamp && (
                  <span className="tabular-nums">{t.corpus.timestamp}</span>
                )}
                {t.corpus.url && (
                  <InlineClip
                    url={t.corpus.url}
                    timestamp={t.corpus.timestamp}
                    episode={t.corpus.episode}
                    seek={t.corpus.seek}
                    isSearch={t.corpus.isSearch}
                  />
                )}
                {t.corpus.episode && (
                  <p className="w-full text-[11.5px] leading-snug opacity-75">
                    {t.corpus.episode}
                  </p>
                )}
              </div>
            </section>
          )}

          {fns.length > 0 && (
            <nav className="mt-12 pt-7 border-t border-rule">
              <p className="rule-label mb-3">最常在這些場合踩到</p>
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
