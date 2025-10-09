// テーマシステムの定義
export type ThemeType = 'food' | 'daily' | 'entertainment' | 'animal' | 'place' | 'vehicle' | 'sport' | 'mixed' | 'random' | 'pack1' | 'pack2' | 'pack3' | 'pack4' | 'pack5';

export interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  cardCategories: string[];  // このテーマで使用するカードカテゴリー
  onlineOnly?: boolean;  // オンラインモード専用かどうか
}

// テーマの定義
export const themes: Theme[] = [
  // オンラインモード用テーマ
  {
    id: 'food',
    name: '食べ物',
    description: '食べ物や飲み物に関するテーマ',
    cardCategories: ['food'],
    onlineOnly: true
  },
  {
    id: 'daily',
    name: '日用品',
    description: '日用品や道具に関するテーマ',
    cardCategories: ['item'],
    onlineOnly: true
  },
  {
    id: 'entertainment',
    name: 'エンタメ',
    description: 'エンターテインメントや文化に関するテーマ',
    cardCategories: ['entertainment', 'sport'],
    onlineOnly: true
  },
  {
    id: 'animal',
    name: '動物',
    description: '動物や生き物に関するテーマ',
    cardCategories: ['animal'],
    onlineOnly: true
  },
  {
    id: 'place',
    name: '場所',
    description: '場所や地域に関するテーマ',
    cardCategories: ['place'],
    onlineOnly: true
  },
  {
    id: 'vehicle',
    name: '乗り物',
    description: '乗り物や交通手段に関するテーマ',
    cardCategories: ['vehicle'],
    onlineOnly: true
  },
  {
    id: 'sport',
    name: 'スポーツ',
    description: 'スポーツや運動に関するテーマ',
    cardCategories: ['sport'],
    onlineOnly: true
  },
  // 通常プレイ用カードパック（全カテゴリから軸を選択）
  {
    id: 'pack1',
    name: 'カードパック1',
    description: '基本セット',
    cardCategories: [],  // 通常プレイでは使用しない
    onlineOnly: false
  },
  {
    id: 'pack2',
    name: 'カードパック2',
    description: '拡張セット1',
    cardCategories: [],
    onlineOnly: false
  },
  {
    id: 'pack3',
    name: 'カードパック3',
    description: '拡張セット2',
    cardCategories: [],
    onlineOnly: false
  },
  {
    id: 'pack4',
    name: 'カードパック4',
    description: '拡張セット3',
    cardCategories: [],
    onlineOnly: false
  },
  {
    id: 'pack5',
    name: 'カードパック5',
    description: '拡張セット4',
    cardCategories: [],
    onlineOnly: false
  }
];

// テーマIDからテーマを取得
export function getThemeById(id: ThemeType): Theme | undefined {
  return themes.find(theme => theme.id === id);
}

// ランダムにテーマを選択（random以外）
export function getRandomTheme(seed: number): Theme {
  const selectableThemes = themes.filter(t => t.id !== 'random' && t.id !== 'mixed');
  const index = seed % selectableThemes.length;
  return selectableThemes[index];
}