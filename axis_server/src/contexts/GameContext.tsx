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
          setRoom(prev => prev ? { ...prev, phase: message.phase } : null);
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
  };

  const createRoom = async (roomCode: string, pid: string, playerName: string) => {
    await api.createRoom(roomCode, pid, playerName);
    const { room: newRoom, players: newPlayers } = await api.getRoom(roomCode);
    setRoom(newRoom);
    setPlayers(newPlayers);
    setPlayerSlot(0);
    setPlayerId(pid);
  };

  const updatePhase = async (phase: string, axisPayload?: any, wolfAxisPayload?: any, roundSeed?: string) => {
    if (!room) return;
    await api.updatePhase(room.room_code, phase, axisPayload, wolfAxisPayload, roundSeed);
    setRoom(prev => prev ? {
      ...prev,
      phase,
      axis_payload: axisPayload || prev.axis_payload,
      wolf_axis_payload: wolfAxisPayload || prev.wolf_axis_payload,
      round_seed: roundSeed || prev.round_seed
    } : null);
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