"use client";

import { useSpeech } from "@/lib/speech";

/**
 * 唸英文的按鈕。一般速度 + 0.75 倍慢速跟讀。
 * 瀏覽器不支援語音合成時整組不顯示，不留一個按了沒反應的按鈕。
 */
export default function Speak({
  text,
  id,
  className = "",
}: {
  text: string;
  id: string;
  className?: string;
}) {
  const { supported, speak, speakingId } = useSpeech();
  if (!supported) return null;

  const active = speakingId === id || speakingId === `${id}-slow`;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <button
        onClick={() => speak(text, { id })}
        aria-label={active ? "停止" : "唸這句"}
        title={active ? "停止" : "唸這句"}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-sm border transition-colors ${
          active
            ? "border-rust text-rust"
            : "border-rule text-ink-3 hover:border-rust hover:text-rust"
        }`}
      >
        {active ? (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor">
            <rect x="0" y="0" width="10" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1.5v13L4.2 11.3H1.5a.5.5 0 0 1-.5-.5V5.2c0-.28.22-.5.5-.5h2.7L8 1.5z" />
            <path
              d="M10.8 5a4 4 0 0 1 0 6"
              stroke="currentColor"
              strokeWidth="1.3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
      <button
        onClick={() => speak(text, { id: `${id}-slow`, rate: 0.72 })}
        aria-label="慢速唸這句，適合跟讀"
        title="慢速（跟讀用）"
        className="inline-flex items-center justify-center h-6 px-1.5 rounded-sm border border-rule text-[10px] tabular-nums text-ink-3 hover:border-rust hover:text-rust transition-colors"
      >
        0.75×
      </button>
    </span>
  );
}
