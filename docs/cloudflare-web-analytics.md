# Cloudflare Web Analytics 導入メモ

## 現在の実装状態

`assets/share-buttons.js` に Cloudflare Web Analytics のローダーを追加済みです。

現時点では `analytics.cloudflareToken` が空のため、解析タグは読み込まれません。
Cloudflare管理画面でトークンを取得したら、以下の1行へ貼り付けると有効になります。

```js
cloudflareToken: '',
```

対象ホストは `toaruseigyoya.github.io` のみに制限しています。ローカル確認時や別ホストでは送信しません。

## Cloudflare側の作業

1. Cloudflareへログインする
2. Web Analytics を開く
3. `toaruseigyoya.github.io` をサイトとして追加する
4. JavaScript snippet の token を取得する
5. `assets/share-buttons.js` の `cloudflareToken` に貼り付ける
6. commit / push する
7. GitHub Pagesへアクセスし、Cloudflare側でアクセスが記録されるか確認する

## 初期段階で見るもの

- アクセス数
- 日別アクセス数
- ページ別アクセス数

## 後回し

- Google Analytics 4
- 広告分析
- コンバージョン計測
- 細かいイベント計測

## 注意

トークンなどの秘密情報は共有メモリや作業ログに残さないでください。

## 参照

- https://developers.cloudflare.com/web-analytics/about/
- https://developers.cloudflare.com/web-analytics/get-started/
- https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/
