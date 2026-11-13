# 圍棋參與確認及網站問卷

此功能讓玩家使用 Google 帳戶登入，並核對是否符合以下兩項條件：

1. 在 weiqi_online 至少完成一盤圍棋。
2. 在本網站提交五題問卷。

## 現有功能

- 使用 weiqi-online Firebase Authentication 的 Google 登入。
- 從 Firestore 的 leaderboard/{uid} 核對玩家自己的完成對局數。
- 問卷直接提交至 Firestore 的 participationQuestionnaires/{uid}。
- 每個 Firebase UID 只可提交一次，避免重複紀錄。
- 網站只回傳登入者自己的對局數及問卷完成狀態，不會公開問卷答案。
- 不使用 Google Apps Script、Google Sheets API 或學校 Google 試算表。
- 繁體中文介面，支援電腦、平板及手機。

## 問卷題目（正式開放前必須確認）

目前頁面先提供五個長文字答案欄位，標示為「第 1 題」至「第 5 題」。由於目前只取得原表格的欄位標題，未取得五題的實際題目文字，請在正式開放前按需要修改：

- participation/index.html 內的 QUESTIONS 陣列：設定五題的顯示名稱及提示文字。
- 如原題目屬於單選或多選，還需要把相應文字欄位改成選項控制，並同步更新前端驗證。

問卷同時保留原表格中的「班級」及「班號」欄位。請確認這些資料是活動所需的最少資料，並只讓獲授權的管理員存取 Firestore 資料。

## Firestore 資料結構

玩家登入後，Cloud Function 會以 Firebase UID 作為文件 ID：

- leaderboard/{uid}：沿用圍棋遊戲已存在的對局統計。
- participationQuestionnaires/{uid}：儲存該玩家提交的班級、班號、五題答案及提交時間。

前端不能直接讀取其他玩家的問卷答案。Cloud Functions 使用 Firebase Admin SDK 寫入及讀取資料，並只向已登入玩家回傳自己的完成狀態。

## 部署前設定

1. 確認 Firebase 專案為 weiqi-online。
2. 在 Firebase Authentication 的授權網域加入排行榜網站的 GitHub Pages 網域。
3. 確認 Firestore 已啟用，且圍棋網站與排行榜網站使用同一個 Firebase 專案。
4. Cloud Functions 需要已啟用的 Firebase 計費方案及 Cloud Billing；部署前請由專案擁有人檢查計費設定。
5. 使用 Node.js 22 及 Firebase CLI。

## 部署步驟

在下載此儲存庫後，於根目錄執行：

\`\`\`bash
npm install -g firebase-tools
firebase login
firebase use weiqi-online
cd functions
npm install
npm run lint
cd ..
firebase deploy --only functions:submitQuestionnaire,functions:checkParticipation
\`\`\`

部署成功後，兩個 callable Cloud Functions 會在 us-central1 提供服務。

## 測試步驟

1. 在 weiqi_online 使用 Google 帳戶登入。
2. 完成並結束至少一盤圍棋，確認該帳戶的 leaderboard/{uid}.games 已更新。
3. 開啟排行榜網站的參與確認頁，使用同一 Google 帳戶登入。
4. 填寫班級、班號及五題答案，提交問卷。
5. 確認問卷狀態顯示「已提交」。
6. 按「重新核對」，確認遊戲及問卷兩項狀態均正確。
7. 使用另一個測試帳戶確認無法讀取第一個帳戶的問卷答案。

## 發布網址

合併到 main 並啟用 GitHub Pages 後：

https://s230127-lab.github.io/Ranking-of-weiqi_online/participation/

原有排行榜首頁不會被此功能取代。

## 隱私及限制

- 只有已登入且電子郵件已驗證的 Firebase 使用者可提交問卷及核對狀態。
- 問卷文件以 Firebase UID 分開儲存；回傳至瀏覽器的只有本人問卷是否存在，不包括答案。
- 問卷提交後不能由玩家自行覆寫。如需更正，請聯絡網站管理員。
- 班級、班號及答案屬於個人提交資料。正式使用前請由活動負責人確認收集目的、存取人員及保留期限。
- 不要把 Firebase Admin 私密金鑰或任何服務帳戶金鑰提交到 GitHub。
- 此版本不會自動匯入舊 Google Form 的提交紀錄。若要承認舊表單的已提交記錄，需要另行安排安全的管理員核對及匯入流程。
