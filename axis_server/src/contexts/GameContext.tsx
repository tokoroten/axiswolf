/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api, type Room, type Player, type PlacedCard, type Vote } from '../lib/api';

interface GameContextType {
  room: Room | null;
  players: Player[];
  placedCards: PlacedCard[];
  votes: Vote[];
  playerSlot: number | null;
  isHost: boolean;
  joinRoom: (roomCode: string, playerId: string, playerName: string) => Promise<void>;
  createRoom: (roomCode: string, playerId: string, playerName: string) => Promise<void>;
  updatePhase: (phase: string, axisPayload?: any, wolfAxisPayload?: any, roundSeed?: string) => Promise<void>;
  placeCard: (cardId: string, quadrant: number, offsets: { x: number; y: number }) => Promise<void>;
  submitVote: (targetSlot: number) => Promise<void>;
  fetchVotes: () => Promise<void>;
  fetchHand: () => Promise<string[]>;
  calculateResults: () => Promise<{
    wolf_slot: number;
    top_voted: number[];
    wolf_caught: boolean;
    scores: Record<string, number>;
    vote_counts: Record<number, number>;
    all_hands: Record<string, string[]>;
    wolf_axis: any;
    normal_axis: any;
  }>;
  startNextRound: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [placedCards, setPlacedCards] = useState<PlacedCard[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [playerSlot, setPlayerSlot] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [, setWs] = useState<WebSocket | null>(null);

  const isHost = players.find(p => p.player_slot === playerSlot)?.is_host === 1;

  // LocalStorageから接続情報を復元
  useEffect(() => {
    const savedRoomCode = localStorage.getItem('online_room_code');
    const savedPlayerId = localStorage.getItem('online_player_id');
    const savedPlayerName = localStorage.getItem('online_player_name');

    if (savedRoomCode && savedPlayerId && savedPlayerName && !room) {
      console.log('[GameContext] 保存された接続情報から再接続を試みます', {
        roomCode: savedRoomCode,
        playerId: savedPlayerId,
        playerName: savedPlayerName,
      });

      // 再接続を試みる
      joinRoom(savedRoomCode, savedPlayerId, savedPlayerName).catch((err) => {
        console.error('[GameContext] 再接続に失敗しました:', err);
        // 失敗したらLocalStorageをクリア
        localStorage.removeItem('online_room_code');
        localStorage.removeItem('online_player_id');
        localStorage.removeItem('online_player_name');
      });
    }
  }, []);

  useEffect(() => {
    if (!room) return;

    const websocket = api.connectWebSocket(room.room_code);
    setWs(websocket);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'player_joined':
          api.getRoom(room.room_code).then(({ players: newPlayers }) => {
            setPlayers(newPlayers);
          });
          break;

        case 'phase_changed':
          // フェーズが変更されたら、サーバーから最新のルーム情報を取得
          // (軸データやシード値が更新されている可能性があるため)
          api.getRoom(room.room_code).then(({ room: updatedRoom }) => {
            setRoom(updatedRoom);
          });
          break;

        case 'card_placed':
          setPlacedCards(prev => [
            ...prev.filter(c => !(c.player_slot === message.player_slot && c.card_id === message.card_id)),
            {
              room_code: room.room_code,
              round: room.active_round,
              player_slot: message.player_slot,
              card_id: message.card_id,
              quadrant: message.quadrant,
              offsets: message.offsets,
              locked: 0,
              placed_at: new Date().toISOString(),
            },
          ]);
          break;

        case 'vote_submitted':
          break;

        case 'round_started':
          // 新しいラウンドが始まったらルーム情報を再取得
          api.getRoom(room.room_code).then(({ room: newRoom }) => {
            setRoom(newRoom);
          });
          // カードと投票をクリア
          setPlacedCards([]);
          setVotes([]);
          break;
      }
    };

    return () => {
      websocket.close();
    };
  }, [room]);

  const joinRoom = async (roomCode: string, pid: string, playerName: string) => {
    const { player_slot } = await api.joinRoom(roomCode, pid, playerName);
    const { room: newRoom, players: newPlayers } = await api.getRoom(roomCode);
    setRoom(newRoom);
    setPlayers(newPlayers);
    setPlayerSlot(player_slot);
    setPlayerId(pid);

    // LocalStorageに保存（再接続用）
    localStorage.setItem('online_room_code', roomCode);
    localStorage.setItem('online_player_id', pid);
    localStorage.setItem('online_player_name', playerName);
    console.log('[GameContext] 接続情報をLocalStorageに保存しました');
  };

  const createRoom = async (roomCode: string, pid: string, playerName: string) => {
    await api.createRoom(roomCode, pid, playerName);
    const { room: newRoom, players: newPlayers } = await api.getRoom(roomCode);
    setRoom(newRoom);
    setPlayers(newPlayers);
    setPlayerSlot(0);
    setPlayerId(pid);

    // LocalStorageに保存（再接続用）
    localStorage.setItem('online_room_code', roomCode);
    localStorage.setItem('online_player_id', pid);
    localStorage.setItem('online_player_name', playerName);
    console.log('[GameContext] 接続情報をLocalStorageに保存しました');
  };

  const updatePhase = async (phase: string, axisPayload?: any, wolfAxisPayload?: any, roundSeed?: string) => {
    if (!room) return;
    await api.updatePhase(room.room_code, phase, axisPayload, wolfAxisPayload, roundSeed);
    // サーバーから最新のルーム情報を取得（サーバー側で軸が生成される可能性があるため）
    const { room: updatedRoom } = await api.getRoom(room.room_code);
    setRoom(updatedRoom);
  };

  const placeCard = async (cardId: string, quadrant: number, offsets: { x: number; y: number }) => {
    if (!room || !playerId) return;
    await api.placeCard(room.room_code, playerId, cardId, quadrant, offsets);
  };

  const submitVote = async (targetSlot: number) => {
    if (!room || !playerId) return;
    await api.submitVote(room.room_code, playerId, targetSlot);
  };

  const fetchVotes = async () => {
    if (!room) return;
    const { votes: newVotes } = await api.getVotes(room.room_code);
    setVotes(newVotes);
  };

  const fetchHand = async (): Promise<string[]> => {
    if (!room || !playerId) return [];
    const { hand } = await api.getHand(room.room_code, playerId);
    return hand;
  };

  const calculateResults = async () => {
    if (!room) throw new Error('No room');
    const results = await api.calculateResults(room.room_code);
    // スコアが更新されたのでルーム情報を再取得
    const { room: updatedRoom } = await api.getRoom(room.room_code);
    setRoom(updatedRoom);
    return results;
  };

  const startNextRound = async () => {
    if (!room) throw new Error('No room');
    await api.startNextRound(room.room_code);
    // サーバーから最新のルーム情報を取得
    const { room: updatedRoom } = await api.getRoom(room.room_code);
    setRoom(updatedRoom);
    // カードと投票をクリア
    setPlacedCards([]);
    setVotes([]);
  };

  return (
    <GameContext.Provider
      value={{
        room,
        players,
        placedCards,
        votes,
        playerSlot,
        isHost,
        joinRoom,
        createRoom,
        updatePhase,
        placeCard,
        submitVote,
        fetchVotes,
        fetchHand,
        calculateResults,
        startNextRound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}