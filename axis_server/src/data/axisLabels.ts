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
  { id: 'label900', positive: '世界市場において日本企業のマーケットシェアが大きい', negative: '世界市場において日本企業のマーケットシェアが小さい', difficulty: 'hard' },

  // 時間・歴史系
  { id: 'label30', positive: '古い', negative: '新しい', difficulty: 'easy' },
  { id: 'label31', positive: '歴史が長い', negative: '歴史が短い', difficulty: 'easy' },
  { id: 'label32', positive: '季節限定', negative: '通年販売', difficulty: 'easy' },
  
  // ターゲット系
  { id: 'label33', positive: '男性向け', negative: '女性向け', difficulty: 'easy' },
  { id: 'label141', positive: '10代向け', negative: '50代向け', difficulty: 'easy' },
  { id: 'label142', positive: '独身向け', negative: '既婚者向け', difficulty: 'easy' },
  { id: 'label143', positive: '家族向け', negative: '一人暮らし向け', difficulty: 'easy' },
  { id: 'label145', positive: '学生向け', negative: '社会人向け', difficulty: 'easy' },
  { id: 'label146', positive: 'アウトドア派向け', negative: 'インドア派向け', difficulty: 'easy' },
  { id: 'label147', positive: '健康志向', negative: '味重視', difficulty: 'easy' },
  { id: 'label148', positive: 'ダイエット中の人向け', negative: '筋トレしてる人向け', difficulty: 'easy' },
  { id: 'label153', positive: 'エコ意識高い人向け', negative: 'コスパ重視の人向け', difficulty: 'easy' },
  { id: 'label154', positive: 'テック好き向け', negative: 'アナログ好き向け', difficulty: 'easy' },
  { id: 'label155', positive: '都会人向け', negative: '田舎暮らし向け', difficulty: 'easy' },
  { id: 'label158', positive: '忙しい人向け', negative: '時間がある人向け', difficulty: 'easy' },
  { id: 'label159', positive: '理系', negative: '文系', difficulty: 'easy' },
  { id: 'label160', positive: 'クリエイティブな人向け', negative: '論理的な人向け', difficulty: 'hard' },

  // 質感・感触系
  { id: 'label41', positive: 'やわらかい', negative: '硬い', difficulty: 'easy' },
  { id: 'label42', positive: 'つるつる', negative: 'ざらざら', difficulty: 'easy' },
  { id: 'label43', positive: 'もちもち', negative: 'パサパサ', difficulty: 'easy' },
  { id: 'label44', positive: 'ふわふわ', negative: 'ごつごつ', difficulty: 'easy' },
  { id: 'label45', positive: 'さらさら', negative: 'べたべた', difficulty: 'easy' },
  { id: 'label46', positive: 'しっとり', negative: 'カサカサ', difficulty: 'easy' },
  { id: 'label47', positive: 'プルプル', negative: 'カチカチ', difficulty: 'easy' },
  { id: 'label48', positive: 'もふもふ', negative: 'チクチク', difficulty: 'easy' },
  
  // 擬音・擬態語系（フーバなど）
  { id: 'label49', positive: 'キラキラ', negative: 'ドロドロ', difficulty: 'easy' },
  { id: 'label50', positive: 'ピカピカ', negative: 'ボロボロ', difficulty: 'easy' },
  { id: 'label51', positive: 'ツヤツヤ', negative: 'くすんでる', difficulty: 'easy' },
  { id: 'label52', positive: 'シャキシャキ', negative: 'ぐにゃぐにゃ', difficulty: 'easy' },
  { id: 'label53', positive: 'パリパリ', negative: 'しなしな', difficulty: 'easy' },
  { id: 'label54', positive: 'コリコリ', negative: 'ネバネバ', difficulty: 'easy' },
  { id: 'label55', positive: 'サクサク', negative: 'ねっとり', difficulty: 'easy' },
  { id: 'label56', positive: 'カリカリ', negative: 'ふにゃふにゃ', difficulty: 'easy' },

  // 味覚・風味系
  { id: 'label57', positive: '甘い', negative: '辛い', difficulty: 'easy' },
  { id: 'label58', positive: '酸っぱい', negative: '苦い', difficulty: 'easy' },
  { id: 'label59', positive: 'しょっぱい', negative: '薄味', difficulty: 'easy' },
  { id: 'label60', positive: 'こってり', negative: 'あっさり', difficulty: 'easy' },
  { id: 'label62', positive: 'スパイシー', negative: 'マイルド', difficulty: 'easy' },
  
  // 温度・状態系
  { id: 'label63', positive: '熱い', negative: '冷たい', difficulty: 'easy' },
  { id: 'label65', positive: '乾燥してる', negative: '湿ってる', difficulty: 'easy' },
  { id: 'label66', positive: '液体', negative: '固体', difficulty: 'easy' },
  
  // サイズ・形状系
  { id: 'label67', positive: '大きい', negative: '小さい', difficulty: 'easy' },
  { id: 'label68', positive: '長い', negative: '短い', difficulty: 'easy' },
  { id: 'label69', positive: '太い', negative: '細い', difficulty: 'easy' },
  { id: 'label70', positive: '厚い', negative: '薄い', difficulty: 'easy' },
  { id: 'label71', positive: '重い', negative: '軽い', difficulty: 'easy' },
  { id: 'label72', positive: '丸い', negative: '角ばってる', difficulty: 'easy' },
  
  // 速度・動き系
  { id: 'label73', positive: '速い', negative: '遅い', difficulty: 'easy' },
  { id: 'label74', positive: '激しい', negative: '穏やか', difficulty: 'easy' },
  { id: 'label75', positive: '動的', negative: '静的', difficulty: 'easy' },
  
  // 音・視覚系
  { id: 'label76', positive: 'うるさい', negative: '静か', difficulty: 'easy' },
  { id: 'label77', positive: '明るい', negative: '暗い', difficulty: 'easy' },
  { id: 'label78', positive: 'カラフル', negative: 'モノトーン', difficulty: 'easy' },
  { id: 'label79', positive: '派手', negative: '地味', difficulty: 'easy' },
  
  // 感情・印象系
  { id: 'label80', positive: '楽しい', negative: '退屈', difficulty: 'easy' },
  { id: 'label81', positive: 'ワクワク', negative: 'ドキドキ', difficulty: 'easy' },
  { id: 'label82', positive: 'ほっこり', negative: 'スリリング', difficulty: 'easy' },
  { id: 'label83', positive: 'ノスタルジック', negative: 'フューチャリスティック', difficulty: 'hard' },
  { id: 'label84', positive: 'エモい', negative: 'エモくない', difficulty: 'easy' },
  { id: 'label85', positive: 'インスタ映え', negative: 'インスタ映えしない', difficulty: 'easy' },
  
  // 音象徴系（ブーバ・キキ効果）
  { id: 'label86', positive: 'ブーバっぽい', negative: 'キキっぽい', difficulty: 'hard' },
  { id: 'label87', positive: 'まるっこい音', negative: 'とがった音', difficulty: 'easy' },
  { id: 'label88', positive: 'やわらかい名前', negative: 'かたい名前', difficulty: 'easy' },
  { id: 'label95', positive: '濁音が多め', negative: '清音が多め', difficulty: 'hard' },
  
  // 香り・匂い系
  { id: 'label89', positive: '香りが強い', negative: '無臭', difficulty: 'easy' },
  { id: 'label90', positive: 'いい匂い', negative: '臭い', difficulty: 'easy' },
  { id: 'label91', positive: 'フルーティー', negative: 'スパイシー', difficulty: 'easy' },
  { id: 'label92', positive: '天然の香り', negative: '人工的な香り', difficulty: 'easy' },
  
  // 保存・賞味期限系
  { id: 'label93', positive: '日持ちする', negative: '日持ちしない', difficulty: 'easy' },
  { id: 'label94', positive: '常温保存', negative: '要冷蔵', difficulty: 'easy' },
  { id: 'label96', positive: '生もの', negative: '加工品', difficulty: 'easy' },
  { id: 'label97', positive: 'レトルト', negative: '手作り', difficulty: 'easy' },
  
  // 使用頻度・場面系
  { id: 'label98', positive: '毎日使う', negative: 'たまに使う', difficulty: 'easy' },
  { id: 'label99', positive: '朝に使う', negative: '夜に使う', difficulty: 'easy' },
  { id: 'label100', positive: '室内で使う', negative: '屋外で使う', difficulty: 'easy' },
  { id: 'label101', positive: '一人で使う', negative: 'みんなで使う', difficulty: 'easy' },
  { id: 'label102', positive: '仕事で使う', negative: '家庭で使う', difficulty: 'easy' },
  { id: 'label129', positive: 'プライベートで使う', negative: 'ビジネスで使う', difficulty: 'easy' },
  { id: 'label130', positive: '学校で使う', negative: 'オフィスで使う', difficulty: 'easy' },
  { id: 'label131', positive: '休日に使う', negative: '平日に使う', difficulty: 'easy' },
  { id: 'label132', positive: '緊急時に使う', negative: '日常的に使う', difficulty: 'easy' },
  { id: 'label133', positive: 'フォーマルな場で使う', negative: 'カジュアルな場で使う', difficulty: 'easy' },
  { id: 'label134', positive: '子供が使う', negative: '大人が使う', difficulty: 'easy' },
  { id: 'label135', positive: '初心者向け', negative: 'プロ向け', difficulty: 'easy' },
  { id: 'label136', positive: '右利き用', negative: '左利き用', difficulty: 'hard' },
  { id: 'label137', positive: '座って使う', negative: '立って使う', difficulty: 'easy' },
  { id: 'label138', positive: '手で使う', negative: '足で使う', difficulty: 'easy' },
  { id: 'label139', positive: '共有する', negative: '専有する', difficulty: 'easy' },
  { id: 'label140', positive: 'レクリエーション用', negative: '実用的', difficulty: 'easy' },
  
  // 製造・素材系
  { id: 'label103', positive: '天然素材', negative: '合成素材', difficulty: 'easy' },
  { id: 'label104', positive: '金属製', negative: 'プラスチック製', difficulty: 'easy' },
  { id: 'label105', positive: '木製', negative: 'ガラス製', difficulty: 'easy' },
  { id: 'label106', positive: '手作り', negative: '機械製造', difficulty: 'hard' },
  { id: 'label107', positive: '使い捨て', negative: '繰り返し使える', difficulty: 'easy' },
  
  // 乗り物特有系
  { id: 'label108', positive: '人力', negative: 'エンジン付き', difficulty: 'easy' },
  { id: 'label109', positive: '陸上', negative: '水上・空中', difficulty: 'easy' },
  { id: 'label110', positive: '公共交通', negative: '個人所有', difficulty: 'easy' },
  { id: 'label111', positive: '乗客が多い', negative: '乗客が少ない', difficulty: 'easy' },
  { id: 'label112', positive: '電動', negative: 'ガソリン', difficulty: 'easy' },
  { id: 'label113', positive: '自動運転', negative: '手動運転', difficulty: 'hard' },
  
  // 食べ物特有系
  { id: 'label114', positive: '主食', negative: 'おかず・おやつ', difficulty: 'easy' },
  { id: 'label115', positive: '和食', negative: '洋食', difficulty: 'easy' },
  { id: 'label116', positive: '肉系', negative: '野菜系', difficulty: 'easy' },
  { id: 'label117', positive: '炭水化物多め', negative: 'タンパク質多め', difficulty: 'hard' },
  { id: 'label118', positive: '朝食向き', negative: '夕食向き', difficulty: 'easy' },
  { id: 'label119', positive: 'アルコール入り', negative: 'ノンアルコール', difficulty: 'easy' },
  { id: 'label120', positive: '炭酸', negative: '非炭酸', difficulty: 'easy' },
  
  // 清潔・メンテナンス系
  { id: 'label121', positive: '洗いやすい', negative: '洗いにくい', difficulty: 'easy' },
  { id: 'label122', positive: 'メンテナンス簡単', negative: 'メンテナンス大変', difficulty: 'easy' },
  { id: 'label123', positive: '汚れやすい', negative: '汚れにくい', difficulty: 'easy' },
  { id: 'label124', positive: '錆びやすい', negative: '錆びにくい', difficulty: 'hard' },
  
  // 所有・入手系
  { id: 'label125', positive: 'レア', negative: 'どこでも買える', difficulty: 'easy' },
  { id: 'label126', positive: '免許が必要', negative: '免許不要', difficulty: 'easy' },
  { id: 'label127', positive: 'レンタル', negative: '購入', difficulty: 'easy' },
  { id: 'label128', positive: 'サブスク', negative: '買い切り', difficulty: 'hard' },
  
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