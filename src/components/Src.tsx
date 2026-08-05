import Link from "next/link";

/**
 * 全站一致的來源標記。
 *
 * 這個站有兩種長得很像、性質卻完全不同的內容：
 *   corpus — 逐字稿／文章裡真的有人講過或寫過的原文
 *   ours   — 我們寫的（翻譯、拆解、整理出來的句型）
 * 不標清楚的話，讀的人分不出哪句話有出處、哪句是我們的建構。
 */
export function Src({
  kind,
  children,
}: {
  kind: "corpus" | "ours";
  children?: React.ReactNode;
}) {
  const corpus = kind === "corpus";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-sm border ${
        corpus
          ? "border-rust/40 text-rust bg-rust-soft"
          : "border-slate/40 bg-slate-soft"
      }`}
      style={corpus ? undefined : { color: "var(--color-slate)" }}
    >
      <span aria-hidden>{corpus ? "❝" : "✎"}</span>
      {children ?? (corpus ? "原文" : "我們寫的")}
    </span>
  );
}

/**
 * 「這句我們寫的英文，語料裡到底有沒有人這樣講？」
 * 點過去搜全站真實引文。找不到，就代表這是我們的建構——
 * 這個結果本身也是誠實的資訊。
 */
export function TraceLink({
  text,
  label = "查語料裡有沒有人這樣講",
}: {
  text: string;
  label?: string;
}) {
  // 取前幾個實詞當查詢，整句丟過去通常搜不到
  const q = text
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[^A-Za-z' ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");
  if (!q) return null;
  return (
    <Link
      href={`/search/?q=${encodeURIComponent(q)}`}
      className="text-[11.5px] text-ink-3 underline underline-offset-2 hover:text-rust whitespace-nowrap"
    >
      {label} ↗
    </Link>
  );
}
