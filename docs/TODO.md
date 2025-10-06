# ヨンショーゲン開発 TODO リスト

このファイルは開発の進捗状況を記録し、次のタスクを管理するための長期メモリです。

## 完了したタスク ✅

### axis_server（オフライン版）
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

### オンライン対戦システム（NEW）
- [x] FastAPIバックエンドの構築
  - WebSocket接続管理
  - ルーム管理（作成、参加、取得）
  - フェーズ管理（lobby, placement, voting, results）
- [x] サーバーサイドRNG実装
  - カード生成（決定的シード値ベース）
  - 軸生成（230+の軸データ）
  - 人狼選出（シード値ベース）
- [x] カード配置機能
  - ドラッグ&ドロップ操作
  - 4象限ボード表示
  - リアルタイム同期
- [x] 投票システム
  - プレイヤー選択UI
  - 投票結果の集計
  - WebSocketでの通知
- [x] スコアリングシステム
  - サーバーサイドでの結果計算
  - 人狼判定ロジック
  - スコア加算・減算（人狼捕獲: 村人+1/人狼-2、逃走: 村人-1/人狼+3）
  - 累積スコア表示
- [x] 次ラウンド移行機能
  - 新ラウンド開始エンドポイント
  - 状態リセット（カード、投票）
  - 新シード値・軸生成
- [x] UI改善
  - プレイヤー進行状況表示（配置済みカード数）
  - 投票進行状況表示
  - 配置済みカード視覚化改善
  - プレイヤーカラー識別
- [x] プレイヤー退出処理
  - `/leave`エンドポイント実装
  - LocalStorageクリーンアップ
  - WebSocket切断通知
  - カード・投票データのクリーンアップ
- [x] WebSocket再接続機能
  - 自動再接続（最大5回試行）
  - Exponential backoff実装
  - LocalStorageからの状態復元
  - `player_left`イベント処理

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

## 進行中のタスク 🔄

なし

## 次にやるべきタスク 📝

### オンライン対戦システム 高優先度
- [ ] **複数プレイヤー対応のテスト**
  - 2-8人での動作確認
  - 同時接続負荷テスト
- [ ] **データ永続化**
  - SQLite/PostgreSQLへの移行
  - ルーム履歴の保存
  - スコアランキング機能
- [ ] **エラーハンドリング強化**
  - 切断時の再接続処理
  - タイムアウト処理
  - 不正な状態遷移の防止
- [ ] **ゲームバランス調整**
  - スコア計算式の見直し
  - 人狼選出ロジックの検証
  - カード枚数の調整（現在5枚）
- [ ] **配置済みカード閲覧機能**
  - 投票フェーズでボードを確認
  - 結果フェーズでの配置振り返り

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

### デプロイ・インフラ
- [ ] バックエンドのデプロイ設定
  - Docker化
  - Render/Railway/Fly.ioへのデプロイ
- [ ] フロントエンドのデプロイ
  - Vercel/Netlifyへのデプロイ
  - 環境変数の設定
- [ ] CORS設定の本番対応
- [ ] HTTPS対応

### 全体的な改善
- [ ] READMEの作成
- [ ] テストの追加
  - ユニットテスト
  - E2Eテスト
- [ ] エラーハンドリングの改善
- [ ] アクセシビリティの向上
- [ ] パフォーマンス最適化

## 技術的な注意事項 ⚠️

### Tailwind CSS v4
- 必ず`@tailwindcss/vite`プラグインを使用
- `app.css`に`@import "tailwindcss";`を記述
- PostCSS設定は不要

### Windows環境での問題
- node_modulesの削除と再インストールが必要な場合がある
- rollupとlightningcssのWindows用モジュールが必要

### 開発サーバー
- **フロントエンド**: http://localhost:5173 (Vite dev server)
- **バックエンド**: http://localhost:8000 (FastAPI + Uvicorn)
- **WebSocket**: ws://localhost:8000/ws/{room_code}

### オンライン対戦アーキテクチャ
- **バックエンド**: FastAPI (Python)
  - In-memory storage（辞書型）
  - WebSocketでリアルタイム通信
  - RESTful API
- **フロントエンド**: React + TypeScript
  - React Context API でグローバル状態管理
  - WebSocketクライアント
- **ゲームロジック**: すべてサーバーサイド
  - 決定的乱数生成（シード値ベース）
  - 公平性の保証

## 現在の課題 🚨

### 既知の問題
- In-memoryストレージのため、サーバー再起動で全データ消失
- ルームタイムアウト・自動削除機能なし
- 複数プレイヤーでの動作未検証（2-8人）

### セキュリティ・安定性
- 認証機能なし（プレイヤーIDのみ）
- レート制限なし
- データバリデーション不十分

## 次回開発時の確認事項 📌

1. バックエンドサーバーの起動確認
   ```bash
   cd backend && uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. フロントエンドサーバーの起動確認
   ```bash
   cd axis_server && npm run dev
   ```

3. オンライン対戦の動作確認
   - ルーム作成
   - 複数ブラウザタブでの参加
   - カード配置
   - 投票
   - スコア表示
   - 次ラウンド移行

4. ビルドチェック
   ```bash
   cd axis_server && npm run build
   ```

## 使い方

### オンライン対戦（開発環境）
1. バックエンド起動: `cd backend && uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000`
2. フロントエンド起動: `cd axis_server && npm run dev`
3. http://localhost:5173/online にアクセス
4. ルームコード入力または作成
5. 他のプレイヤーも同じルームコードで参加

### オフライン版（axis_server）
1. http://localhost:5173 にアクセス
2. ホストは `/host` からルーム作成
3. プレイヤーはQRコードを読み取って参加

### card_generator
1. http://localhost:5181 にアクセス
2. OpenAI APIキーを入力
3. 単語を選択または追加
4. 画像生成ボタンをクリック
5. PDFをダウンロード

## 実装済みAPI エンドポイント

### ルーム管理
- `POST /api/rooms/create` - ルーム作成
- `POST /api/rooms/join` - ルーム参加
- `GET /api/rooms/{room_code}` - ルーム情報取得
- `POST /api/rooms/{room_code}/leave` - プレイヤー退出

### ゲーム進行
- `POST /api/rooms/{room_code}/phase` - フェーズ更新
- `GET /api/rooms/{room_code}/hand` - 手札取得
- `POST /api/rooms/{room_code}/cards` - カード配置
- `GET /api/rooms/{room_code}/cards` - 配置カード取得

### 投票・結果
- `POST /api/rooms/{room_code}/vote` - 投票
- `GET /api/rooms/{room_code}/votes` - 投票結果取得
- `POST /api/rooms/{room_code}/calculate_results` - 結果計算
- `POST /api/rooms/{room_code}/next_round` - 次ラウンド開始

### WebSocket
- `WS /ws/{room_code}` - リアルタイム通信
  - イベント: `phase_change`, `card_placed`, `vote_cast`, `player_left`

---
最終更新: 2025-10-06 23:45 (JST)
