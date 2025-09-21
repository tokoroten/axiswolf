// 個別の軸ラベル（対になる概念）
export interface AxisLabel {
  id: string;
  positive: string;
  negative: string;
}

export const axisLabels: AxisLabel[] = [
  // 評価・人気系
  { id: 'label1', positive: '子どもウケ', negative: '大人ウケ' },
  { id: 'label2', positive: 'アメリカで人気', negative: 'アメリカで不人気' },
  { id: 'label4', positive: '若者に人気', negative: '高齢者に人気' },
  { id: 'label5', positive: '都市部で人気', negative: '地方で人気' },
  { id: 'label8', positive: 'SNSで話題', negative: 'SNSで話題じゃない' },

  // 価格・経済系
  { id: 'label10', positive: '安い', negative: '高い' },
  { id: 'label11', positive: '高級', negative: '庶民的' },
  { id: 'label12', positive: '富裕層向け', negative: '一般層向け' },

  // 健康・実用系
  { id: 'label17', positive: '健康的', negative: '不健康' },
  { id: 'label18', positive: '実用的', negative: '娯楽的' },
  { id: 'label19', positive: '環境に優しい', negative: '環境に悪い' },

  // スタイル・見た目系
  { id: 'label20', positive: 'かわいい', negative: 'かっこいい' },
  { id: 'label21', positive: 'シンプル', negative: '複雑' },
  { id: 'label22', positive: 'アナログ', negative: 'デジタル' },
  { id: 'label23', positive: '伝統的', negative: '革新的' },

  // 文化・地域系
  { id: 'label24', positive: '日本的', negative: '西洋的' },

  // 時間・歴史系
  { id: 'label30', positive: '古い', negative: '新しい' },
  { id: 'label31', positive: '歴史が長い', negative: '歴史が短い' },

  // ターゲット系
  { id: 'label33', positive: '男性向け', negative: '女性向け' },
  { id: 'label141', positive: '子ども向け', negative: '大人向け' },
  { id: 'label143', positive: '家族向け', negative: '一人向け' },
  { id: 'label146', positive: 'アウトドア向け', negative: 'インドア向け' },

  // 質感・感触系（汎用的なもののみ）
  { id: 'label41', positive: 'やわらかい', negative: '硬い' },
  { id: 'label42', positive: 'つるつる', negative: 'ざらざら' },
  { id: 'label44', positive: 'ふわふわ', negative: 'ごつごつ' },
  { id: 'label45', positive: 'さらさら', negative: 'べたべた' },

  // 見た目・状態系
  { id: 'label49', positive: 'キラキラ', negative: 'くすんでる' },
  { id: 'label50', positive: 'ピカピカ', negative: 'ボロボロ' },

  // 温度系
  { id: 'label63', positive: '熱い', negative: '冷たい' },

  // サイズ・形状系
  { id: 'label67', positive: '大きい', negative: '小さい' },
  { id: 'label68', positive: '長い', negative: '短い' },
  { id: 'label69', positive: '太い', negative: '細い' },
  { id: 'label70', positive: '厚い', negative: '薄い' },
  { id: 'label71', positive: '重い', negative: '軽い' },
  { id: 'label72', positive: '丸い', negative: '角ばってる' },

  // 速度・動き系
  { id: 'label73', positive: '速い', negative: '遅い' },
  { id: 'label74', positive: '激しい', negative: '穏やか' },
  { id: 'label75', positive: '動的', negative: '静的' },

  // 音・視覚系
  { id: 'label76', positive: 'うるさい', negative: '静か' },
  { id: 'label77', positive: '明るい', negative: '暗い' },
  { id: 'label78', positive: 'カラフル', negative: 'モノトーン' },
  { id: 'label79', positive: '派手', negative: '地味' },

  // 感情・印象系
  { id: 'label80', positive: '楽しい', negative: '退屈' },
  { id: 'label81', positive: 'ワクワク', negative: 'ドキドキ' },
  { id: 'label82', positive: 'ほっこり', negative: 'スリリング' },
  { id: 'label83', positive: '懐かしい', negative: '最先端' },
  { id: 'label85', positive: 'インスタ映え', negative: 'インスタ映えしない' },

  // 使用頻度系（汎用的なもののみ）
  { id: 'label98', positive: '毎日使う', negative: 'たまに使う' },
  { id: 'label100', positive: '室内用', negative: '屋外用' },
  { id: 'label101', positive: '一人用', negative: 'みんな用' },
  { id: 'label133', positive: 'フォーマル', negative: 'カジュアル' },
  { id: 'label135', positive: '初心者向け', negative: 'プロ向け' },

  // 素材系
  { id: 'label103', positive: '天然', negative: '人工' },
  { id: 'label107', positive: '使い捨て', negative: '繰り返し使える' },

  // 所有・入手系
  { id: 'label125', positive: 'レア', negative: 'よくある' },

  // ビジネス系
  { id: 'label34', positive: '有名', negative: '無名' },
];

// すべての軸ラベルを返す関数
export function getAxisLabelsByDifficulty(): AxisLabel[] {
  return axisLabels;
}