# 16 操作確認メモ

確認日: 2026-11-27

## 自動確認

- `npm test`: 11 件すべて成功
- `npm run build`: 成功
- ローカル `npm run dev`（`http://127.0.0.1:5173/solo_base/#/home`）

## ブラウザ確認

- ホーム: 事業者名「デモ事業」、期間 10/21 – 11/20、売上 110,000 / 経費 2,180 / 利益 107,820、未承認 3・未入金 1・未紐付け 3
- 下部 5 タブ（ホーム・記帳・書類・証憑・チャット）が表示される
- チャット: 「未入金は何件？」→「未入金の請求は 1 件です。」（ホームの件数と一致）
- チャットに履歴・新規・添付プラス・送るがある

## 公開確認

- リポジトリ: https://github.com/mhirano-yayoi/solo_base
- Pages: https://mhirano-yayoi.github.io/solo_base/#/home が開き、デモ事業のホームが表示される
- Actions「Deploy to GitHub Pages」成功（workflow_dispatch）

## 手元で追加確認するとよいこと

- 実機でのホーム画面追加
- 明細取込〜承認、請求発行〜入金、証憑紐付けの通し操作
