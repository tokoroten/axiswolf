import { useState, useEffect } from 'react';
import type { PlacedCard, Player } from '../lib/api';
import { getPlayerColorStyle } from '../utils/playerColors';

interface Axis {
  vertical?: {
    negative: string;
    positive: string;
  };
  horizontal?: {
    negative: string;
    positive: string;
  };
  // 旧形式のフォールバック
  axis1?: { label: string };
  axis2?: { label: string };
  axis3?: { label: string };
  axis4?: { label: string };
}

interface GameBoardProps {
  axis: Axis;
  wolfAxis?: Axis; // 人狼の軸（オプション、結果画面用）
  placedCards: PlacedCard[];
  players: Player[];
  interactive?: boolean;
  onBoardClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onCardDragStart?: (cardId: string, isPlaced: boolean) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  currentPlayerSlot?: number | null;
  roomPhase?: string;
}

const STORAGE_KEY = 'gameboard_zoom_size';

export default function GameBoard({
  axis,
  wolfAxis,
  placedCards,
  players,
  interactive = false,
  onBoardClick,
  onCardDragStart,
  onDragOver,
  onDrop,
  currentPlayerSlot,
  roomPhase,
}: GameBoardProps) {
  // localStorageから初期値を読み込む
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 100;
  });

  // サイズが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, size.toString());
  }, [size]);

  const handleZoomIn = () => {
    setSize(prev => Math.min(prev + 5, 200));
  };

  const handleZoomOut = () => {
    setSize(prev => Math.max(prev - 5, 50));
  };

  const handleZoomReset = () => {
    setSize(100);
  };
  // 軸ラベルの取得（新形式または旧形式）
  const getAxisLabel = (axisData: Axis, type: 'vertical-negative' | 'vertical-positive' | 'horizontal-negative' | 'horizontal-positive') => {
    switch (type) {
      case 'vertical-negative':
        return axisData.vertical?.negative || axisData.axis3?.label || '上';
      case 'vertical-positive':
        return axisData.vertical?.positive || axisData.axis4?.label || '下';
      case 'horizontal-negative':
        return axisData.horizontal?.negative || axisData.axis1?.label || '左';
      case 'horizontal-positive':
        return axisData.horizontal?.positive || axisData.axis2?.label || '右';
    }
  };

  return (
    <div className="relative w-full">
      {/* ズームコントロール */}
      <div className="absolute top-2 right-2 z-30 flex gap-2 bg-white rounded-lg shadow-lg p-2">
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 font-bold text-lg"
          title="縮小"
        >
          −
        </button>
        <button
          onClick={handleZoomReset}
          className="w-8 h-8 flex items-center justify-center bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          title="リセット"
        >
          ◯
        </button>
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded hover:bg-blue-600 font-bold text-lg"
          title="拡大"
        >
          +
        </button>
      </div>

      <div
        onClick={interactive ? onBoardClick : undefined}
        onDragOver={interactive ? onDragOver : undefined}
        onDrop={interactive ? onDrop : undefined}
        className={`relative bg-white rounded-xl shadow-xl ${
          interactive ? 'cursor-crosshair' : ''
        }`}
        style={{
          width: `${size}%`,
          aspectRatio: '1',
        }}
      >
      {/* SVGで四象限の背景 */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* 上の三角形 (A) */}
        <path d="M 0 0 L 50 50 L 100 0 Z" fill="#fee2e2" fillOpacity="0.6" />
        {/* 左の三角形 (C) */}
        <path d="M 0 0 L 50 50 L 0 100 Z" fill="#dcfce7" fillOpacity="0.6" />
        {/* 下の三角形 (B) */}
        <path d="M 0 100 L 50 50 L 100 100 Z" fill="#dbeafe" fillOpacity="0.6" />
        {/* 右の三角形 (D) */}
        <path d="M 100 0 L 50 50 L 100 100 Z" fill="#fef3c7" fillOpacity="0.6" />
        {/* 対角線 */}
        <line x1="0" y1="0" x2="100" y2="100" stroke="#d1d5db" strokeWidth="0.1" strokeOpacity="0.3" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#d1d5db" strokeWidth="0.1" strokeOpacity="0.3" />
      </svg>

      {/* 縦軸と横軸の線 */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400"></div>

      {/* エリアラベル */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-red-500 opacity-50 z-10 pointer-events-none">A</div>
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-6xl font-bold text-blue-500 opacity-50 z-10 pointer-events-none">B</div>
      <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-6xl font-bold text-green-500 opacity-50 z-10 pointer-events-none">C</div>
      <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2 translate-x-1/2 text-6xl font-bold text-yellow-600 opacity-50 z-10 pointer-events-none">D</div>

      {/* 軸ラベル表示 */}
      <>
        {/* 縦軸 上 (A) - 正解の軸 */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
          <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-400 shadow-md">
            <span className="text-red-600">(A) {getAxisLabel(axis, 'vertical-negative')}</span>
          </div>
        </div>
        {/* 縦軸 下 (B) - 正解の軸 */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
          <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-400 shadow-md">
            <span className="text-blue-600">(B) {getAxisLabel(axis, 'vertical-positive')}</span>
          </div>
        </div>
        {/* 横軸 左 (C) - 正解の軸 */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-20">
          <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-400 shadow-md">
            <span className="text-green-600">(C) {getAxisLabel(axis, 'horizontal-negative')}</span>
          </div>
        </div>
        {/* 横軸 右 (D) - 正解の軸 */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-20">
          <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-400 shadow-md">
            <span className="text-yellow-700">(D) {getAxisLabel(axis, 'horizontal-positive')}</span>
          </div>
        </div>

        {/* 人狼の軸（点線・赤）- 変更がある場合のみ表示 */}
        {wolfAxis && (
          <>
            {getAxisLabel(wolfAxis, 'vertical-negative') !== getAxisLabel(axis, 'vertical-negative') && (
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
                <div className="bg-red-50 px-3 py-1 rounded-lg text-sm border-2 border-dashed border-red-400">
                  <span className="text-red-600">人狼: {getAxisLabel(wolfAxis, 'vertical-negative')}</span>
                </div>
              </div>
            )}
            {getAxisLabel(wolfAxis, 'vertical-positive') !== getAxisLabel(axis, 'vertical-positive') && (
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
                <div className="bg-red-50 px-3 py-1 rounded-lg text-sm border-2 border-dashed border-red-400">
                  <span className="text-red-600">人狼: {getAxisLabel(wolfAxis, 'vertical-positive')}</span>
                </div>
              </div>
            )}
            {getAxisLabel(wolfAxis, 'horizontal-negative') !== getAxisLabel(axis, 'horizontal-negative') && (
              <div className="absolute left-2 top-[56%] transform -translate-y-1/2 pointer-events-none z-20">
                <div className="bg-red-50 px-3 py-1 rounded-lg text-sm border-2 border-dashed border-red-400">
                  <span className="text-red-600">人狼: {getAxisLabel(wolfAxis, 'horizontal-negative')}</span>
                </div>
              </div>
            )}
            {getAxisLabel(wolfAxis, 'horizontal-positive') !== getAxisLabel(axis, 'horizontal-positive') && (
              <div className="absolute right-2 top-[56%] transform -translate-y-1/2 pointer-events-none z-20">
                <div className="bg-red-50 px-3 py-1 rounded-lg text-sm border-2 border-dashed border-red-400">
                  <span className="text-red-600">人狼: {getAxisLabel(wolfAxis, 'horizontal-positive')}</span>
                </div>
              </div>
            )}
          </>
        )}
      </>

      {/* 配置されたカード（プレイヤーカラー付き） */}
      {placedCards.map((card) => {
        const isMyCard = card.player_slot === currentPlayerSlot;
        const player = players.find(p => p.player_slot === card.player_slot);
        const uniqueKey = `${card.player_slot}-${card.card_id}`;
        const isDraggable = isMyCard && interactive && roomPhase === 'placement';

        return (
          <div
            key={uniqueKey}
            draggable={isDraggable}
            onDragStart={() => isDraggable && onCardDragStart?.(card.card_id, true)}
            className={`absolute w-16 h-16 rounded-lg flex flex-col items-center justify-center text-xs font-bold shadow-xl border-2 hover:scale-110 hover:z-20 ${
              isDraggable ? 'cursor-move border-white' : 'cursor-default border-white/50'
            }`}
            style={{
              left: `${(card.offsets.x + 1) * 50}%`,
              top: `${(card.offsets.y + 1) * 50}%`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: getPlayerColorStyle(card.player_slot),
              transition: 'none',
            }}
            title={`${player?.player_name || 'Unknown'}: ${card.card_id}`}
          >
            <div className="text-white text-center px-1 leading-tight break-all">{card.card_id}</div>
            {!isMyCard && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: getPlayerColorStyle(card.player_slot) }}
              ></div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}
