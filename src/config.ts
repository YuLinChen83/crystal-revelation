/**
 * 水晶啟示錄 - 全域配置檔
 */

export const FEEDBACK_API_URL = 'https://script.google.com/macros/s/AKfycbxXkR8gRqqqLLoPPvlKrSqnvqYDJcPepAFU4uwp3EG7ADXpySQzhNnuMSfAjvy3HkslFQ/exec';

// Buy Me a Coffee 或 Portaly 個人贊助連結
// 請將您獲得的個人收款/贊助網址貼在下方，例如:
// 'https://portaly.cc/您的帳號'
export const BUY_ME_A_COFFEE_URL = 'https://portaly.cc/shiruko/support';


/**
 * 【Google Sheet & Apps Script 部署說明】
 * 
 * 1. 打開試算表：https://docs.google.com/spreadsheets/d/11w5MrhArgGNjYWGX4T_SGCjRMyk6prKfgHthaNtYAKg/edit
 * 2. 點擊頂部選單的「擴充功能」 -> 「Apps Script」。
 * 3. 將專案中的預設程式碼全部清空，並貼上以下 JavaScript 程式碼：
 * 
 * ```javascript
 * function doPost(e) {
 *   // 允許跨網域存取 (CORS)
 *   var headers = {
 *     "Access-Control-Allow-Origin": "*",
 *     "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
 *     "Access-Control-Allow-Headers": "Content-Type"
 *   };
 * 
 *   try {
 *     var json = JSON.parse(e.postData.contents);
 *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     
 *     // 如果工作表為空，自動建立表頭
 *     if (sheet.getLastRow() === 0) {
 *       sheet.appendRow(["時間", "水晶名稱", "回報類型", "具體描述", "聯絡方式"]);
 *     }
 *     
 *     // 寫入回報內容
 *     sheet.appendRow([
 *       new Date(),
 *       json.crystalName || "全站建議 / 其他",
 *       json.type || "未分類",
 *       json.description || "",
 *       json.contact || ""
 *     ]);
 *     
 *     return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
 *       .setMimeType(ContentService.MimeType.JSON)
 *       .setHeaders(headers);
 *   } catch (error) {
 *     return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
 *       .setMimeType(ContentService.MimeType.JSON)
 *       .setHeaders(headers);
 *   }
 * }
 * 
 * // 處理 OPTIONS 預檢請求
 * function doOptions(e) {
 *   var headers = {
 *     "Access-Control-Allow-Origin": "*",
 *     "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
 *     "Access-Control-Allow-Headers": "Content-Type",
 *     "Access-Control-Max-Age": "86400"
 *   };
 *   return ContentService.createTextOutput("")
 *     .setMimeType(ContentService.MimeType.TEXT)
 *     .setHeaders(headers);
 * }
 * ```
 * 
 * 4. 點擊 Apps Script 編輯器右上角的「部署」 -> 「新增部署」。
 * 5. 類型選擇「網頁應用程式 (Web App)」。
 * 6. 設定如下：
 *    - 說明：水晶百科回報系統
 *    - 執行身分：我 (您的 Google 帳號)
 *    - 誰有權限存取：所有人 (Anyone)
 * 7. 點擊「部署」，並授予必要的 Google 帳戶授權權限。
 * 8. 複製產生的「網頁應用程式 URL」，將其填入本檔案的 `FEEDBACK_API_URL` 變數中。
 */
