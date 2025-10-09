export interface PlayerName {
  id: number;
  name: string;
  color: string;
  bgColor: string;
}

export const playerNames: PlayerName[] = [
  { id: 1, name: '1.ルビー', color: '#FFFFFF', bgColor: '#DC143C' },
  { id: 2, name: '2.サファイア', color: '#FFFFFF', bgColor: '#082567' },
  { id: 3, name: '3.エメラルド', color: '#FFFFFF', bgColor: '#50C878' },
  { id: 4, name: '4.ダイヤ', color: '#333333', bgColor: '#E5E5E5' },
  { id: 5, name: '5.トパーズ', color: '#333333', bgColor: '#FFC87C' },
  { id: 6, name: '6.アメジスト', color: '#FFFFFF', bgColor: '#9966CC' },
  { id: 7, name: '7.オニキス', color: '#FFFFFF', bgColor: '#353839' },
  { id: 8, name: '8.アクアマリン', color: '#333333', bgColor: '#7FFFD4' },
];

export function getPlayerName(playerId: number): PlayerName {
  return playerNames[playerId - 1] || playerNames[0];
}