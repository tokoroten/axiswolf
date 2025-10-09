"""軸データ定義"""
import random

# TypeScriptの ThemeType に対応
VALID_THEMES = ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle', 'sport']

# 軸ラベルデータ
AXIS_LABELS = [
    # 評価・人気系
    {'id': 'popularity_kids', 'positive': '子どもウケ', 'negative': '大人ウケ', 'themes': ['entertainment', 'place', 'sport'], 'description': '年齢層による人気度'},
    {'id': 'popularity_us', 'positive': 'アメリカで人気', 'negative': 'アメリカで不人気', 'themes': ['entertainment', 'vehicle', 'sport'], 'description': 'アメリカでの人気度'},
    {'id': 'popularity_young', 'positive': '若者に人気', 'negative': '高齢者に人気', 'themes': ['entertainment', 'place', 'sport'], 'description': '世代間の人気差'},
    {'id': 'popularity_urban', 'positive': '都市部で人気', 'negative': '地方で人気', 'themes': ['entertainment', 'place', 'sport'], 'description': '地域による人気差'},
    {'id': 'popularity_sns', 'positive': 'SNSで話題', 'negative': 'SNSで話題じゃない', 'themes': ['entertainment', 'place', 'sport'], 'description': 'SNSでの話題性'},

    # 価格・経済系
    {'id': 'price_level', 'positive': '安い', 'negative': '高い', 'themes': ['food', 'daily', 'vehicle', 'sport'], 'description': '価格帯'},
    {'id': 'price_target', 'positive': '富裕層向け', 'negative': '一般層向け', 'themes': ['food', 'daily', 'vehicle'], 'description': 'ターゲット層'},

    # 健康・実用系
    {'id': 'health', 'positive': '健康的', 'negative': '不健康', 'themes': ['food'], 'description': '健康への影響'},
    {'id': 'practical', 'positive': '実用的', 'negative': '娯楽的', 'themes': ['daily', 'sport'], 'description': '実用性レベル'},
    {'id': 'eco', 'positive': '環境に優しい', 'negative': '環境に悪い', 'themes': ['vehicle'], 'description': '環境への影響'},

    # スタイル・見た目系
    {'id': 'cute_cool', 'positive': 'かわいい', 'negative': 'かっこいい', 'themes': ['entertainment', 'animal', 'vehicle'], 'description': '見た目の印象'},
    {'id': 'simple_complex', 'positive': 'シンプル', 'negative': '複雑', 'themes': ['daily', 'vehicle'], 'description': 'デザインの複雑さ'},
    {'id': 'analog_digital', 'positive': 'アナログ', 'negative': 'デジタル', 'themes': ['daily', 'vehicle'], 'description': '技術タイプ'},
    {'id': 'traditional_modern', 'positive': '伝統的', 'negative': '革新的', 'themes': ['daily', 'entertainment', 'vehicle'], 'description': '新旧の度合い'},

    # 文化・地域系
    {'id': 'culture_jp_west', 'positive': '日本的', 'negative': '西洋的', 'themes': ['entertainment', 'place', 'sport'], 'description': '文化圏'},

    # 時間・歴史系
    {'id': 'old_new', 'positive': '古い', 'negative': '新しい', 'themes': ['entertainment', 'place', 'vehicle', 'daily', 'sport'], 'description': '時代'},
    {'id': 'history_long', 'positive': '歴史が長い', 'negative': '歴史が短い', 'themes': ['entertainment', 'place', 'vehicle', 'daily', 'sport'], 'description': '歴史の長さ'},
    {'id': 'seasonal', 'positive': '季節限定', 'negative': '通年販売', 'themes': ['food', 'sport'], 'description': '販売時期'},

    # ターゲット系
    {'id': 'gender_target', 'positive': '男性向け', 'negative': '女性向け', 'themes': ['entertainment', 'daily', 'vehicle', 'sport'], 'description': '性別ターゲット'},
    {'id': 'age_target', 'positive': '10代向け', 'negative': '50代向け', 'themes': ['entertainment', 'daily', 'vehicle', 'sport'], 'description': '年代ターゲット'},
    {'id': 'family_target', 'positive': '家族向け', 'negative': '一人暮らし向け', 'themes': ['entertainment', 'daily', 'vehicle', 'sport'], 'description': '世帯ターゲット'},

    # 質感系（触覚）
    {'id': 'soft_hard', 'positive': 'やわらかい', 'negative': '硬い', 'themes': ['food', 'daily', 'animal', 'sport'], 'description': '硬さ'},
    {'id': 'smooth_rough', 'positive': 'つるつる', 'negative': 'ざらざら', 'themes': ['food', 'daily', 'animal', 'vehicle'], 'description': '表面の滑らかさ'},
    {'id': 'mochi_pasa', 'positive': 'もちもち', 'negative': 'パサパサ', 'themes': ['food'], 'description': '食感（弾力）'},
    {'id': 'fluffy_hard', 'positive': 'ふわふわ', 'negative': 'ごつごつ', 'themes': ['daily', 'animal', 'food'], 'description': '質感の柔らかさ'},
    {'id': 'sara_beta', 'positive': 'さらさら', 'negative': 'べたべた', 'themes': ['food', 'daily', 'animal'], 'description': '手触り'},
    {'id': 'mofu_chiku', 'positive': 'もふもふ', 'negative': 'チクチク', 'themes': ['food', 'animal', 'sport'], 'description': '毛並み'},

    # 擬音系（全テーマ共通）
    {'id': 'kira_doro', 'positive': 'キラキラ', 'negative': 'ドロドロ', 'themes': ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], 'description': '光沢感'},
    {'id': 'pika_boro', 'positive': 'ピカピカ', 'negative': 'ボロボロ', 'themes': ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], 'description': '新しさ・状態'},
    {'id': 'tsuya_kusu', 'positive': 'ツヤツヤ', 'negative': 'くすんでる', 'themes': ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle'], 'description': '艶'},
    {'id': 'shaki_gunya', 'positive': 'シャキシャキ', 'negative': 'ぐにゃぐにゃ', 'themes': ['food', 'sport'], 'description': '歯ごたえ'},
    {'id': 'pari_shina', 'positive': 'パリパリ', 'negative': 'しなしな', 'themes': ['food'], 'description': 'パリッと感'},
    {'id': 'kori_neba', 'positive': 'コリコリ', 'negative': 'ネバネバ', 'themes': ['food'], 'description': 'コリコリ感'},
    {'id': 'saku_netto', 'positive': 'サクサク', 'negative': 'ねっとり', 'themes': ['food'], 'description': 'サクッと感'},
    {'id': 'kari_funya', 'positive': 'カリカリ', 'negative': 'ふにゃふにゃ', 'themes': ['food'], 'description': 'カリッと感'},

    # 味覚系
    {'id': 'sweet_spicy', 'positive': '甘い', 'negative': '辛い', 'themes': ['food'], 'description': '甘辛'},
    {'id': 'sour_bitter', 'positive': '酸っぱい', 'negative': '苦い', 'themes': ['food'], 'description': '酸苦'},
    {'id': 'salty_light', 'positive': 'しょっぱい', 'negative': '薄味', 'themes': ['food'], 'description': '塩分'},
    {'id': 'rich_light', 'positive': 'こってり', 'negative': 'あっさり', 'themes': ['food'], 'description': '濃厚さ'},
    {'id': 'spicy_mild', 'positive': 'スパイシー', 'negative': 'マイルド', 'themes': ['food'], 'description': 'スパイス度'},

    # 温度系
    {'id': 'hot_cold', 'positive': '熱い', 'negative': '冷たい', 'themes': ['food', 'place', 'sport'], 'description': '温度'},

    # サイズ・形状系
    {'id': 'big_small', 'positive': '大きい', 'negative': '小さい', 'themes': ['food', 'daily', 'animal', 'place', 'vehicle', 'sport'], 'description': '大小'},
    {'id': 'long_short', 'positive': '長い', 'negative': '短い', 'themes': ['daily', 'animal', 'vehicle', 'sport'], 'description': '長さ'},
    {'id': 'thick_thin', 'positive': '太い', 'negative': '細い', 'themes': ['daily', 'animal', 'vehicle', 'sport'], 'description': '太さ'},
    {'id': 'thick2_thin2', 'positive': '厚い', 'negative': '薄い', 'themes': ['food', 'daily', 'sport'], 'description': '厚み'},
    {'id': 'heavy_light', 'positive': '重い', 'negative': '軽い', 'themes': ['daily', 'animal', 'vehicle', 'sport'], 'description': '重さ'},
    {'id': 'round_square', 'positive': '丸い', 'negative': '角ばってる', 'themes': ['daily', 'vehicle', 'sport'], 'description': '形状'},
    {'id': 'high_low', 'positive': '高い', 'negative': '低い', 'themes': ['daily', 'animal', 'place', 'vehicle', 'sport'], 'description': '高さ'},
    {'id': 'deep_shallow', 'positive': '深い', 'negative': '浅い', 'themes': ['daily', 'place'], 'description': '深さ'},
    {'id': 'wide_narrow', 'positive': '広い', 'negative': '狭い', 'themes': ['daily', 'place', 'vehicle'], 'description': '広さ'},
    {'id': 'many_few', 'positive': '多い', 'negative': '少ない', 'themes': ['food', 'daily', 'animal', 'vehicle'], 'description': '数量'},

    # 速度・動き系
    {'id': 'fast_slow', 'positive': '速い', 'negative': '遅い', 'themes': ['entertainment', 'animal', 'vehicle', 'sport'], 'description': '速度'},
    {'id': 'intense_calm', 'positive': '激しい', 'negative': '穏やか', 'themes': ['entertainment', 'animal', 'vehicle', 'sport'], 'description': '激しさ'},

    # 音・視覚系
    {'id': 'loud_quiet', 'positive': 'うるさい', 'negative': '静か', 'themes': ['entertainment', 'animal', 'place', 'vehicle', 'sport'], 'description': '音量'},
    {'id': 'bright_dark', 'positive': '明るい', 'negative': '暗い', 'themes': ['daily', 'entertainment', 'animal', 'place', 'vehicle'], 'description': '明るさ'},
    {'id': 'colorful_mono', 'positive': 'カラフル', 'negative': 'モノトーン', 'themes': ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle', 'sport'], 'description': '色彩'},
    {'id': 'flashy_plain', 'positive': '派手', 'negative': '地味', 'themes': ['food', 'daily', 'entertainment', 'animal', 'place', 'vehicle', 'sport'], 'description': '派手さ'},

    # 感情・印象系
    {'id': 'fun_boring', 'positive': '楽しい', 'negative': '退屈', 'themes': ['entertainment', 'sport'], 'description': '楽しさ'},
    {'id': 'waku_doki', 'positive': 'ワクワク', 'negative': 'ドキドキ', 'themes': ['entertainment', 'sport'], 'description': '興奮の種類'},
    {'id': 'hokko_thrill', 'positive': 'ほっこり', 'negative': 'スリリング', 'themes': ['entertainment'], 'description': '感情の方向'},
    {'id': 'nostalgic_cutting', 'positive': '懐かしい', 'negative': '最先端', 'themes': ['entertainment'], 'description': '新旧感'},
    {'id': 'emotional', 'positive': 'エモい', 'negative': 'エモくない', 'themes': ['entertainment', 'place', 'sport'], 'description': 'エモさ'},
    {'id': 'instagrammable', 'positive': 'インスタ映え', 'negative': 'インスタ映えしない', 'themes': ['entertainment', 'vehicle', 'place', 'sport'], 'description': 'インスタ映え度'},
    {'id': 'gentle_strict', 'positive': '優しい', 'negative': '厳しい', 'themes': ['entertainment', 'animal'], 'description': '優しさ'},
    {'id': 'serious_playful', 'positive': '真面目', 'negative': 'ふざけている', 'themes': ['entertainment', 'sport'], 'description': '真面目さ'},
    {'id': 'romantic_realistic', 'positive': 'ロマンチック', 'negative': '現実的', 'themes': ['entertainment', 'sport'], 'description': 'ロマンチック度'},
    {'id': 'simple_sophisticated', 'positive': '素朴', 'negative': '洗練されている', 'themes': ['entertainment', 'place', 'sport'], 'description': '洗練度'},
    {'id': 'elegant_vulgar', 'positive': '上品', 'negative': '下品', 'themes': ['entertainment', 'sport'], 'description': '品格'},
    {'id': 'stylish_lame', 'positive': 'おしゃれ', 'negative': 'ださい', 'themes': ['entertainment'], 'description': 'おしゃれ度'},
    {'id': 'elegant_casual', 'positive': 'エレガント', 'negative': 'カジュアル', 'themes': ['daily', 'entertainment', 'place', 'vehicle'], 'description': 'フォーマル度'},
    {'id': 'cool_hot', 'positive': 'クール', 'negative': 'ホット', 'themes': ['entertainment', 'animal', 'vehicle', 'sport'], 'description': 'クール度'},
    {'id': 'clean_dirty', 'positive': '清潔', 'negative': '不潔', 'themes': ['place', 'sport'], 'description': '清潔感'},
    {'id': 'pure_sexy', 'positive': '清楚', 'negative': '妖艶', 'themes': ['entertainment', 'sport'], 'description': '清楚さ'},

    # 音の印象系
    {'id': 'round_sound', 'positive': 'まるっこい音', 'negative': 'とがった音', 'themes': ['entertainment', 'animal', 'sport'], 'description': '音の印象'},
    {'id': 'soft_name', 'positive': 'やわらかい名前', 'negative': 'かたい名前', 'themes': ['entertainment', 'animal', 'place', 'sport'], 'description': '名前の印象'},
    {'id': 'voiced_voiceless', 'positive': '濁音が多め', 'negative': '清音が多め', 'themes': ['entertainment', 'animal', 'place', 'sport'], 'description': '濁音の多さ'},

    # 匂い系
    {'id': 'good_bad_smell', 'positive': 'いい匂い', 'negative': '臭い', 'themes': ['food', 'daily', 'animal', 'place'], 'description': '匂いの良さ'},
    {'id': 'natural_artificial', 'positive': '天然の香り', 'negative': '人工的な香り', 'themes': ['food', 'daily'], 'description': '香りの自然さ'},

    # 使用頻度・場面系
    {'id': 'daily_occasional', 'positive': '毎日使う', 'negative': 'たまに使う', 'themes': ['daily', 'sport'], 'description': '使用頻度'},
    {'id': 'morning_night', 'positive': '朝に使う', 'negative': '夜に使う', 'themes': ['daily', 'food', 'sport'], 'description': '使用時間帯'},
    {'id': 'indoor_outdoor', 'positive': '室内で使う', 'negative': '屋外で使う', 'themes': ['daily', 'sport'], 'description': '使用場所'},
    {'id': 'solo_group', 'positive': '一人で使う', 'negative': 'みんなで使う', 'themes': ['daily', 'sport'], 'description': '使用人数'},
    {'id': 'work_home', 'positive': '仕事で使う', 'negative': '家庭で使う', 'themes': ['daily', 'vehicle'], 'description': '使用シーン'},
    {'id': 'private_business', 'positive': 'プライベートで使う', 'negative': 'ビジネスで使う', 'themes': ['daily', 'vehicle'], 'description': '使用目的'},
    {'id': 'school_office', 'positive': '学校で使う', 'negative': 'オフィスで使う', 'themes': ['daily'], 'description': '使用場所'},
    {'id': 'holiday_weekday', 'positive': '休日に使う', 'negative': '平日に使う', 'themes': ['daily', 'entertainment', 'vehicle', 'sport'], 'description': '使用曜日'},
    {'id': 'emergency_daily', 'positive': '緊急時に使う', 'negative': '日常的に使う', 'themes': ['daily', 'vehicle'], 'description': '使用頻度'},
    {'id': 'formal_casual', 'positive': 'フォーマルな場で使う', 'negative': 'カジュアルな場で使う', 'themes': ['daily'], 'description': 'フォーマル度'},
    {'id': 'child_adult', 'positive': '子供が使う', 'negative': '大人が使う', 'themes': ['daily', 'entertainment', 'vehicle', 'sport'], 'description': '年齢層'},
    {'id': 'beginner_pro', 'positive': '初心者向け', 'negative': 'プロ向け', 'themes': ['daily', 'sport'], 'description': 'スキルレベル'},
    {'id': 'share_own', 'positive': '共有する', 'negative': '専有する', 'themes': ['daily', 'vehicle', 'sport'], 'description': '所有形態'},
    {'id': 'recreation_practical', 'positive': 'レクリエーション用', 'negative': '実用的', 'themes': ['daily', 'vehicle', 'sport'], 'description': '用途'},

    # 素材系
    {'id': 'natural_synthetic', 'positive': '天然素材', 'negative': '合成素材', 'themes': ['daily'], 'description': '素材の自然さ'},

    # メンテナンス系
    {'id': 'easy_wash', 'positive': '洗いやすい', 'negative': '洗いにくい', 'themes': ['daily', 'animal'], 'description': '洗いやすさ'},
    {'id': 'easy_maintenance', 'positive': 'メンテナンス簡単', 'negative': 'メンテナンス大変', 'themes': ['daily', 'vehicle', 'sport'], 'description': 'メンテナンス性'},
    {'id': 'easy_dirty', 'positive': '汚れやすい', 'negative': '汚れにくい', 'themes': ['daily', 'animal'], 'description': '汚れやすさ'},

    # レア度系
    {'id': 'rare_common', 'positive': 'レア', 'negative': 'コモン', 'themes': ['food', 'daily', 'entertainment', 'animal', 'vehicle', 'sport'], 'description': 'レア度'},
    {'id': 'license_required', 'positive': '免許が必要', 'negative': '免許不要', 'themes': ['vehicle', 'sport'], 'description': '免許の必要性'},
    {'id': 'easy_get', 'positive': '手に入れやすい', 'negative': '手に入れにくい', 'themes': ['food', 'daily', 'entertainment', 'vehicle'], 'description': '入手しやすさ'},

    # 汎用形容詞系
    {'id': 'strong_weak', 'positive': '強い', 'negative': '弱い', 'themes': ['food', 'daily', 'entertainment', 'animal', 'vehicle', 'sport'], 'description': '強さ'},
    {'id': 'beautiful_ugly', 'positive': '美しい', 'negative': '醜い', 'themes': ['food', 'entertainment', 'place', 'vehicle'], 'description': '美しさ'},
    {'id': 'smart_stupid', 'positive': '賢い', 'negative': '愚か', 'themes': ['animal'], 'description': '賢さ'},
    {'id': 'brave_coward', 'positive': '勇敢', 'negative': '臆病', 'themes': ['entertainment', 'animal', 'sport'], 'description': '勇敢さ'},
    {'id': 'active_passive', 'positive': 'アクティブ', 'negative': 'パッシブ', 'themes': ['animal', 'sport'], 'description': '活動性'},
    {'id': 'positive_negative', 'positive': 'ポジティブ', 'negative': 'ネガティブ', 'themes': ['entertainment'], 'description': 'ポジティブ度'},
    {'id': 'clear_ambiguous', 'positive': '明確', 'negative': '曖昧', 'themes': ['entertainment', 'place'], 'description': '明確さ'},
    {'id': 'thick_light', 'positive': '濃い', 'negative': '薄い', 'themes': ['food', 'daily'], 'description': '濃さ'},
    {'id': 'sharp_dull', 'positive': '鋭い', 'negative': '鈍い', 'themes': ['daily', 'animal', 'sport'], 'description': '鋭さ'},
    {'id': 'smooth_coarse', 'positive': '滑らか', 'negative': '粗い', 'themes': ['food', 'daily', 'vehicle'], 'description': '滑らかさ'},
    {'id': 'flexible_rigid', 'positive': '柔軟', 'negative': '硬直', 'themes': ['daily', 'animal', 'sport'], 'description': '柔軟性'},
    {'id': 'luxury_simple', 'positive': '豪華', 'negative': '質素', 'themes': ['daily', 'place', 'vehicle'], 'description': '豪華さ'},
    {'id': 'modern_retro', 'positive': 'モダン', 'negative': 'レトロ', 'themes': ['entertainment', 'place', 'vehicle'], 'description': 'モダンさ'},
    {'id': 'open_closed', 'positive': 'オープン', 'negative': 'クローズド', 'themes': ['entertainment', 'place', 'vehicle'], 'description': 'オープン度'},
    {'id': 'lively_inactive', 'positive': '活発', 'negative': '不活発', 'themes': ['entertainment', 'animal', 'place', 'sport'], 'description': '活発さ'},
    {'id': 'vivid_dull', 'positive': '鮮やか', 'negative': 'くすんだ', 'themes': ['food'], 'description': '鮮やかさ'},
    {'id': 'rich_poor', 'positive': 'リッチ', 'negative': 'プア', 'themes': ['food', 'daily', 'place', 'vehicle'], 'description': 'リッチ度'},
    {'id': 'smooth_jerky', 'positive': 'スムーズ', 'negative': 'ギクシャク', 'themes': ['entertainment', 'vehicle'], 'description': 'スムーズさ'},
    {'id': 'delicate_rough', 'positive': '繊細', 'negative': '大雑把', 'themes': ['food', 'daily', 'entertainment'], 'description': '繊細さ'},
    {'id': 'stable_unstable', 'positive': '安定', 'negative': '不安定', 'themes': ['daily', 'vehicle', 'place'], 'description': '安定性'},
    {'id': 'convenient_inconvenient', 'positive': '便利', 'negative': '不便', 'themes': ['daily', 'vehicle'], 'description': '便利さ'},
    {'id': 'comfortable_uncomfortable', 'positive': '快適', 'negative': '不快', 'themes': ['food', 'daily', 'place', 'vehicle'], 'description': '快適さ'},
    {'id': 'safe_dangerous', 'positive': '安全', 'negative': '危険', 'themes': ['daily', 'animal', 'place', 'vehicle', 'sport'], 'description': '安全性'},
    {'id': 'accurate_inaccurate', 'positive': '正確', 'negative': '不正確', 'themes': ['daily', 'vehicle', 'sport'], 'description': '正確さ'},
    {'id': 'efficient_inefficient', 'positive': '効率的', 'negative': '非効率', 'themes': ['vehicle'], 'description': '効率性'},
    {'id': 'creative_ordinary', 'positive': '独創的', 'negative': '平凡', 'themes': ['entertainment', 'vehicle'], 'description': '独創性'},

    # 乗り物専用の軸
    {'id': 'fuel_efficient', 'positive': '燃費が良い', 'negative': '燃費が悪い', 'themes': ['vehicle'], 'description': '燃費'},
    {'id': 'eco_friendly', 'positive': 'エコ', 'negative': 'エコじゃない', 'themes': ['vehicle'], 'description': 'エコ度'},
    {'id': 'passenger_capacity', 'positive': '乗車人数が多い', 'negative': '乗車人数が少ない', 'themes': ['vehicle'], 'description': '乗車定員'},
    {'id': 'cargo_space', 'positive': '荷物がたくさん載る', 'negative': '荷物があまり載らない', 'themes': ['vehicle'], 'description': '積載量'},
    {'id': 'maintenance_cost', 'positive': '維持費が高い', 'negative': '維持費が安い', 'themes': ['vehicle'], 'description': '維持費'},
    {'id': 'acceleration', 'positive': '加速が良い', 'negative': '加速が悪い', 'themes': ['vehicle'], 'description': '加速性能'},
    {'id': 'handling', 'positive': '運転しやすい', 'negative': '運転しにくい', 'themes': ['vehicle'], 'description': '操作性'},
    {'id': 'turning_radius', 'positive': '小回りが利く', 'negative': '小回りが利かない', 'themes': ['vehicle'], 'description': '小回り'},
    {'id': 'ground_clearance', 'positive': '車高が高い', 'negative': '車高が低い', 'themes': ['vehicle'], 'description': '車高'},
    {'id': 'engine_sound', 'positive': 'エンジン音が大きい', 'negative': 'エンジン音が小さい', 'themes': ['vehicle'], 'description': 'エンジン音'},
    {'id': 'sporty_practical', 'positive': 'スポーティ', 'negative': '実用的', 'themes': ['vehicle'], 'description': 'スポーティさ'},
    {'id': 'automated_manual', 'positive': '自動', 'negative': '手動', 'themes': ['vehicle'], 'description': '自動化'},
    {'id': 'electric_gasoline', 'positive': '電気', 'negative': 'ガソリン', 'themes': ['vehicle'], 'description': '動力源'},
    {'id': 'public_private', 'positive': '公共', 'negative': '個人', 'themes': ['vehicle'], 'description': '所有形態'},
    {'id': 'land_air_water', 'positive': '陸上', 'negative': '水上・空中', 'themes': ['vehicle'], 'description': '走行環境'},
    {'id': 'commercial_personal', 'positive': '商用', 'negative': '自家用', 'themes': ['vehicle'], 'description': '用途'},
    {'id': 'domestic_foreign', 'positive': '国産', 'negative': '外国産', 'themes': ['vehicle'], 'description': '生産国'},
    {'id': 'vintage_latest', 'positive': 'ビンテージ', 'negative': '最新型', 'themes': ['vehicle'], 'description': '年代'},
    {'id': 'rough_road', 'positive': '悪路に強い', 'negative': '悪路に弱い', 'themes': ['vehicle'], 'description': '悪路走破性'},
    {'id': 'weather_resistant', 'positive': '全天候型', 'negative': '天候に左右される', 'themes': ['vehicle'], 'description': '天候対応'},

    # 動物専用の軸
    {'id': 'wild_domestic', 'positive': '野生', 'negative': '飼育', 'themes': ['animal'], 'description': '野生/飼育'},
    {'id': 'carnivore_herbivore', 'positive': '肉食', 'negative': '草食', 'themes': ['animal'], 'description': '食性'},
    {'id': 'nocturnal_diurnal', 'positive': '夜行性', 'negative': '昼行性', 'themes': ['animal'], 'description': '活動時間'},
    {'id': 'solitary_social', 'positive': '単独行動', 'negative': '群れ行動', 'themes': ['animal'], 'description': '社会性'},
    {'id': 'predator_prey', 'positive': '捕食者', 'negative': '被食者', 'themes': ['animal'], 'description': '食物連鎖'},
    {'id': 'mammal_reptile', 'positive': '哺乳類', 'negative': '爬虫類', 'themes': ['animal'], 'description': '分類'},
    {'id': 'land_aquatic', 'positive': '陸生', 'negative': '水生', 'themes': ['animal'], 'description': '生息環境'},
    {'id': 'flying_ground', 'positive': '飛ぶ', 'negative': '飛ばない', 'themes': ['animal'], 'description': '飛行能力'},
    {'id': 'warm_cold_blooded', 'positive': '恒温動物', 'negative': '変温動物', 'themes': ['animal'], 'description': '体温調節'},
    {'id': 'long_short_lived', 'positive': '長寿', 'negative': '短命', 'themes': ['animal'], 'description': '寿命'},
    {'id': 'aggressive_docile', 'positive': '攻撃的', 'negative': 'おとなしい', 'themes': ['animal'], 'description': '性格'},
    {'id': 'territorial_nomadic', 'positive': '縄張り持つ', 'negative': '放浪', 'themes': ['animal'], 'description': '縄張り'},
    {'id': 'migratory_sedentary', 'positive': '移動する', 'negative': '定住する', 'themes': ['animal'], 'description': '移動性'},
    {'id': 'endangered_common', 'positive': '絶滅危惧', 'negative': '一般的', 'themes': ['animal'], 'description': '希少性'},
    {'id': 'pet_wild_only', 'positive': 'ペット向き', 'negative': 'ペット不向き', 'themes': ['animal'], 'description': 'ペット適性'},
    {'id': 'trainable_untrained', 'positive': '訓練可能', 'negative': '訓練困難', 'themes': ['animal', 'sport'], 'description': '訓練性'},
    {'id': 'vocal_silent', 'positive': '鳴く', 'negative': '鳴かない', 'themes': ['animal'], 'description': '発声'},
    {'id': 'furry_scaly', 'positive': '毛がある', 'negative': '鱗がある', 'themes': ['animal'], 'description': '体表'},
    {'id': 'fast_breeding', 'positive': '繁殖が早い', 'negative': '繁殖が遅い', 'themes': ['animal'], 'description': '繁殖速度'},
    {'id': 'hibernate_active', 'positive': '冬眠する', 'negative': '冬眠しない', 'themes': ['animal'], 'description': '冬眠'},
    {'id': 'large_small_group', 'positive': '群を作る', 'negative': '群を作らない', 'themes': ['animal'], 'description': '群れの規模'},
    {'id': 'hierarchical_egalitarian', 'positive': '階級社会', 'negative': '平等社会', 'themes': ['animal', 'sport'], 'description': '社会構造'},
    {'id': 'family_non_family', 'positive': '家族で暮らす', 'negative': '家族を作らない', 'themes': ['animal'], 'description': '家族形成'},
    {'id': 'monogamous_polygamous', 'positive': '一夫一婦', 'negative': '多夫多妻', 'themes': ['animal'], 'description': '配偶形態'},
    {'id': 'parental_care', 'positive': '子育てする', 'negative': '子育てしない', 'themes': ['animal'], 'description': '子育て'},
    {'id': 'communal_independent', 'positive': '共同生活', 'negative': '独立生活', 'themes': ['animal'], 'description': '生活様式'},
]


def flip_axis_polarity(axis: dict, rng: random.Random) -> dict:
    """
    軸の正負をランダムに反転する（50%の確率）
    """
    # 50%の確率でpositiveとnegativeを入れ替える
    if rng.random() < 0.5:
        return {
            'id': axis['id'],
            'positive': axis['negative'],
            'negative': axis['positive'],
            'themes': axis['themes'],
            'description': axis['description']
        }
    return axis.copy()


def generate_axis_pair(themes: list[str], seed: int) -> dict:
    """
    テーマに基づいて軸ペアを生成
    軸の正負はランダムに反転される

    - themes に 'chaos' が含まれる場合: 全軸から選択
    - 単一テーマの場合: そのテーマの軸のみ
    - 複数テーマの場合: seedで1つのテーマを選択し、その軸から選ぶ
    """
    rng = random.Random(seed)

    # カオスモードチェック
    if 'chaos' in themes:
        valid_axes = AXIS_LABELS.copy()
    # 単一テーマの場合
    elif len(themes) == 1:
        valid_axes = [
            axis for axis in AXIS_LABELS
            if themes[0] in axis['themes']
        ]
    # 複数テーマの場合: 1つ選択
    else:
        selected_theme = rng.choice(themes)
        valid_axes = [
            axis for axis in AXIS_LABELS
            if selected_theme in axis['themes']
        ]

    if len(valid_axes) < 2:
        raise ValueError('十分な軸が見つかりません')

    # ランダムに2つの異なる軸を選択
    selected_axes = rng.sample(valid_axes, 2)

    # 各軸の正負をランダムに反転
    horizontal_axis = flip_axis_polarity(selected_axes[0], rng)
    vertical_axis = flip_axis_polarity(selected_axes[1], rng)

    return {
        'horizontal': horizontal_axis,
        'vertical': vertical_axis
    }


def generate_wolf_axis_pair(normal_axis: dict, themes: list[str], seed: int) -> dict:
    """
    人狼用の軸ペアを生成
    - パターンA (40%): 縦軸だけ変更
    - パターンB (40%): 横軸だけ変更
    - パターンC (20%): 両軸とも変更
    各軸の正負はランダムに反転される
    """
    rng = random.Random(seed)

    # カオスモードチェック
    if 'chaos' in themes:
        valid_axes = AXIS_LABELS.copy()
    # 単一テーマの場合
    elif len(themes) == 1:
        valid_axes = [
            axis for axis in AXIS_LABELS
            if themes[0] in axis['themes']
        ]
    # 複数テーマの場合: 1つ選択（normal_axisと同じテーマ）
    else:
        selected_theme = rng.choice(themes)
        valid_axes = [
            axis for axis in AXIS_LABELS
            if selected_theme in axis['themes']
        ]

    if len(valid_axes) < 3:
        raise ValueError('人狼用の軸を生成できません')

    # パターン選択（0-9の値で確率分布）
    # 0-3: パターンA (40%)
    # 4-7: パターンB (40%)
    # 8-9: パターンC (20%)
    pattern = rng.randint(0, 9)

    # 既存の軸IDを取得
    normal_horizontal_id = normal_axis['horizontal']['id']
    normal_vertical_id = normal_axis['vertical']['id']

    # 既存の軸を除外したリストを作成
    available_axes = [axis for axis in valid_axes if axis['id'] not in [normal_horizontal_id, normal_vertical_id]]

    if pattern < 4:
        # パターンA: 縦軸だけ変更
        if not available_axes:
            raise ValueError('新しい軸が見つかりません')
        new_vertical = flip_axis_polarity(rng.choice(available_axes), rng)
        return {
            'horizontal': normal_axis['horizontal'],
            'vertical': new_vertical
        }

    elif pattern < 8:
        # パターンB: 横軸だけ変更
        if not available_axes:
            raise ValueError('新しい軸が見つかりません')
        new_horizontal = flip_axis_polarity(rng.choice(available_axes), rng)
        return {
            'horizontal': new_horizontal,
            'vertical': normal_axis['vertical']
        }

    else:
        # パターンC: 両軸とも変更
        if len(available_axes) < 2:
            raise ValueError('新しい軸が見つかりません')
        selected = rng.sample(available_axes, 2)
        return {
            'horizontal': flip_axis_polarity(selected[0], rng),
            'vertical': flip_axis_polarity(selected[1], rng)
        }
