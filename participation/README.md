# 圍棋參與完成確認

這個頁面核對目前登入的玩家是否同時符合兩個條件：

1. 在 weiqi_online 至少完成一盤圍棋。
2. 使用相同的 Google 帳戶提交指定 Google Form。

## 網站功能

- 使用 weiqi-online Firebase Authentication 的 Google 登入。
- 由 Firebase Cloud Function 在伺服器端讀取登入者自己的 `leaderboard/{uid}` 文件，檢查 `games >= 1`。
- 同一個 Cloud Function 以 Google Sheets API 讀取回應表的電子郵件欄，核對 Firebase 登入者已驗證的電子郵件。
- 網頁只收到完成狀態及對局數，不會取得問卷答案、班級、班號或其他人的電子郵件。
- 全繁體中文，支援桌面、平板及手機。
- 不使用 Google Apps Script。

## 表單設定

你提供的 Google Forms 設定截圖顯示「收集電子郵件地址」已設為「已驗證」。

請確認回應工作表的標題列有以下其中一種欄位名稱：

- Email Address
- Email
- Verified Email
- 電子郵件地址
- 電子郵件

如果啟用收集電郵前已有舊回應，舊回應未必包含電郵地址。建議以測試帳戶送出一份新回應，確認欄位已出現。系統只會核對有明確電子郵件值的回應。

## 重要：學校試算表存取權限

Cloud Function 以 Google Cloud 執行服務帳戶身分呼叫 Google Sheets API。這不是學校帳戶的登入，也不會繞過學校的分享政策。

此 Firebase 專案的 project number 是 `950011884276`。Firebase Cloud Functions 第 2 代預設執行服務帳戶通常為：

`950011884276-compute@developer.gserviceaccount.com`

部署前，請先確認 Firebase Console / Google Cloud Console 中該函式實際使用的 runtime service account。然後請試算表擁有者或學校 IT 管理員，按學校政策授權該服務帳戶以「檢視者」存取指定回應試算表。

**如果學校禁止向外部服務帳戶分享檔案，必須請學校 IT 管理員批准一個校方管理的服務帳戶或網域委派方案。不要嘗試繞過校方政策，也不要把整份回應表公開。** 未獲授權時，函式會回報權限錯誤，不會顯示任何人的資料。

## Google Cloud / Firebase 部署設定

### 1. 啟用 Google Sheets API

在 `weiqi-online` 專案的 Google Cloud Console 中，確認已啟用 Google Sheets API（`sheets.googleapis.com`）。

### 2. 確認 Firebase 方案

部署 Cloud Functions 需要 Firebase Blaze（隨用隨付）方案及連結的 Cloud Billing 帳戶。費用取決於實際使用量；請先檢查 Firebase / Google Cloud 的計費設定與免費用量，再決定是否啟用。不要在未獲帳戶擁有人或監護人同意前變更計費方案。

### 3. 安裝 Firebase CLI 並部署

在已安裝 Node.js 22 及 Firebase CLI 的電腦上，下載此儲存庫後在專案根目錄執行：

```bash
npm install -g firebase-tools
firebase login
firebase use weiqi-online
cd functions
npm install
cd ..
firebase deploy --only functions:checkParticipation
```

部署檔案已設定 Node.js 22，並使用 Cloud Functions 第 2 代 callable function。Firebase callable SDK 會自動隨請求附上 Firebase Authentication token，伺服器會驗證登入狀態及已驗證電郵。

### 4. 授權 Cloud Function 讀取試算表

部署完成後，確認函式使用的 runtime service account，並請表單擁有者／學校 IT 管理員依政策授權該帳戶檢視回應試算表。不要建立或提交服務帳戶私密金鑰到 GitHub；程式使用 Google Cloud Application Default Credentials。

### 5. 測試

1. 使用同一個 Google 帳戶登入 weiqi_online，完成並結束一盤棋。
2. 使用同一個 Google 帳戶提交 Google Form。
3. 開啟參與確認頁並登入相同帳戶。
4. 按「重新核對」，確認兩項均顯示完成。
5. 用沒有提交表單的測試帳戶測試，確認問卷狀態會顯示未提交。

## 發布 GitHub Pages

此檔案位於排行榜儲存庫的 `participation/` 子資料夾。將功能合併到 `main` 後，若排行榜儲存庫已啟用 GitHub Pages，網址會是：

https://s230127-lab.github.io/Ranking-of-weiqi_online/participation/

原本的排行榜首頁不會被這個子資料夾取代。

## 隱私與限制

- 只有已登入的 Firebase 使用者可以呼叫核對函式。
- 伺服器從已驗證的 Firebase ID token 取得電郵，不接受前端自行指定要查詢的電郵地址。
- Cloud Function 只讀取電子郵件欄，且只回傳這位登入者是否提交。
- 前端不會讀取整份 Firestore 排行榜，也不會列出其他參與者。
- Google Form 的收集電郵功能必須是「已驗證」；遊戲與問卷必須使用同一 Google 帳戶。
- 學校擁有者／管理員必須批准 Cloud Function 的服務帳戶存取權。Firebase API key 並不會自動給予 Sheets 權限。
- 建議正式公開前，另外設定 Firebase App Check，減少非預期的函式呼叫。

## 原始設定

- Firebase 專案：`weiqi-online`
- Firestore 遊戲統計：`leaderboard/{uid}.games`
- Google 回應試算表：`15NVX-qvZ1GvV552uNoLZLxlh1DUDv7R03f6i4anwQDg`
- 回應工作表名稱：`Form_Responses`
- Google Form：`https://docs.google.com/forms/d/e/1FAIpQLSfT6YJEJDFkvivKx9vGhTvSP2bw59M9WOTFTSglo0F_uwGTYg/viewform`
