# ヨンショーゲン開発 TODO リスト

このファイルは開発の進捗状況を記録し、次のタスクを管理するための長期メモリです。

## 完了したタスク ✅

### オンライン対戦システム
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
  - オンライン状態インジケーター
  - ゲームルール表示モーダル
  - 入力フィールドのテキスト色改善
- [x] プレイヤー退出処理
  - `/leave`エンドポイント実装
  - LocalStorageクリーンアップ
  - WebSocket切断通知
  - カード・投票データのクリーンアップ
- [x] WebSocket再接続機能
  - 自動再接続（最大5回試行）
  - LocalStorageからの状態復元
  - `player_left`イベント処理
  - 重複接続の防止
- [x] **チャット機能**
  - WebSocketベースのリアルタイムチャット
  - チャットパネルコンポーネント
  - 未読通知機能（赤いバッジ表示）
  - 過去ログの管理と重複防止
  - メッセージ送受信とブロードキャスト
- [x] **トークン認証システム**
  - ゲーム参加時にトークン払い出し
  - LocalStorageにトークン保存
  - 再接続時のトークン検証
  - 不正アクセス防止
- [x] **招待機能の改善**
  - QRコード表示（ロビー画面）
  - 招待リンクのコピー機能
  - スマートフォン対応

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
  - タイムアウト処理
  - 不正な状態遷移の防止
- [ ] **ゲームバランス調整**
  - スコア計算式の見直し
  - 人狼選出ロジックの検証
  - カード枚数の調整（現在5枚）

### UI/UX改善
- [ ] モバイル対応の改善
- [ ] PWA対応（オフラインでも使用可能に）
- [ ] ダークモード対応
- [ ] アニメーション追加

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
- [ ] READMEの充実
- [ ] テストの追加
  - ユニットテスト
  - E2Eテスト
- [ ] アクセシビリティの向上
- [ ] パフォーマンス最適化

## 技術的な注意事項 ⚠️

### 開発サーバー
- **フロントエンド**: http://localhost:5173 (Vite dev server)
- **バックエンド**: http://localhost:8000 (FastAPI + Uvicorn)
- **WebSocket**: ws://localhost:8000/ws/{room_code}

### オンライン対戦アーキテクチャ
- **バックエンド**: FastAPI (Python)
  - In-memory storage（辞書型）
  - WebSocketでリアルタイム通信
  - RESTful API
  - トークンベース認証
- **フロントエンド**: React + TypeScript
  - React Context API でグローバル状態管理
  - WebSocketクライアント
  - QRコード生成（qrcode）
- **ゲームロジック**: すべてサーバーサイド
  - 決定的乱数生成（シード値ベース）
  - 公平性の保証

## 現在の課題 🚨

### 既知の問題
- In-memoryストレージのため、サーバー再起動で全データ消失
- ルームタイムアウト・自動削除機能なし
- 複数プレイヤーでの動作未検証（2-8人）

### セキュリティ・安定性
- トークン認証実装済み（基本的なセキュリティ確保）
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
   - チャット機能
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
5. QRコードまたはリンクを共有して他のプレイヤーを招待
6. チャットでコミュニケーション
7. ゲーム開始

## 実装済みAPI エンドポイント

### 認証
- `POST /api/auth/verify` - トークン検証

### ルーム管理
- `POST /api/rooms/create` - ルーム作成（トークン払い出し）
- `POST /api/rooms/join` - ルーム参加（トークン払い出し）
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
- `WS /ws/{room_code}?player_id={id}&load_history={bool}` - リアルタイム通信
  - イベント: `chat`, `phase_changed`, `card_placed`, `vote_submitted`, `player_joined`, `player_left`, `player_online`, `player_offline`, `round_started`
  - チャットメッセージのブロードキャスト
  - 過去ログの送信（初回接続時のみ）

---
最終更新: 2025-10-08 (JST)
