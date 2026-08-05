import { stats } from "@/lib/cards";
import { conceptStats } from "@/lib/concepts";
import { Src } from "@/components/Src";

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
            兩層，而且是綁在一起的
          </h2>
          <p>
            <strong className="text-ink font-medium">語言功能層</strong>（{stats.covered} 個功能、{stats.cards} 張句型卡）教你「這個處境的英文怎麼說」；
            <strong className="text-ink font-medium">PM 知識層</strong>（{conceptStats.written} 個概念）教你「這個處境背後在解什麼問題」。
          </p>
          <p className="mt-3">
            兩層互相連結：看「有禮貌地反對」的句型時，會看到它背後是 disagree and commit 這個概念；看
            disagree and commit 時，會看到在英文會議上怎麼把它講出口。因為
            <strong className="text-ink font-medium">懂一個概念，跟能用英文把它講清楚，是兩件不同的事</strong>
            ——而多數台灣 PM 卡住的是後者。
          </p>
        </section>

        <section>
          <h2 className="text-ink font-semibold text-[16px] mb-2.5">
            哪些是原文，哪些是我們寫的
          </h2>
          <p>
            這個站有兩種內容，全站用一致的標記分開，因為分不出來的話你無從判斷該不該相信。
          </p>
          <div className="mt-4 space-y-3">
            <p>
              <Src kind="corpus" />{" "}
              真的有人講過或寫過的句子。一律標示講者、時間戳與集數，而且可以直接在卡片上展開播放器，
              跳到那一秒聽本人講——不必離開這個站。
            </p>
            <p>
              <Src kind="ours" />{" "}
              翻譯、語用拆解、整理出來的句型、PM 概念解說與那 7 個核心策略。
              這些是我們的分析，不是原文。每一句我們寫的英文旁邊都有「查語料」，
              點過去會搜全站的真實引文——
              <strong className="text-ink font-medium">如果搜不到，那就代表這句是我們的建構</strong>，
              這個結果本身也是誠實的資訊。
            </p>
          </div>
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
