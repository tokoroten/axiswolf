// 環境変数から取得、デフォルトは開発環境用
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const WS_BASE = import.meta.env.VITE_WS_BASE || 'ws://localhost:8000/ws';

// 本番環境では相対パスを使用（同一オリジン）
const getApiBase = () => {
  if (API_BASE === '') return '/api';
  return API_BASE;
};

const getWsBase = () => {
  if (WS_BASE === '') {
    // 本番環境: 同一オリジンのWebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
  return WS_BASE;
};

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
  is_online?: boolean;
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
  async verifyToken(playerId: string, token: string) {
    const res = await fetch(`${getApiBase()}/auth/verify?player_id=${playerId}&token=${token}`, {
      method: 'POST',
    });
    if (!res.ok) return false;
    return true;
  },

  async createRoom(roomCode: string, playerId: string, playerName: string) {
    const res = await fetch(`${getApiBase()}/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_code: roomCode, player_id: playerId, player_name: playerName }),
    });
    if (!res.ok) throw new Error('Failed to create room');
    return res.json();
  },

  async joinRoom(roomCode: string, playerId: string, playerName: string) {
    const res = await fetch(`${getApiBase()}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_code: roomCode, player_id: playerId, player_name: playerName }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const error: any = new Error(errorData.detail || 'Failed to join room');
      error.response = { status: res.status };
      throw error;
    }
    return res.json();
  },

  async getRoom(roomCode: string): Promise<{ room: Room; players: Player[] }> {
    const res = await fetch(`${getApiBase()}/rooms/${roomCode}`);
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
    const res = await fetch(`${getApiBase()}/rooms/${roomCode}/phase`, {
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

  async leaveRoom(roomCode: string, playerId: string) {
    const res = await fetch(`${getApiBase()}/rooms/${roomCode}/leave?player_id=${playerId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to leave room');
    return res.json();
  },

  async placeCard(
    roomCode: string,
    playerId: string,
    cardId: string,
    quadrant: number,
    offsets: { x: number; y: number }
  ) {
    const res = await fetch(`${getApiBase()}/rooms/${roomCode}/cards?player_id=${playerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: cardId, quadrant, offsets }),
    });
    if (!res.ok) throw new Error('Failed to place card');
    return res.json();
  },

  async submitVote(roomCode: string, playerId: string, targetSlot: number) {
    const res = await fetch(`${getApiBase()}/rooms/${roomCode}/vote?player_id=${playerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_slot: targetSlot }),
    });
    if (!res.ok) throw new Error('Failed to submit vote');
    return res.json();
  },

  async getVotes(roomCode: string): Promise<{ votes: Vote[] }> {
    const res = await fetch(`${getApiBase()}/rooms/${roomCode}/votes`);
    if (!res.ok) throw new Error('Failed to get votes');
    return res.json();
  },

  async getHand(roomCode: string, playerId: string): Promise<{ hand: string[]; player_slot: number }> {
    const res = await fetch(`${getApiBase()}/rooms/${roomCode}/hand?player_id=${playerId}`);
    if (!res.ok) throw new Error('Failed to get hand');
    return res.json();
  },

  async calculateResults(roomCode: string): Promise<{
    wolf_slot: number;
    top_voted: number[];
    wolf_caught: boolean;
    scores: Record<string, number>;
    vote_counts: Record<number, number>;
    all_hands: Record<string, string[]>;
    wolf_axis: any;
    normal_axis: any;
  }> {
    const res = await fetch(`${getApiBase()}/rooms/${roomCode}/calculate_results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to calculate results');
    return res.json();
  },

  async startNextRound(roomCode: string): Promise<{
    success: boolean;
    round: number;
    round_seed: string;
  }> {
    const res = await fetch(`${getApiBase()}/rooms/${roomCode}/next_round`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to start next round');
    return res.json();
  },

  connectWebSocket(roomCode: string, playerId?: string, loadHistory: boolean = true): WebSocket {
    let url = `${getWsBase()}/${roomCode}`;
    const params = new URLSearchParams();

    if (playerId) {
      params.append('player_id', playerId);
    }
    params.append('load_history', loadHistory.toString());

    url += `?${params.toString()}`;
    return new WebSocket(url);
  },
};
