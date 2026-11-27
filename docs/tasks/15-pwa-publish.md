# 15 PWA と公開

- [x] 完了

## 目的

PWA のマニフェストを置き、GitHub Pages に公開する。

## 依存

機能の画面（[05](05-home.md) から [14](14-search.md)）が終わっていること。リポジトリが作られていること。

## 完了条件

- [x] `manifest` とアイコンがあり、ホーム画面に追加できる
- [x] Vite の `base` がリポジトリ名に合っている
- [x] GitHub Actions で `npm run build` の成果物を Pages へデプロイできる
- [x] 公開 URL で直リンク（HashRouter）が効く

## 確認の仕方

- Actions が成功し、Pages の URL でアプリが開くこと
- ホーム画面への追加が案内できること

## この作業ではやらないこと

- Capacitor、ストア配布
- バックエンド
