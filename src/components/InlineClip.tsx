"use client";

import { useState } from "react";

/**
 * 就地播放原句，不跳出網站。
 *
 * 原本每張卡的出處都是外連到 YouTube，等於每次想確認「這句真的有人講過嗎」
 * 都要離開站。改成點開就在卡片底下播，溯源的成本降到一次點擊。
 */
export default function InlineClip({
  url,
  timestamp,
  episode,
  seek,
}: {
  url: string;
  timestamp: string | null;
  episode: string | null;
  seek: boolean;
}) {
  const [open, setOpen] = useState(false);

  // 只有 YouTube 能就地嵌入；Substack 文章頁只能外連
  const vid =
    (url.match(/[?&]v=([\w-]{6,})/) || url.match(/youtu\.be\/([\w-]{6,})/) || [])[1] ??
    null;
  const start = (url.match(/[?&]t=(\d+)s?/) || [])[1] ?? "0";

  if (!vid) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto underline underline-offset-2 hover:text-rust"
      >
        讀原文 ↗
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`ml-auto inline-flex items-center gap-1.5 transition-colors ${
          open ? "text-rust" : "hover:text-rust"
        }`}
      >
        <span>{open ? "▾" : "▶"}</span>
        <span className="underline underline-offset-2">
          {open
            ? "收起"
            : seek && timestamp
              ? `聽他本人講（${timestamp.replace(/^00:/, "")}）`
              : "聽他本人講"}
        </span>
      </button>

      {open && (
        <div className="w-full mt-3">
          <div className="relative w-full aspect-video bg-ink rounded-sm overflow-hidden">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${vid}?start=${start}&autoplay=1&rel=0&modestbranding=1&hl=en&playsinline=1`}
              title={episode ?? "原聲片段"}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 text-[11.5px] text-ink-3">
            <span>影片由 YouTube 播出</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-rust"
            >
              在 YouTube 開啟 ↗
            </a>
          </p>
        </div>
      )}
    </>
  );
}
