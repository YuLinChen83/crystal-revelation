# 🔮 水晶啟示錄 (Crystal Revelation)

水晶啟示錄是一個基於 React、TypeScript 與 3D WebGL (Three.js) 技術建構的精美靜態水晶百科展覽網站。本專案收錄並展示了上百顆精美的水晶圓珠，透過真實感的 3D 渲染與細緻的礦物屬性介紹，帶給使用者沉浸式的水晶探索體驗。

---

## 🚀 核心功能

1. **🔮 水晶百科展覽**：收錄了不同品種的天然礦物與水晶，提供詳盡的物理與能量屬性介紹。
2. **✨ 3D WebGL 水晶預覽**：使用 Three.js 與 React Three Fiber (R3F) 技術，在網頁上實現水晶球體的即時 3D 渲染與光影反射。
3. **🎯 篩選與分類**：支援快速檢索與多維度的水晶分類篩選。
4. **🎨 精美流暢動畫**：結合 Framer Motion，提供細緻流暢的卡片翻轉、加載與介面切換動畫。
5. **📱 響應式設計**：支援桌機、平板與手機等不同尺寸的螢幕瀏覽。

---

## 🛠️ 技術棧 (Tech Stack)

### 前端核心
* **框架**：React 19 (React-DOM)
* **語言**：TypeScript
* **構建工具**：Vite 8

### 3D 渲染與動畫
* **Three.js**：強大的 WebGL 3D 庫。
* **React Three Fiber (R3F)**：將 Three.js 組件化的 React 渲染器。
* **React Three Drei**：R3F 的輔助工具庫（相機控制、燈光等）。
* **Framer Motion 12**：提供流暢、自然的網頁動畫效果。

### 樣式與排版
* **CSS**：純 Vanilla CSS，兼顧最佳的性能與極致的設計控制力。

---

## 📂 專案結構

```text
crystal-revelation/
├── dist/                # Vite 打包輸出目錄 (生產環境部署用)
├── public/              # 靜態資源目錄
│   └── assets/
│       └── crystals/    # 104 顆水晶圓珠的 600x600 真實感 PNG 圖片
├── src/
│   ├── components/      # React 元件 (3D 畫布、水晶卡片、百科列表等)
│   ├── data/
│   │   └── crystals.ts  # 104 顆水晶的資料庫 (包含 ID、名稱、屬性、介紹與圖片路徑)
│   ├── App.tsx          # 應用程式入口元件
│   ├── index.css        # 全域樣式與變數系統
│   └── main.tsx         # React 掛載點
├── vite.config.ts       # Vite 設定檔
└── package.json         # 專案依賴與腳本設定
```

---

## 💻 本地開發與運行

請確保您的電腦已安裝 [Node.js](https://nodejs.org/) (建議版本 v20 或以上)。

### 1. 安裝依賴包
在專案根目錄下執行：
```bash
npm install
```

### 2. 啟動開發伺服器
```bash
npm run dev
```
啟動後在瀏覽器中造訪終端機顯示的本地網址（通常為 `http://localhost:5173`）。

### 3. 打包生產版本
```bash
npm run build
```
打包完成後會產生一個 `dist/` 資料夾，即可直接部署於 Cloudflare Pages、Vercel 等託管平台。

---

## ☁️ 部署說明 (Cloudflare Pages)

本專案使用 Vite 構建，推薦使用 **Cloudflare Pages** 進行免費靜態託管（其提供無上限的頻寬，非常適合加載大量水晶圖片）：

1. **設定建置參數 (Build Settings)**：
   * **Framework preset**: `Vite`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
2. **環境變數**：
   * 建議在下方 Environment variables 新增 `NODE_VERSION` 設為 `20` 或 `22`。

