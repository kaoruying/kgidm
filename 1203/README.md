# 企業家經營班 12/3 下一局，由我定義

本資料夾為 GitHub Pages 靜態入口，不改動原本的 kgidm 首頁。

## 三個網址
- `https://kaoruying.github.io/kgidm/1203/Display.html`：投影展示
- `https://kaoruying.github.io/kgidm/1203/Upload.html`：手機上傳
- `https://kaoruying.github.io/kgidm/1203/Admin.html`：管理者後台
- `https://kaoruying.github.io/kgidm/1203/Preview.html`：不連線的動畫預覽

## 重要：Google 雲端後端仍需部署

GitHub Pages 不提供 Google Drive 寫入權限，也不能執行 Apps Script。網頁已公開，但**目前是前端及展示模式，不可用於正式照片上傳**。

1. 使用儲存照片的 Google 帳號至 https://script.google.com/ 建立 Apps Script 專案。
2. 由先前的 `KGI_1203_Three_Pages.zip` 貼入 `Code.gs` 及 HTML 檔案（檔名 Display、Upload、Admin）。
3. 在編輯器執行 `setupProject()`，授權 Drive/Sheets 存取。
4. 部署網頁應用程式：以本人身分執行、允許所有人存取（若帳戶政策允許）。
5. 將部署網址（https://script.google.com/macros/s/.../exec）填入本資料夾的 `config.js` 之 `window.KGI_GAS_URL`。
6. 此後三個固定 GitHub Pages 網址就會自動轉到各自的 Apps Script 網頁，實際儲存照片至 Google Drive 並即時更新投影。

## 安全與測試
- 請勿將管理密碼貼入公開 GitHub 檔案。
- 學員名單會在公開上傳頁的下拉選單顯示；請確認活動用途允許在公開頁面列出。
- 初次完成部署後，至少用兩支手機與投影電腦測試拍照、更新、刪除，並確認公司網路能開啟 Google Apps Script。
- `Preview.html` 只供動畫示範，不會寫入 Google Drive。
