# デプロイガイド

## Renderへのデプロイ

### 必要なサービス

このプロジェクトは2つのサービスを使用します：

1. **axiswolf** - FastAPIバックエンド（Pythonサービス）
   - デプロイ先: https://axiswolf.onrender.com
2. **axiswolf-peerjs** - PeerJSシグナリングサーバー（Node.jsサービス）
   - デプロイ先: https://axiswolf-peerjs.onrender.com

### Renderでの設定手順

#### 1. GitHubリポジトリを接続

Renderのダッシュボードで「New Blueprint」を選択し、GitHubリポジトリを接続します。

#### 2. 環境変数の設定

**axiswolf-peerjs サービス**
- 環境変数の設定は不要です（ポートは自動的に`$PORT`が使用されます）

**axiswolf サービス**
- 環境変数の設定は不要です

#### 3. フロントエンドの環境変数設定

フロントエンドをビルドする際、以下の環境変数を設定してください：

```bash
VITE_PEERJS_HOST=axiswolf-peerjs.onrender.com
VITE_PEERJS_PORT=443
VITE_PEERJS_PATH=/peerjs
```

これらは`frontend/.env.production`に記載するか、ビルドコマンドで指定します：

```bash
cd frontend && \
VITE_PEERJS_HOST=axiswolf-peerjs.onrender.com \
VITE_PEERJS_PORT=443 \
VITE_PEERJS_PATH=/peerjs \
npm run build
```

#### 4. サービスの起動確認

両方のサービスが正常に起動したら、以下のURLで確認できます：

- **バックエンドAPI**: `https://axiswolf.onrender.com/api/health`
- **PeerJSサーバー**: `https://axiswolf-peerjs.onrender.com/peerjs/peerjs/id`

### ローカル開発環境

ローカルで開発する場合は、以下の環境変数を`frontend/.env.local`に設定してください：

```bash
VITE_PEERJS_HOST=localhost
VITE_PEERJS_PORT=9000
VITE_PEERJS_PATH=/peerjs
```

#### PeerJSサーバーの起動（ローカル）

```bash
cd backend
npm install
npm run peerjs
```

または：

```bash
cd backend
bash start_peerjs.sh
```

### トラブルシューティング

#### PeerJS接続エラー

- PeerJSサーバーが起動しているか確認
- ブラウザのコンソールで接続ログを確認
- ネットワークタブで`/peerjs`へのWebSocket接続を確認

#### CORS エラー

- バックエンドのCORS設定を確認（`backend/main.py`の`CORSMiddleware`設定）
- フロントエンドのビルド時に正しいAPIエンドポイントが設定されているか確認

#### WebSocket接続エラー

- Renderの無料プランでは、一定時間アイドル状態が続くとサービスがスリープします
- スリープ状態から復帰するまで数秒かかる場合があります
