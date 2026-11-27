# 技術

実装の土台である。

## 本体

- 触る本体は Ionic React + Vite とする。
- UI は `@ionic/react` 9.0.11 とする。
- 見た目は iOS モードで固定する。
- 部品は Ionic のコンポーネントと CSS 変数だけを使い、後から `mode` を外して Material を足せるようにする。
- Capacitor は入れない。

## 会計ロジック

会計ロジックは Ionic に依存させない。
`src/domain` に仕訳・税・源泉の純関数を置く。

## 保存

保存はブラウザの IndexedDB とする。
ライブラリは Dexie 4.4.7（メンテナ David Fahlander / Anders Ekdahl）とする。

## チャットの読み取り

チャットが読む件数と集計は、画面に依存しない関数で返す。
読み取りは MCP のツールとする。詳細は [チャット](chat.md) を見る。

## 参照

- [概要](overview.md)
- [チャット](chat.md)
- [作業: ドメインと保存](../../tasks/02-domain-and-storage.md)
