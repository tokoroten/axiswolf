import type { Axis } from '../types';
import { axisLabels } from './axisLabels';
import { generateSeed } from '../utils/seedGenerator';
import type { Theme } from './themes';
import seedrandom from 'seedrandom';

// 軸の組み合わせを生成する関数
export function generateAxis(seed: number, index: number): Axis {
  // ラベルを取得
  const availableLabels = axisLabels;

  // シード値から乱数生成器を作成
  const rng = seedrandom(`${seed}-${index}`);

  // 乱数で2つの異なるラベルを選択
  const label1Index = Math.floor(rng() * availableLabels.length);
  let label2Index = Math.floor(rng() * availableLabels.length);

  // 同じラベルが選ばれないようにする
  while (label2Index === label1Index) {
    label2Index = Math.floor(rng() * availableLabels.length);
  }

  const label1 = availableLabels[label1Index];
  const label2 = availableLabels[label2Index];

  // 各軸のポジティブ/ネガティブをランダムに反転するかどうか決定
  const flipHorizontal = rng() < 0.5;
  const flipVertical = rng() < 0.5;
  
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

// テーマに応じた軸の組み合わせを生成する関数
export function generateAxisForTheme(seed: number, index: number, theme?: Theme): Axis {
  // テーマが指定されていない、またはmixed、またはカードパックの場合はすべてのラベルを使用
  if (!theme || theme.id === 'mixed' || theme.id.startsWith('pack')) {
    return generateAxis(seed, index);
  }

  // テーマに適した軸ラベルのみをフィルタリング
  const availableLabels = axisLabels.filter(label =>
    label.themes.includes(theme.id) // このテーマに適したラベルのみ
  );

  // デバッグ情報（簡潔版）
  console.log(`[Axis Generation] Theme: ${theme.name}, Available axes: ${availableLabels.length}`);

  if (availableLabels.length < 2) {
    // 適合する軸が少なすぎる場合は通常の生成にフォールバック
    console.warn(`Not enough labels for theme ${theme.name}, falling back to all labels`);
    return generateAxis(seed, index);
  }

  // シード値から乱数生成器を作成
  const rng = seedrandom(`${seed}-${index}-theme`);

  // 乱数で2つの異なるラベルを選択
  const label1Index = Math.floor(rng() * availableLabels.length);
  let label2Index = Math.floor(rng() * availableLabels.length);

  // 同じラベルが選ばれないようにする
  while (label2Index === label1Index) {
    label2Index = Math.floor(rng() * availableLabels.length);
  }

  const label1 = availableLabels[label1Index];
  const label2 = availableLabels[label2Index];

  console.log(`[Axis Selected] H: ${label1.positive}⇔${label1.negative}, V: ${label2.positive}⇔${label2.negative}`);

  // 各軸のポジティブ/ネガティブをランダムに反転するかどうか決定
  const flipHorizontal = rng() < 0.5;
  const flipVertical = rng() < 0.5;

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