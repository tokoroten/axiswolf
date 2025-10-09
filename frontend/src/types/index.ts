export interface Axis {
  id: string;
  horizontal: {
    left: string;
    right: string;
  };
  vertical: {
    top: string;
    bottom: string;
  };
}

export interface Mutator {
  id: string;
  name: string;
  description: string;
  effect: string;
}

export interface Player {
  id: string;
  name: string;
  role: 'citizen' | 'mutator';
  mutatorInstruction?: Mutator;
}

export interface Room {
  code: string;
  seed: number;
  players: Player[];
  currentAxis: Axis;
  currentMutator: Mutator;
  hostId: string;
  status: 'waiting' | 'playing' | 'finished';
}