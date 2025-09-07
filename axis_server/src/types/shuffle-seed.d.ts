declare module 'shuffle-seed' {
  export function shuffle<T>(array: T[], seed: string): T[];
  export function unshuffle<T>(array: T[], seed: string): T[];
}