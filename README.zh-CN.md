# weiqi_online 排行榜

[繁體中文](README.zh-Hant.md) · [简体中文](README.zh-CN.md) · [English (UK)](README.en-GB.md) · [English (US)](README.en-US.md)

这是 [weiqi_online](https://github.com/s230127-lab/weiqi_online) 围棋游戏的独立排行榜网站。网站**只显示总排行榜**，不包含围棋棋盘、对局、AI、登录或游戏管理功能。

## 网站内容

- 显示总排行榜前 10 名。
- 按玩家积分从高到低排序。
- 显示玩家名称、积分、胜局、负局和和局数量。
- 支持简体中文、繁體中文和英文（英国／美国使用同一英文界面）。
- 提供手动刷新，并每 60 秒自动更新一次。
- 可在电脑、平板和手机浏览器中使用。

积分规则与游戏一致：胜局 3 分，和局 1 分，负局 0 分。积分相同时，排行榜会继续参考胜局数量、胜率和玩家名称。

## 数据来源

排行榜从原游戏使用的 Firebase Cloud Firestore 项目读取公开数据：

- Firebase 项目：`weiqi-online`
- Firestore 集合：`leaderboard`
- 网页只读取排行榜资料，不会新增、修改或删除玩家纪录。
- 网站不要求 Google 登录。
- 玩家成绩仍由原游戏网站在符合条件时写入。

Firebase 网页应用配置会出现在浏览器端代码中；这类配置不是服务端私钥。请继续使用 Firestore 安全规则保护写入操作，并且不要将服务端私钥加入此仓库。

## 本地预览

直接在浏览器中打开根目录的 `index.html)，或使用任何静态文件服务器预览。

## 使用 GitHub Pages 发布

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment** 中选择 **Deploy from a branch**。
3. 选择分支 `main) 和目录 `/(root))。
4. 保存设置，等待 GitHub Pages 部署完成。

发布后的网站地址：

https://s230127-lab.github.io/Ranking-of-weiqi_online/

## 项目结构

```
.
├── index.html
├── README.zh-CN.md
├── README.zh-Hant.md
├── README.en-GB.md
└── README.en-US.md
```

## 相关项目

- [weiqi_online 围棋游戏](https://github.com/s230127-lab/weiqi_online)
- [本排行榜网站仓库](https://github.com/s230127-lab/Ranking-of-weiqi_online)
