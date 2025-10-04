# Axis Wolf Backend

FastAPI + WebSocket によるオンラインゲーム用バックエンド

## 特徴

- **オンメモリストレージ**: 再起動すると全てのデータが揮発
- **WebSocketリアルタイム通信**: プレイヤー間の状態同期
- **FastAPI**: 高速なAPIエンドポイント

## 起動方法

### uvを使用（推奨）

```bash
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Pythonで直接起動

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r pyproject.toml
python main.py
```

## APIエンドポイント

- `POST /api/rooms/create` - ルーム作成
- `POST /api/rooms/join` - ルーム参加
- `GET /api/rooms/{room_code}` - ルーム情報取得
- `POST /api/rooms/{room_code}/phase` - フェーズ更新
- `POST /api/rooms/{room_code}/cards` - カード配置
- `POST /api/rooms/{room_code}/vote` - 投票
- `WS /ws/{room_code}` - WebSocket接続

## 技術スタック

- FastAPI 0.115+
- Uvicorn (ASGI server)
- WebSockets
- Pydantic (データバリデーション)
