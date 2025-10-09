# ヨンショーゲン プロジェクト

## プロジェクト概要
「アクシスウルフ：人狼は誰だ？」は、物理カードとWebシステムを組み合わせたオンライン対戦型パーティーゲームです。

## プロジェクト構造
```
yonshogen/
├── axis_server/     # フロントエンド（React + TypeScript）
├── backend/         # バックエンド（FastAPI + WebSocket）
└── docs/           # ドキュメント・進捗管理
```

## axis_server（フロントエンド）
プレイヤーに軸とズレ指示を表示し、ゲーム進行を管理するWebアプリケーション

### ディレクトリ構造
```
axis_server/
├── src/
│   ├── pages/          # 画面コンポーネント
│   │   ├── Home.tsx            # トップページ
│   │   ├── OnlineHome.tsx      # オンラインルーム作成/参加
│   │   ├── OnlinePlay.tsx      # ロビー画面
│   │   ├── OnlineGame.tsx      # ゲーム画面（メイン）
│   │   └── Debug.tsx           # デバッグ画面
│   ├── components/     # 再利用可能なコンポーネント
│   │   ├── GameBoard.tsx       # ゲーム盤面
│   │   ├── ChatPanel.tsx       # チャット機能
│   │   ├── PlayerAvatar.tsx    # プレイヤーアバター
│   │   └── RulesModal.tsx      # ルール説明モーダル
│   ├── contexts/       # React Context（状態管理）
│   │   └── GameContext.tsx     # ゲーム全体の状態管理
│   ├── lib/            # ユーティリティ・ロジック
│   ├── types/          # TypeScript型定義
│   └── utils/          # ヘルパー関数
└── dist/               # ビルド出力先
```

### 主要機能
- **ルーム作成・参加**: ルームコードでゲームルーム作成・参加
- **QRコード生成**: 各プレイヤー用のQRコードを自動生成
- **リアルタイム同期**: WebSocketでプレイヤー状態・チャット・カード配置を同期
- **役割配布**: シード値から決定的に人狼を選出（サーバー側で計算）
- **軸表示**: 二軸とズレ指示の秘密表示（人狼には異なる軸を表示）
- **カード配置**: ドラッグ＆ドロップで4象限にカードを配置
- **投票・結果表示**: 投票集計と得点計算
- **チャット機能**: WebSocketによるリアルタイムチャット

### 技術スタック
- React 18 + TypeScript
- Vite（ビルドツール）
- Tailwind CSS v4
- React Router（ルーティング）
- QRCode.js（QRコード生成）
- WebSocket（リアルタイム通信）

### 開発コマンド
```bash
cd axis_server
npm install
npm run dev     # 開発サーバー起動（http://localhost:5178）
npm run build   # 本番ビルド
```

### アクセスURL
- http://localhost:5178/ - トップページ
- http://localhost:5178/online - オンラインゲーム入口
- http://localhost:5178/online/play?room=XXX - ゲームルーム

## backend（バックエンド）
FastAPI + WebSocketによるオンラインゲーム用バックエンドサーバー

### ディレクトリ構造
```
backend/
├── main.py         # FastAPIアプリケーション本体
├── axis_data.py    # 軸データ生成ロジック
├── pyproject.toml  # Python依存関係
└── requirements.txt
```

### 主要機能
- **ルーム管理**: オンメモリでルーム・プレイヤー情報を管理
- **WebSocketサーバー**: リアルタイム通信（チャット、カード配置、投票）
- **認証**: トークンベースのプレイヤー認証
- **手札生成**: シード値から決定的に全プレイヤーの手札を生成
- **軸生成**: ゲーム用の通常軸と人狼用軸を自動生成
- **得点計算**: 投票結果から自動的にスコア計算
- **自動クリーンアップ**: 14日間アクティビティのないルームを削除

### 技術スタック
- FastAPI 0.115+
- Uvicorn（ASGIサーバー）
- WebSockets
- Pydantic（データバリデーション）
- Python 3.11+

### 開発コマンド
```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

または

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py
```

### APIエンドポイント
- `GET /api/health` - ヘルスチェック
- `POST /api/rooms/create` - ルーム作成
- `POST /api/rooms/join` - ルーム参加
- `GET /api/rooms/{room_code}` - ルーム情報取得
- `POST /api/rooms/{room_code}/phase` - フェーズ更新
- `POST /api/rooms/{room_code}/cards` - カード配置
- `POST /api/rooms/{room_code}/vote` - 投票
- `POST /api/rooms/{room_code}/calculate_results` - 結果取得
- `POST /api/rooms/{room_code}/next_round` - 次ラウンド開始
- `WS /ws/{room_code}` - WebSocket接続
- `GET /api/debug/rooms` - デバッグ: 全ルーム一覧

### アクセスURL
- http://localhost:8000/docs - Swagger UI（APIドキュメント）
- http://localhost:8000/api/health - ヘルスチェック

## ゲームルール概要

### 目的
全員に共有された二軸に沿ってカードを軸に沿って配置する。ただし1人だけは異なる軸が提示されており、その人（人狼）を見破る。

### 人数・時間
- 人数：4人（3–8人でも可）
- 時間：1ラウンド 5–8分

### 遊び方
1. ホストがキーワードを設定してルーム作成
2. 各プレイヤーがQRコードを読み取って参加
3. 全員に共通の二軸が表示される、人狼だけ異なる二軸が表示される
4. 物理カードをその軸上に配置しながら議論
5. 全員が3枚配置したら投票
6. 最多票を集めた人が人狼候補
7. 得点計算

## 開発フロー

### サーバー起動（両方必要）

**フロントエンド:**
```bash
cd axis_server
npm run dev
# → http://localhost:5178
```

**バックエンド:**
```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
# → http://localhost:8000
```

### 開発上の注意事項

#### 必須チェック項目 ⚠️
**コードを変更した後は必ず以下を実行：**

1. **TypeScriptビルドチェック**
   ```bash
   cd axis_server
   npm run build
   ```
   - 型エラーがないことを確認
   - `import type` を使用して型インポート

2. **Lintチェック**（設定されている場合）
   ```bash
   npm run lint
   ```

3. **開発サーバーでの動作確認**
   - フロントエンド: http://localhost:5178
   - バックエンド: http://localhost:8000/docs

#### 技術的注意事項

**フロントエンド:**
- Tailwind CSS v4を使用（@tailwindcss/vite プラグイン）
- Windows環境でのビルドエラーに注意
  - `@tailwindcss/oxide-win32-x64-msvc` のインストールが必要
  - `@rollup/rollup-win32-x64-msvc` のインストールが必要
  - `lightningcss-win32-x64-msvc` のインストールが必要
- QRコード生成はクライアントサイドで実行
- `verbatimModuleSyntax` が有効の場合、型は `import type` を使用
- Reactのインポートは不要（React 17+）

**バックエンド:**
- オンメモリストレージのため、サーバー再起動でデータ揮発
- WebSocket接続の管理に注意（重複接続、再接続処理）
- CORS設定は開発用（localhost:5173, 5174）
- 本番環境では環境変数でCORS設定を変更する必要あり

## 進捗管理

### docs/TODO.md
開発の進捗状況と次のタスクを管理する長期メモリファイルです。
- 完了したタスクの記録
- 進行中のタスクの管理
- 次にやるべきタスクのリスト
- 技術的な注意事項のメモ

定期的に`docs/TODO.md`を確認して、プロジェクトの現在の状態と次のステップを把握してください。

## トラブルシューティング

### Tailwind CSSエラー
```bash
# Tailwind CSS v4の正しいインストール
npm install -D tailwindcss@next @tailwindcss/vite@next
```

### Viteエラー
```bash
# node_modulesの再インストール
rm -rf node_modules package-lock.json
npm install
```