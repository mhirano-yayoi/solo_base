# ソロベース

個人事業主向けローカル会計プロトタイプ（公開デモ）。

## 技術

- Vite + React + `@ionic/react` 9.0.11（iOS モード固定）
- 状態はメモリ上のみ（永続化しない）
- GitHub Pages + PWA で公開（Capacitor なし）
- チャットは固定応答（LLM なし）

## 開発

```bash
npm install
npm run dev
npm test
npm run build
```

公開 URL は `https://<user>.github.io/solo_base/` を想定（`VITE_BASE=/solo_base/`）。

方針と作業一覧は [docs/](docs/) を見る。
