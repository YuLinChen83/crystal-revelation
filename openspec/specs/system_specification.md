# OpenSpec: 水晶啟示錄 (Crystal Revelation) 系統規格書

## 1. Overview (專案概述)

### 1.1 專案簡介
「水晶啟示錄 (Crystal Revelation)」是一款極簡風格的現代網頁應用，融合了水晶科學百科、生命靈數測算以及 3D 手鍊 3D 模擬設計功能。用戶可以透過輸入生日，計算出自己的生命靈數與空缺數，獲得推薦的共振水晶，並在 3D 虛擬工坊中自由搭配設計手鍊，還能將設計回饋實體加工。

### 1.2 專案目標 (Goals)
* **科學與感性融合**：打破傳統水晶迷信，以礦物學（硬度、晶系、化學式）結合靈數美學，提供雙重維度水晶百科。
* **高質感 3D 體驗**：提供流暢、具備真實物理感的手鍊穿線自轉動畫（800ms 自轉一圈，無殘影）。
* **極致效能體驗**：網頁具備優秀的 Core Web Vitals 指標（LCP 良好、INP 反應極低、CLS 零偏移）。
* **Google 搜尋優化 (SEO)**：針對 104 種水晶，建構自動化靜態路由預渲染 (SSG)，實現水晶長尾詞的搜尋霸屏。

### 1.3 非目標 (Non-Goals)
* 本系統**不**建立用戶註冊與資料庫系統（用戶收藏水晶與手鍊暫存皆使用本地 LocalStorage 處理）。
* 本系統**不**包含線上金流交易，贊助管道統一導流至外部平台（Portaly）。

---

## 2. User Flows & Features (核心功能與使用者流程)

### 2.1 水晶百科展覽 (Encyclopedia)
* **資料庫**：內建 104 種標準化水晶資料，統一晶系亞分類，提供標準化化學式與摩氏硬度。
* **篩選功能**：
  * **硬度篩選**：以區間形式（如 0~1、1~2 到 9~10）進行精準匹配過濾。
  * **靈數對應數字篩選**：點擊對應之靈數，可即時篩選出共振水晶。
* **收藏機制**：點擊愛心圖示，將水晶 ID 存入 LocalStorage，支持跨頁面同步（在手鍊工坊中可一鍵篩選出收藏水晶進行設計）。

### 2.2 生命靈數測算 (Numerology)
* **計算邏輯**：用戶輸入西元生日，系統將年、月、日的各個數字拆分累加，直到縮減至個位數（1-9）作為主命數，並統計所有出現的數字來判定空缺數（Missing Numbers）。
* **推薦機制**：依據主命數與空缺數，智慧推薦對應的能量共振水晶。
* **查看所有靈數特質**：在已測算結果狀態下，測算按鈕下方會提供「查看所有靈數特質」連結。點擊後以 Modal 彈窗展示 0-9 號靈數的所有特質（包含名稱、氛圍、命定說明、缺數說明、肯定語等）。
* **17LIVE 廣告隨機置入**：
  * 測算結果底部設有推廣文案，使用 `useMemo` 基於生命靈數鎖定索引防止畫面切換時閃爍。
  * 隨機置入 4 款推廣文案，包含直接導流至 [17LIVE 首頁](https://17.live) 的心靈調頻文案，以及指向 [17LIVE 命理小舖](https://17.live/zh-Hant/suggested?subtab=label:fortune_teller) 的專門主播推薦。

### 2.3 手鍊工坊 (3D DIY Simulator)
* **3D 模擬視口**：基於 Three.js 與 React Three Fiber，動態繪製珠子排列。
* **模擬功能**：支持退回一顆、清空重置、點擊珠盤增加珠子（上限 24 顆）。
* **一鍵穿線收尾 (handleStringUp)**：
  * 點擊後，手鍊珠子軌道會從分散狀態向中心收攏，並繪製金黃色軌道線（顏色 `#eccc68`、寬度 `1.2`、不透明度 `0.25`）。
  * 執行 800ms 的平滑自轉一圈動畫。採用 `easeInOutQuad` 緩動函數，消除殘影，精確旋轉 $2\pi$ 弧度。
* **安全警示**：工坊底部加入實體手工加工時的線材、彈力線及工具安全防護提示。

---

## 3. Technical Architecture & Performance (技術架構與效能優化)

### 3.1 技術棧
* **核心框架**：React 18 + TypeScript + Vite。
* **3D 引擎**：`@react-three/fiber` + `@react-three/drei` (Three.js)。
* **動畫庫**：`framer-motion`。
* **路由**：`react-router-dom` (支援 `/diy`、`/numerology`、`/encyclopedia` 直連路由)。

### 3.2 INP (Interaction to Next Paint) 改善設計
* **問題**：切換導覽列時，React 會同步卸載與掛載極為龐大的 Encyclopedia 或 BraceletSimulator 組件，導致 JS 主線程被卡死，按鈕的 active 狀態無法在下一幀內繪製。
* **優化方案**：
  * 引入 `React.startTransition`。在導覽列跳轉的 `navigateToPage` 函數以及 URL 路由同步的 `useEffect` 中，將 `setCurrentPage` 狀態更新包裹在 `startTransition` 中。
  * 這使得 React 會以低優先級在後台渲染新頁面，優先釋放主線程以響應按鈕的選中高亮渲染，實現 INP 零延遲。

### 3.3 CLS (Cumulative Layout Shift) 改善設計
* **問題 A：主容器塌陷**：切換頁面時，舊頁面已卸載但新頁面尚未撐開高度，使 `<main>` 容器高度瞬間塌陷至 0，導致 Footer 向上彈跳再被推回。
* **優化方案 A**：為 `styles.mainContent` 新增 `minHeight: 'calc(100vh - 180px)'` 預留最小高度，確保不論如何切換頁面，版面皆不會發生高度偏移。
* **問題 B：首次載入與重新整理閃爍**：
  * 初始化狀態 `currentPage` 被寫死為 `'encyclopedia'`，導致直連其他頁面時，Navbar 會先選中圖鑑再跳轉。
  * `isMobile` 初始值被寫死為 `false`，導致手機上首次載入時以桌面版寬度渲染 Navbar，因過寬而折行，隨後才縮回手機版寬度。
* **優化方案 B**：改用 Lazy Initial State，在 `useState` 初始化時同步讀取環境：
  * `currentPage` 初始值同步讀取 `window.location.pathname`。
  * `isMobile` 同步讀取 `window.innerWidth <= 768`。
  * 這使首格畫面（First Paint）渲染即為正確狀態，完全消除了 Navbar 的閃爍與折行跳動。
* **問題 C：滾動抖動**：平滑滾動會引發多個 Frame 的 layout 更新。
* **優化方案 C**：移除頁面跳轉時的 `window.scrollTo({ behavior: 'smooth' })`，改用瞬間重置 `window.scrollTo(0, 0)`。

---

## 4. SEO & SSG Engine (預渲染引擎規格)

### 4.1 後處理腳本 (scripts/generate-seo-pages.cjs)
* **執行時機**：在 `npm run build` 時，於 Vite 打包輸出至 `dist/` 後自動執行。
* **功能**：
  1. 讀取並使用 Regex 解析 `src/data/crystals.ts` 中 104 種水晶的資訊。
  2. 動態為 104 種水晶生成專屬的 Title、Meta Description、與包含化學式/硬度/晶系屬性的 Schema.org (JSON-LD) 結構標記。
  3. 在 `dist/crystals/:id/index.html` 寫入實體目錄頁面（內含隱藏的爬蟲可讀 SEO HTML 文本），徹底解決單頁應用直連 404 問題。
  4. 為 `diy`、`numerology`、`encyclopedia` 生成實體目錄，實現無伺服器配置的靜態路由直連。

### 4.2 統計代碼隔離設計
* 為了防止本地開發流量（localhost）污染 Umami / Cloudflare 統計數據，開發環境的 `index.html` 不含任何追蹤碼。
* 追蹤碼由 `generate-seo-pages.cjs` 在建置階段自動注入到 `dist/` 下產出的所有 HTML 檔案（包括首頁及 104 個靜態頁面）的 `</body>` 前。

---

## 5. Telemetry & Integration (統計追蹤與外部系統)

### 5.1 Telemetry (自訂事件追蹤規範)
系統使用 Umami Analytics 收集以下關鍵用戶操作事件：

| 功能模組 | 觸發元素 | 事件代碼 (data-umami-event) | 說明 |
| :--- | :--- | :--- | :--- |
| **導覽列** | 贊助咖啡按鈕 | `navbar.sponsor` | 統計點擊贊助連結的人數 |
| **手鍊工坊** | 一鍵穿線收尾 | `diy.click_string_up` | 統計完成設計並穿線的人數 |
| **生命靈數** | 測算能量按鈕 | `numerology.click_calculate` | 統計進行生日靈數測算的人數 |
| **生命靈數** | 17LIVE 推薦連結 | `numerology.click_17LIVE` | 統計被推薦導流至 17LIVE 的點擊數 |

### 5.2 外部整合
* **問題回報系統**：串接 Google Apps Script Web App，將回報類型、描述及聯絡方式寫入指定之 Google Sheet 試算表。
* **個人贊助平台**：串接 Portaly（`PORTALY_SPONSOR_URL = 'https://portaly.cc/shiruko/support'`）。
