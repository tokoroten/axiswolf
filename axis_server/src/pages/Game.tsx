import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateAxis } from '../data/axes';
import { getAxisLabelsByDifficulty } from '../data/axisLabels';
import { mutators } from '../data/mutators';
import { generateSeed } from '../utils/seedGenerator';
import type { Axis } from '../types';
import RulesModal from '../components/RulesModal';
import { getPlayerName } from '../data/playerNames';
import { generateCardsForPlayer, categoryColors, categoryDisplayNames, type Card } from '../data/onlineCards';

export default function Game() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const playerId = searchParams.get('pid') || localStorage.getItem('playerId') || '0';
  const isHost = searchParams.get('host') === 'true';
  
  // URLからラウンド数を取得、なければ0
  const initialRound = parseInt(searchParams.get('round') || '0');
  const [currentRound, setCurrentRound] = useState(initialRound);
  const [currentAxis, setCurrentAxis] = useState<Axis | null>(null);
  const [showRules, setShowRules] = useState(false);
  // URLパラメータから人数を取得、なければLocalStorageから
  const playerCount = parseInt(searchParams.get('playerCount') || localStorage.getItem('playerCount') || '4');
  // ゲームモードを取得
  const gameMode = (searchParams.get('mode') || localStorage.getItem('gameMode') || 'normal') as 'normal' | 'expert';
  // オンラインモードかどうか
  const isOnlineMode = searchParams.get('online') === 'true' || localStorage.getItem('isOnlineMode') === 'true';
  // オンラインモード用のカード
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  // 全プレイヤーのカード（ホスト用）
  const [allPlayersCards, setAllPlayersCards] = useState<Record<number, Card[]>>({});
  
  // 得点管理（ホスト用）
  const [scores, setScores] = useState<Record<number, number>>(() => {
    const savedScores = localStorage.getItem('gameScores');
    if (savedScores) {
      return JSON.parse(savedScores);
    }
    const initialScores: Record<number, number> = {};
    for (let i = 1; i <= playerCount; i++) {
      initialScores[i] = 0;
    }
    return initialScores;
  });

  // 得点を更新
  const updateScore = (playerId: number, delta: number) => {
    setScores(prev => {
      const newScores = { ...prev, [playerId]: (prev[playerId] || 0) + delta };
      localStorage.setItem('gameScores', JSON.stringify(newScores));
      return newScores;
    });
  };

  const loadRound = useCallback(() => {
    // ルームID（keyword）とラウンド数から全員共通のラウンドシードを生成
    const roundSeed = generateSeed(`${keyword}-${currentRound}`);
    
    // 難易度に応じた軸を生成（全員共通）
    const selectedAxis = generateAxis(roundSeed, currentRound, gameMode);
    
    // ウルフを決定（ラウンドシード % プレイヤー数 + 1）
    const zureshaPlayerId = (roundSeed % playerCount) + 1;
    const playerIdNum = parseInt(playerId) || 0;
    const isPlayerZuresha = playerIdNum === zureshaPlayerId;
    
    // ウルフの場合、別のズレシードを生成してミューテーターを選択
    if (isPlayerZuresha) {
      // ズレシード = ルームID + ラウンド数 + "zure" のハッシュ
      const zureSeed = generateSeed(`${keyword}-${currentRound}-zure`);
      
      // ミューテーターを選択
      const mutatorIndex = zureSeed % mutators.length;
      const selectedMutator = mutators[mutatorIndex];
      
      // ミューテーター効果を適用
      const mutatedAxis = applyMutator(selectedAxis, selectedMutator, zureSeed, selectedAxis);
      setCurrentAxis(mutatedAxis);
    } else {
      setCurrentAxis(selectedAxis);
    }
  }, [keyword, currentRound, playerId, playerCount, gameMode]);

  useEffect(() => {
    if (keyword) {
      // LocalStorageに保存
      localStorage.setItem('gameKeyword', keyword);
      if (playerId !== '0') {
        localStorage.setItem('playerId', playerId);
      }
      loadRound();
      
      // オンラインモードの場合、カードを生成
      if (isOnlineMode) {
        // ホストの場合
        if (isHost || playerId === '0') {
          const allCards: Record<number, Card[]> = {};
          for (let i = 1; i <= playerCount; i++) {
            allCards[i] = generateCardsForPlayer(keyword, currentRound, i, 5, gameMode);
          }
          setAllPlayersCards(allCards);
        } else {
          // プレイヤーの場合
          const cards = generateCardsForPlayer(keyword, currentRound, parseInt(playerId), 5, gameMode);
          setPlayerCards(cards);
        }
      }
    }
  }, [keyword, currentRound, playerId, loadRound, isOnlineMode]);

  // ミューテーター効果を軸に適用する関数
  const applyMutator = (axis: Axis, mutator: { id: string }, seed: number, originalAxis: Axis): Axis => {
    // 難易度に応じたラベルを取得
    const availableLabels = getAxisLabelsByDifficulty(gameMode);
    
    // 現在使われているラベルのインデックスと反転状態を取得
    const getCurrentLabelInfo = () => {
      // 水平軸の検索（正順と反転の両方を試す）
      let horizontalIndex = availableLabels.findIndex(label => 
        label.positive === originalAxis.horizontal.left && 
        label.negative === originalAxis.horizontal.right
      );
      let horizontalFlipped = false;
      
      if (horizontalIndex === -1) {
        // 反転している場合
        horizontalIndex = availableLabels.findIndex(label => 
          label.negative === originalAxis.horizontal.left && 
          label.positive === originalAxis.horizontal.right
        );
        horizontalFlipped = true;
      }
      
      // 垂直軸の検索（正順と反転の両方を試す）
      let verticalIndex = availableLabels.findIndex(label => 
        label.positive === originalAxis.vertical.top && 
        label.negative === originalAxis.vertical.bottom
      );
      let verticalFlipped = false;
      
      if (verticalIndex === -1) {
        // 反転している場合
        verticalIndex = availableLabels.findIndex(label => 
          label.negative === originalAxis.vertical.top && 
          label.positive === originalAxis.vertical.bottom
        );
        verticalFlipped = true;
      }
      
      return { 
        horizontalIndex, 
        verticalIndex, 
        horizontalFlipped, 
        verticalFlipped 
      };
    };
    
    // 異なるラベルを選択
    const getAlternativeLabelIndex = (currentIndex: number, offset: number) => {
      let newIndex = (seed + offset * 7) % availableLabels.length;
      // 現在のラベルと同じにならないようにする
      while (newIndex === currentIndex) {
        newIndex = (newIndex + 1) % availableLabels.length;
      }
      return newIndex;
    };

    const currentInfo = getCurrentLabelInfo();

    switch (mutator.id) {
      case 'mutator1': { // 縦軸を別の軸に変更
        const newVerticalIndex = getAlternativeLabelIndex(currentInfo.verticalIndex, 1);
        const newLabel = availableLabels[newVerticalIndex];
        return {
          ...axis,
          vertical: {
            // 元の反転状態を維持
            top: currentInfo.verticalFlipped ? newLabel.negative : newLabel.positive,
            bottom: currentInfo.verticalFlipped ? newLabel.positive : newLabel.negative
          }
        };
      }
      case 'mutator2': { // 横軸を別の軸に変更
        const newHorizontalIndex = getAlternativeLabelIndex(currentInfo.horizontalIndex, 2);
        const newLabel = availableLabels[newHorizontalIndex];
        return {
          ...axis,
          horizontal: {
            // 元の反転状態を維持
            left: currentInfo.horizontalFlipped ? newLabel.negative : newLabel.positive,
            right: currentInfo.horizontalFlipped ? newLabel.positive : newLabel.negative
          }
        };
      }
      case 'mutator3': { // 両軸を別の軸に変更
        const newHorizontalIndex = getAlternativeLabelIndex(currentInfo.horizontalIndex, 3);
        const newVerticalIndex = getAlternativeLabelIndex(currentInfo.verticalIndex, 5);
        // 両軸が同じにならないようにする
        let finalVerticalIndex = newVerticalIndex;
        while (finalVerticalIndex === newHorizontalIndex) {
          finalVerticalIndex = (finalVerticalIndex + 1) % availableLabels.length;
        }
        const horizontalLabel = availableLabels[newHorizontalIndex];
        const verticalLabel = availableLabels[finalVerticalIndex];
        return {
          ...axis,
          horizontal: {
            // 元の反転状態を維持
            left: currentInfo.horizontalFlipped ? horizontalLabel.negative : horizontalLabel.positive,
            right: currentInfo.horizontalFlipped ? horizontalLabel.positive : horizontalLabel.negative
          },
          vertical: {
            // 元の反転状態を維持
            top: currentInfo.verticalFlipped ? verticalLabel.negative : verticalLabel.positive,
            bottom: currentInfo.verticalFlipped ? verticalLabel.positive : verticalLabel.negative
          }
        };
      }
      default:
        return axis;
    }
  };

  const updateURLRound = (newRound: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('round', newRound.toString());
    setSearchParams(newParams, { replace: true });
  };

  const handleNextRound = () => {
    const newRound = currentRound + 1;
    setCurrentRound(newRound);
    updateURLRound(newRound);
    window.scrollTo(0, 0);
  };

  const handlePrevRound = () => {
    if (currentRound > 0) {
      const newRound = currentRound - 1;
      setCurrentRound(newRound);
      updateURLRound(newRound);
      window.scrollTo(0, 0);
    }
  };

  if (!currentAxis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-600">パスコード: </span>
              <span className="font-mono font-bold text-lg">{keyword}</span>
            </div>
            <div>
              <span className="text-gray-600">人数: </span>
              <span className="font-bold text-lg">{playerCount}人</span>
            </div>
            <div>
              <span className="text-gray-600">モード: </span>
              <span className="font-bold text-lg">{gameMode === 'normal' ? '一般向け' : 'インテリ向け'}</span>
            </div>
            {!isHost && (
              <div>
                <span className="text-gray-600">プレイヤー: </span>
                <span 
                  className="font-bold text-lg px-2 py-1 rounded"
                  style={{
                    backgroundColor: getPlayerName(parseInt(playerId) || 0).bgColor,
                    color: getPlayerName(parseInt(playerId) || 0).color
                  }}
                >
                  {getPlayerName(parseInt(playerId) || 0).name}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-600">ラウンド: </span>
              <span className="font-bold text-lg">{currentRound + 1}</span>
            </div>
          </div>
          <button
            onClick={() => setShowRules(true)}
            className="mt-3 w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            📖 ルールを確認
          </button>
        </div>

        {/* 軸表示 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="relative" style={{ paddingTop: '100%' }}>
            <div className="absolute inset-0">
              {/* 対角線で区切られた三角形エリア */}
              {/* SVGで三角形エリアを描画 */}
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
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-500"></div>

              {/* ラベル */}
              {/* A: 上 */}
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-red-500 opacity-20 z-10">A</div>

              {/* B: 下 */}
              <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-6xl font-bold text-blue-500 opacity-20 z-10">B</div>

              {/* C: 左 */}
              <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 -translate-x-1/2 text-6xl font-bold text-green-500 opacity-20 z-10">C</div>

              {/* D: 右 */}
              <div className="absolute right-1/4 top-1/2 transform -translate-y-1/2 translate-x-1/2 text-6xl font-bold text-yellow-600 opacity-20 z-10">D</div>
              
              {/* ホストモードの場合、正解と人狼の両方を表示 */}
              {isHost ? (() => {
                // ラウンドシード生成
                const roundSeed = generateSeed(`${keyword}-${currentRound}`);
                const originalAxis = generateAxis(roundSeed, currentRound, gameMode);
                
                // ウルフを決定
                // const zureshaPlayerId = (roundSeed % playerCount) + 1;
                
                // ズレシードからミューテーター情報を取得
                const zureSeed = generateSeed(`${keyword}-${currentRound}-zure`);
                const mutatorIndex = zureSeed % mutators.length;
                const selectedMutator = mutators[mutatorIndex];
                const mutatedAxis = applyMutator(originalAxis, selectedMutator, zureSeed, originalAxis);
                
                return (
                  <>
                    {/* 正解の軸（実線） */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-400 shadow-md">
                        <span className="text-red-600 mr-1">(A)</span> {originalAxis.vertical.top}
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-400 shadow-md">
                        <span className="text-blue-600 mr-1">(B)</span> {originalAxis.vertical.bottom}
                      </div>
                    </div>
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-400 shadow-md">
                        <span className="text-green-600 mr-1">(C)</span> {originalAxis.horizontal.left}
                      </div>
                    </div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-400 shadow-md">
                        <span className="text-yellow-700 mr-1">(D)</span> {originalAxis.horizontal.right}
                      </div>
                    </div>
                    
                    {/* 人狼の軸（点線・赤） - 変更がある場合のみ表示 */}
                    {mutatedAxis.vertical.top !== originalAxis.vertical.top && (
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                        <div className="bg-red-50 px-3 py-1 rounded-lg text-sm border-2 border-dashed border-red-400">
                          <span className="text-red-600">人狼: {mutatedAxis.vertical.top}</span>
                        </div>
                      </div>
                    )}
                    {mutatedAxis.vertical.bottom !== originalAxis.vertical.bottom && (
                      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
                        <div className="bg-red-50 px-3 py-1 rounded-lg text-sm border-2 border-dashed border-red-400">
                          <span className="text-red-600">人狼: {mutatedAxis.vertical.bottom}</span>
                        </div>
                      </div>
                    )}
                    {mutatedAxis.horizontal.left !== originalAxis.horizontal.left && (
                      <div className="absolute left-2 top-[56%] transform -translate-y-1/2">
                        <div className="bg-red-50 px-3 py-1 rounded-lg text-sm border-2 border-dashed border-red-400">
                          <span className="text-red-600">人狼: {mutatedAxis.horizontal.left}</span>
                        </div>
                      </div>
                    )}
                    {mutatedAxis.horizontal.right !== originalAxis.horizontal.right && (
                      <div className="absolute right-2 top-[56%] transform -translate-y-1/2">
                        <div className="bg-red-50 px-3 py-1 rounded-lg text-sm border-2 border-dashed border-red-400">
                          <span className="text-red-600">人狼: {mutatedAxis.horizontal.right}</span>
                        </div>
                      </div>
                    )}
                  </>
                );
              })() : (
                <>
                  {/* 通常プレイヤーの軸表示 */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-300 shadow-md">
                      <span className="text-red-600 mr-1">(A)</span> {currentAxis.vertical.top}
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-300 shadow-md">
                      <span className="text-blue-600 mr-1">(B)</span> {currentAxis.vertical.bottom}
                    </div>
                  </div>
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                    <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-300 shadow-md">
                      <span className="text-green-600 mr-1">(C)</span> {currentAxis.horizontal.left}
                    </div>
                  </div>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-300 shadow-md">
                      <span className="text-yellow-700 mr-1">(D)</span> {currentAxis.horizontal.right}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ホスト用情報表示 */}
        {isHost && (() => {
          // ラウンドシード生成（プレイヤーと同じロジック）
          const roundSeed = generateSeed(`${keyword}-${currentRound}`);
          // const originalAxis = generateAxis(roundSeed, currentRound, gameMode);
          
          // ウルフを決定
          const zureshaPlayerId = (roundSeed % playerCount) + 1;
          const zureshaInfo = getPlayerName(zureshaPlayerId);
          
          // スタートプレイヤーをラウンドシードから決定
          // 全員共通の乱数で公平に決定
          const startPlayerSeed = generateSeed(`${keyword}-${currentRound}-start`);
          const startPlayerId = (startPlayerSeed % playerCount) + 1;
          const startPlayerInfo = getPlayerName(startPlayerId);
          
          // ズレシードからミューテーター情報を取得
          // const zureSeed = generateSeed(`${keyword}-${currentRound}-zure`);
          // const mutatorIndex = zureSeed % mutators.length;
          // const selectedMutator = mutators[mutatorIndex];
          // const mutatedAxis = applyMutator(originalAxis, selectedMutator, zureSeed, originalAxis);
          
          return (
            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 mb-6">
              <div className="text-sm text-purple-600 mb-3 font-bold">【ホスト用情報】</div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-purple-600 mb-1">スタートプレイヤー:</div>
                    <div className="text-lg font-bold text-purple-700">
                      <span 
                        className="px-3 py-1 rounded"
                        style={{
                          backgroundColor: startPlayerInfo.bgColor,
                          color: startPlayerInfo.color
                        }}
                      >
                        {startPlayerInfo.name}
                      </span>
                    </div>
                    <div className="text-xs text-purple-500 mt-1">
                      （システムでランダム決定）
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-purple-600 mb-1">今回の人狼:</div>
                    <div className="text-lg font-bold text-purple-700">
                      <span 
                        className="px-3 py-1 rounded"
                        style={{
                          backgroundColor: zureshaInfo.bgColor,
                          color: zureshaInfo.color
                        }}
                      >
                        {zureshaInfo.name}
                      </span>
                    </div>
                  </div>
                </div>
                
                
                {/* デバッグ用プレイヤーリンク */}
                <div>
                  <div className="text-sm text-purple-600 mb-2">デバッグ用リンク:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: playerCount }, (_, i) => i + 1).map(pid => {
                      const playerInfo = getPlayerName(pid);
                      const baseUrl = window.location.origin;
                      const basePath = import.meta.env.BASE_URL; // '/' または '/axiswolf/'
                      const playerUrl = `${baseUrl}${basePath}game?keyword=${encodeURIComponent(keyword)}&pid=${pid}&mode=${gameMode}&round=${currentRound}&playerCount=${playerCount}${isOnlineMode ? '&online=true' : ''}`;
                      return (
                        <a
                          key={pid}
                          href={playerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 rounded text-sm hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: playerInfo.bgColor,
                            color: playerInfo.color
                          }}
                        >
                          {playerInfo.name}
                          {pid === zureshaPlayerId && (
                            <span className="ml-1">(人狼)</span>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
                
                <div className="text-xs text-purple-500">
                  ※ この情報はホストのみに表示されています
                </div>
              </div>
            </div>
          );
        })()}

        {/* オンラインモードの場合のカード表示 */}
        {isOnlineMode && !isHost && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-6">
            <div className="text-sm text-blue-600 mb-3 font-bold">【あなたのカード】</div>
            <div className="grid grid-cols-5 gap-3">
              {playerCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg p-3 border-2 shadow-md hover:shadow-lg transition-shadow"
                  style={{
                    borderColor: categoryColors[card.category],
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: categoryColors[card.category] }}>
                    {categoryDisplayNames[card.category]}
                  </div>
                  <div className="text-sm font-bold text-gray-800">
                    {card.name}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-blue-600">
              ※ MiroやJamboardなどのオンラインボード上で、これらのカードを配置してください
            </div>
          </div>
        )}

        {/* ホスト用：全プレイヤーのカード表示 */}
        {isOnlineMode && isHost && (
          <div className="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-6 mb-6">
            <div className="text-sm text-indigo-600 mb-3 font-bold">【全プレイヤーのカード（ホスト用）】</div>
            <div className="space-y-4">
              {Array.from({ length: playerCount }, (_, i) => i + 1).map(pid => {
                const playerInfo = getPlayerName(pid);
                const cards = allPlayersCards[pid] || [];
                return (
                  <div key={pid} className="bg-white rounded-lg p-4 border border-indigo-200">
                    <div className="mb-2">
                      <span 
                        className="px-3 py-1 rounded text-sm font-bold"
                        style={{
                          backgroundColor: playerInfo.bgColor,
                          color: playerInfo.color
                        }}
                      >
                        {playerInfo.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {cards.map((card, index) => (
                        <div
                          key={card?.id || `card-${index}`}
                          className="bg-gray-50 rounded p-2 border text-xs"
                          style={{
                            borderColor: card?.category ? categoryColors[card.category] : '#ccc',
                          }}
                        >
                          <div className="text-xs" style={{ color: card?.category ? categoryColors[card.category] : '#666' }}>
                            {card?.category ? categoryDisplayNames[card.category] : ''}
                          </div>
                          <div className="font-bold text-gray-700 truncate">
                            {card?.name || 'カード'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-indigo-600">
              ※ この情報はホストのみに表示されています
            </div>
          </div>
        )}

        {/* スタートプレイヤー表示（非ホスト用） */}
        {!isHost && (() => {
          // const roundSeed = generateSeed(`${keyword}-${currentRound}`);
          const startPlayerSeed = generateSeed(`${keyword}-${currentRound}-start`);
          const startPlayerId = (startPlayerSeed % playerCount) + 1;
          const startPlayerInfo = getPlayerName(startPlayerId);
          
          return (
            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 mb-6">
              <div className="text-sm text-purple-600 mb-1">スタートプレイヤー:</div>
              <div className="text-lg font-bold">
                <span 
                  className="px-3 py-1 rounded"
                  style={{
                    backgroundColor: startPlayerInfo.bgColor,
                    color: startPlayerInfo.color
                  }}
                >
                  {startPlayerInfo.name}
                </span>
              </div>
            </div>
          );
        })()}

        {/* 得点管理（ホストまたはプレイヤーID1） */}
        {(isHost || (!isHost && parseInt(playerId) === 1)) && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 mb-6">
            <div className="text-sm text-amber-700 mb-3 font-bold">
              {isHost ? '【得点管理】' : '【得点管理（ルビー担当）】'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: playerCount }, (_, i) => i + 1).map(pid => {
                const playerInfo = getPlayerName(pid);
                return (
                  <div key={pid} className="bg-white rounded-lg p-3 border border-amber-200">
                    <div 
                      className="text-sm font-bold mb-2 px-2 py-1 rounded text-center"
                      style={{
                        backgroundColor: playerInfo.bgColor,
                        color: playerInfo.color
                      }}
                    >
                      {playerInfo.name}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => updateScore(pid, -1)}
                        className="w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-bold"
                      >
                        -
                      </button>
                      <div className="text-2xl font-bold w-12 text-center">
                        {scores[pid] || 0}
                      </div>
                      <button
                        onClick={() => updateScore(pid, 1)}
                        className="w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-amber-600">
              <div>【得点ルール】</div>
              <div>村人：人狼を正しく指したら+1点（人狼が最多票になったら全員+1点）</div>
              <div>人狼：最多票を避けられたら+3点</div>
              <div className="text-red-600">ペナルティ：軸の名前を口に出したら-1点</div>
            </div>
          </div>
        )}

        {/* ラウンド移動ボタン */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handlePrevRound}
            disabled={currentRound === 0}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-colors ${
              currentRound === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            前のラウンドへ
          </button>
          <button
            onClick={handleNextRound}
            className="bg-purple-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-purple-600 transition-colors"
          >
            次のラウンドへ
          </button>
        </div>
      </div>
      
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}