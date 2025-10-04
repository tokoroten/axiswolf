// プレイヤースロットごとの色を定義
export const PLAYER_COLORS = [
  { bg: 'bg-red-500', text: 'text-white', name: '赤' },
  { bg: 'bg-blue-500', text: 'text-white', name: '青' },
  { bg: 'bg-green-500', text: 'text-white', name: '緑' },
  { bg: 'bg-yellow-500', text: 'text-gray-900', name: '黄' },
  { bg: 'bg-purple-500', text: 'text-white', name: '紫' },
  { bg: 'bg-pink-500', text: 'text-white', name: 'ピンク' },
  { bg: 'bg-orange-500', text: 'text-white', name: 'オレンジ' },
  { bg: 'bg-cyan-500', text: 'text-white', name: '水色' },
];

export function getPlayerColor(slot: number) {
  return PLAYER_COLORS[slot % PLAYER_COLORS.length];
}

export function getPlayerColorStyle(slot: number) {
  const colors = [
    '#ef4444', // red-500
    '#3b82f6', // blue-500
    '#10b981', // green-500
    '#eab308', // yellow-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
    '#f97316', // orange-500
    '#06b6d4', // cyan-500
  ];
  return colors[slot % colors.length];
}
