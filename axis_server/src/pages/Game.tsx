import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateAxis } from '../data/axes';
import { getAxisLabelsByDifficulty } from '../data/axisLabels';
import { mutators } from '../data/mutators';
import { generateSeed } from '../utils/seedGenerator';
import type { Axis } from '../types';
import RulesModal from '../components/RulesModal';
import { getPlayerName } from '../data/playerNames';

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
    }
  }, [keyword, currentRound, playerId, loadRound]);

  // ミューテーター効果を軸に適用する関数
  const applyMutator = (axis: Axis, mutator: { id: string }, seed: number, originalAxis: Axis): Axis => {
    // 難易度に応じたラベルを取得
    const availableLabels = getAxisLabelsByDifficulty(gameMode);
    
    // 現在使われているラベルのインデックスを取得
    const getCurrentLabelIndices = () => {
      const horizontalIndex = availableLabels.findIndex(label => 
        label.positive === originalAxis.horizontal.left && 
        label.negative === originalAxis.horizontal.right
      );
      const verticalIndex = availableLabels.findIndex(label => 
        label.positive === originalAxis.vertical.top && 
        label.negative === originalAxis.vertical.bottom
      );
      return { horizontalIndex, verticalIndex };
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

    const currentIndices = getCurrentLabelIndices();

    switch (mutator.id) {
      case 'mutator1': { // 縦軸を別の軸に変更
        const newVerticalIndex = getAlternativeLabelIndex(currentIndices.verticalIndex, 1);
        const newLabel = availableLabels[newVerticalIndex];
        return {
          ...axis,
          vertical: {
            top: newLabel.positive,
            bottom: newLabel.negative
          }
        };
      }
      case 'mutator2': { // 横軸を別の軸に変更
        const newHorizontalIndex = getAlternativeLabelIndex(currentIndices.horizontalIndex, 2);
        const newLabel = availableLabels[newHorizontalIndex];
        return {
          ...axis,
          horizontal: {
            left: newLabel.positive,
            right: newLabel.negative
          }
        };
      }
      case 'mutator3': { // 両軸を別の軸に変更
        const newHorizontalIndex = getAlternativeLabelIndex(currentIndices.horizontalIndex, 3);
        const newVerticalIndex = getAlternativeLabelIndex(currentIndices.verticalIndex, 5);
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
            left: horizontalLabel.positive,
            right: horizontalLabel.negative
          },
          vertical: {
            top: verticalLabel.positive,
            bottom: verticalLabel.negative
          }
        };
      }
      case 'mutator4': // 縦軸と横軸を入れ替え
        return {
          ...axis,
          vertical: {
            top: axis.horizontal.left,
            bottom: axis.horizontal.right
          },
          horizontal: {
            left: axis.vertical.top,
            right: axis.vertical.bottom
          }
        };
      case 'mutator5': // 縦軸を反転
        return {
          ...axis,
          vertical: {
            top: axis.vertical.bottom,
            bottom: axis.vertical.top
          }
        };
      case 'mutator6': // 横軸を反転
        return {
          ...axis,
          horizontal: {
            left: axis.horizontal.right,
            right: axis.horizontal.left
          }
        };
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
  };

  const handlePrevRound = () => {
    if (currentRound > 0) {
      const newRound = currentRound - 1;
      setCurrentRound(newRound);
      updateURLRound(newRound);
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
              {/* 縦軸と横軸の線 */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300"></div>
              
              {/* 軸ラベル */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-100 px-4 py-2 rounded-lg font-bold text-lg">
                  {currentAxis.vertical.top}
                </div>
              </div>
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-100 px-4 py-2 rounded-lg font-bold text-lg">
                  {currentAxis.vertical.bottom}
                </div>
              </div>
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                <div className="bg-green-100 px-4 py-2 rounded-lg font-bold text-lg">
                  {currentAxis.horizontal.left}
                </div>
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="bg-green-100 px-4 py-2 rounded-lg font-bold text-lg">
                  {currentAxis.horizontal.right}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ホスト用情報表示 */}
        {isHost && (() => {
          // ラウンドシード生成（プレイヤーと同じロジック）
          const roundSeed = generateSeed(`${keyword}-${currentRound}`);
          const originalAxis = generateAxis(roundSeed, currentRound, gameMode);
          
          // ウルフを決定
          const zureshaPlayerId = (roundSeed % playerCount) + 1;
          const zureshaInfo = getPlayerName(zureshaPlayerId);
          
          // スタートプレイヤーをラウンドシードから決定
          // 全員共通の乱数で公平に決定
          const startPlayerSeed = generateSeed(`${keyword}-${currentRound}-start`);
          const startPlayerId = (startPlayerSeed % playerCount) + 1;
          const startPlayerInfo = getPlayerName(startPlayerId);
          
          // ズレシードからミューテーター情報を取得
          const zureSeed = generateSeed(`${keyword}-${currentRound}-zure`);
          const mutatorIndex = zureSeed % mutators.length;
          const selectedMutator = mutators[mutatorIndex];
          const mutatedAxis = applyMutator(originalAxis, selectedMutator, zureSeed, originalAxis);
          
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
                
                <div>
                  <div className="text-sm text-purple-600 mb-1">人狼に表示されている軸:</div>
                  <div className="bg-white rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">縦軸:</span>
                        <div className="font-medium">
                          <span className="text-blue-600">{mutatedAxis.vertical.top}</span>
                          <span className="mx-1">/</span>
                          <span className="text-blue-600">{mutatedAxis.vertical.bottom}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">横軸:</span>
                        <div className="font-medium">
                          <span className="text-green-600">{mutatedAxis.horizontal.left}</span>
                          <span className="mx-1">/</span>
                          <span className="text-green-600">{mutatedAxis.horizontal.right}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      変更タイプ: {selectedMutator.name}
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
                      const playerUrl = `${baseUrl}${basePath}game?keyword=${encodeURIComponent(keyword)}&pid=${pid}&mode=${gameMode}&round=${currentRound}&playerCount=${playerCount}`;
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
              <div>ルール：村人がウルフを当てたら+1点、ウルフが逃げ切ったら+3点</div>
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