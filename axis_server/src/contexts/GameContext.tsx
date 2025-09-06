/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Room, Player } from '../types';

interface GameContextType {
  room: Room | null;
  currentPlayer: Player | null;
  setRoom: (room: Room | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  isHost: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const isHost = room?.hostId === currentPlayer?.id;

  return (
    <GameContext.Provider value={{
      room,
      currentPlayer,
      setRoom,
      setCurrentPlayer,
      isHost
    }}>
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