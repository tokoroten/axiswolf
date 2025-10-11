# デプロイガイド

## Renderへのデプロイ

### 必要なサービス

このプロジェクトは以下のサービスを使用します：

1. **axiswolf** - FastAPIバックエンド（Pythonサービス）
   - デプロイ先: https://axiswolf.onrender.com

### Renderでの設定手順

#### 1. GitHubリポジトリを接続

Renderのダッシュボードで「New Web Service」を選択し、GitHubリポジトリを接続します。

#### 2. 環境変数の設定

**axiswolf サービス**
- 環境変数の設定は不要です

#### 3. サービスの起動確認

サービスが正常に起動したら、以下のURLで確認できます：

- **バックエンドAPI**: `https://axiswolf.onrender.com/api/health`

### ローカル開発環境

ローカルで開発する場合は、`frontend/.env.example`を参考に環境変数を設定してください。

### トラブルシューティング

#### CORS エラー

- バックエンドのCORS設定を確認（`backend/main.py`の`CORSMiddleware`設定）
- フロントエンドのビルド時に正しいAPIエンドポイントが設定されているか確認

#### WebSocket接続エラー

- Renderの無料プランでは、一定時間アイドル状態が続くとサービスがスリープします
- スリープ状態から復帰するまで数秒かかる場合があります
