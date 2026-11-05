# weiqi_online 排行榜

[繁體中文](README.md) · [简体中文](README.zh-CN.md) · [English (UK)](README.en-GB.md) · [English (US)](README.en-US.md)

這是 [weiqi_online](https://github.com/s230127-lab/weiqi_online) 圍棋遊戲的獨立排行榜網站。網站**只顯示總排行榜**，不包含棋盤、對弈、AI、登入或遊戲管理功能。

## 網站內容

- 顯示總排行榜前 10 名。
- 依玩家積分由高至低排名。
- 顯示玩家名稱、積分、勝局、敗局及和局數量。
- 支援繁體中文、簡體中文及英文（英式／美式英文使用相同介面）。
- 提供手動重新整理，並每 60 秒自動更新一次。
- 可在電腦、平板及手機瀏覽器使用。

積分規則與遊戲一致：勝局 3 分、和局 1 分、敗局 0 分。積分相同時，排行榜會再參考勝局數、勝率及玩家名稱。

## 資料來源

排行榜會從原遊戲使用的 Firebase Cloud Firestore 專案讀取公開資料：

- Firebase 專案：`weiqi-online`
- Firestore 集合：`leaderboard`
- 網頁只讀取排行榜資料，不會新增、修改或刪除玩家紀錄。
- 網站不要求使用者以 Google 登入。
- 玩家成績仍由原遊戲網站在符合條件時寫入。

Firebase 網頁應用程式設定會出現在瀏覽器端程式碼中；這類設定不是伺服器私密金鑰。請繼續使用 Firestore 安全規則保護寫入操作，也不要將伺服器私密金鑰加入此儲存庫。

## 本機預覽

可直接在瀏覽器開啟根目錄的 `index.html`，或使用任何靜態檔案伺服器預覽。

## 使用 GitHub Pages 發布

1. 開啟儲存庫的 **Settings → Pages**。
2. 在 **Build and deployment** 選擇 **Deploy from a branch**。
3. 選擇分支 `main` 及目錄 `/(root)`。
4. 儲存設定，等待 GitHub Pages 完成部署。

發布後的網站網址：

https://s230127-lab.github.io/Ranking-of-weiqi_online/

## 專案結構

```
.
├── index.html
├── README.zh-CN.md
├── README.zh-Hant.md
├── README.en-GB.md
└── README.en-US.md
```

## 相關專案

- [weiqi_online 圍棋遊戲](https://github.com/s230127-lab/weiqi_online)
- [本排行榜網站儲存庫](https://github.com/s230127-lab/Ranking-of-weiqi_online)
