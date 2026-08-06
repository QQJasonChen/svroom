import AskBrowser from "@/components/AskBrowser";
import { questionCats, questions, questionStats } from "@/lib/questions";

export const metadata = {
  title: "主持人怎麼問｜矽谷會議室",
  description:
    "Lenny 訪談 311 位矽谷產品人，他的提問是一整套追問技術。全部原句萃取，一個字沒改。",
};

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="rule-label mb-4">主持人怎麼問</p>
      <h1 className="font-serif text-[2.2rem] leading-tight tracking-tight mb-5">
        問一次得到表面答案，
        <br />
        <span className="text-rust">然後就停了</span>。
      </h1>
      <p className="text-[15.5px] leading-[1.85] text-ink-2 mb-4">
        台灣人在英文會議最缺的技能之一是<strong className="text-ink font-medium">追問</strong>——
        對方講完一個漂亮但空的答案，我們往往就接受了，因為不知道怎麼再往下一層而不顯得咄咄逼人。
      </p>
      <p className="text-[15px] leading-[1.8] text-ink-2 mb-8">
        Lenny 訪談了 311 位矽谷產品人，他的提問就是一整套追問技術。這一頁把他真的問過的句子
        <strong className="text-ink font-medium">原封不動萃取出來</strong>——
        {questionStats.count} 則，來自 {questionStats.episodes} 集，一個字都沒改。
      </p>

      {questionStats.count === 0 ? (
        <p className="text-[15px] text-ink-2">內容整理中。</p>
      ) : (
        <AskBrowser cats={questionCats} questions={questions} />
      )}
    </div>
  );
}
