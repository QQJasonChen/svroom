import { stats } from "@/lib/cards";

export const metadata = {
  title: "關於｜矽谷會議室",
  description: "這個網站是什麼、資料哪裡來、為什麼免費。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="font-serif text-[2.2rem] tracking-tight mb-8">關於</h1>

      <div className="space-y-9 text-[15px] leading-[1.85] text-ink-2">
        <section>
          <h2 className="text-ink font-semibold text-[16px] mb-2.5">
            這是什麼
          </h2>
          <p>
            一個給華語使用者（尤其是台灣的產品經理、工程師、設計師）練<strong className="text-ink font-medium">商業英文口說</strong>的免費網站。
          </p>
          <p className="mt-3">
            它跟一般英文教材最大的不同是：不按「主題」分類，而是按
            <strong className="text-ink font-medium">「你當下想做什麼」</strong>
            分類。你不會在會議中想著「我要用商業詞彙」，你會想的是「我要擋掉這個需求」「我要不失禮貌地反對」。所以這裡的分類就長成這樣。
          </p>
        </section>

        <section>
          <h2 className="text-ink font-semibold text-[16px] mb-2.5">
            例句哪裡來
          </h2>
          <p>
            全部取自{" "}
            <a
              href="https://www.lennyspodcast.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rust underline underline-offset-2"
            >
              Lenny&apos;s Podcast
            </a>{" "}
            的公開節目——Lenny Rachitsky 訪談矽谷產品經理與創辦人的長篇對話。目前收錄了 {stats.guests} 位講者、{stats.cards} 個句型。
          </p>
          <p className="mt-3">
            用真實訪談而不是編寫的教科書例句，是因為這些句子是講者
            <strong className="text-ink font-medium">在被追問、要即時反應</strong>
            的狀態下講出來的。那才是你在會議裡真正需要的語言——不是準備好的稿子，是臨場的反應。
          </p>
        </section>

        <section>
          <h2 className="text-ink font-semibold text-[16px] mb-2.5">
            版權與為什麼免費
          </h2>
          <p>
            節目內容版權屬 Lenny Rachitsky。本站是<strong className="text-ink font-medium">非商業的個人學習專案</strong>，
            在授權允許的範圍內使用：每張卡片只引用極短的句段（上限 60 字）作教學拆解，不散布逐字稿，並且一律標示講者、時間戳，連回原始集數。
          </p>
          <p className="mt-3">
            本站永久免費、沒有付費牆、不販售任何東西。如果這裡的內容對你有用，
            <strong className="text-ink font-medium">請直接去訂閱與支持原作者</strong>
            ——完整的節目與電子報都在他那裡。
          </p>
        </section>

        <section>
          <h2 className="text-ink font-semibold text-[16px] mb-2.5">
            怎麼用最有效
          </h2>
          <ol className="space-y-2 list-decimal pl-5">
            <li>
              從你<strong className="text-ink font-medium">這週真的會遇到</strong>的處境挑一個功能，不要從頭讀到尾。
            </li>
            <li>
              到「練習」看中文先自己講一次英文，再對答案。想不出來才是有價值的那一刻。
            </li>
            <li>
              每張卡的「為什麼這樣講」比句子本身重要——那是語感，可以遷移到別的句子上。
            </li>
            <li>
              點「聽原句」回原集，聽講者的語氣和停頓。文字學不到節奏。
            </li>
          </ol>
        </section>
      </div>
    </div>
  );
}
