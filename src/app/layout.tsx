import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://qqjasonchen.github.io/svroom";

const DESCRIPTION =
  "不是單字書。從矽谷產品經理與創辦人的真實對話裡，拆解「怎麼說服、怎麼反對、怎麼收尾會議」的英文說法，順便把 PM 知識一起學走。免費、無付費牆。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "矽谷會議室 — 從真實對話學商業英文",
    template: "%s",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "矽谷會議室",
    title: "矽谷會議室 — 從真實對話學商業英文",
    description: DESCRIPTION,
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "矽谷會議室 — 從真實對話學商業英文",
    description: DESCRIPTION,
  },
};

// 導覽只放「每天真的會點」的四個。其餘（總論／開口說／動筆寫／
// PM 知識／講 vs 寫／情境）都從首頁進——首頁本身就是那張地圖。
// 導覽只放「每天真的會點」的。其餘（總論／開口說／動筆寫／PM 知識／
// 講 vs 寫／情境）都從首頁進——首頁本身就是那張地圖。
const nav = [
  { href: "/today/", label: "今天的 5 句" },
  { href: "/trap/", label: "中文腦陷阱" },
  { href: "/jargon/", label: "職場黑話" },
  { href: "/ask/", label: "怎麼問" },
  { href: "/clips/", label: "原聲片段" },
  { href: "/practice/", label: "練習" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // 字體變數必須掛在 <html>：@theme 的 --font-serif 定義在 :root 且引用
    // --font-newsreader，若後者只存在於 <body> 作用域，整個 --font-serif 會失效。
    <html lang="zh-Hant" className={newsreader.variable}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-rule">
          <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between gap-6">
            <Link href="/" className="group flex items-baseline gap-2.5 shrink-0">
              <span className="text-[15px] font-semibold tracking-tight">
                矽谷會議室
              </span>
              <span className="hidden sm:inline text-[11px] text-ink-3 tracking-wide">
                Boardroom English
              </span>
            </Link>
            <nav className="flex items-center gap-3.5 sm:gap-5 text-[12.5px] sm:text-[13px] overflow-x-auto">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-ink-2 hover:text-rust transition-colors whitespace-nowrap"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                href="/search/"
                aria-label="搜尋"
                className="text-ink-3 hover:text-rust transition-colors pl-1"
              >
                搜尋
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-rule mt-20">
          <div className="mx-auto max-w-5xl px-5 py-8 text-[12px] leading-relaxed text-ink-3 space-y-2">
            <p>
              例句取自{" "}
              <a
                href="https://www.lennyspodcast.com"
                className="text-ink-2 underline underline-offset-2 hover:text-rust"
                target="_blank"
                rel="noopener noreferrer"
              >
                Lenny&apos;s Podcast
              </a>
              ，版權屬 Lenny Rachitsky。本站為非商業的個人學習專案，僅引用極短句段作教學拆解之用，每張卡片均連回原集。
            </p>
            <p>
              免費、不販售、無付費牆。想聽完整內容請直接支持原作者。
              <Link
                href="/about/"
                className="ml-2 text-ink-2 underline underline-offset-2 hover:text-rust"
              >
                關於這個站
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
