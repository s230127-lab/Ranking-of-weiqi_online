# 圍棋參與完成確認

這個頁面核對目前登入的玩家是否同時符合兩個條件：

1. 在 weiqi_online 至少完成一盤圍棋。
2. 使用相同的 Google 帳戶提交指定 Google Form。

## 網站功能

- 使用 weiqi-online Firebase 專案的 Google Authentication 登入。
- 讀取目前登入者自己的 leaderboard/{uid} 文件，並檢查 games >= 1。
- 透過 Google Apps Script 在伺服器端檢查回應試算表是否包含 Firebase 已驗證的電子郵件。
- 網頁只收到「已提交／未提交」結果，不會取得班級、班號或問卷答案。
- 全繁體中文，支援桌面、平板及手機。

## 重要：表單電子郵件欄位

Google Form 的「收集電子郵件地址」需要設定為「已驗證」。你提供的設定截圖已顯示「已驗證」。

請在試算表確認回應工作表的標題列已出現 Email Address、Email 或 電子郵件地址 欄位。若剛啟用收集電子郵件，建議先新增一筆測試回應，再重新檢查標題列。啟用前的舊回應不一定有電子郵件紀錄，不能單靠本系統補回。

## 設定 Google Apps Script

1. 使用有權檢視回應試算表的 Google 帳戶開啟 https://script.google.com/。
2. 建立新專案。
3. 將本資料夾的 Code.gs 全文貼到 Apps Script 編輯器。
4. 在專案設定中啟用「顯示 appsscript.json 資訊清單檔案」，並以本資料夾的 appsscript.json 內容取代資訊清單。
5. 儲存專案，執行部署 → 新增部署 → 網頁應用程式。
6. 「執行身分」選擇「我」；「誰可以存取」選擇「所有人」。這讓 Apps Script 以試算表擁有者授權讀取工作表；每次核對仍會先驗證 Firebase ID token。
7. 完成授權後複製以 /exec 結尾的網頁應用程式網址。

> 不要把試算表設為公開，也不要將試算表中的回應資料複製到網站。Apps Script 只會回傳布林核對結果。

## 設定網站

開啟 index.html，找到：

    const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

將字串替換成剛才複製的 Apps Script /exec 網址，提交變更。

## 發布 GitHub Pages

此檔案位於排行榜儲存庫的 participation/ 子資料夾。合併此功能到 main 後，若排行榜儲存庫已啟用 GitHub Pages，網址會是：

https://s230127-lab.github.io/Ranking-of-weiqi_online/participation/

若 GitHub Pages 尚未啟用，請在儲存庫 Settings → Pages，選擇 main 分支及 /(root)。

## 遊戲紀錄規則

原遊戲會在對局結束時更新 leaderboard/{uid} 的 games 欄位。完成勝負判定或數子結算均會記錄一盤；玩家必須在原遊戲使用與問卷相同的 Google 帳戶登入，紀錄才會連結到此帳戶。

此網站不會修改遊戲紀錄或排行榜。

## 隱私與限制

- Apps Script 只把 Firebase ID token 傳到伺服器端，並透過 Firebase Authentication 的 accounts:lookup 驗證身份。
- 伺服器只在指定工作表中比對已驗證電郵，回傳是否找到，不回傳任何表格列或答案。
- 前端只讀取登入者自己的遊戲統計文件。
- 目前版本是玩家個人核對頁，不提供可瀏覽全體參與者個人資料的管理員名冊。
- 尚未設定 Apps Script 網址時，網站會明確顯示問卷核對服務尚未設定，不會錯誤地標記為已提交。
