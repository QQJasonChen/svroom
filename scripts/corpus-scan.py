#!/usr/bin/env python3
"""
階段 1：全語料統計 + 缺口分析。

讀階段 0 產出的句級索引，回答三個問題：
  1. 每一類語用行為在全語料出現多少次、涵蓋幾集
  2. 站上目前收錄了多少（拿 data/*.json 的引文去比對）
  3. 哪些是「語料裡很常見，但站上幾乎沒有」——那就是缺口

這一步完全不用模型，只是算。目的是讓後面的 agent 不必再靠「讀 4 集」
去猜哪些說法重要——由全語料的數字決定。

用法：  python3 scripts/corpus-scan.py
輸出：  analysis/gap-report.md  +  analysis/pool/<類別>.jsonl（各類候選句池）
"""
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IDX = ROOT / "analysis" / "corpus-index.jsonl"
OUT_DIR = ROOT / "analysis"
POOL_DIR = OUT_DIR / "pool"

ZH = {
    "stance.disagree": "反對與保留",
    "stance.refuse": "說不與擋需求",
    "stance.premise": "挑戰前提",
    "stance.hold": "守住立場",
    "hedge.prefix": "先貼標籤再開火",
    "hedge.uncertain": "承認不確定",
    "hedge.selfcrit": "先自曝弱點",
    "frame.opinion": "提出看法",
    "frame.reframe": "換分析單位",
    "frame.naming": "命名一個概念",
    "act.ask": "提問與追問",
    "act.clarify": "澄清與確認",
    "act.interrupt": "插話",
    "act.summarize": "總結收斂",
    "people.feedback": "對事不對人的回饋",
    "people.optout": "給對方退路",
    "commit.time": "指定時間與負責人",
    "concrete.number": "用數字講",
    "concrete.verb": "強動詞講成績",
    "candor.failure": "講失敗",
    "candor.changed": "公開改變想法",
    "candor.limits": "劃出能講的範圍",
    "story.setup": "鋪陳與舉例",
}


def norm(s):
    return re.sub(r"[^a-z0-9 ]+", " ", s.lower()).strip()


def main():
    if not IDX.exists():
        print(f"✗ 找不到 {IDX}，請先跑 corpus-index.py", file=sys.stderr)
        return 1

    rows = [json.loads(l) for l in IDX.open()]

    # ── 站上已收錄的引文，拿來比對涵蓋率 ──
    site = []
    for f in ["cards.json", "writing.json"]:
        p = ROOT / "data" / f
        if p.exists():
            site += [c["quote"] for c in json.loads(p.read_text())["cards"]]
    for f, key in [("questions.json", "questions"), ("findings.json", "findings")]:
        p = ROOT / "data" / f
        if not p.exists():
            continue
        d = json.loads(p.read_text())
        if key == "questions":
            site += [q["q"] for q in d["questions"]]
        else:
            site += [
                e["quote"] for x in d["findings"] for t in x["types"] for e in t["examples"]
            ]
    for f in ["jargon.json"]:
        p = ROOT / "data" / f
        if p.exists():
            site += [u["quote"] for t in json.loads(p.read_text())["terms"] for u in t["usage"]]
    site_norm = {norm(s)[:60] for s in site}

    cnt, eps, covered = Counter(), defaultdict(set), Counter()
    by_cat = defaultdict(list)
    for r in rows:
        key = norm(r["s"])[:60]
        for m in r["m"]:
            cnt[m] += 1
            eps[m].add(r["f"])
            by_cat[m].append(r)
            if key in site_norm:
                covered[m] += 1

    POOL_DIR.mkdir(parents=True, exist_ok=True)
    for cat, rs in by_cat.items():
        with (POOL_DIR / f"{cat}.jsonl").open("w") as fh:
            for r in rs:
                fh.write(json.dumps(r, ensure_ascii=False) + "\n")

    lines = []
    lines.append("# 全語料缺口報告\n")
    lines.append(f"索引 {len(rows):,} 句候選、站上已收錄 {len(site):,} 則引文\n")
    lines.append("| 語用行為 | 語料句數 | 出現檔數 | 站上已收 | 收錄率 | 缺口 |")
    lines.append("|---|---:|---:|---:|---:|---|")

    gaps = []
    for cat, n in cnt.most_common():
        c = covered[cat]
        rate = c / n * 100
        gap = "🔴 大" if n >= 200 and rate < 3 else ("🟡 中" if n >= 80 and rate < 6 else "")
        if gap:
            gaps.append((cat, n, len(eps[cat]), c, rate, gap))
        lines.append(
            f"| {ZH.get(cat, cat)} `{cat}` | {n:,} | {len(eps[cat])} | {c} | {rate:.1f}% | {gap} |"
        )

    lines.append("\n## 建議優先處理\n")
    for cat, n, e, c, rate, gap in sorted(gaps, key=lambda x: -x[1]):
        lines.append(
            f"- **{ZH.get(cat, cat)}**（`{cat}`）— 語料 {n:,} 句、{e} 個檔案，站上只收 {c} 則（{rate:.1f}%）"
        )

    (OUT_DIR / "gap-report.md").write_text("\n".join(lines) + "\n")

    print(f"✓ 掃描完成，候選句池寫到 {POOL_DIR}/（{len(by_cat)} 類）")
    print(f"  報告：{OUT_DIR / 'gap-report.md'}\n")
    print(f"{'語用行為':<18}{'語料句數':>9}{'檔數':>6}{'站上':>6}{'收錄率':>8}")
    print("-" * 50)
    for cat, n in cnt.most_common():
        print(
            f"{ZH.get(cat, cat):<18}{n:>9,}{len(eps[cat]):>6}{covered[cat]:>6}{covered[cat]/n*100:>7.1f}%"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
