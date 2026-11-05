# weiqi_online Rankings

[繁體中文](README.zh-Hant.md) · [简体中文](README.zh-CN.md) · [English (UK)](README.en-GB.md) · [English (US)](README.en-US.md)

This is a standalone rankings website for the [weiqi_online](https://github.com/s230127-lab/weiqi_online) Go game. It **shows the overall leaderboard only**. It does not include a Go board, gameplay, AI, sign-in, or game-management features.

## Website features

- Displays the overall top 10 players.
- Ranks players by score, highest first.
- Shows each player's name, points, wins, losses and draws.
- Supports Traditional Chinese, Simplified Chinese and English. The British and American English README files describe the same English-language interface.
- Provides a manual refresh control and refreshes automatically every 60 seconds.
- Works in desktop, tablet and mobile browsers.

The scoring system matches the game: 3 points for a win, 1 point for a draw and 0 points for a loss. When points are tied, the ranking also considers wins, win rate and player name.

## Data source

The website reads public leaderboard data from the Firebase Cloud Firestore project used by the original game:

- Firebase project: `weiqi-online`
- Firestore collection: `leaderboard`
- This website only reads leaderboard records. It does not create, update or delete player records.
- Google sign-in is not required to view the rankings.
- Eligible player results continue to be submitted by the original game website.

The Firebase web-app configuration is present in browser-side code; it is not a server private key. Keep Firestore security rules in place to protect write operations, and never add server private keys to this repository.

## Preview locally

Open the root `index.html` file in a browser, or serve the repository with any static file server.

## Publish with GitHub Pages

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose the `main` branch and the `/(root)` folder.
4. Save the settings and wait for GitHub Pages to finish deploying.

Expected website address:

https://s230127-lab.github.io/Ranking-of-weiqi_online/

## Repository structure

```
.
├── index.html
├── README.zh-CN.md
├── README.zh-Hant.md
├── README.en-GB.md
└── README.en-US.md
```

## Related repositories

- [weiqi_online Go game](https://github.com/s230127-lab/weiqi_online)
- [Ranking website repository](https://github.com/s230127-lab/Ranking-of-weiqi_online)
