# ナビゲーション

アプリ内の画面遷移と下部タブの構造である。

## 下部タブ

左から **ホーム、記帳、書類、証憑、チャット** の 5 つとする。

設定は下部タブに置かない。ホーム右上のアイコンだけから開く。文言は付けない。

未実装の機能はタブに出さない。

## チャットの入口

入口は下部タブのチャットとする。
どの画面のフッターからでも、チャットの画面を開く。シートにはしない。

## 押し込む画面

押し込む画面のナビは iOS に合わせ、左に戻る、中央にタイトル、右に操作を置く。

## 画面遷移

```mermaid
graph TD
  Home[ホーム]
  Ledger[記帳]
  Docs[書類]
  Evidence[証憑]
  Chat[チャット]
  Settings[設定]

  Home -->|右上アイコン| Settings
  Settings -->|未実装の機能| Unimpl[未実装の機能]
  Settings -->|デモに戻す| Home

  Home -->|未承認の明細| Pending[未承認の明細]
  Home -->|未入金の請求| Docs
  Home -->|未紐付けの証憑| Evidence

  Ledger -->|行| JournalDetail[仕訳詳細]
  JournalDetail -->|編集| JournalEdit[仕訳の編集]
  Ledger -->|メニュー かんたん入力| Quick[かんたん入力]
  Ledger -->|メニュー 明細の取込| Pending
  Ledger -->|メニュー 未承認の明細| Pending
  JournalDetail -->|証憑に紐付け| LinkEv[証憑に紐付け]

  Docs -->|新規・下書き| InvoiceCreate[請求書の作成・編集]
  Docs -->|詳細| InvoiceDetail[請求書の詳細]
  InvoiceDetail -->|発行| InvoiceDetail
  InvoiceDetail -->|入金| Payment[入金]
  Docs -->|見積書| Quote[見積書]
  Docs -->|納品書| Delivery[納品書]
  InvoiceCreate -->|品目| LineItem[品目の入力]

  Evidence -->|撮影| Capture[証憑の撮影]
  Capture -->|使用する| Review[証憑の確認]
  Evidence -->|行| Review
  Review -->|仕訳に紐付け| LinkJournal[仕訳に紐付け]
  Review -->|追加| Quick

  Chat -->|履歴| ChatHistory[チャットの履歴]
```

タブ間の切替は図に書いていない。どのタブからでもチャットへ進める。

## 参照

- [画面の共通](common-ui.md)
- [チャット](chat.md)
- [画面一覧](../screens/)
