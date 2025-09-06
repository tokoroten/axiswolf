import type { Player, Mutator } from '../types';

export function assignRoles(
  players: Player[],
  seed: number,
  mutator: Mutator
): Player[] {
  if (players.length === 0) return players;
  
  // シード値とプレイヤー数から決定的にズレ者を選ぶ
  const mutatorIndex = seed % players.length;
  
  return players.map((player, index) => ({
    ...player,
    role: index === mutatorIndex ? 'mutator' : 'citizen',
    mutatorInstruction: index === mutatorIndex ? mutator : undefined
  }));
}

export function selectRandomItem<T>(items: T[], seed: number): T {
  const index = seed % items.length;
  return items[index];
}