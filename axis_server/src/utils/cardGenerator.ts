// 簡単な名詞リスト（実際のゲームではもっと多くのカードを用意）
const CARD_POOL = [
  // 食べ物
  'りんご', 'バナナ', 'ぶどう', 'いちご', 'みかん', 'メロン', 'スイカ', 'もも',
  'ラーメン', 'カレー', 'ハンバーグ', 'ピザ', 'すし', 'うどん', 'そば', 'おにぎり',
  'ケーキ', 'チョコレート', 'アイス', 'プリン', 'ドーナツ', 'クッキー',

  // 動物
  'いぬ', 'ねこ', 'うさぎ', 'ぞう', 'ライオン', 'きりん', 'パンダ', 'コアラ',
  'ペンギン', 'いるか', 'くじら', 'さめ', 'きんぎょ', 'かめ',

  // 乗り物
  '自動車', '電車', 'バス', '飛行機', 'ヘリコプター', '自転車', 'バイク', '船',

  // 日用品
  'スマホ', 'パソコン', 'テレビ', '冷蔵庫', 'エアコン', '時計', 'カメラ', '傘',
  'ペン', 'ノート', 'はさみ', 'のり', 'テープ', 'ホチキス',

  // エンターテイメント
  '映画', 'アニメ', 'ゲーム', '音楽', 'スポーツ', 'サッカー', '野球', 'バスケ',
  '本', '漫画', '雑誌', 'ドラマ',
];

/**
 * シード値を使って決定的に手札を生成
 */
export function generateHand(playerSlot: number, roundSeed: string, handSize: number = 5): string[] {
  const seed = parseInt(roundSeed) + playerSlot * 1000;
  const hand: string[] = [];
  const usedIndices = new Set<number>();

  // 疑似乱数生成器
  let rng = seed;
  const random = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };

  // ランダムにカードを選択
  while (hand.length < handSize && usedIndices.size < CARD_POOL.length) {
    const index = Math.floor(random() * CARD_POOL.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      hand.push(CARD_POOL[index]);
    }
  }

  return hand;
}

/**
 * 手札をシャッフル（表示順をランダム化）
 */
export function shuffleHand(hand: string[], playerSlot: number): string[] {
  const shuffled = [...hand];
  let rng = playerSlot * 7919;

  const random = () => {
    rng = (rng * 9301 + 49297) % 233280;
    return rng / 233280;
  };

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
