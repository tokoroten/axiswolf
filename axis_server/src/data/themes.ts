// テーマシステムの定義
export type ThemeType = 'food' | 'daily' | 'entertainment' | 'animal' | 'place' | 'vehicle' | 'mixed' | 'random';

export interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  cardCategories: string[];  // このテーマで使用するカードカテゴリー
  compatibleAxisIds: string[]; // このテーマで使用可能な軸ラベルID
}

// テーマの定義
export const themes: Theme[] = [
  {
    id: 'food',
    name: '食べ物',
    description: '食べ物や飲み物に関するテーマ',
    cardCategories: ['food'],
    compatibleAxisIds: [
      // 味覚系
      'label57', 'label58', 'label59', 'label60', 'label62',
      // 温度系
      'label63',
      // 質感系（食感）
      'label43', 'label52', 'label53', 'label54', 'label55', 'label56',
      // 擬音系（全テーマ共通）
      'label49', 'label50', 'label51', 'label52', 'label53', 'label54', 'label55', 'label56',
      // 健康系
      'label17',
      // 価格系
      'label10', 'label11', 'label12',
      // サイズ系
      'label67', 'label70',
      // 見た目系
      'label78', 'label79',
      // 共通形容詞
      'label231', 'label232', 'label248', 'label255'
    ]
  },
  {
    id: 'daily',
    name: '日用品',
    description: '日用品や道具に関するテーマ',
    cardCategories: ['item'],
    compatibleAxisIds: [
      // サイズ・形状系
      'label67', 'label68', 'label69', 'label70', 'label71', 'label72',
      'label200', 'label201', 'label202', 'label203',
      // 質感系
      'label41', 'label42', 'label44', 'label45',
      // 擬音系（全テーマ共通）
      'label49', 'label50', 'label51', 'label52', 'label53', 'label54', 'label55', 'label56',
      // 素材系
      'label103', 'label107',
      // 使用頻度系
      'label98', 'label100', 'label101', 'label133', 'label135',
      // 清潔系
      'label121', 'label122', 'label123',
      // 価格系
      'label10', 'label12',
      // 見た目系
      'label21', 'label22', 'label77', 'label78', 'label79',
      // 共通形容詞
      'label230', 'label231', 'label243', 'label254', 'label255', 'label256'
    ]
  },
  {
    id: 'entertainment',
    name: 'エンタメ',
    description: 'エンターテインメントや文化に関するテーマ',
    cardCategories: ['entertainment', 'sport'],
    compatibleAxisIds: [
      // 感情・印象系
      'label80', 'label81', 'label82', 'label83', 'label85',
      'label210', 'label211', 'label212', 'label213', 'label214', 'label215',
      // 擬音系（全テーマ共通）
      'label49', 'label50', 'label51', 'label52', 'label53', 'label54', 'label55', 'label56',
      // 時間系
      'label30', 'label31',
      // ターゲット系
      'label33', 'label141', 'label143',
      // 人気系
      'label1', 'label2', 'label4', 'label5', 'label8',
      // スタイル系
      'label20', 'label23',
      // 文化系
      'label24',
      // 速度・動き系
      'label73', 'label74',
      // 音・視覚系
      'label76', 'label77', 'label78', 'label79',
      // 共通形容詞
      'label34', 'label234', 'label236', 'label244', 'label259'
    ]
  },
  {
    id: 'animal',
    name: '動物',
    description: '動物や生き物に関するテーマ',
    cardCategories: ['animal'],
    compatibleAxisIds: [
      // サイズ系
      'label67', 'label68', 'label69', 'label71',
      // 速度系
      'label73', 'label74',
      // 見た目系
      'label20', 'label77', 'label78', 'label79',
      // 質感系（毛並みなど）
      'label41', 'label44', 'label48',
      // 擬音系（全テーマ共通）
      'label49', 'label50', 'label51', 'label52', 'label53', 'label54', 'label55', 'label56',
      // 音系
      'label76',
      // 性格系
      'label210', 'label234', 'label235',
      // 共通形容詞
      'label230', 'label231', 'label232', 'label233', 'label256', 'label259'
    ]
  },
  {
    id: 'place',
    name: '場所',
    description: '場所や地域に関するテーマ',
    cardCategories: ['place'],
    compatibleAxisIds: [
      // サイズ系
      'label67', 'label200', 'label201', 'label202',
      // 温度系
      'label63',
      // 見た目系
      'label77', 'label78', 'label79',
      // 擬音系（全テーマ共通）
      'label49', 'label50', 'label51', 'label52', 'label53', 'label54', 'label55', 'label56',
      // 音系
      'label76',
      // 人気系
      'label1', 'label4', 'label5', 'label8',
      // 文化系
      'label24',
      // 時間系
      'label30', 'label31',
      // 共通形容詞
      'label34', 'label213', 'label218', 'label231', 'label243', 'label244', 'label255', 'label256'
    ]
  },
  {
    id: 'vehicle',
    name: '乗り物',
    description: '乗り物や交通手段に関するテーマ',
    cardCategories: ['vehicle'],
    compatibleAxisIds: [
      // サイズ系
      'label67', 'label68', 'label69', 'label71', 'label200', 'label202',
      // 速度系
      'label73', 'label74', 'label75',
      // 見た目系
      'label20', 'label21', 'label22', 'label23', 'label78', 'label79',
      // 擬音系（全テーマ共通）
      'label49', 'label50', 'label51', 'label52', 'label53', 'label54', 'label55', 'label56',
      // 音系
      'label76',
      // 価格系
      'label10', 'label11', 'label12',
      // 環境系
      'label19',
      // 共通形容詞
      'label34', 'label230', 'label231', 'label243', 'label244', 'label254', 'label255', 'label256', 'label258', 'label259'
    ]
  },
  {
    id: 'mixed',
    name: 'ミックス',
    description: 'すべてのカテゴリーから選択（上級者向け）',
    cardCategories: ['food', 'item', 'entertainment', 'sport', 'animal', 'place', 'plant', 'weather', 'vehicle'],
    compatibleAxisIds: [] // すべての軸を使用可能（空配列は全部OKの意味）
  },
  {
    id: 'random',
    name: 'ランダム',
    description: 'ラウンドごとにテーマが変わる',
    cardCategories: [], // ラウンドごとに決定
    compatibleAxisIds: [] // ラウンドごとに決定
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