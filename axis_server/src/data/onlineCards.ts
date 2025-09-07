// オンラインプレイ用のカードデータ
export interface Card {
  id: string;
  name: string;
  category: 'food' | 'item' | 'character' | 'place' | 'concept';
  imageUrl?: string;
}

// カードプール（CSVファイルから抽出したデータ）
export const cardPool: Card[] = [
  // 食べ物
  { id: 'f01', name: '寿司', category: 'food' },
  { id: 'f02', name: 'ラーメン', category: 'food' },
  { id: 'f03', name: 'カレー', category: 'food' },
  { id: 'f04', name: 'ピザ', category: 'food' },
  { id: 'f05', name: 'ハンバーガー', category: 'food' },
  { id: 'f06', name: '天ぷら', category: 'food' },
  { id: 'f07', name: 'うどん', category: 'food' },
  { id: 'f08', name: 'そば', category: 'food' },
  { id: 'f09', name: 'おにぎり', category: 'food' },
  { id: 'f10', name: 'たこ焼き', category: 'food' },
  { id: 'f11', name: '焼き鳥', category: 'food' },
  { id: 'f12', name: '餃子', category: 'food' },
  { id: 'f13', name: 'チャーハン', category: 'food' },
  { id: 'f14', name: 'パスタ', category: 'food' },
  { id: 'f15', name: 'サラダ', category: 'food' },
  { id: 'f16', name: 'ステーキ', category: 'food' },
  { id: 'f17', name: '焼肉', category: 'food' },
  { id: 'f18', name: 'しゃぶしゃぶ', category: 'food' },
  { id: 'f19', name: 'お好み焼き', category: 'food' },
  { id: 'f20', name: '牛丼', category: 'food' },
  { id: 'f21', name: '親子丼', category: 'food' },
  { id: 'f22', name: 'カツ丼', category: 'food' },
  { id: 'f23', name: 'オムライス', category: 'food' },
  { id: 'f24', name: 'カレーパン', category: 'food' },
  { id: 'f25', name: 'メロンパン', category: 'food' },
  { id: 'f26', name: 'クロワッサン', category: 'food' },
  { id: 'f27', name: 'ドーナツ', category: 'food' },
  { id: 'f28', name: 'ケーキ', category: 'food' },
  { id: 'f29', name: 'プリン', category: 'food' },
  { id: 'f30', name: 'アイスクリーム', category: 'food' },
  { id: 'f31', name: 'チョコレート', category: 'food' },
  { id: 'f32', name: 'ポテトチップス', category: 'food' },
  { id: 'f33', name: 'せんべい', category: 'food' },
  { id: 'f34', name: '団子', category: 'food' },
  { id: 'f35', name: '大福', category: 'food' },
  { id: 'f36', name: 'たい焼き', category: 'food' },
  { id: 'f37', name: 'わたあめ', category: 'food' },
  { id: 'f38', name: 'かき氷', category: 'food' },
  { id: 'f39', name: 'コーヒー', category: 'food' },
  { id: 'f40', name: '紅茶', category: 'food' },
  { id: 'f41', name: '緑茶', category: 'food' },
  
  // 日用品
  { id: 'i01', name: 'スマートフォン', category: 'item' },
  { id: 'i02', name: 'パソコン', category: 'item' },
  { id: 'i03', name: 'テレビ', category: 'item' },
  { id: 'i04', name: '冷蔵庫', category: 'item' },
  { id: 'i05', name: '洗濯機', category: 'item' },
  { id: 'i06', name: 'エアコン', category: 'item' },
  { id: 'i07', name: '掃除機', category: 'item' },
  { id: 'i08', name: '電子レンジ', category: 'item' },
  { id: 'i09', name: '炊飯器', category: 'item' },
  { id: 'i10', name: 'ドライヤー', category: 'item' },
  { id: 'i11', name: '歯ブラシ', category: 'item' },
  { id: 'i12', name: 'シャンプー', category: 'item' },
  { id: 'i13', name: 'タオル', category: 'item' },
  { id: 'i14', name: 'ティッシュ', category: 'item' },
  { id: 'i15', name: 'トイレットペーパー', category: 'item' },
  { id: 'i16', name: 'マスク', category: 'item' },
  { id: 'i17', name: 'メガネ', category: 'item' },
  { id: 'i18', name: '腕時計', category: 'item' },
  { id: 'i19', name: '財布', category: 'item' },
  { id: 'i20', name: 'カバン', category: 'item' },
  { id: 'i21', name: '傘', category: 'item' },
  { id: 'i22', name: '靴', category: 'item' },
  { id: 'i23', name: '服', category: 'item' },
  { id: 'i24', name: '帽子', category: 'item' },
  { id: 'i25', name: '手袋', category: 'item' },
  { id: 'i26', name: 'マフラー', category: 'item' },
  { id: 'i27', name: 'ペン', category: 'item' },
  { id: 'i28', name: 'ノート', category: 'item' },
  { id: 'i29', name: 'はさみ', category: 'item' },
  { id: 'i30', name: 'のり', category: 'item' },
  { id: 'i31', name: '定規', category: 'item' },
  { id: 'i32', name: '消しゴム', category: 'item' },
  { id: 'i33', name: '鉛筆', category: 'item' },
  { id: 'i34', name: '本', category: 'item' },
  { id: 'i35', name: '雑誌', category: 'item' },
  { id: 'i36', name: '新聞', category: 'item' },
  { id: 'i37', name: 'カメラ', category: 'item' },
  
  // 乗り物
  { id: 'v01', name: '軽自動車', category: 'item' },
  { id: 'v02', name: '普通自動車', category: 'item' },
  { id: 'v03', name: '高級車', category: 'item' },
  { id: 'v04', name: 'スポーツカー', category: 'item' },
  { id: 'v05', name: 'ワゴン車', category: 'item' },
  { id: 'v06', name: 'ミニバン', category: 'item' },
  { id: 'v07', name: 'SUV', category: 'item' },
  { id: 'v08', name: 'トラック', category: 'item' },
  { id: 'v09', name: 'バス', category: 'item' },
  { id: 'v10', name: 'タクシー', category: 'item' },
  { id: 'v11', name: 'パトカー', category: 'item' },
  { id: 'v12', name: '救急車', category: 'item' },
  { id: 'v13', name: '消防車', category: 'item' },
  { id: 'v14', name: 'ショベルカー', category: 'item' },
  { id: 'v15', name: 'ブルドーザー', category: 'item' },
  { id: 'v16', name: 'クレーン車', category: 'item' },
  { id: 'v17', name: '新幹線', category: 'item' },
  { id: 'v18', name: '特急電車', category: 'item' },
  { id: 'v19', name: '普通電車', category: 'item' },
  { id: 'v20', name: '地下鉄', category: 'item' },
  { id: 'v21', name: '路面電車', category: 'item' },
  { id: 'v22', name: 'モノレール', category: 'item' },
  { id: 'v23', name: '蒸気機関車', category: 'item' },
  { id: 'v24', name: '旅客機', category: 'item' },
  { id: 'v25', name: '戦闘機', category: 'item' },
  { id: 'v26', name: 'ヘリコプター', category: 'item' },
  { id: 'v27', name: '気球', category: 'item' },
  { id: 'v28', name: 'ロケット', category: 'item' },
  { id: 'v29', name: '宇宙船', category: 'item' },
  { id: 'v30', name: '客船', category: 'item' },
  { id: 'v31', name: 'タンカー', category: 'item' },
  { id: 'v32', name: '漁船', category: 'item' },
  { id: 'v33', name: 'ヨット', category: 'item' },
  { id: 'v34', name: 'カヌー', category: 'item' },
  { id: 'v35', name: '水上バイク', category: 'item' },
  { id: 'v36', name: '潜水艦', category: 'item' },
  { id: 'v37', name: 'フェリー', category: 'item' },
  { id: 'v38', name: '原付バイク', category: 'item' },
  { id: 'v39', name: 'オートバイ', category: 'item' },
  { id: 'v40', name: '電動自転車', category: 'item' },
  { id: 'v41', name: '三輪車', category: 'item' },
  { id: 'v42', name: '一輪車', category: 'item' },
  { id: 'v43', name: 'スケートボード', category: 'item' },
  { id: 'v44', name: 'キックボード', category: 'item' },
  { id: 'v45', name: 'セグウェイ', category: 'item' },
  { id: 'v46', name: '車椅子', category: 'item' },
  { id: 'v47', name: 'ベビーカー', category: 'item' },
  { id: 'v48', name: 'リヤカー', category: 'item' },
  { id: 'v49', name: '馬車', category: 'item' },
  
  // キャラクター・動物・物体
  { id: 'c01', name: 'ダイヤモンド', category: 'character' },
  { id: 'c02', name: '羽毛', category: 'character' },
  { id: 'c03', name: '氷', category: 'character' },
  { id: 'c04', name: '炎', category: 'character' },
  { id: 'c05', name: '鉄', category: 'character' },
  { id: 'c06', name: '綿', category: 'character' },
  { id: 'c07', name: '岩', category: 'character' },
  { id: 'c08', name: '水', category: 'character' },
  { id: 'c09', name: 'ガラス', category: 'character' },
  { id: 'c10', name: 'ゴム', category: 'character' },
  { id: 'c11', name: '木材', category: 'character' },
  { id: 'c12', name: 'プラスチック', category: 'character' },
  { id: 'c13', name: 'スポンジ', category: 'character' },
  { id: 'c14', name: '針', category: 'character' },
  { id: 'c15', name: '刀', category: 'character' },
  { id: 'c16', name: '盾', category: 'character' },
  { id: 'c17', name: '槍', category: 'character' },
  { id: 'c18', name: '弓', category: 'character' },
  { id: 'c19', name: 'ハンマー', category: 'character' },
  { id: 'c20', name: '釘', category: 'character' },
  { id: 'c21', name: 'ライオン', category: 'character' },
  { id: 'c22', name: 'うさぎ', category: 'character' },
  { id: 'c23', name: '象', category: 'character' },
  { id: 'c24', name: '蟻', category: 'character' },
  { id: 'c25', name: '鷹', category: 'character' },
  { id: 'c26', name: '亀', category: 'character' },
  { id: 'c27', name: 'チーター', category: 'character' },
  { id: 'c28', name: 'ナマケモノ', category: 'character' },
  { id: 'c29', name: 'サボテン', category: 'character' },
  { id: 'c30', name: '桜', category: 'character' },
  { id: 'c31', name: '竹', category: 'character' },
  { id: 'c32', name: 'きのこ', category: 'character' },
  { id: 'c33', name: 'バラ', category: 'character' },
  { id: 'c34', name: '雑草', category: 'character' },
  { id: 'c35', name: '稲妻', category: 'character' },
  { id: 'c36', name: '雲', category: 'character' },
  { id: 'c37', name: '太陽', category: 'character' },
  { id: 'c38', name: '月', category: 'character' },
  { id: 'c39', name: '星', category: 'character' },
  { id: 'c40', name: '雪', category: 'character' },
  { id: 'c41', name: '風', category: 'character' },
  { id: 'c42', name: '虹', category: 'character' },
  
  // 場所
  { id: 'p01', name: '城', category: 'place' },
  { id: 'p02', name: '小屋', category: 'place' },
  { id: 'p03', name: '高層ビル', category: 'place' },
  { id: 'p04', name: 'テント', category: 'place' },
  { id: 'p05', name: '橋', category: 'place' },
  { id: 'p06', name: 'トンネル', category: 'place' },
  { id: 'p07', name: '山', category: 'place' },
  { id: 'p08', name: '谷', category: 'place' },
  { id: 'p09', name: '海', category: 'place' },
  { id: 'p10', name: '川', category: 'place' },
  { id: 'p11', name: '湖', category: 'place' },
  { id: 'p12', name: '砂漠', category: 'place' },
  { id: 'p13', name: '森', category: 'place' },
  { id: 'p14', name: '草原', category: 'place' },
  { id: 'p15', name: '洞窟', category: 'place' },
  { id: 'p16', name: '火山', category: 'place' },
  { id: 'p17', name: '氷山', category: 'place' },
  { id: 'p18', name: '地球', category: 'place' },
  { id: 'p19', name: '宇宙', category: 'place' },
  
  // 概念・道具
  { id: 'co01', name: '筋肉', category: 'concept' },
  { id: 'co02', name: '骨', category: 'concept' },
  { id: 'co03', name: '心臓', category: 'concept' },
  { id: 'co04', name: '脳', category: 'concept' },
  { id: 'co05', name: '目', category: 'concept' },
  { id: 'co06', name: '耳', category: 'concept' },
  { id: 'co07', name: '手', category: 'concept' },
  { id: 'co08', name: '足', category: 'concept' },
  { id: 'co09', name: '砂時計', category: 'concept' },
  { id: 'co10', name: 'コンパス', category: 'concept' },
  { id: 'co11', name: '地図', category: 'concept' },
  { id: 'co12', name: '羅針盤', category: 'concept' },
  { id: 'co13', name: '望遠鏡', category: 'concept' },
  { id: 'co14', name: '顕微鏡', category: 'concept' },
  { id: 'co15', name: '時計', category: 'concept' },
  { id: 'co16', name: 'カレンダー', category: 'concept' },
  { id: 'co17', name: '電話', category: 'concept' },
  { id: 'co18', name: 'ラジオ', category: 'concept' },
  { id: 'co19', name: 'スピーカー', category: 'concept' },
];

// シードベースでカードを生成する関数
export function generateCardsForPlayer(
  roomId: string,
  round: number,
  playerId: number,
  count: number = 5
): Card[] {
  // シード値を生成（roomId + round + playerId の組み合わせ）
  const seedString = `${roomId}-round${round}-player${playerId}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = ((seed << 5) - seed) + seedString.charCodeAt(i);
    seed = seed & seed; // Convert to 32bit integer
  }
  
  // 線形合同法による疑似乱数生成
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 2147483647;
    return seed / 2147483647;
  };
  
  // カードプールをシャッフル（Fisher-Yates）
  const shuffled = [...cardPool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // 指定枚数のカードを返す
  return shuffled.slice(0, count);
}

// カードのカテゴリーごとの色
export const categoryColors = {
  food: '#FFA500',      // オレンジ
  item: '#4169E1',      // ロイヤルブルー
  character: '#FF69B4', // ホットピンク
  place: '#32CD32',     // ライムグリーン
  concept: '#9370DB',   // ミディアムパープル
};