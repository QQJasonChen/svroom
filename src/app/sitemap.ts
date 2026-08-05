import type { MetadataRoute } from "next";
import { cards } from "@/lib/cards";
import { conceptIndex } from "@/lib/concepts";
import { writingCards } from "@/lib/writing";

export const dynamic = "force-static";

// 站台完整網址。換自訂網域時改這個環境變數即可。
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://qqjasonchen.github.io/svroom";

export default function sitemap(): MetadataRoute.Sitemap {
  const at = (path: string) => `${SITE}${path}`;

  const staticPages = ["/", "/w/", "/pm/", "/practice/", "/search/", "/about/"];

  const fnPages = [...new Set(cards.map((c) => c.fn))].map((fn) => `/f/${fn}/`);
  const writingPages = [...new Set(writingCards.map((c) => c.fn))].map(
    (fn) => `/w/${fn}/`,
  );
  const conceptPages = conceptIndex.map((c) => `/pm/${c.id}/`);

  return [...staticPages, ...fnPages, ...writingPages, ...conceptPages].map(
    (path) => ({
      url: at(path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
    }),
  );
}
