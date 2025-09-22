// テーマシステムの定義
export type ThemeType = 'food' | 'daily' | 'entertainment' | 'animal' | 'place' | 'vehicle' | 'mixed' | 'random';

export interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  cardCategories: string[];  // このテーマで使用するカードカテゴリー
}

// テーマの定義
export const themes: Theme[] = [
  {
    id: 'food',
    name: '食べ物',
    description: '食べ物や飲み物に関するテーマ',
    cardCategories: ['food']
  },
  {
    id: 'daily',
    name: '日用品',
    description: '日用品や道具に関するテーマ',
    cardCategories: ['item']
  },
  {
    id: 'entertainment',
    name: 'エンタメ',
    description: 'エンターテインメントや文化に関するテーマ',
    cardCategories: ['entertainment', 'sport']
  },
  {
    id: 'animal',
    name: '動物',
    description: '動物や生き物に関するテーマ',
    cardCategories: ['animal']
  },
  {
    id: 'place',
    name: '場所',
    description: '場所や地域に関するテーマ',
    cardCategories: ['place']
  },
  {
    id: 'vehicle',
    name: '乗り物',
    description: '乗り物や交通手段に関するテーマ',
    cardCategories: ['vehicle']
  },
  {
    id: 'mixed',
    name: 'ミックス',
    description: 'すべてのカテゴリーから選択（上級者向け）',
    cardCategories: ['food', 'item', 'entertainment', 'sport', 'animal', 'place', 'plant', 'weather', 'vehicle']
  },
  {
    id: 'random',
    name: 'ランダム',
    description: 'ラウンドごとにテーマが変わる',
    cardCategories: [] // ラウンドごとに決定
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