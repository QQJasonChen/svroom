"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 用瀏覽器內建的 Web Speech API 唸英文。
 *
 * 刻意不用付費 TTS 預生成音檔：這個站是免費的、不能商業化，
 * 而 macOS / iOS / Chrome 內建的英文語音品質已經夠做跟讀練習，
 * 而且零成本、零檔案、零頻寬。
 */

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  if (cachedVoice) return cachedVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  if (en.length === 0) return null;

  // 挑順序：Apple 的加強語音 → 其他非 compact 的美式 → 任何美式 → 任何英文
  const preferred =
    en.find((v) => /(Samantha|Ava|Allison|Evan|Zoe)/i.test(v.name) && !/compact/i.test(v.name)) ??
    en.find((v) => /(Google US English|Microsoft Aria|Microsoft Jenny)/i.test(v.name)) ??
    en.find((v) => v.lang === "en-US" && !/compact/i.test(v.name)) ??
    en.find((v) => v.lang === "en-US") ??
    en[0];

  cachedVoice = preferred ?? null;
  return cachedVoice;
}

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const currentId = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    setSupported(true);
    // 語音清單在部分瀏覽器是非同步載入的，先觸發一次
    pickVoice();
    const onVoices = () => pickVoice();
    window.speechSynthesis.addEventListener?.("voiceschanged", onVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", onVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, opts?: { id?: string; rate?: number }) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      const id = opts?.id ?? text;

      // 再點一次同一句 = 停止
      if (currentId.current === id) {
        window.speechSynthesis.cancel();
        currentId.current = null;
        setSpeakingId(null);
        return;
      }

      window.speechSynthesis.cancel();

      // 句型骨架裡的 [X] 佔位符唸出來很怪，改唸成停頓
      const clean = text.replace(/\[([^\]]+)\]/g, "…").replace(/\s+/g, " ").trim();

      const u = new SpeechSynthesisUtterance(clean);
      const voice = pickVoice();
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? "en-US";
      u.rate = opts?.rate ?? 1;
      u.pitch = 1;

      const done = () => {
        if (currentId.current === id) {
          currentId.current = null;
          setSpeakingId(null);
        }
      };
      u.onend = done;
      u.onerror = done;

      currentId.current = id;
      setSpeakingId(id);
      window.speechSynthesis.speak(u);
    },
    [],
  );

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    currentId.current = null;
    setSpeakingId(null);
  }, []);

  return { supported, speak, stop, speakingId };
}
