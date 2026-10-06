# Musica — Music for Your Moment

一個依照「心情、場合、目的」尋找音樂的推薦網站。

## 功能
- Mood / Occasion / Purpose 情境搜尋
- Language / Genre / Artist 條件
- YouTube 搜尋
- Spotify 搜尋
- Openverse 開放授權音訊搜尋
- People in similar moments 情境推薦介面
- 義大利音樂廳、暗色金黃色視覺風格

## 本機啟動

需要 Node.js 18+：

```bash
npm install
```

複製 `.env.example` 為 `.env`，再填入：

```env
YOUTUBE_API_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
PORT=3000
```

然後：

```bash
npm start
```

開啟 http://localhost:3000

## API 與下載限制

Spotify 與一般 YouTube 內容不會透過本網站提供下載。Spotify 用於搜尋 catalog metadata；YouTube 用於搜尋與官方觀看入口。

真正的 Download 入口只會出現在 Openverse 結果，使用前仍應確認原作品的授權、署名與再利用條件。

## 下一步

正式版可以加入資料庫、登入、收藏、播放紀錄，以及根據「相同情境的人播放了什麼」建立 collaborative filtering recommendation score。
