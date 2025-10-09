# ヨンショーゲン プロジェクト

## プロジェクト概要
「アクシスウルフ：人狼は誰だ？」は、物理カードとWebシステムを組み合わせたオンライン対戦型パーティーゲームです。

## プロジェクト構造
```
yonshogen/
├── frontend/        # フロントエンド（React + TypeScript）
├── backend/         # バックエンド（FastAPI + WebSocket）
└── docs/           # ドキュメント・進捗管理
```

## 開発環境セットアップ

### フロントエンド
```bash
cd frontend
npm install
npm run dev     # http://localhost:5178
```

### バックエンド
```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
# → http://localhost:8000
```

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite（ビルドツール）
- Tailwind CSS v4
- React Router
- QRCode.js
- WebSocket

### バックエンド
- FastAPI 0.115+
- Uvicorn（ASGIサーバー）
- WebSockets
- Pydantic
- Python 3.11+

## 開発時の注意事項

### 必須チェック ⚠️
コード変更後は必ず以下を実行：

```bash
cd frontend
npm run build  # TypeScript型チェック
```

### 技術的注意点

**フロントエンド:**
- Tailwind CSS v4を使用
- Windows環境では `@tailwindcss/oxide-win32-x64-msvc` 等のネイティブモジュールが必要
- `verbatimModuleSyntax` 有効のため、型は `import type` を使用

**バックエンド:**
- オンメモリストレージ（サーバー再起動でデータ揮発）
- WebSocket接続の重複・再接続処理に注意
- CORS設定は開発用（localhost:5173, 5174）

## APIエンドポイント

主要なエンドポイント：
- `GET /api/health` - ヘルスチェック
- `POST /api/rooms/create` - ルーム作成
- `POST /api/rooms/join` - ルーム参加
- `GET /api/rooms/{room_code}` - ルーム情報取得
- `POST /api/rooms/{room_code}/phase` - フェーズ更新
- `POST /api/rooms/{room_code}/cards` - カード配置
- `POST /api/rooms/{room_code}/vote` - 投票
- `POST /api/rooms/{room_code}/calculate_results` - 結果取得
- `WS /ws/{room_code}` - WebSocket接続

詳細: http://localhost:8000/docs

## トラブルシューティング

### Tailwind CSSエラー
```bash
npm install -D tailwindcss@next @tailwindcss/vite@next
```

### Viteエラー
```bash
rm -rf node_modules package-lock.json
npm install
```

## 進捗管理
- `docs/TODO.md` - 開発の進捗状況と次のタスクを管理
