import { axisLabels, type AxisLabel } from '../data/axisLabels';
import type { ThemeType } from '../data/themes';

export interface AxisPair {
  horizontal: AxisLabel;
  vertical: AxisLabel;
}

export function generateAxisPair(
  themes: ThemeType[],
  seed: number
): AxisPair {
  // テーマに合致する軸をフィルタリング
  const validAxes = axisLabels.filter(axis =>
    axis.themes.some(theme => themes.includes(theme))
  );

  if (validAxes.length < 2) {
    throw new Error('十分な軸が見つかりません');
  }

  // シード値から決定的に選択
  const horizontalIndex = seed % validAxes.length;
  let verticalIndex = (seed * 7 + 13) % validAxes.length;

  // 同じ軸を選ばないようにする
  if (horizontalIndex === verticalIndex) {
    verticalIndex = (verticalIndex + 1) % validAxes.length;
  }

  return {
    horizontal: validAxes[horizontalIndex],
    vertical: validAxes[verticalIndex],
  };
}

export function generateWolfAxisPair(
  normalAxis: AxisPair,
  themes: ThemeType[],
  seed: number
): AxisPair {
  const validAxes = axisLabels.filter(axis =>
    axis.themes.some(theme => themes.includes(theme))
  );

  if (validAxes.length < 3) {
    throw new Error('人狼用の軸を生成できません');
  }

  // 横軸は同じにして、縦軸だけ変える
  const wolfSeed = seed * 31 + 47;
  let newVerticalIndex = wolfSeed % validAxes.length;

  // 既存の軸と被らないようにする
  const maxAttempts = 100;
  let attempts = 0;
  while (
    (validAxes[newVerticalIndex].id === normalAxis.vertical.id ||
      validAxes[newVerticalIndex].id === normalAxis.horizontal.id) &&
    attempts < maxAttempts
  ) {
    newVerticalIndex = (newVerticalIndex + 1) % validAxes.length;
    attempts++;
  }

  return {
    horizontal: normalAxis.horizontal,
    vertical: validAxes[newVerticalIndex],
  };
}
