# ヨンショーゲン開発 TODO リスト

このファイルは開発の進捗状況を記録し、次のタスクを管理するための長期メモリです。

## 完了したタスク ✅

### axis_server
- [x] プロジェクト構造の再構成（axis_serverとcard_generator）
- [x] React + Vite + TypeScript プロジェクトの初期設定
- [x] Tailwind CSS v4の設定（@tailwindcss/vite使用）
- [x] React Routerの設定
- [x] 基本データとユーティリティの作成
  - axes.ts: 二軸データ
  - mutators.ts: ズレ指示データ
  - seedGenerator.ts: シード値生成
  - roleAssigner.ts: 役割配布ロジック
- [x] キーワードログイン機能の実装
- [x] 軸表示機能の実装
- [x] 次のラウンドへの機能実装
- [x] QRコードライブラリの追加（qrcode）
- [x] ホスト機能の実装
  - キーワードでルーム作成
  - プレイヤー用QRコード生成（4人分）
- [x] QRコード表示機能の実装
- [x] QRコードからの自動ログイン機能
  - キーワード自動設定
  - プレイヤーID自動設定
- [x] 動作確認（http://localhost:5180で稼働中）

### card_generator
- [x] React + Vite + TypeScriptプロジェクトの作成
- [x] Tailwind CSS v4の設定
- [x] 単語リスト管理システムの実装
  - カテゴリ別管理
  - カスタム単語追加機能
- [x] OpenAI API統合
  - DALL-E 3を使用した画像生成
  - APIキー設定画面
- [x] PDF出力機能
  - jsPDFを使用
  - A4サイズ最適化
  - 切り取り線付き
- [x] 動作確認（http://localhost:5181で稼働中）

## 進行中のタスク 🔄
なし

## 次にやるべきタスク 📝

### axis_server 改善案
- [ ] プレイヤー人数の動的変更機能（現在は4人固定）
- [ ] ズレ者の割合調整機能
- [ ] 軸データの追加・編集機能
- [ ] ゲーム履歴の保存機能
- [ ] モバイル対応の改善
- [ ] PWA対応（オフラインでも使用可能に）

### card_generator 改善案
- [ ] 画像生成の最適化
  - バッチ処理の改善
  - エラーハンドリングの強化
- [ ] PDF出力の改善
  - 画像のbase64変換と埋め込み
  - 高品質印刷対応
- [ ] UI/UXの改善
  - 生成進捗バー
  - 画像のプレビュー機能強化

### 全体的な改善
- [ ] READMEの作成
- [ ] デプロイ設定（GitHub Pages or Vercel）
- [ ] テストの追加
- [ ] エラーハンドリングの改善
- [ ] アクセシビリティの向上

## 技術的な注意事項 ⚠️

### Tailwind CSS v4
- 必ず`@tailwindcss/vite`プラグインを使用
- `app.css`に`@import "tailwindcss";`を記述
- PostCSS設定は不要

### Windows環境での問題
- node_modulesの削除と再インストールが必要な場合がある
- rollupとlightningcssのWindows用モジュールが必要

### 開発サーバー
- axis_serverは現在ポート5180で稼働中
- 複数のインスタンスが起動している可能性があるため注意

## 現在の課題 🚨
- 過去の開発サーバープロセスが複数残っている（要クリーンアップ）
- OpenAI APIキーはブラウザに保存されない（リロード時に再入力必要）
- DALL-E 3のレートリミットに注意が必要

## 次回開発時の確認事項 📌
1. axis_serverの動作確認（http://localhost:5180）
2. card_generatorの動作確認（http://localhost:5181）
3. 不要なバックグラウンドプロセスのクリーンアップ
4. OpenAI APIキーのセットアップ

## 使い方

### axis_server
1. http://localhost:5180 にアクセス
2. ホストは `/host` からルーム作成
3. プレイヤーはQRコードを読み取って参加

### card_generator
1. http://localhost:5181 にアクセス
2. OpenAI APIキーを入力
3. 単語を選択または追加
4. 画像生成ボタンをクリック
5. PDFをダウンロード

---
最終更新: 2025-09-06 23:13 (JST)