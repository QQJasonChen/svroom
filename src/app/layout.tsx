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

export const metadata: Metadata = {
  title: "矽谷會議室 — 從真實對話學商業英文",
  description:
    "不是單字書。從矽谷產品經理與創辦人的真實對話裡，拆解「怎麼說服、怎麼反對、怎麼收尾會議」的英文說法，順便把 PM 知識一起學走。",
};

const nav = [
  { href: "/", label: "全部功能" },
  { href: "/search/", label: "搜尋" },
  { href: "/practice/", label: "練習" },
  { href: "/about/", label: "關於" },
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
            <nav className="flex items-center gap-5 text-[13px]">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-ink-2 hover:text-rust transition-colors"
                >
                  {n.label}
                </Link>
              ))}
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
            <p>免費、不販售、無付費牆。想聽完整內容請直接支持原作者。</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
