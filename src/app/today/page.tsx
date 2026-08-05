import Today from "@/components/Today";
import { poolSize } from "@/lib/today";

export const metadata = {
  title: "今天的 5 句｜矽谷會議室",
  description:
    "不用決定從哪開始。每天五句，唸出來就好。同一天打開永遠是同一組，明天自動換。",
};

export default function TodayPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-serif text-[2rem] tracking-tight mb-2">今天的 5 句</h1>
      <p className="text-[14.5px] leading-relaxed text-ink-2 mb-8 max-w-2xl">
        站上有 {poolSize} 張卡，但你今天不需要決定從哪開始。
        這五句唸出來、聽一次本人怎麼講，就夠了。
        <span className="block mt-2 text-[13px] text-ink-3">
          同一天打開永遠是同一組（今天沒練完，明天回來還在），跨天自動換。進度存在你自己的瀏覽器。
        </span>
      </p>
      <Today />
    </div>
  );
}
