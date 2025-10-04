const API_BASE = 'http://localhost:8000/api';
const WS_BASE = 'ws://localhost:8000/ws';

export interface Room {
  room_code: string;
  phase: string;
  active_round: number;
  active_player_slot: number | null;
  start_player_slot: number | null;
  mutator_id: string | null;
  axis_payload: string | null;
  wolf_axis_payload: string | null;
  round_seed: string | null;
  scores: string;
  discussion_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface Player {
  room_code: string;
  player_id: string;
  player_slot: number;
  player_name: string;
  status: string;
  is_host: number;
  hand_seed: string | null;
  hand_committed_at: string | null;
  connected_at: string;
  last_seen_at: string;
}

export interface PlacedCard {
  room_code: string;
  round: number;
  player_slot: number;
  card_id: string;
  quadrant: number;
  offsets: { x: number; y: number };
  locked: number;
  placed_at: string;
}

export interface Vote {
  room_code: string;
  round: number;
  voter_slot: number;
  target_slot: number;
  submitted_at: string;
}

export const api = {
  async createRoom(roomCode: string, playerId: string, playerName: string) {
    const res = await fetch(`${API_BASE}/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_code: roomCode, player_id: playerId, player_name: playerName }),
    });
    if (!res.ok) throw new Error('Failed to create room');
    return res.json();
  },

  async joinRoom(roomCode: string, playerId: string, playerName: string) {
    const res = await fetch(`${API_BASE}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_code: roomCode, player_id: playerId, player_name: playerName }),
    });
    if (!res.ok) throw new Error('Failed to join room');
    return res.json();
  },

  async getRoom(roomCode: string): Promise<{ room: Room; players: Player[] }> {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}`);
    if (!res.ok) throw new Error('Failed to get room');
    return res.json();
  },

  async updatePhase(
    roomCode: string,
    phase: string,
    axisPayload?: any,
    wolfAxisPayload?: any,
    roundSeed?: string
  ) {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}/phase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase,
        axis_payload: axisPayload,
        wolf_axis_payload: wolfAxisPayload,
        round_seed: roundSeed,
      }),
    });
    if (!res.ok) throw new Error('Failed to update phase');
    return res.json();
  },

  async placeCard(
    roomCode: string,
    playerId: string,
    cardId: string,
    quadrant: number,
    offsets: { x: number; y: number }
  ) {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}/cards?player_id=${playerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: cardId, quadrant, offsets }),
    });
    if (!res.ok) throw new Error('Failed to place card');
    return res.json();
  },

  async submitVote(roomCode: string, playerId: string, targetSlot: number) {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}/vote?player_id=${playerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_slot: targetSlot }),
    });
    if (!res.ok) throw new Error('Failed to submit vote');
    return res.json();
  },

  async getVotes(roomCode: string): Promise<{ votes: Vote[] }> {
    const res = await fetch(`${API_BASE}/rooms/${roomCode}/votes`);
    if (!res.ok) throw new Error('Failed to get votes');
    return res.json();
  },

  connectWebSocket(roomCode: string): WebSocket {
    return new WebSocket(`${WS_BASE}/${roomCode}`);
  },
};
