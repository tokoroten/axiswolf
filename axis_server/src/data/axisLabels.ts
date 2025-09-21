// 個別の軸ラベル（対になる概念）
export interface AxisLabel {
  id: string;
  positive: string;
  negative: string;
}

export const axisLabels: AxisLabel[] = [
  // 評価・人気系（一般向け）
  { id: 'label1', positive: '子どもウケ', negative: '大人ウケ' },
  { id: 'label2', positive: 'アメリカで人気', negative: 'アメリカで不人気' },
  { id: 'label4', positive: '若者に人気', negative: '高齢者に人気' },
  { id: 'label5', positive: '都市部で人気', negative: '地方で人気' },
  { id: 'label8', positive: 'SNSで話題', negative: 'SNSで話題じゃない' },
  
  // 価格・経済系
  { id: 'label10', positive: '安い', negative: '高い' },
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
  { id: 'label32', positive: '季節限定', negative: '通年販売' },
  
  // ターゲット系
  { id: 'label33', positive: '男性向け', negative: '女性向け' },
  { id: 'label141', positive: '10代向け', negative: '50代向け' },
  { id: 'label142', positive: '独身向け', negative: '既婚者向け' },
  { id: 'label143', positive: '家族向け', negative: '一人暮らし向け' },
  { id: 'label145', positive: '学生向け', negative: '社会人向け' },
  { id: 'label153', positive: 'エコ意識高い人向け', negative: 'コスパ重視の人向け' },
  { id: 'label154', positive: 'テック好き向け', negative: 'アナログ好き向け' },
  { id: 'label155', positive: '都会人向け', negative: '田舎暮らし向け' },
  { id: 'label158', positive: '忙しい人向け', negative: '時間がある人向け' },
  { id: 'label159', positive: '理系', negative: '文系' },

  // 質感・感触系
  { id: 'label41', positive: 'やわらかい', negative: '硬い' },
  { id: 'label42', positive: 'つるつる', negative: 'ざらざら' },
  { id: 'label43', positive: 'もちもち', negative: 'パサパサ' },
  { id: 'label44', positive: 'ふわふわ', negative: 'ごつごつ' },
  { id: 'label45', positive: 'さらさら', negative: 'べたべた' },
  { id: 'label46', positive: 'しっとり', negative: 'カサカサ' },
  { id: 'label47', positive: 'プルプル', negative: 'カチカチ' },
  { id: 'label48', positive: 'もふもふ', negative: 'チクチク' },
  
  // 擬音・擬態語系（フーバなど）
  { id: 'label49', positive: 'キラキラ', negative: 'ドロドロ' },
  { id: 'label50', positive: 'ピカピカ', negative: 'ボロボロ' },
  { id: 'label51', positive: 'ツヤツヤ', negative: 'くすんでる' },
  { id: 'label52', positive: 'シャキシャキ', negative: 'ぐにゃぐにゃ' },
  { id: 'label53', positive: 'パリパリ', negative: 'しなしな' },
  { id: 'label54', positive: 'コリコリ', negative: 'ネバネバ' },
  { id: 'label55', positive: 'サクサク', negative: 'ねっとり' },
  { id: 'label56', positive: 'カリカリ', negative: 'ふにゃふにゃ' },

  // 味覚・風味系
  { id: 'label57', positive: '甘い', negative: '辛い' },
  { id: 'label58', positive: '酸っぱい', negative: '苦い' },
  { id: 'label59', positive: 'しょっぱい', negative: '薄味' },
  { id: 'label60', positive: 'こってり', negative: 'あっさり' },
  { id: 'label62', positive: 'スパイシー', negative: 'マイルド' },
  
  // 温度・状態系
  { id: 'label63', positive: '熱い', negative: '冷たい' },
  { id: 'label65', positive: '乾燥してる', negative: '湿ってる' },
  
  // サイズ・形状系
  { id: 'label67', positive: '大きい', negative: '小さい' },
  { id: 'label68', positive: '長い', negative: '短い' },
  { id: 'label69', positive: '太い', negative: '細い' },
  { id: 'label70', positive: '厚い', negative: '薄い' },
  { id: 'label71', positive: '重い', negative: '軽い' },
  { id: 'label72', positive: '丸い', negative: '角ばってる' },
  { id: 'label200', positive: '高い', negative: '低い' },
  { id: 'label201', positive: '深い', negative: '浅い' },
  { id: 'label202', positive: '広い', negative: '狭い' },
  { id: 'label203', positive: '多い', negative: '少ない' },
  
  // 速度・動き系
  { id: 'label73', positive: '速い', negative: '遅い' },
  { id: 'label74', positive: '激しい', negative: '穏やか' },
  
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
  { id: 'label84', positive: 'エモい', negative: 'エモくない' },
  { id: 'label85', positive: 'インスタ映え', negative: 'インスタ映えしない' },
  { id: 'label210', positive: '優しい', negative: '厳しい' },
  { id: 'label211', positive: '真面目', negative: 'ふざけている' },
  { id: 'label212', positive: 'ロマンチック', negative: '現実的' },
  { id: 'label213', positive: '素朴', negative: '洗練されている' },
  { id: 'label214', positive: '上品', negative: '下品' },
  { id: 'label215', positive: 'おしゃれ', negative: 'ださい' },
  { id: 'label216', positive: 'エレガント', negative: 'カジュアル' },
  { id: 'label217', positive: 'クール', negative: 'ホット' },
  { id: 'label218', positive: '清潔', negative: '不潔' },
  { id: 'label219', positive: '清楚', negative: '妖艶' },
  
  // 音象徴系（ブーバ・キキ効果）
  { id: 'label87', positive: 'まるっこい音', negative: 'とがった音' },
  { id: 'label88', positive: 'やわらかい名前', negative: 'かたい名前' },
  { id: 'label95', positive: '濁音が多め', negative: '清音が多め' },
  
  // 香り・匂い系
  { id: 'label90', positive: 'いい匂い', negative: '臭い' },
  { id: 'label92', positive: '天然の香り', negative: '人工的な香り' },
    
  // 使用頻度・場面系
  { id: 'label98', positive: '毎日使う', negative: 'たまに使う' },
  { id: 'label99', positive: '朝に使う', negative: '夜に使う' },
  { id: 'label100', positive: '室内で使う', negative: '屋外で使う' },
  { id: 'label101', positive: '一人で使う', negative: 'みんなで使う' },
  { id: 'label102', positive: '仕事で使う', negative: '家庭で使う' },
  { id: 'label129', positive: 'プライベートで使う', negative: 'ビジネスで使う' },
  { id: 'label130', positive: '学校で使う', negative: 'オフィスで使う' },
  { id: 'label131', positive: '休日に使う', negative: '平日に使う' },
  { id: 'label132', positive: '緊急時に使う', negative: '日常的に使う' },
  { id: 'label133', positive: 'フォーマルな場で使う', negative: 'カジュアルな場で使う' },
  { id: 'label134', positive: '子供が使う', negative: '大人が使う' },
  { id: 'label135', positive: '初心者向け', negative: 'プロ向け' },
  { id: 'label139', positive: '共有する', negative: '専有する' },
  { id: 'label140', positive: 'レクリエーション用', negative: '実用的' },
  
  // 製造・素材系
  { id: 'label103', positive: '天然素材', negative: '合成素材' },
      
  // 清潔・メンテナンス系
  { id: 'label121', positive: '洗いやすい', negative: '洗いにくい' },
  { id: 'label122', positive: 'メンテナンス簡単', negative: 'メンテナンス大変' },
  { id: 'label123', positive: '汚れやすい', negative: '汚れにくい' },
  
  // 所有・入手系
  { id: 'label125', positive: 'レア', negative: 'コモン' },
  { id: 'label126', positive: '免許が必要', negative: '免許不要' },
  { id: 'label127', positive: '手に入れやすい', negative: '手に入れにくい' },

  // 追加形容詞系
  { id: 'label230', positive: '強い', negative: '弱い' },
  { id: 'label231', positive: '美しい', negative: '醜い' },
  { id: 'label233', positive: '賢い', negative: '愚か' },
  { id: 'label234', positive: '勇敢', negative: '臆病' },
  { id: 'label235', positive: 'アクティブ', negative: 'パッシブ' },
  { id: 'label236', positive: 'ポジティブ', negative: 'ネガティブ' },
  { id: 'label237', positive: '明確', negative: '曖昧' },
  { id: 'label238', positive: '濃い', negative: '薄い' },
  { id: 'label239', positive: '鋭い', negative: '鈍い' },
  { id: 'label240', positive: '滑らか', negative: '粗い' },
  { id: 'label242', positive: '柔軟', negative: '硬直' },
  { id: 'label243', positive: '豪華', negative: '質素' },
  { id: 'label244', positive: 'モダン', negative: 'レトロ' },
  { id: 'label245', positive: 'オープン', negative: 'クローズド' },
  { id: 'label247', positive: '活発', negative: '不活発' },
  { id: 'label248', positive: '鮮やか', negative: 'くすんだ' },
  { id: 'label249', positive: 'リッチ', negative: 'プア' },
  { id: 'label250', positive: 'スムーズ', negative: 'ギクシャク' },
  { id: 'label251', positive: '繊細', negative: '大雑把' },
  { id: 'label253', positive: '安定', negative: '不安定' },
  { id: 'label254', positive: '便利', negative: '不便' },
  { id: 'label255', positive: '快適', negative: '不快' },
  { id: 'label256', positive: '安全', negative: '危険' },
  { id: 'label257', positive: '正確', negative: '不正確' },
  { id: 'label258', positive: '効率的', negative: '非効率' },
  { id: 'label259', positive: '独創的', negative: '平凡' },
];

// すべての軸ラベルを返す関数
export function getAxisLabelsByDifficulty(): AxisLabel[] {
  return axisLabels;
}