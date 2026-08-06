#!/usr/bin/env python3
"""
從電子報正文抽出真正的作者。

為什麼需要這支：語料的 index.json 只有 podcast 有 `guest` 欄位，電子報沒有。
建候選池時我讓它 fallback 成佔位字串 "author"，結果 agent 只能猜，
把客座文章一律掛成 Lenny Rachitsky——但 Lenny's Newsletter 有大量客座文
（談薪那篇其實是 Jacob Warwick、Palantir 那篇是 Adam Judelson）。

在一個承諾「每句都有真實出處」的站上，掛錯作者比沒有作者嚴重。

Lenny 介紹客座作者的寫法很固定，開頭幾段一定會出現：
  "an incredible post by [Name](link)"  /  "guest post by [Name](link)"
  "I'm excited to bring you ... by [Name](link)"  /  "[Name] is the ..."
所以抓「前 12 段裡第一個 markdown 人名連結」命中率很高；抓不到就歸給
Lenny 本人（他自己寫的佔多數），並在輸出裡標明是推定還是明確。

用法：  python3 scripts/newsletter-authors.py
輸出：  data/newsletter-authors.json
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
OUT = ROOT / "data" / "newsletter-authors.json"

# markdown 連結裡的人名：[Jacob Warwick](https://…)
NAME_LINK = re.compile(r"\[([A-Z][a-zA-Z.'’-]+(?: [A-Z][a-zA-Z.'’-]+){1,2})\]\(https?://[^)]+\)")

# 明確的客座訊號——出現這些字樣時，後面第一個人名幾乎一定是作者
GUEST_CUE = re.compile(
    r"(guest post|guest series|post by|piece by|essay by|bring you .{0,40}by|"
    r"excited to share .{0,60}by|written by|is a guest)",
    re.I,
)

# 不是人名的連結文字。Lenny 開頭常連到職稱、產品、活動，
# 這些長得跟人名一樣（兩個大寫字），但掛上去就是假出處。
NOT_AUTHOR = {"Lenny Rachitsky", "Lenny"}
ROLE_WORDS = re.compile(
    r"\b(fellow|newsletter|podcast|guide|report|course|community|team|group|"
    r"labs?|ventures?|capital|partners?|inc|llc|university|school|academy|"
    r"conference|summit|substack|linkedin|twitter|product hunt|here|this)\b",
    re.I,
)


def author_of(text):
    """回傳 (作者, 是否為明確客座)。抓不到就 (Lenny Rachitsky, False)。"""
    head = "\n".join(text.split("\n")[:40])

    # 先找有客座訊號的那一句，取句中第一個人名連結
    for sent in re.split(r"(?<=[.!?])\s+", head):
        if not GUEST_CUE.search(sent):
            continue
        for m in NAME_LINK.finditer(sent):
            n = m.group(1)
            if n not in NOT_AUTHOR and not ROLE_WORDS.search(n):
                return n, True

    # 沒有明確客座訊號就**不猜**。Lenny 在開頭會連到各種人名（受訪者、
    # 被提到的創辦人、工具作者），拿那個當作者等於偽造出處。
    # 寧可不宣稱作者，只顯示文章標題——那本來就是真實出處。
    return None, False


def main():
    d = ARCHIVE / "newsletters"
    if not d.exists():
        print(f"✗ 找不到 {d}", file=sys.stderr)
        return 1

    out, explicit, guessed, lenny = {}, 0, 0, 0
    for p in sorted(d.glob("*.md")):
        name, sure = author_of(p.read_text(encoding="utf8"))
        out[p.name] = {"author": name, "explicit": sure}
        if name is None:
            lenny += 1
        else:
            explicit += 1

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    print(f"✓ {len(out)} 篇電子報")
    print(f"  能確認作者（文中寫明 guest post by …）  {explicit}")
    print(f"  不宣稱作者（只顯示文章標題）            {lenny}")
    print(f"  → {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
