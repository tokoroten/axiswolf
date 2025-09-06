import type { Mutator } from '../types';

export const mutators: Mutator[] = [
  // 1軸変更パターン（必ず対になる概念に置き換え）
  {
    id: 'mutator1',
    name: '縦軸を別の概念に変更',
    description: '縦軸が完全に別の対称的な概念に変更',
    effect: '縦軸が変更されています'
  },
  {
    id: 'mutator2',
    name: '横軸を別の概念に変更',
    description: '横軸が完全に別の対称的な概念に変更',
    effect: '横軸が変更されています'
  },
  // 2軸変更パターン
  {
    id: 'mutator3',
    name: '両軸を別の概念に変更',
    description: '縦軸と横軸の両方が別の概念に変更',
    effect: '両軸が変更されています'
  },
  // 軸の入れ替えパターン
  {
    id: 'mutator4',
    name: '縦軸と横軸を入れ替え',
    description: '縦軸と横軸の位置を交換',
    effect: '縦横の軸が入れ替わっています'
  },
  {
    id: 'mutator5',
    name: '縦軸を反転',
    description: '縦軸の上下を反転',
    effect: '縦軸が上下反転しています'
  },
  {
    id: 'mutator6',
    name: '横軸を反転',
    description: '横軸の左右を反転',
    effect: '横軸が左右反転しています'
  }
];