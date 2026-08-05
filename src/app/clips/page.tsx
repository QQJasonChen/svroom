import ClipBrowser from "@/components/ClipBrowser";
import { clipCount, clipPhrases } from "@/lib/clips";

export const metadata = {
  title: "原聲片段｜矽谷會議室",
  description:
    "挑一個說法，連續聽十幾個矽谷高階主管親口講它。語氣、停頓、輕重音——這些文字學不到。",
};

export default function ClipsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-serif text-[2rem] tracking-tight mb-2">原聲片段</h1>
      <p className="text-[14.5px] leading-relaxed text-ink-2 max-w-2xl mb-8">
        挑一個說法，連續聽不同的人親口講它。同一句話，Marty Cagan 講起來和
        Marc Andreessen 講起來是不一樣的——
        <strong className="text-ink font-medium">語氣、停頓、輕重音，這些文字學不到</strong>。
        收錄 {clipPhrases.length} 個說法、{clipCount} 段原聲。影片由 YouTube 播出。
      </p>
      <ClipBrowser />
    </div>
  );
}
