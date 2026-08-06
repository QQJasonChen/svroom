#!/usr/bin/env python3
"""
階段 0：全語料索引。

把 311 集 podcast + 367 篇 newsletter 切成**句子**，每句帶上出處
（檔案、講者、時間戳）與它命中哪些語用標記。

為什麼要這一步：先前 agent 的工作單位是「讀 4 集」，回報的只能是
「這 4 集裡最好的說法」——局部最佳。有了句級索引之後，工作單位可以
換成「某個語言行為在全 311 集的所有候選句」，模型讀的是候選池而不是
原文，於是**統計跑在 100% 語料上，模型只做它擅長的解讀**。

這支腳本不進 CI（CI 沒有語料庫），只在本機跑。輸出到 analysis/ 並已
gitignore——那是衍生資料，不是內容。

用法：  python3 scripts/corpus-index.py
輸出：  analysis/corpus-index.jsonl
"""
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE = Path(
    os.environ.get("LENNY_ARCHIVE", ROOT.parent / "lennys-newsletterpodcastdata-all")
)
OUT_DIR = ROOT / "analysis"
OUT = OUT_DIR / "corpus-index.jsonl"

MIN_WORDS, MAX_WORDS = 5, 45

TURN = re.compile(r"\*\*([^*]+)\*\* \((\d+):(\d+):(\d+)\):\s*")
SENT = re.compile(r"(?<=[.!?])\s+")

# 語用標記電池。分類是為了之後好挑，統計時每一條都獨立計數。
# 刻意收得很寬——這一步的目的是「不漏」，篩選留給後面的階段。
MARKERS = {
    # ── 立場：反對、拒絕、挑戰 ──
    "stance.disagree": [
        r"i disagree", r"i'?d disagree", r"don'?t get me wrong", r"i'?d push back",
        r"push back on", r"i'?m not convinced", r"i take issue", r"i'?m skeptical",
        r"i see it differently", r"where i'?d differ", r"i don'?t buy",
        r"i'?d challenge", r"that'?s a false", r"i'?d resist",
    ],
    "stance.refuse": [
        r"\bi'?m going to say no", r"\bthe answer is no", r"\bwe'?re not going to",
        r"\bi have to say no", r"\bwe decided not to", r"\bwe'?ve chosen not to",
        r"\bthat'?s off the table", r"\bi'?m not willing", r"\bwe'?re going to pass",
        r"\bsay no to",
    ],
    "stance.premise": [
        r"what would have to be true", r"that assumes", r"reject that premise",
        r"the assumption", r"why do we believe", r"is that actually true",
        r"how do we know", r"what if the opposite", r"what are we assuming",
        r"what would falsify", r"what would change your mind",
    ],
    "stance.hold": [
        r"i still think", r"i'?ll stand by", r"i haven'?t changed my",
        r"i feel strongly", r"this is a hill", r"i'?m sticking with",
        r"i really do believe", r"my strong opinion",
    ],
    # ── 緩衝與標籤 ──
    "hedge.prefix": [
        r"hot take", r"unpopular opinion", r"spicy take", r"i'?ll caveat",
        r"big caveat", r"to be fair", r"to be clear", r"i'?m not saying",
        r"don'?t hear this", r"i acknowledge", r"if i'?m being",
    ],
    "hedge.uncertain": [
        r"i don'?t know", r"i'?m not sure", r"i have no idea", r"my guess is",
        r"i could be wrong", r"i may be wrong", r"i'?m not an expert",
        r"i don'?t have a good answer", r"we don'?t know", r"i'?d hold that loosely",
        r"the jury'?s still out", r"reasonable people disagree",
    ],
    "hedge.selfcrit": [
        r"i'?m biased", r"survivorship bias", r"full disclosure",
        r"i'?ll be the first to", r"this sounds", r"it'?s embarrassing",
        r"granted", r"i can'?t prove",
    ],
    # ── 主張與框架 ──
    "frame.opinion": [
        r"the way i think about", r"the way i see it", r"my sense is",
        r"i would argue", r"i'?d argue", r"here'?s how i think",
        r"my take on", r"i tend to think", r"what i'?ve found",
        r"my mental model", r"the frame i use", r"what it comes down to",
        r"the crux of", r"if you boil it down", r"my working hypothesis",
    ],
    "frame.reframe": [
        r"it'?s not a .{1,25} problem", r"that'?s not a .{1,25} problem",
        r"it'?s never a", r"the real question", r"wrong question",
        r"if you zoom out", r"zoom out", r"the question behind",
    ],
    "frame.naming": [
        r"what i call", r"i call it", r"i call this", r"we call it",
        r"we call this", r"the name we", r"i describe it as",
    ],
    # ── 互動 ──
    "act.ask": [
        r"help me understand", r"can you say more", r"walk me through",
        r"what do you mean", r"how do you know", r"what are you optimizing",
        r"what does success look like", r"where does that break down",
        r"say more about", r"what'?s the failure mode",
    ],
    "act.clarify": [
        r"what i'?m hearing", r"just to make sure", r"just to be clear",
        r"so what you'?re saying", r"correct me if", r"let me reflect",
        r"am i right that", r"let me restate", r"to steelman",
    ],
    "act.interrupt": [
        r"can i jump in", r"jump in here", r"can i build on",
        r"just to double click", r"double click on", r"real quick",
        r"let me interject", r"one quick thing",
    ],
    "act.summarize": [
        r"let me pause", r"try to capture", r"just to summarize",
        r"where we'?ve landed", r"is everyone in agreement", r"to wrap",
    ],
    # ── 人與回饋 ──
    "people.feedback": [
        r"i noticed", r"what i'?m noticing", r"i'?m seeing something",
        r"the system failed", r"not on you", r"you keep using the word",
        r"every time we", r"in what world",
    ],
    "people.optout": [
        r"feel free to", r"no pressure", r"totally fine if",
        r"are you able to", r"if that doesn'?t work", r"up to you",
        r"just say so", r"happy either way",
    ],
    # ── 承諾與具體 ──
    "commit.time": [
        r"by end of", r"by monday", r"by friday", r"by next week",
        r"i'?ll own", r"i'?ll take that", r"who'?s the owner", r"\bdri\b",
        r"deadline", r"by when",
    ],
    "concrete.number": [
        r"\b\d+x\b", r"\b\d+%", r"went from \d", r"order of magnitude",
        r"\b\d+ percent",
    ],
    "concrete.verb": [
        r"\bwe shipped\b", r"\bi shipped\b", r"\bwe drove\b", r"\bwe cut\b",
        r"\bwe tripled\b", r"\bwe doubled\b", r"\bi led\b", r"\bi owned\b",
        r"\bwe scaled\b",
    ],
    # ── 誠實與修正 ──
    "candor.failure": [
        r"we failed", r"i failed", r"biggest mistake", r"we screwed up",
        r"i screwed up", r"we got it wrong", r"i was wrong",
    ],
    "candor.changed": [
        r"i used to think", r"i used to believe", r"changed my mind",
        r"i no longer", r"i'?ve come around", r"i'?ve since",
    ],
    "candor.limits": [
        r"i can'?t speak to", r"i can'?t share", r"limited on what",
        r"but what i can", r"i'?m not the right person",
    ],
    # ── 故事與鋪陳 ──
    "story.setup": [
        r"let me tell you", r"i'?ll give you a", r"here'?s a good example",
        r"to set the stage", r"for context", r"the backdrop",
        r"let me back up", r"at a high level", r"the short version",
        r"so here'?s what happened", r"a great example of",
    ],
}

COMPILED = {k: [re.compile(p, re.I) for p in v] for k, v in MARKERS.items()}


def sentences_from(text):
    """把一段文字切成句子，過濾掉太短太長的。"""
    for s in SENT.split(text):
        s = " ".join(s.split())
        n = len(s.split())
        if MIN_WORDS <= n <= MAX_WORDS:
            yield s, n


def hits_for(sentence):
    out = []
    for key, pats in COMPILED.items():
        if any(p.search(sentence) for p in pats):
            out.append(key)
    return out


def main():
    if not ARCHIVE.exists():
        print(f"✗ 找不到語料庫 {ARCHIVE}", file=sys.stderr)
        return 1
    OUT_DIR.mkdir(exist_ok=True)

    idx = json.loads((ARCHIVE / "index.json").read_text())
    meta = {}
    for kind in ("podcasts", "newsletters"):
        for it in idx.get(kind, []):
            meta[it["filename"].split("/")[-1]] = {
                "title": it.get("title"),
                "guest": it.get("guest"),
                "kind": kind,
            }

    n_files = n_sent = n_marked = 0
    with OUT.open("w") as fh:
        for kind, pattern in (("podcasts", "podcasts/*.md"), ("newsletters", "newsletters/*.md")):
            for path in sorted(ARCHIVE.glob(pattern)):
                name = path.name
                text = path.read_text(encoding="utf8")
                n_files += 1
                info = meta.get(name, {})

                if kind == "podcasts":
                    # 依講者段落切，這樣每句都帶得到講者與時間戳
                    turns = list(TURN.finditer(text))
                    blocks = []
                    for i, m in enumerate(turns):
                        end = turns[i + 1].start() if i + 1 < len(turns) else len(text)
                        blocks.append(
                            (
                                m.group(1).strip(),
                                f"{m.group(2)}:{m.group(3)}:{m.group(4)}",
                                text[m.end() : end],
                            )
                        )
                    if not blocks:
                        blocks = [(info.get("guest"), None, text)]
                else:
                    blocks = [(info.get("guest") or "author", None, text)]

                for speaker, ts, body in blocks:
                    body = re.sub(r"\*\*[^*]+\*\*", " ", body)
                    for sent, wc in sentences_from(body):
                        n_sent += 1
                        marks = hits_for(sent)
                        if not marks:
                            continue
                        n_marked += 1
                        fh.write(
                            json.dumps(
                                {
                                    "f": name,
                                    "k": kind,
                                    "sp": speaker,
                                    "t": ts,
                                    "w": wc,
                                    "m": marks,
                                    "s": sent,
                                },
                                ensure_ascii=False,
                            )
                            + "\n"
                        )

    size = OUT.stat().st_size / 1e6
    print(f"✓ 索引完成：{n_files} 個檔案")
    print(f"  合格句 {n_sent:,} 句，其中命中語用標記 {n_marked:,} 句 = {n_marked/n_sent*100:.0f}%")
    print(f"  輸出 {OUT}（{size:.1f} MB）")
    return 0


if __name__ == "__main__":
    sys.exit(main())
