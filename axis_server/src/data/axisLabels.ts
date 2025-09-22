import type { ThemeType } from './themes';

// 個別の軸ラベル（対になる概念）
export interface AxisLabel {
  id: string;
  positive: string;
  negative: string;
  themes: ThemeType[]; // この軸が適用されるテーマ
  description?: string; // 軸の説明（オプション）
}

export const axisLabels: AxisLabel[] = [
  // 評価・人気系
  { id: 'popularity_kids', positive: '子どもウケ', negative: '大人ウケ', themes: ['entertainment', 'place'], description: '年齢層による人気度' },
  { id: 'popularity_us', positive: 'アメリカで人気', negative: 'アメリカで不人気', themes: ['entertainment'], description: 'アメリカでの人気度' },
  { id: 'popularity_young', positive: '若者に人気', negative: '高齢者に人気', themes: ['entertainment', 'place'], description: '世代間の人気差' },
  { id: 'popularity_urban', positive: '都市部で人気', negative: '地方で人気', themes: ['entertainment', 'place'], description: '地域による人気差' },
  { id: 'popularity_sns', positive: 'SNSで話題', negative: 'SNSで話題じゃない', themes: ['entertainment', 'place'], description: 'SNSでの話題性' },

  // 価格・経済系
  { id: 'price_level', positive: '安い', negative: '高い', themes: ['food', 'daily', 'vehicle'], description: '価格帯' },
  { id: 'price_target', positive: '富裕層向け', negative: '一般層向け', themes: ['food', 'daily', 'vehicle'], description: 'ターゲット層' },

  // 健康・実用系
  { id: 'health', positive: '健康的', negative: '不健康', themes: ['food'], description: '健康への影響' },
  { id: 'practical', positive: '実用的', negative: '娯楽的', themes: ['daily'], description: '実用性レベル' },
  { id: 'eco', positive: '環境に優しい', negative: '環境に悪い', themes: ['vehicle'], description: '環境への影響' },

  // スタイル・見た目系
  { id: 'cute_cool', positive: 'かわいい', negative: 'かっこいい', themes: ['entertainment', 'animal', 'vehicle'], description: '見た目の印象' },
  { id: 'simple_complex', positive: 'シンプル', negative: '複雑', themes: ['daily', 'vehicle'], description: 'デザインの複雑さ' },
  { id: 'analog_digital', positive: 'アナログ', negative: 'デジタル', themes: ['daily', 'vehicle'], description: '技術タイプ' },
  { id: 'traditional_modern', positive: '伝統的', negative: '革新的', themes: ['entertainment', 'vehicle'], description: '新旧の度合い' },

  // 文化・地域系
  { id: 'culture_jp_west', positive: '日本的', negative: '西洋的', themes: ['entertainment', 'place'], description: '文化圏' },

  // 時間・歴史系
  { id: 'old_new', positive: '古い', negative: '新しい', themes: ['entertainment', 'place'], description: '時代' },
  { id: 'history_long', positive: '歴史が長い', negative: '歴史が短い', themes: ['entertainment', 'place'], description: '歴史の長さ' },
  { id: 'seasonal', positive: '季節限定', negative: '通年販売', themes: ['food'], description: '販売時期' },

  // ターゲット系
  { id: 'gender_target', positive: '男性向け', negative: '女性向け', themes: ['entertainment'], description: '性別ターゲット' },
  { id: 'age_target', positive: '10代向け', negative: '50代向け', themes: ['entertainment'], description: '年代ターゲット' },
  { id: 'family_target', positive: '家族向け', negative: '一人暮らし向け', themes: ['entertainment'], description: '世帯ターゲット' },

  // 質感系（触覚）
  { id: 'soft_hard', positive: 'やわらかい', negative: '硬い', themes: ['daily', 'animal'], description: '硬さ' },
  { id: 'smooth_rough', positive: 'つるつる', negative: 'ざらざら', themes: ['daily'], description: '表面の滑らかさ' },
  { id: 'mochi_pasa', positive: 'もちもち', negative: 'パサパサ', themes: ['food'], description: '食感（弾力）' },
  { id: 'fluffy_hard', positive: 'ふわふわ', negative: 'ごつごつ', themes: ['daily', 'animal'], description: '質感の柔らかさ' },
  { id: 'sara_beta', positive: 'さらさら', negative: 'べたべた', themes: ['daily'], description: '手触り' },
  { id: 'mofu_chiku', positive: 'もふもふ', negative: 'チクチク', themes: ['animal'], description: '毛並み' },

  // 擬音系（全テーマ共通）
  { id: 'kira_doro', positive: 'キラキラ', negative: 'ドロドロ', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: '光沢感' },
  { id: 'pika_boro', positive: 'ピカピカ', negative: 'ボロボロ', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: '新しさ・状態' },
  { id: 'tsuya_kusu', positive: 'ツヤツヤ', negative: 'くすんでる', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: '艶' },
  { id: 'shaki_gunya', positive: 'シャキシャキ', negative: 'ぐにゃぐにゃ', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: '歯ごたえ' },
  { id: 'pari_shina', positive: 'パリパリ', negative: 'しなしな', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: 'パリッと感' },
  { id: 'kori_neba', positive: 'コリコリ', negative: 'ネバネバ', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: 'コリコリ感' },
  { id: 'saku_netto', positive: 'サクサク', negative: 'ねっとり', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: 'サクッと感' },
  { id: 'kari_funya', positive: 'カリカリ', negative: 'ふにゃふにゃ', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: 'カリッと感' },

  // 味覚系
  { id: 'sweet_spicy', positive: '甘い', negative: '辛い', themes: ['food'], description: '甘辛' },
  { id: 'sour_bitter', positive: '酸っぱい', negative: '苦い', themes: ['food'], description: '酸苦' },
  { id: 'salty_light', positive: 'しょっぱい', negative: '薄味', themes: ['food'], description: '塩分' },
  { id: 'rich_light', positive: 'こってり', negative: 'あっさり', themes: ['food'], description: '濃厚さ' },
  { id: 'spicy_mild', positive: 'スパイシー', negative: 'マイルド', themes: ['food'], description: 'スパイス度' },

  // 温度系
  { id: 'hot_cold', positive: '熱い', negative: '冷たい', themes: ['food', 'place'], description: '温度' },

  // サイズ・形状系
  { id: 'big_small', positive: '大きい', negative: '小さい', themes: ['food', 'daily', 'animal', 'place', 'vehicle'], description: '大小' },
  { id: 'long_short', positive: '長い', negative: '短い', themes: ['daily', 'animal', 'vehicle'], description: '長さ' },
  { id: 'thick_thin', positive: '太い', negative: '細い', themes: ['daily', 'animal', 'vehicle'], description: '太さ' },
  { id: 'thick2_thin2', positive: '厚い', negative: '薄い', themes: ['food', 'daily'], description: '厚み' },
  { id: 'heavy_light', positive: '重い', negative: '軽い', themes: ['daily', 'animal', 'vehicle'], description: '重さ' },
  { id: 'round_square', positive: '丸い', negative: '角ばってる', themes: ['daily'], description: '形状' },
  { id: 'high_low', positive: '高い', negative: '低い', themes: ['daily', 'place', 'vehicle'], description: '高さ' },
  { id: 'deep_shallow', positive: '深い', negative: '浅い', themes: ['daily', 'place'], description: '深さ' },
  { id: 'wide_narrow', positive: '広い', negative: '狭い', themes: ['daily', 'place', 'vehicle'], description: '広さ' },
  { id: 'many_few', positive: '多い', negative: '少ない', themes: ['daily'], description: '数量' },

  // 速度・動き系
  { id: 'fast_slow', positive: '速い', negative: '遅い', themes: ['entertainment', 'animal', 'vehicle'], description: '速度' },
  { id: 'intense_calm', positive: '激しい', negative: '穏やか', themes: ['entertainment', 'animal', 'vehicle'], description: '激しさ' },

  // 音・視覚系
  { id: 'loud_quiet', positive: 'うるさい', negative: '静か', themes: ['entertainment', 'animal', 'place', 'vehicle'], description: '音量' },
  { id: 'bright_dark', positive: '明るい', negative: '暗い', themes: ['daily', 'entertainment', 'animal', 'place', 'vehicle'], description: '明るさ' },
  { id: 'colorful_mono', positive: 'カラフル', negative: 'モノトーン', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: '色彩' },
  { id: 'flashy_plain', positive: '派手', negative: '地味', themes: ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], description: '派手さ' },

  // 感情・印象系
  { id: 'fun_boring', positive: '楽しい', negative: '退屈', themes: ['entertainment'], description: '楽しさ' },
  { id: 'waku_doki', positive: 'ワクワク', negative: 'ドキドキ', themes: ['entertainment'], description: '興奮の種類' },
  { id: 'hokko_thrill', positive: 'ほっこり', negative: 'スリリング', themes: ['entertainment'], description: '感情の方向' },
  { id: 'nostalgic_cutting', positive: '懐かしい', negative: '最先端', themes: ['entertainment'], description: '新旧感' },
  { id: 'emotional', positive: 'エモい', negative: 'エモくない', themes: [], description: 'エモさ' },
  { id: 'instagrammable', positive: 'インスタ映え', negative: 'インスタ映えしない', themes: ['entertainment'], description: 'インスタ映え度' },
  { id: 'gentle_strict', positive: '優しい', negative: '厳しい', themes: ['entertainment', 'animal'], description: '優しさ' },
  { id: 'serious_playful', positive: '真面目', negative: 'ふざけている', themes: ['entertainment'], description: '真面目さ' },
  { id: 'romantic_realistic', positive: 'ロマンチック', negative: '現実的', themes: ['entertainment'], description: 'ロマンチック度' },
  { id: 'simple_sophisticated', positive: '素朴', negative: '洗練されている', themes: ['entertainment', 'place'], description: '洗練度' },
  { id: 'elegant_vulgar', positive: '上品', negative: '下品', themes: ['entertainment'], description: '品格' },
  { id: 'stylish_lame', positive: 'おしゃれ', negative: 'ださい', themes: ['entertainment'], description: 'おしゃれ度' },
  { id: 'elegant_casual', positive: 'エレガント', negative: 'カジュアル', themes: [], description: 'フォーマル度' },
  { id: 'cool_hot', positive: 'クール', negative: 'ホット', themes: [], description: 'クール度' },
  { id: 'clean_dirty', positive: '清潔', negative: '不潔', themes: ['place'], description: '清潔感' },
  { id: 'pure_sexy', positive: '清楚', negative: '妖艶', themes: [], description: '清楚さ' },

  // 音の印象系
  { id: 'round_sound', positive: 'まるっこい音', negative: 'とがった音', themes: [], description: '音の印象' },
  { id: 'soft_name', positive: 'やわらかい名前', negative: 'かたい名前', themes: [], description: '名前の印象' },
  { id: 'voiced_voiceless', positive: '濁音が多め', negative: '清音が多め', themes: [], description: '濁音の多さ' },

  // 匂い系
  { id: 'good_bad_smell', positive: 'いい匂い', negative: '臭い', themes: [], description: '匂いの良さ' },
  { id: 'natural_artificial', positive: '天然の香り', negative: '人工的な香り', themes: [], description: '香りの自然さ' },

  // 使用頻度・場面系
  { id: 'daily_occasional', positive: '毎日使う', negative: 'たまに使う', themes: ['daily'], description: '使用頻度' },
  { id: 'morning_night', positive: '朝に使う', negative: '夜に使う', themes: [], description: '使用時間帯' },
  { id: 'indoor_outdoor', positive: '室内で使う', negative: '屋外で使う', themes: ['daily'], description: '使用場所' },
  { id: 'solo_group', positive: '一人で使う', negative: 'みんなで使う', themes: ['daily'], description: '使用人数' },
  { id: 'work_home', positive: '仕事で使う', negative: '家庭で使う', themes: [], description: '使用シーン' },
  { id: 'private_business', positive: 'プライベートで使う', negative: 'ビジネスで使う', themes: [], description: '使用目的' },
  { id: 'school_office', positive: '学校で使う', negative: 'オフィスで使う', themes: [], description: '使用場所' },
  { id: 'holiday_weekday', positive: '休日に使う', negative: '平日に使う', themes: [], description: '使用曜日' },
  { id: 'emergency_daily', positive: '緊急時に使う', negative: '日常的に使う', themes: [], description: '使用頻度' },
  { id: 'formal_casual', positive: 'フォーマルな場で使う', negative: 'カジュアルな場で使う', themes: ['daily'], description: 'フォーマル度' },
  { id: 'child_adult', positive: '子供が使う', negative: '大人が使う', themes: [], description: '年齢層' },
  { id: 'beginner_pro', positive: '初心者向け', negative: 'プロ向け', themes: ['daily'], description: 'スキルレベル' },
  { id: 'share_own', positive: '共有する', negative: '専有する', themes: [], description: '所有形態' },
  { id: 'recreation_practical', positive: 'レクリエーション用', negative: '実用的', themes: [], description: '用途' },

  // 素材系
  { id: 'natural_synthetic', positive: '天然素材', negative: '合成素材', themes: ['daily'], description: '素材の自然さ' },

  // メンテナンス系
  { id: 'easy_wash', positive: '洗いやすい', negative: '洗いにくい', themes: ['daily'], description: '洗いやすさ' },
  { id: 'easy_maintenance', positive: 'メンテナンス簡単', negative: 'メンテナンス大変', themes: ['daily'], description: 'メンテナンス性' },
  { id: 'easy_dirty', positive: '汚れやすい', negative: '汚れにくい', themes: ['daily'], description: '汚れやすさ' },

  // レア度系
  { id: 'rare_common', positive: 'レア', negative: 'コモン', themes: [], description: 'レア度' },
  { id: 'license_required', positive: '免許が必要', negative: '免許不要', themes: [], description: '免許の必要性' },
  { id: 'easy_get', positive: '手に入れやすい', negative: '手に入れにくい', themes: [], description: '入手しやすさ' },

  // 汎用形容詞系
  { id: 'strong_weak', positive: '強い', negative: '弱い', themes: ['food', 'daily', 'entertainment', 'animal', 'vehicle'], description: '強さ' },
  { id: 'beautiful_ugly', positive: '美しい', negative: '醜い', themes: ['food', 'entertainment', 'place', 'vehicle'], description: '美しさ' },
  { id: 'smart_stupid', positive: '賢い', negative: '愚か', themes: ['animal'], description: '賢さ' },
  { id: 'brave_coward', positive: '勇敢', negative: '臆病', themes: ['entertainment', 'animal'], description: '勇敢さ' },
  { id: 'active_passive', positive: 'アクティブ', negative: 'パッシブ', themes: ['animal'], description: '活動性' },
  { id: 'positive_negative', positive: 'ポジティブ', negative: 'ネガティブ', themes: ['entertainment'], description: 'ポジティブ度' },
  { id: 'clear_ambiguous', positive: '明確', negative: '曖昧', themes: [], description: '明確さ' },
  { id: 'thick_light', positive: '濃い', negative: '薄い', themes: [], description: '濃さ' },
  { id: 'sharp_dull', positive: '鋭い', negative: '鈍い', themes: [], description: '鋭さ' },
  { id: 'smooth_coarse', positive: '滑らか', negative: '粗い', themes: [], description: '滑らかさ' },
  { id: 'flexible_rigid', positive: '柔軟', negative: '硬直', themes: [], description: '柔軟性' },
  { id: 'luxury_simple', positive: '豪華', negative: '質素', themes: ['daily', 'place', 'vehicle'], description: '豪華さ' },
  { id: 'modern_retro', positive: 'モダン', negative: 'レトロ', themes: ['entertainment', 'place', 'vehicle'], description: 'モダンさ' },
  { id: 'open_closed', positive: 'オープン', negative: 'クローズド', themes: [], description: 'オープン度' },
  { id: 'lively_inactive', positive: '活発', negative: '不活発', themes: [], description: '活発さ' },
  { id: 'vivid_dull', positive: '鮮やか', negative: 'くすんだ', themes: ['food'], description: '鮮やかさ' },
  { id: 'rich_poor', positive: 'リッチ', negative: 'プア', themes: [], description: 'リッチ度' },
  { id: 'smooth_jerky', positive: 'スムーズ', negative: 'ギクシャク', themes: [], description: 'スムーズさ' },
  { id: 'delicate_rough', positive: '繊細', negative: '大雑把', themes: [], description: '繊細さ' },
  { id: 'stable_unstable', positive: '安定', negative: '不安定', themes: [], description: '安定性' },
  { id: 'convenient_inconvenient', positive: '便利', negative: '不便', themes: ['daily', 'vehicle'], description: '便利さ' },
  { id: 'comfortable_uncomfortable', positive: '快適', negative: '不快', themes: ['food', 'daily', 'place', 'vehicle'], description: '快適さ' },
  { id: 'safe_dangerous', positive: '安全', negative: '危険', themes: ['daily', 'animal', 'place', 'vehicle'], description: '安全性' },
  { id: 'accurate_inaccurate', positive: '正確', negative: '不正確', themes: [], description: '正確さ' },
  { id: 'efficient_inefficient', positive: '効率的', negative: '非効率', themes: ['vehicle'], description: '効率性' },
  { id: 'creative_ordinary', positive: '独創的', negative: '平凡', themes: ['entertainment', 'vehicle'], description: '独創性' },
];

// difficulty別にラベルを取得する関数（互換性のため残す）
export function getAxisLabelsByDifficulty(): AxisLabel[] {
  return axisLabels;
}