# アクシスウルフ (Axis Wolf)

軸がズレた人狼を見つけ出せ！4象限の軸を使った新感覚の正体隠匿ゲーム。

🎮 **プレイ**: https://axiswolf.onrender.com/

## 🎯 ゲーム概要

アクシスウルフは、プレイヤーの中に一人だけ存在する「人狼」を見つけ出す正体隠匿ゲームです。全員が同じ4象限の軸（縦軸・横軸）を見ているはずが、人狼だけは微妙に異なる軸を見ています。物理カードを軸上に配置する議論を通じて、誰が人狼なのかを推理します。

### 特徴
- 🎲 3〜8人でプレイ可能
- 📱 スマートフォン/タブレット対応
- 🔄 複数ラウンド制（好きなだけプレイ可能）
- 🏆 累積スコアシステム搭載
- 🎨 8種類のテーマ（食べ物、日常、娯楽、動物、場所、乗り物、スポーツ、カオス）
- 🎭 ラウンドごとにテーマと軸が変わる動的な体験
- 🌐 WebSocketによるリアルタイム同期

## 🚀 セットアップ

### 必要なもの
- スマートフォン/タブレット（人数分）
- 物理カード40枚以上（商品、キャラクター、食べ物など）
- インターネット接続

### ゲームの始め方

1. **ホストとして開始**
   - 「ホストとしてゲームを開始」を選択
   - 6桁のパスコードを設定（自動生成も可能）
   - プレイ人数と難易度を選択
   - 各プレイヤー用のQRコードが表示される

2. **プレイヤーとして参加**
   - QRコードを読み取るか、パスコードを入力
   - キャラクターを選択して参加

## 🎮 ゲームの流れ

### 準備
1. カードをシャッフルして各プレイヤーに5枚ずつ配布
2. 残りを山札として中央に配置

### プレイ
1. 全員が自分の画面で軸を確認（人狼だけ違う軸）
2. システムが指定したプレイヤーから開始
3. 手札から1枚選び、軸に沿って配置
4. 他のカードの配置を調整しても良い
5. 山札から1枚引いて手札を補充
6. 時計回りに進行、全員が3枚配置したら投票へ

### 投票
- ラウンド終了時、誰が人狼だと思うか一斉に指さす
- 最多票を集めた人が人狼候補

### 得点
- **村人**: 人狼が最多票になったら 全員+1点、人狼を正しく指したら指した人に+1点
- **人狼**: 最多票を避けられたら +3点
    - 得票数が同じ場合は人狼の勝利
- **ペナルティ**: 軸の名前を口に出したら -1点


## 🛠️ 技術スタック

### フロントエンド
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router

### バックエンド（オンライン対戦）
- FastAPI 0.115+
- Uvicorn (ASGI server)
- WebSockets（リアルタイム通信）
- Python 3.11+
- Pydantic（データバリデーション）
- オンメモリストレージ（再起動で揮発）

### デプロイ
- Render（バックエンド + フロントエンド）
  - バックエンド: FastAPI + Uvicorn
  - フロントエンド: 静的ファイルとしてバックエンドから配信
  - 自動デプロイ: mainブランチへのプッシュで自動更新

## 💻 開発

### 環境構築

#### フロントエンド
```bash
cd frontend
npm install
npm run dev
```

アクセス: http://localhost:5173/

注: Windows環境では Tailwind CSS v4 のネイティブモジュール (`@tailwindcss/oxide-win32-x64-msvc` 等) が自動的にインストールされます。

#### バックエンド（オンライン対戦用）
```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API: http://localhost:8000/
API ドキュメント: http://localhost:8000/docs

### ビルド
```bash
cd frontend
npm run build
```

### デプロイ
mainブランチへのプッシュで自動的にRenderへデプロイされます。

Renderでのビルドプロセス:
1. フロントエンドの依存関係インストール (`npm ci`)
2. フロントエンドのビルド (`npm run build`)
3. 静的ファイルを `backend/static/` にコピー
4. Pythonの依存関係インストール (`pip install -r requirements.txt`)

詳細は `backend/build.sh` を参照してください。

## 🔌 主要なAPIエンドポイント

### REST API
- `GET /api/health` - ヘルスチェック
- `POST /api/rooms/create` - ルーム作成
- `POST /api/rooms/join` - ルーム参加
- `GET /api/rooms/{room_code}` - ルーム情報取得
- `POST /api/rooms/{room_code}/phase` - ゲームフェーズ更新
- `POST /api/rooms/{room_code}/cards` - カード配置
- `POST /api/rooms/{room_code}/vote` - 投票
- `POST /api/rooms/{room_code}/calculate_results` - 結果計算

### WebSocket
- `WS /ws/{room_code}` - リアルタイム通信（プレイヤー接続・状態同期）

詳細なAPIドキュメントは開発サーバー起動後 http://localhost:8000/docs で確認できます。

## 📁 プロジェクト構成

```
yonshogen/
├── frontend/          # Webアプリケーション
│   ├── src/
│   │   ├── pages/     # ページコンポーネント
│   │   ├── components/# UIコンポーネント
│   │   ├── contexts/  # React Context
│   │   ├── data/      # ゲームデータ
│   │   ├── lib/       # APIクライアント
│   │   └── utils/     # ユーティリティ関数
│   └── public/        # 静的ファイル
├── backend/           # オンライン対戦用バックエンド
│   ├── main.py        # FastAPIアプリケーション
│   └── requirements.txt # Python依存関係
└── card_generator_python/ # カード生成ツール
```

## 🎯 ゲームのポイント

- カードをどこに置くか、その理由を説明しながら議論する
- 一人だけ配置の理由が不自然な人を探す
- 複数のカードで一貫してズレている人を見つける
- 人狼も自然に振る舞おうとするので注意深く観察

## 🎨 テーマシステム

ゲームでは以下の8種類のテーマからカードと軸が生成されます:

1. **食べ物 (food)** - 料理、食材、飲み物など
2. **日常 (daily)** - 日用品、家電、生活用品など
3. **娯楽 (entertainment)** - 映画、音楽、本、ゲームなど
4. **動物 (animal)** - 動物、虫、ペットなど
5. **場所 (place)** - 都市、建物、観光地など
6. **乗り物 (vehicle)** - 車、電車、飛行機など
7. **スポーツ (sport)** - 球技、格闘技、ウィンタースポーツなど
8. **カオス (chaos)** - 全テーマが混在したランダムモード

各ラウンドで選択されたテーマに基づいてカードプールと軸が一貫性を持って生成されます。ゲーム開始時に複数のテーマを選択でき、各ラウンドでランダムに1つのテーマが選ばれます。

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

Issue や Pull Request は大歓迎です！

## 👥 作者

- GitHub: [@tokoroten](https://github.com/tokoroten)

---

🤖 Generated with [Claude Code](https://claude.ai/code)