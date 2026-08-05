# 矽谷會議室 Boardroom English

從矽谷產品經理與創辦人的真實對話裡，學商業英文的**語言功能**——怎麼說服、怎麼擋需求、怎麼給難聽的回饋、怎麼承認不知道。

給華語使用者（尤其是台灣的 PM／工程師／設計師）。**永久免費、無付費牆、不販售。**

---

## 這個專案在解什麼問題

台灣人的商業英文卡點通常不是單字量，是**沒看過母語者在同樣處境下怎麼說**。
會議上想反對一個提案，腦中只剩 "I don't think so"。

## 兩層架構

站分成兩層，而且是**雙向連結**的——因為懂一個概念，跟能用英文把它講清楚，是兩件事。

### 一、語言功能層（`data/functions.json`）

不按「商業會議」「電子郵件」這種主題分，而是按 **「你當下想做什麼」**（speech act）
分成 7 大類 30 個功能。每張句型卡：

| 欄位 | 內容 |
|---|---|
| 句型 | 可替換內容的骨架，例：`The way I'd frame it is [X]` |
| 原句 | 真人講過的話（≤60 字），附講者與時間戳 |
| 中譯 | 台灣用語的自然翻譯 |
| 為什麼這樣講 | 語用拆解——這句厲害在哪，怎麼遷移 |
| 也可以這樣說 | 同功能的替代說法 |
| 聽原句 | 帶時間碼的深連結，直接跳到那一句（回退 2 秒） |

### 二、PM 知識層（`data/concepts-taxonomy.json`）

7 大類 46 個產品管理核心概念。每個概念：

| 欄位 | 內容 |
|---|---|
| 這是什麼 | 中文解說，講清楚它在解什麼問題 |
| 常見的坑 | 台灣 PM 特有的誤解，不是教科書定義 |
| 在英文會議上怎麼講 | 2-3 個能直接開口的句型，附使用時機 |
| 他們是這樣說的 | 原文佐證＋時間碼連結 |
| 配套的句型 | 連回相關的語言功能與句型卡 |

反向也通：語言功能頁會列出「這些句型背後的 PM 判斷」。

---

## 資料來源與授權

例句取自 [Lenny's Podcast](https://www.lennyspodcast.com)，版權屬 Lenny Rachitsky。

本專案是**非商業的個人學習專案**，依原始語料授權中「可以建立個人專案並公開分享」
的條款進行。合規做法寫死在 `scripts/build-cards.mjs` 裡，不靠自律：

- 每則引文 **≤ 60 個英文字**，超過的卡片直接被 build 剔除
- 每位講者累計引文 **≤ 500 字**，超過的卡片直接被 build 剔除。
  **兩層共用同一個預算**——否則多加一層就等於把上限翻倍
- 每張卡片**必須有出處**（講者 + 來源集數），否則剔除
- 原始逐字稿放在 `data/raw/`，**已寫進 `.gitignore`，絕不進 repo**
- 出處連結只在語料索引有真實網址時才給。索引裡有 38 個 YouTube 網址的
  影片 ID 含空白（來源髒資料），這些一律留空——**標錯出處比沒有連結更糟**

想看完整內容請直接訂閱與支持原作者。

---

## 開發

```bash
npm install
npm run cards      # 合併 data/raw/batch-*.json → data/cards.json（含授權檢查）
npm run dev        # http://localhost:3000
npm run build      # 跑 cards 再 next build，產出靜態站到 out/
```

技術：Next.js 16（App Router、`output: 'export'` 靜態輸出）、React 19、Tailwind v4。
沒有後端、沒有資料庫、沒有帳號。練習進度存在使用者自己瀏覽器的 localStorage。

### 加新的語料

1. 把新的批次 JSON 放進 `data/raw/batch-NN.json`（格式見既有檔案）
2. `npm run cards` — 它會報告哪些 function 還沒卡片、哪些卡片被剔除與原因
3. `npm run build`

---

## 部署

推到 `main` 由 GitHub Actions 自動 build 並發到 GitHub Pages（見 `.github/workflows/deploy.yml`）。

站台跑在 `https://<user>.github.io/svroom/`，所以 `next.config.ts` 設了 `basePath`。
若換 repo 名或改用自訂網域，設環境變數 `NEXT_PUBLIC_BASE_PATH` 覆蓋（自訂網域用空字串）。
