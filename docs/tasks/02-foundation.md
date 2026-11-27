# 02 土台

- [x] 完了

## 目的

Vite + Ionic React のプロジェクトを起動し、下部 5 タブの空シェルを置く。

## 依存

なし。実装の最初に着手してよい。[01 Figma ワイヤー](01-figma-wireframes.md) は完了済み。

## 完了条件

- [x] Vite + Ionic React（`@ionic/react` 9.0.11）のプロジェクトが起動する
- [x] 起動時の 1 箇所で iOS モードを固定している
- [x] Capacitor を入れてない
- [x] 下部タブがホーム、記帳、書類、証憑、チャットの 5 つで、各タブは空の見出しだけの画面である
- [x] ルーターは `HashRouter` である
- [x] Vite の `base` をリポジトリ名に合わせられる形にしてある（未公開ならプレースホルダでよい）
- [x] Ionic のコンポーネントと CSS 変数だけを使っている

## 確認の仕方

- `npm run dev` で開き、下部 5 タブが切り替わること
- Capacitor 関連の依存が `package.json` に無いこと

## この作業ではやらないこと

- ドメイン、デモデータ、各画面の本実装
- PWA、GitHub Pages のデプロイ
- Capacitor の導入
