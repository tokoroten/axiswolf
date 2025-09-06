import type { Axis } from '../types';
import { getAxisLabelsByDifficulty } from './axisLabels';
import { generateSeed } from '../utils/seedGenerator';

// 軸の組み合わせを生成する関数
export function generateAxis(seed: number, index: number, mode: 'normal' | 'expert' = 'normal'): Axis {
  // 難易度に応じたラベルを取得
  const availableLabels = getAxisLabelsByDifficulty(mode);
  
  // シードベースで2つの異なるラベルを選択
  const label1Index = (seed + index * 7) % availableLabels.length;
  let label2Index = (seed + index * 13 + 5) % availableLabels.length;
  
  // 同じラベルが選ばれないようにする
  while (label2Index === label1Index) {
    label2Index = (label2Index + 1) % availableLabels.length;
  }
  
  const label1 = availableLabels[label1Index];
  const label2 = availableLabels[label2Index];
  
  return {
    id: `axis${index}`,
    horizontal: {
      left: label1.positive,
      right: label1.negative
    },
    vertical: {
      top: label2.positive,
      bottom: label2.negative
    }
  };
}

// 事前定義された20個の軸を生成（互換性のため）
const baseSeed = generateSeed('base-axes');
export const axes: Axis[] = Array.from({ length: 20 }, (_, i) => generateAxis(baseSeed, i, 'expert')); // デフォルトはすべての軸を含む