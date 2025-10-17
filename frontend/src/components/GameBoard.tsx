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
  onCardClick?: (cardId: string) => void;
  onCardDragStart?: (cardId: string, isPlaced: boolean) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  currentPlayerSlot?: number | null;
  roomPhase?: string;
  selectedCard?: string | null;
}

const STORAGE_KEY = 'gameboard_zoom_size';

export default function GameBoard({
  axis,
  wolfAxis,
  placedCards,
  players,
  interactive = false,
  onBoardClick,
  onCardClick,
  onCardDragStart,
  onDragOver,
  onDrop,
  currentPlayerSlot,
  roomPhase,
  selectedCard,
}: GameBoardProps) {
  // localStorageから初期値を読み込む
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 100;
  });

  // モバイル判定
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      {/* ズームコントロール（デスクトップはフローティング、モバイルは下部） */}
      {!isMobile && (
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
      )}

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
      <div className={`absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-red-500 opacity-50 z-10 pointer-events-none ${isMobile ? 'text-3xl' : 'text-6xl'}`}>A</div>
      <div className={`absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 font-bold text-blue-500 opacity-50 z-10 pointer-events-none ${isMobile ? 'text-3xl' : 'text-6xl'}`}>B</div>
      <div className={`absolute left-1/4 top-1/2 transform -translate-y-1/2 -translate-x-1/2 font-bold text-green-500 opacity-50 z-10 pointer-events-none ${isMobile ? 'text-3xl' : 'text-6xl'}`}>C</div>
      <div className={`absolute right-1/4 top-1/2 transform -translate-y-1/2 translate-x-1/2 font-bold text-yellow-600 opacity-50 z-10 pointer-events-none ${isMobile ? 'text-3xl' : 'text-6xl'}`}>D</div>

      {/* 軸ラベル表示 */}
      <>
        {/* 縦軸 上 (A) - 正解の軸 */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
          <div className={`bg-white rounded-lg font-bold border-2 border-gray-400 shadow-md ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-lg'}`}>
            <span className="text-red-600">(A) {getAxisLabel(axis, 'vertical-negative')}</span>
          </div>
        </div>
        {/* 縦軸 下 (B) - 正解の軸 */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
          <div className={`bg-white rounded-lg font-bold border-2 border-gray-400 shadow-md ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-lg'}`}>
            <span className="text-blue-600">(B) {getAxisLabel(axis, 'vertical-positive')}</span>
          </div>
        </div>
        {/* 横軸 左 (C) - 正解の軸 */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-20">
          <div className={`bg-white rounded-lg font-bold border-2 border-gray-400 shadow-md ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-lg'}`}>
            <span className="text-green-600">(C) {getAxisLabel(axis, 'horizontal-negative')}</span>
          </div>
        </div>
        {/* 横軸 右 (D) - 正解の軸 */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none z-20">
          <div className={`bg-white rounded-lg font-bold border-2 border-gray-400 shadow-md ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-lg'}`}>
            <span className="text-yellow-700">(D) {getAxisLabel(axis, 'horizontal-positive')}</span>
          </div>
        </div>

        {/* 人狼の軸（点線・赤）- 変更がある場合のみ表示 */}
        {wolfAxis && (
          <>
            {getAxisLabel(wolfAxis, 'vertical-negative') !== getAxisLabel(axis, 'vertical-negative') && (
              <div className={`absolute left-1/2 transform -translate-x-1/2 pointer-events-none z-20 ${isMobile ? 'top-8' : 'top-12'}`}>
                <div className={`bg-red-50 rounded-lg border-2 border-dashed border-red-400 ${isMobile ? 'px-1.5 py-0.5 text-[10px]' : 'px-3 py-1 text-sm'}`}>
                  <span className="text-red-600">人狼: {getAxisLabel(wolfAxis, 'vertical-negative')}</span>
                </div>
              </div>
            )}
            {getAxisLabel(wolfAxis, 'vertical-positive') !== getAxisLabel(axis, 'vertical-positive') && (
              <div className={`absolute left-1/2 transform -translate-x-1/2 pointer-events-none z-20 ${isMobile ? 'bottom-8' : 'bottom-12'}`}>
                <div className={`bg-red-50 rounded-lg border-2 border-dashed border-red-400 ${isMobile ? 'px-1.5 py-0.5 text-[10px]' : 'px-3 py-1 text-sm'}`}>
                  <span className="text-red-600">人狼: {getAxisLabel(wolfAxis, 'vertical-positive')}</span>
                </div>
              </div>
            )}
            {getAxisLabel(wolfAxis, 'horizontal-negative') !== getAxisLabel(axis, 'horizontal-negative') && (
              <div className={`absolute left-2 transform -translate-y-1/2 pointer-events-none z-20 ${isMobile ? 'top-[54%]' : 'top-[56%]'}`}>
                <div className={`bg-red-50 rounded-lg border-2 border-dashed border-red-400 ${isMobile ? 'px-1.5 py-0.5 text-[10px]' : 'px-3 py-1 text-sm'}`}>
                  <span className="text-red-600">人狼: {getAxisLabel(wolfAxis, 'horizontal-negative')}</span>
                </div>
              </div>
            )}
            {getAxisLabel(wolfAxis, 'horizontal-positive') !== getAxisLabel(axis, 'horizontal-positive') && (
              <div className={`absolute right-2 transform -translate-y-1/2 pointer-events-none z-20 ${isMobile ? 'top-[54%]' : 'top-[56%]'}`}>
                <div className={`bg-red-50 rounded-lg border-2 border-dashed border-red-400 ${isMobile ? 'px-1.5 py-0.5 text-[10px]' : 'px-3 py-1 text-sm'}`}>
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
        const isSelected = selectedCard === card.card_id;

        return (
          <div
            key={uniqueKey}
            draggable={isDraggable}
            onDragStart={() => isDraggable && onCardDragStart?.(card.card_id, true)}
            onClick={(e) => {
              if (isDraggable && onCardClick) {
                e.stopPropagation();  // ボードのクリックイベントを防ぐ
                onCardClick(card.card_id);
              }
            }}
            className={`absolute rounded-lg flex flex-col items-center justify-center font-bold shadow-xl border-2 hover:scale-110 hover:z-20 transition-all ${
              isMobile ? 'w-12 h-12 text-[10px]' : 'w-16 h-16 text-xs'
            } ${
              isDraggable ? 'cursor-pointer border-white' : 'cursor-default border-white/50'
            } ${isSelected ? 'scale-110 ring-4 ring-blue-400 z-30' : ''}`}
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
              <div className={`absolute -bottom-1 -right-1 rounded-full border border-white ${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`}
                style={{ backgroundColor: getPlayerColorStyle(card.player_slot) }}
              ></div>
            )}
          </div>
        );
      })}
      </div>

      {/* モバイル用ズームコントロール（盤面の下） */}
      {isMobile && (
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleZoomOut}
            className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-xl shadow-lg active:scale-95 transition-all"
            title="縮小"
          >
            −
          </button>
          <button
            onClick={handleZoomReset}
            className="w-12 h-12 flex items-center justify-center bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-base shadow-lg active:scale-95 transition-all"
            title="リセット"
          >
            ◯
          </button>
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-xl shadow-lg active:scale-95 transition-all"
            title="拡大"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
