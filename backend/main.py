from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import random
from axis_data import generate_axis_pair, generate_wolf_axis_pair

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# カードプール
CARD_POOL = [
    # 食べ物
    'りんご', 'バナナ', 'ぶどう', 'いちご', 'みかん', 'メロン', 'スイカ', 'もも',
    'ラーメン', 'カレー', 'ハンバーグ', 'ピザ', 'すし', 'うどん', 'そば', 'おにぎり',
    'ケーキ', 'チョコレート', 'アイス', 'プリン', 'ドーナツ', 'クッキー',

    # 動物
    'いぬ', 'ねこ', 'うさぎ', 'ぞう', 'ライオン', 'きりん', 'パンダ', 'コアラ',
    'ペンギン', 'いるか', 'くじら', 'さめ', 'きんぎょ', 'かめ',

    # 乗り物
    '自動車', '電車', 'バス', '飛行機', 'ヘリコプター', '自転車', 'バイク', '船',

    # 日用品
    'スマホ', 'パソコン', 'テレビ', '冷蔵庫', 'エアコン', '時計', 'カメラ', '傘',
    'ペン', 'ノート', 'はさみ', 'のり', 'テープ', 'ホチキス',

    # エンターテイメント
    '映画', 'アニメ', 'ゲーム', '音楽', 'スポーツ', 'サッカー', '野球', 'バスケ',
    '本', '漫画', '雑誌', 'ドラマ',
]

def generate_hand(player_slot: int, round_seed: str, hand_size: int = 5) -> List[str]:
    """
    シード値を使って決定的に手札を生成
    """
    seed = int(round_seed) + player_slot * 1000
    rng = random.Random(seed)

    # ランダムにカードを選択
    hand = rng.sample(CARD_POOL, min(hand_size, len(CARD_POOL)))
    return hand

# オンメモリストレージ
rooms: Dict[str, dict] = {}
players: Dict[str, List[dict]] = {}
cards: Dict[str, List[dict]] = {}
votes: Dict[str, List[dict]] = {}

# WebSocket接続管理
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_code: str):
        await websocket.accept()
        if room_code not in self.active_connections:
            self.active_connections[room_code] = []
        self.active_connections[room_code].append(websocket)

    def disconnect(self, websocket: WebSocket, room_code: str):
        if room_code in self.active_connections:
            self.active_connections[room_code].remove(websocket)

    async def broadcast(self, room_code: str, message: dict):
        if room_code in self.active_connections:
            for connection in self.active_connections[room_code]:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

# Pydanticモデル
class CreateRoomRequest(BaseModel):
    room_code: str
    player_id: str
    player_name: str

class JoinRoomRequest(BaseModel):
    room_code: str
    player_id: str
    player_name: str

class UpdatePhaseRequest(BaseModel):
    phase: str
    axis_payload: Optional[dict] = None
    wolf_axis_payload: Optional[dict] = None
    round_seed: Optional[str] = None
    themes: Optional[List[str]] = None  # 軸生成用のテーマ

class PlaceCardRequest(BaseModel):
    card_id: str
    quadrant: int
    offsets: dict

class SubmitVoteRequest(BaseModel):
    target_slot: int

# ルーム作成
@app.post("/api/rooms/create")
async def create_room(req: CreateRoomRequest):
    if req.room_code in rooms:
        raise HTTPException(status_code=400, detail="Room already exists")

    rooms[req.room_code] = {
        "room_code": req.room_code,
        "phase": "lobby",
        "active_round": 0,
        "active_player_slot": None,
        "start_player_slot": None,
        "mutator_id": None,
        "axis_payload": None,
        "wolf_axis_payload": None,
        "round_seed": None,
        "scores": "{}",
        "discussion_deadline": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }

    players[req.room_code] = [{
        "room_code": req.room_code,
        "player_id": req.player_id,
        "player_slot": 0,
        "player_name": req.player_name,
        "status": "connected",
        "is_host": 1,
        "hand_seed": None,
        "hand_committed_at": None,
        "connected_at": datetime.now().isoformat(),
        "last_seen_at": datetime.now().isoformat(),
    }]

    cards[req.room_code] = []
    votes[req.room_code] = []

    return {"success": True, "room_code": req.room_code}

# ルーム参加
@app.post("/api/rooms/join")
async def join_room(req: JoinRoomRequest):
    if req.room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = rooms[req.room_code]

    # 既存プレイヤー確認
    room_players = players.get(req.room_code, [])
    existing = next((p for p in room_players if p["player_id"] == req.player_id), None)

    if existing:
        return {"success": True, "player_slot": existing["player_slot"]}

    # ゲーム開始後の新規参加を防ぐ
    if room["phase"] != "lobby":
        raise HTTPException(
            status_code=403,
            detail="Cannot join room after game has started. Please wait for the next round."
        )

    # 次のスロット番号取得
    max_slot = max((p["player_slot"] for p in room_players), default=-1)
    next_slot = max_slot + 1

    # プレイヤー追加
    new_player = {
        "room_code": req.room_code,
        "player_id": req.player_id,
        "player_slot": next_slot,
        "player_name": req.player_name,
        "status": "connected",
        "is_host": 0,
        "hand_seed": None,
        "hand_committed_at": None,
        "connected_at": datetime.now().isoformat(),
        "last_seen_at": datetime.now().isoformat(),
    }
    players[req.room_code].append(new_player)

    # 他のプレイヤーに通知
    await manager.broadcast(req.room_code, {
        "type": "player_joined",
        "player_slot": next_slot,
        "player_name": req.player_name
    })

    return {"success": True, "player_slot": next_slot}

# プレイヤー退出
@app.post("/api/rooms/{room_code}/leave")
async def leave_room(room_code: str, player_id: str):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room_players = players.get(room_code, [])
    player = next((p for p in room_players if p["player_id"] == player_id), None)

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    player_slot = player["player_slot"]
    player_name = player["player_name"]

    # プレイヤーをリストから削除
    players[room_code] = [p for p in room_players if p["player_id"] != player_id]

    # そのプレイヤーのカードと投票を削除
    if room_code in cards:
        cards[room_code] = [c for c in cards[room_code] if c["player_slot"] != player_slot]
    if room_code in votes:
        votes[room_code] = [v for v in votes[room_code] if v["voter_slot"] != player_slot]

    # 他のプレイヤーに通知
    await manager.broadcast(room_code, {
        "type": "player_left",
        "player_slot": player_slot,
        "player_name": player_name
    })

    # ルームが空になったら削除
    if len(players[room_code]) == 0:
        del rooms[room_code]
        del players[room_code]
        if room_code in cards:
            del cards[room_code]
        if room_code in votes:
            del votes[room_code]

    return {"success": True}

# ルーム情報取得
@app.get("/api/rooms/{room_code}")
async def get_room(room_code: str):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    return {
        "room": rooms[room_code],
        "players": players.get(room_code, [])
    }

# フェーズ更新
@app.post("/api/rooms/{room_code}/phase")
async def update_phase(room_code: str, req: UpdatePhaseRequest):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    rooms[room_code]["phase"] = req.phase
    rooms[room_code]["updated_at"] = datetime.now().isoformat()

    # 軸データが提供されていない場合は自動生成
    if req.phase == 'placement' and not req.axis_payload:
        # デフォルトテーマを使用
        themes = req.themes if req.themes else ['food', 'daily', 'entertainment']
        seed = int(req.round_seed) if req.round_seed else random.randint(0, 10000)

        # 通常の軸と人狼用の軸を生成
        normal_axis = generate_axis_pair(themes, seed)
        wolf_axis = generate_wolf_axis_pair(normal_axis, themes, seed)

        rooms[room_code]["axis_payload"] = normal_axis
        rooms[room_code]["wolf_axis_payload"] = wolf_axis
        rooms[room_code]["round_seed"] = str(seed)
    else:
        # 手動で提供された軸データを使用
        if req.axis_payload:
            rooms[room_code]["axis_payload"] = req.axis_payload

        if req.wolf_axis_payload:
            rooms[room_code]["wolf_axis_payload"] = req.wolf_axis_payload

        if req.round_seed:
            rooms[room_code]["round_seed"] = req.round_seed

    await manager.broadcast(room_code, {
        "type": "phase_changed",
        "phase": req.phase
    })

    return {"success": True}

# カード配置
@app.post("/api/rooms/{room_code}/cards")
async def place_card(room_code: str, player_id: str, req: PlaceCardRequest):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    # プレイヤー情報取得
    room_players = players.get(room_code, [])
    player = next((p for p in room_players if p["player_id"] == player_id), None)

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # カード配置
    room_cards = cards.get(room_code, [])
    # 同じカードがあれば削除
    room_cards = [c for c in room_cards if not (
        c["player_slot"] == player["player_slot"] and c["card_id"] == req.card_id
    )]

    room_cards.append({
        "room_code": room_code,
        "round": rooms[room_code]["active_round"],
        "player_slot": player["player_slot"],
        "card_id": req.card_id,
        "quadrant": req.quadrant,
        "offsets": req.offsets,
        "locked": 0,
        "placed_at": datetime.now().isoformat(),
    })
    cards[room_code] = room_cards

    await manager.broadcast(room_code, {
        "type": "card_placed",
        "player_slot": player["player_slot"],
        "card_id": req.card_id,
        "quadrant": req.quadrant,
        "offsets": req.offsets
    })

    return {"success": True}

# 手札取得
@app.get("/api/rooms/{room_code}/hand")
async def get_hand(room_code: str, player_id: str):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    # プレイヤー情報取得
    room_players = players.get(room_code, [])
    player = next((p for p in room_players if p["player_id"] == player_id), None)

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    room = rooms[room_code]
    if not room["round_seed"]:
        raise HTTPException(status_code=400, detail="Game not started")

    # 手札を生成
    hand = generate_hand(player["player_slot"], room["round_seed"], 5)

    return {
        "hand": hand,
        "player_slot": player["player_slot"]
    }

# 投票
@app.post("/api/rooms/{room_code}/vote")
async def submit_vote(room_code: str, player_id: str, req: SubmitVoteRequest):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room_players = players.get(room_code, [])
    player = next((p for p in room_players if p["player_id"] == player_id), None)

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # 投票追加/更新
    room_votes = votes.get(room_code, [])
    room_votes = [v for v in room_votes if v["voter_slot"] != player["player_slot"]]
    room_votes.append({
        "room_code": room_code,
        "round": rooms[room_code]["active_round"],
        "voter_slot": player["player_slot"],
        "target_slot": req.target_slot,
        "submitted_at": datetime.now().isoformat(),
    })
    votes[room_code] = room_votes

    await manager.broadcast(room_code, {
        "type": "vote_submitted",
        "voter_slot": player["player_slot"]
    })

    return {"success": True}

# 投票結果取得
@app.get("/api/rooms/{room_code}/votes")
async def get_votes(room_code: str):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room_votes = votes.get(room_code, [])
    return {"votes": room_votes}

# 投票結果を計算してスコアを更新
@app.post("/api/rooms/{room_code}/calculate_results")
async def calculate_results(room_code: str):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = rooms[room_code]
    room_players = players.get(room_code, [])
    room_votes = votes.get(room_code, [])

    # 人狼を特定
    if not room["round_seed"]:
        raise HTTPException(status_code=400, detail="Game not started")

    wolf_slot = int(room["round_seed"]) % len(room_players)

    # 投票集計
    vote_counts: Dict[int, int] = {}
    for vote in room_votes:
        target = vote["target_slot"]
        vote_counts[target] = vote_counts.get(target, 0) + 1

    # 最多得票数
    max_votes = max(vote_counts.values()) if vote_counts else 0
    # 最多得票者（複数の可能性）
    top_voted = [slot for slot, count in vote_counts.items() if count == max_votes]

    # 勝利判定
    wolf_caught = wolf_slot in top_voted

    # スコア計算
    import json
    current_scores = json.loads(room["scores"]) if room["scores"] else {}

    for player in room_players:
        slot = player["player_slot"]
        slot_str = str(slot)

        if slot_str not in current_scores:
            current_scores[slot_str] = 0

        # 人狼が捕まった場合
        if wolf_caught:
            if slot == wolf_slot:
                # 人狼は減点
                current_scores[slot_str] -= 2
            else:
                # 村人は加点
                current_scores[slot_str] += 1
        else:
            # 人狼が逃げた場合
            if slot == wolf_slot:
                # 人狼は加点
                current_scores[slot_str] += 3
            else:
                # 村人は減点
                current_scores[slot_str] -= 1

    # スコアを保存
    room["scores"] = json.dumps(current_scores)
    room["updated_at"] = datetime.now().isoformat()

    # 全プレイヤーの手札を生成（結果表示用）
    all_hands = {}
    for player in room_players:
        slot = player["player_slot"]
        hand = generate_hand(slot, room["round_seed"])
        all_hands[str(slot)] = hand

    return {
        "wolf_slot": wolf_slot,
        "top_voted": top_voted,
        "wolf_caught": wolf_caught,
        "scores": current_scores,
        "vote_counts": vote_counts,
        "all_hands": all_hands,
        "wolf_axis": room["wolf_axis_payload"],
        "normal_axis": room["axis_payload"]
    }

# 次ラウンドへ移行
@app.post("/api/rooms/{room_code}/next_round")
async def start_next_round(room_code: str):
    if room_code not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")

    room = rooms[room_code]
    room_players = players.get(room_code, [])

    # 新しいラウンド番号
    new_round = room["active_round"] + 1

    # 新しいシード値を生成
    new_seed = random.randint(0, 10000)

    # 新しい軸を生成
    themes = ['food', 'daily', 'entertainment']
    normal_axis = generate_axis_pair(themes, new_seed)
    wolf_axis = generate_wolf_axis_pair(normal_axis, themes, new_seed)

    # ルームの状態を更新
    room["active_round"] = new_round
    room["phase"] = "placement"
    room["round_seed"] = str(new_seed)
    room["axis_payload"] = normal_axis
    room["wolf_axis_payload"] = wolf_axis
    room["updated_at"] = datetime.now().isoformat()

    # 前ラウンドのカードと投票をクリア
    if room_code in cards:
        cards[room_code] = []
    if room_code in votes:
        votes[room_code] = []

    # WebSocketで通知
    await manager.broadcast(room_code, {
        "type": "round_started",
        "round": new_round
    })

    return {
        "success": True,
        "round": new_round,
        "round_seed": str(new_seed)
    }

# デバッグ: ルーム一覧取得
@app.get("/api/debug/rooms")
async def get_all_rooms():
    rooms_with_players = []
    for room_code, room_data in rooms.items():
        room_players = players.get(room_code, [])
        room_cards = cards.get(room_code, [])
        room_votes = votes.get(room_code, [])
        rooms_with_players.append({
            **room_data,
            "players_count": len(room_players),
            "players": room_players,
            "cards_count": len(room_cards),
            "votes_count": len(room_votes)
        })
    return {
        "rooms": rooms_with_players,
        "total": len(rooms)
    }

# WebSocket接続
@app.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    await manager.connect(websocket, room_code)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_code)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
