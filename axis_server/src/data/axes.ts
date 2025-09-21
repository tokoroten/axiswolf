import type { Axis } from '../types';
import { getAxisLabelsByDifficulty } from './axisLabels';
import { generateSeed } from '../utils/seedGenerator';

// 軸の組み合わせを生成する関数
export function generateAxis(seed: number, index: number): Axis {
  // ラベルを取得
  const availableLabels = getAxisLabelsByDifficulty();
  
  // シードベースで2つの異なるラベルを選択
  const label1Index = (seed + index * 7) % availableLabels.length;
  let label2Index = (seed + index * 13 + 5) % availableLabels.length;
  
  // 同じラベルが選ばれないようにする
  while (label2Index === label1Index) {
    label2Index = (label2Index + 1) % availableLabels.length;
  }
  
  const label1 = availableLabels[label1Index];
  const label2 = availableLabels[label2Index];
  
  // 各軸のポジティブ/ネガティブをランダムに反転するかどうか決定
  // 水平軸の反転（シードベースで決定）
  const flipHorizontal = ((seed + index * 17) % 2) === 0;
  // 垂直軸の反転（シードベースで決定）
  const flipVertical = ((seed + index * 23) % 2) === 0;
  
  return {
    id: `axis${index}`,
    horizontal: {
      left: flipHorizontal ? label1.negative : label1.positive,
      right: flipHorizontal ? label1.positive : label1.negative
    },
    vertical: {
      top: flipVertical ? label2.negative : label2.positive,
      bottom: flipVertical ? label2.positive : label2.negative
    }
  };
}

// 事前定義された20個の軸を生成（互換性のため）
const baseSeed = generateSeed('base-axes');
export const axes: Axis[] = Array.from({ length: 20 }, (_, i) => generateAxis(baseSeed, i));