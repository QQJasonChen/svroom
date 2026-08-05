"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Clip, clipDuration } from "@/lib/clips";

/**
 * 原聲片段播放器。介面與快捷鍵沿用 dutch-playphrase：
 * N 下一個 · P 上一個 · R 重播 · L 循環 · F 收藏 · 空白鍵 播放/暫停
 *
 * 內容一律由 YouTube 官方播放器播出——我們只提供「第幾秒」，
 * 不代管、不轉檔、不散布任何音訊。
 */

type YTPlayer = {
  loadVideoById: (o: {
    videoId: string;
    startSeconds: number;
    endSeconds?: number;
  }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (s: number, allow: boolean) => void;
  setPlaybackRate: (r: number) => void;
  getPlayerState: () => number;
  destroy: () => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, opts: unknown) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return apiPromise;
}

const FAV_KEY = "svroom.clipFavs.v1";

export default function ClipPlayer({
  clips,
  label,
}: {
  clips: Clip[];
  label: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready, setReady] = useState(false);
  const [i, setI] = useState(0);
  const [loop, setLoop] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [rate, setRate] = useState(1);
  const [favs, setFavs] = useState<string[]>([]);

  const clip = clips[i];
  const keyOf = (c: Clip) => `${c.v}@${c.t}`;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAV_KEY);
      if (raw) setFavs(JSON.parse(raw));
    } catch {
      /* 隱私模式就算了 */
    }
  }, []);

  // 換一組片段時回到第一個
  useEffect(() => setI(0), [label]);

  useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !mountRef.current || playerRef.current) return;
      playerRef.current = new window.YT!.Player(mountRef.current, {
        width: "100%",
        height: "100%",
        // hl 不指定的話 YouTube 會依瀏覽器語系把標題自動翻譯掉，
        // 學英文的站看到荷蘭文標題很怪
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          hl: "en",
          cc_lang_pref: "en",
        },
        events: { onReady: () => !cancelled && setReady(true) },
      });
    });
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, []);

  const play = useCallback(
    (c: Clip) => {
      const p = playerRef.current;
      if (!p || !c) return;
      const dur = clipDuration(c.line) / rate;
      p.loadVideoById({ videoId: c.v, startSeconds: c.t });
      p.setPlaybackRate(rate);
      if (timerRef.current) clearTimeout(timerRef.current);
      // YouTube 的 endSeconds 不吃播放速度，所以自己算時間停
      timerRef.current = setTimeout(() => {
        if (loop) play(c);
        else if (autoNext) setI((x) => (x + 1) % clips.length);
        else playerRef.current?.pauseVideo();
      }, dur * 1000);
    },
    [rate, loop, autoNext, clips.length],
  );

  useEffect(() => {
    if (ready && clip) play(clip);
    // play 會因為 rate/loop 改變而變動，但那時不該重播，故只看 index
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, clip?.v, clip?.t]);

  const toggleFav = useCallback(() => {
    if (!clip) return;
    const k = keyOf(clip);
    setFavs((prev) => {
      const next = prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k];
      try {
        window.localStorage.setItem(FAV_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [clip]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === "n") setI((x) => (x + 1) % clips.length);
      else if (k === "p") setI((x) => (x - 1 + clips.length) % clips.length);
      else if (k === "r") clip && play(clip);
      else if (k === "l") setLoop((v) => !v);
      else if (k === "f") toggleFav();
      else if (e.key === " ") {
        e.preventDefault();
        const p = playerRef.current;
        if (!p) return;
        p.getPlayerState() === 1 ? p.pauseVideo() : p.playVideo();
      } else return;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clips.length, clip, play, toggleFav]);

  if (clips.length === 0) {
    return (
      <p className="text-[14px] text-ink-2 py-10 text-center">
        這個說法還沒有原聲片段。
      </p>
    );
  }

  const faved = clip && favs.includes(keyOf(clip));

  return (
    <div>
      <div className="relative w-full aspect-video bg-ink rounded-sm overflow-hidden">
        <div ref={mountRef} className="absolute inset-0" />
      </div>

      {/* 這一句 */}
      <div className="mt-4 border-l-2 border-rust/35 pl-4">
        <p className="quote">{clip.line}</p>
        <p className="mt-2 text-[12px] text-ink-3">
          {clip.sp}
          {clip.ep ? ` · ${clip.ep}` : ""}
        </p>
      </div>

      {/* 控制列 */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setI((x) => (x - 1 + clips.length) % clips.length)}
          className="px-3 py-2 text-[13px] border border-rule rounded-sm hover:border-rust hover:text-rust transition-colors"
        >
          ← 上一個 <span className="opacity-50 text-[11px]">P</span>
        </button>
        <button
          onClick={() => clip && play(clip)}
          className="px-3 py-2 text-[13px] border border-rule rounded-sm hover:border-rust hover:text-rust transition-colors"
        >
          重播 <span className="opacity-50 text-[11px]">R</span>
        </button>
        <button
          onClick={() => setI((x) => (x + 1) % clips.length)}
          className="px-3 py-2 text-[13px] bg-ink text-paper rounded-sm hover:opacity-90"
        >
          下一個 → <span className="opacity-50 text-[11px]">N</span>
        </button>

        <button
          onClick={() => setLoop((v) => !v)}
          className={`px-3 py-2 text-[13px] border rounded-sm transition-colors ${
            loop ? "border-rust text-rust" : "border-rule hover:border-rust"
          }`}
        >
          循環 <span className="opacity-50 text-[11px]">L</span>
        </button>
        <button
          onClick={toggleFav}
          className={`px-3 py-2 text-[13px] border rounded-sm transition-colors ${
            faved ? "border-rust text-rust" : "border-rule hover:border-rust"
          }`}
        >
          {faved ? "★" : "☆"} 收藏 <span className="opacity-50 text-[11px]">F</span>
        </button>

        <div className="flex rounded-sm border border-rule overflow-hidden ml-auto">
          {[0.5, 0.75, 1].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRate(r);
                playerRef.current?.setPlaybackRate(r);
              }}
              className={`px-2.5 py-2 text-[12px] tabular-nums transition-colors ${
                rate === r ? "bg-ink text-paper" : "hover:text-rust"
              }`}
            >
              {r}×
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-[12px] text-ink-3">
        <span className="tabular-nums">
          {i + 1} / {clips.length}
        </span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={autoNext}
            onChange={(e) => setAutoNext(e.target.checked)}
          />
          播完自動接下一個
        </label>
        <span className="ml-auto hidden sm:inline">
          快捷鍵 N／P／R／L／F／空白鍵
        </span>
      </div>
    </div>
  );
}
