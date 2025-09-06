// 個別の軸ラベル（対になる概念）
export interface AxisLabel {
  id: string;
  positive: string;
  negative: string;
  difficulty: 'easy' | 'hard'; // easy: 一般向け, hard: インテリ向け
}

export const axisLabels: AxisLabel[] = [
  // 評価・人気系（一般向け）
  { id: 'label1', positive: '子どもウケ', negative: '大人ウケ', difficulty: 'easy' },
  { id: 'label2', positive: 'アメリカで人気', negative: 'アメリカで不人気', difficulty: 'easy' },
  { id: 'label3', positive: 'ヨーロッパで人気', negative: 'アジアで人気', difficulty: 'hard' },
  { id: 'label4', positive: '若者に人気', negative: '高齢者に人気', difficulty: 'easy' },
  { id: 'label5', positive: '都市部で人気', negative: '地方で人気', difficulty: 'easy' },
  { id: 'label6', positive: '関東で人気', negative: '関西で人気', difficulty: 'hard' },
  { id: 'label7', positive: '批評家評価高い', negative: '大衆評価高い', difficulty: 'hard' },
  { id: 'label8', positive: 'SNSで話題', negative: 'SNSで話題じゃない', difficulty: 'easy' },
  { id: 'label9', positive: 'Z世代に人気', negative: 'ミレニアル世代に人気', difficulty: 'hard' },
  
  // 価格・経済系
  { id: 'label10', positive: '安い', negative: '高い', difficulty: 'easy' },
  { id: 'label11', positive: '高級ブランド', negative: '庶民ブランド', difficulty: 'easy' },
  { id: 'label12', positive: '富裕層向け', negative: '一般層向け', difficulty: 'easy' },
  { id: 'label13', positive: '株価が高い', negative: '株価が低い', difficulty: 'hard' },
  { id: 'label14', positive: '利益率が高い', negative: '利益率が低い', difficulty: 'hard' },
  { id: 'label15', positive: '広告費が少ない', negative: '広告費が多い', difficulty: 'hard' },
  { id: 'label16', positive: 'コロナで売上増', negative: 'コロナで売上減', difficulty: 'hard' },
  
  // 健康・実用系
  { id: 'label17', positive: '健康的', negative: '不健康', difficulty: 'easy' },
  { id: 'label18', positive: '実用的', negative: '娯楽的', difficulty: 'easy' },
  { id: 'label19', positive: '環境に優しい', negative: '環境に悪い', difficulty: 'easy' },
  
  // スタイル・見た目系
  { id: 'label20', positive: 'かわいい', negative: 'かっこいい', difficulty: 'easy' },
  { id: 'label21', positive: 'シンプル', negative: '複雑', difficulty: 'easy' },
  { id: 'label22', positive: 'アナログ', negative: 'デジタル', difficulty: 'easy' },
  { id: 'label23', positive: '伝統的', negative: '革新的', difficulty: 'easy' },
  
  // 文化・地域系
  { id: 'label24', positive: '日本的', negative: '西洋的', difficulty: 'easy' },
  { id: 'label25', positive: '国内生産', negative: '海外生産', difficulty: 'hard' },
  { id: 'label26', positive: '日本で売上高い', negative: '日本で売上低い', difficulty: 'hard' },
  { id: 'label27', positive: '国際展開', negative: '国内限定', difficulty: 'hard' },
  { id: 'label28', positive: '輸出が多い', negative: '輸入が多い', difficulty: 'hard' },
  { id: 'label29', positive: 'サブカル', negative: 'メインカルチャー', difficulty: 'hard' },
  
  // 時間・歴史系
  { id: 'label30', positive: '古い', negative: '新しい', difficulty: 'easy' },
  { id: 'label31', positive: '歴史が長い', negative: '歴史が短い', difficulty: 'easy' },
  { id: 'label32', positive: '季節限定', negative: '通年販売', difficulty: 'easy' },
  
  // ターゲット系
  { id: 'label33', positive: '男性向け', negative: '女性向け', difficulty: 'easy' },
  
  // ビジネス系
  { id: 'label34', positive: '世界的に有名', negative: '世界的に無名', difficulty: 'easy' },
  { id: 'label35', positive: '成長企業', negative: '衰退企業', difficulty: 'hard' },
  { id: 'label36', positive: '政府支援あり', negative: '政府支援なし', difficulty: 'hard' },
  { id: 'label37', positive: '個人経営', negative: '大企業', difficulty: 'easy' },
  { id: 'label38', positive: '競合が多い', negative: '競合が少ない', difficulty: 'hard' },
  { id: 'label39', positive: '市場シェア大', negative: '市場シェア小', difficulty: 'hard' },
  { id: 'label40', positive: 'オンライン販売中心', negative: '実店舗販売中心', difficulty: 'easy' },
];

// 難易度でフィルタリングする関数
export function getAxisLabelsByDifficulty(mode: 'normal' | 'expert'): AxisLabel[] {
  if (mode === 'normal') {
    // 一般向け: 低難易度のみ
    return axisLabels.filter(label => label.difficulty === 'easy');
  } else {
    // インテリ向け: 低難易度 + 高難易度（すべて）
    return axisLabels;
  }
}