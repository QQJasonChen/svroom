import PracticeDeck from "@/components/PracticeDeck";
import { cards, groups } from "@/lib/cards";
import { writingCards, writingGroups } from "@/lib/writing";

export const metadata = {
  title: "練習｜矽谷會議室",
  description: "看中文情境，先自己想英文，再對答案。間隔複習排程，進度存在你自己的瀏覽器。",
};

export default function PracticePage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-serif text-[2rem] tracking-tight mb-2">練習</h1>
      <p className="text-[14px] text-ink-2 leading-relaxed mb-8">
        先看中文情境，在心裡把英文講出來，再對答案。答得出來的會拉長複習間隔，答不出來的很快就會再出現。
        進度只存在你自己的瀏覽器，不上傳。
      </p>
      <PracticeDeck
        cards={[...cards, ...writingCards]}
        groups={[
          ...groups,
          ...writingGroups.map((g) => ({
            ...g,
            zh: `寫｜${g.zh}`,
            functions: g.functions.map((f) => ({ ...f, pm_hook: "" })),
          })),
        ]}
      />
    </div>
  );
}
