import SearchCards from "@/components/SearchCards";
import { cards, groups } from "@/lib/cards";

export const metadata = {
  title: "搜尋｜矽谷會議室",
  description: "想講的那句話，英文怎麼說。搜中文、英文或句型都可以。",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-serif text-[2rem] tracking-tight mb-2">搜尋</h1>
      <p className="text-[14px] text-ink-2 leading-relaxed mb-7">
        知道自己想表達什麼、但不知道英文怎麼講的時候，直接搜中文。
      </p>
      <SearchCards cards={cards} groups={groups} />
    </div>
  );
}
