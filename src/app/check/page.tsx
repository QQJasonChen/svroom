import Checker from "@/components/Checker";
import { rules } from "@/lib/checker";
import { trapStats } from "@/lib/traps";

export const metadata = {
  title: "檢查我的英文｜矽谷會議室",
  description:
    "把要寄出去的 email 或 Slack 訊息貼進來，當場標出你踩了哪幾條中文腦陷阱、對方會聽成什麼、該怎麼改。全部在瀏覽器裡跑。",
};

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="rule-label mb-4">檢查我的英文</p>
      <h1 className="font-serif text-[2.2rem] leading-tight tracking-tight mb-5">
        文法都對，
        <br />
        <span className="text-rust">但對方讀到的不是你的意思</span>。
      </h1>
      <p className="text-[15.5px] leading-[1.85] text-ink-2 mb-4">
        這個站其他地方都是你去查它。這一頁反過來——
        <strong className="text-ink font-medium">
          把你正要寄出去的東西貼進來
        </strong>
        ，它會標出你踩了哪幾條中文腦陷阱、對方會讀成什麼、以及母語者會怎麼講。
      </p>
      <p className="text-[14px] leading-[1.8] text-ink-2 mb-8">
        目前認得 {rules.length} 種有固定語言特徵的問題（{trapStats.written}{" "}
        條陷阱裡可機器偵測的那些）。需要判斷語意的——結論的位置、冠詞、單複數——它看不出來，
        那些請自己對照
        <a href="/trap/" className="text-rust underline underline-offset-2 mx-1">
          中文腦陷阱
        </a>
        那一頁。
      </p>
      <Checker />
    </div>
  );
}
