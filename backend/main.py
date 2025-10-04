from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    # 既存プレイヤー確認
    room_players = players.get(req.room_code, [])
    existing = next((p for p in room_players if p["player_id"] == req.player_id), None)

    if existing:
        return {"success": True, "player_slot": existing["player_slot"]}

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
