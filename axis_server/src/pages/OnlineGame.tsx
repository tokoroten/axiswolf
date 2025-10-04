import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { getPlayerColorStyle } from '../utils/playerColors';

export default function OnlineGame() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, players, placedCards, votes, isHost, playerSlot, updatePhase, placeCard, submitVote, fetchVotes, fetchHand } = useGame();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [myAxis, setMyAxis] = useState<any>(null);
  const [myHand, setMyHand] = useState<string[]>([]);
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; isPlaced: boolean } | null>(null);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const lastRoundSeedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      navigate('/online');
    }
  }, [roomCode, navigate]);

  // 既に参加済みかチェック
  const isJoined = playerSlot !== null && room !== null;

  useEffect(() => {
    console.log('[OnlineGame] useEffect triggered', {
      hasRoom: !!room,
      phase: room?.phase,
      hasAxisPayload: !!room?.axis_payload,
      hasRoundSeed: !!room?.round_seed,
      roundSeed: room?.round_seed,
      lastRoundSeed: lastRoundSeedRef.current,
      playerSlot,
      playersLength: players.length,
      myHandLength: myHand.length
    });

    if (room && room.axis_payload && room.phase !== 'lobby') {
      // 軸データを取得
      const axisData = typeof room.axis_payload === 'string'
        ? JSON.parse(room.axis_payload)
        : room.axis_payload;

      // 自分が人狼かどうかを確認
      const wolfSlot = (parseInt(room.round_seed || '0') % players.length);
      const isWolf = playerSlot === wolfSlot;

      if (isWolf && room.wolf_axis_payload) {
        const wolfAxisData = typeof room.wolf_axis_payload === 'string'
          ? JSON.parse(room.wolf_axis_payload)
          : room.wolf_axis_payload;
        setMyAxis(wolfAxisData);
      } else {
        setMyAxis(axisData);
      }

      // 手札を取得（ラウンドシードが変わったら再取得）
      if (playerSlot !== null && room.round_seed && room.round_seed !== lastRoundSeedRef.current) {
        console.log('[OnlineGame] Fetching hand for player', playerSlot, 'with seed', room.round_seed);
        fetchHand().then(hand => {
          console.log('[OnlineGame] Fetched hand:', hand);
          setMyHand(hand);
          lastRoundSeedRef.current = room.round_seed;
        }).catch(error => {
          console.error('[OnlineGame] Failed to fetch hand:', error);
        });
      } else {
        console.log('[OnlineGame] Skipping hand fetch:', {
          playerSlot,
          hasRoundSeed: !!room.round_seed,
          roundSeed: room.round_seed,
          lastRoundSeed: lastRoundSeedRef.current,
          same: room.round_seed === lastRoundSeedRef.current
        });
      }
    }
  }, [room, playerSlot, players.length, fetchHand]);


  const handleStartGame = async () => {
    if (!isHost || !roomCode) return;

    try {
      // サーバー側で軸を生成するため、引数なしでphaseのみ変更
      await updatePhase('placement');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('ゲーム開始に失敗しました');
    }
  };

  const handleBoardClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedCard || !roomCode || room?.phase !== 'placement') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const offsetX = (x - 0.5) * 2;
    const offsetY = (y - 0.5) * 2;
    const quadrant = (x >= 0.5 ? 1 : 0) + (y >= 0.5 ? 2 : 0);

    await placeCard(selectedCard, quadrant, { x: offsetX, y: offsetY });
    setSelectedCard(null);
  };

  const handleDragStart = (cardId: string, isPlaced: boolean) => {
    setDraggedCard({ cardId, isPlaced });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedCard || !roomCode || room?.phase !== 'placement') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const offsetX = (x - 0.5) * 2;
    const offsetY = (y - 0.5) * 2;
    const quadrant = (x >= 0.5 ? 1 : 0) + (y >= 0.5 ? 2 : 0);

    await placeCard(draggedCard.cardId, quadrant, { x: offsetX, y: offsetY });
    setDraggedCard(null);
    setSelectedCard(null);
  };

  // 未参加の場合はOnlineHomeにリダイレクト
  useEffect(() => {
    if (!isJoined && roomCode) {
      navigate('/online');
    }
  }, [isJoined, roomCode, navigate]);

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">ルームに参加していません...</p>
          <p className="text-sm text-gray-400">リダイレクト中...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // 自分のプレイヤー情報を取得
  const myPlayer = players.find(p => p.player_slot === playerSlot);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">ルーム: {roomCode}</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              フェーズ: {room.phase} | プレイヤー数: {players.length}
            </div>
            {myPlayer && playerSlot !== null && (
              <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg border-2 border-gray-700">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white"
                  style={{ backgroundColor: getPlayerColorStyle(playerSlot) }}
                ></div>
                <span className="font-bold">{myPlayer.player_name}</span>
                {myPlayer.is_host === 1 && (
                  <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded">ホスト</span>
                )}
              </div>
            )}
          </div>
        </div>

        {room.phase === 'lobby' && isHost && (
          <button
            onClick={handleStartGame}
            className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            ゲーム開始
          </button>
        )}

        {room.phase === 'lobby' && (
          <div className="bg-gray-800 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">プレイヤー一覧</h2>
            <ul className="space-y-2">
              {players.map((p) => (
                <li key={p.player_slot} className="flex items-center gap-3 bg-gray-700 px-3 py-2 rounded">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white flex-shrink-0"
                    style={{ backgroundColor: getPlayerColorStyle(p.player_slot) }}
                  ></div>
                  <span className="font-medium">{p.player_name}</span>
                  {p.is_host === 1 && (
                    <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded ml-auto">ホスト</span>
                  )}
                  {p.player_slot === playerSlot && (
                    <span className="text-xs bg-blue-600 px-2 py-0.5 rounded ml-auto">あなた</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {(room.phase === 'placement' || room.phase === 'voting' || room.phase === 'results') && myHand.length > 0 && (
          <div className="bg-gray-800 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">
              {room.phase === 'placement' ? '手札（ドラッグ&ドロップで配置）' : '手札'}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {myHand.map((card) => {
                const isPlaced = placedCards.some(c => c.card_id === card && c.player_slot === playerSlot);
                return (
                  <div
                    key={card}
                    draggable={room.phase === 'placement' && !isPlaced}
                    onDragStart={() => room.phase === 'placement' && !isPlaced && handleDragStart(card, false)}
                    onClick={() => room.phase === 'placement' && !isPlaced && setSelectedCard(card)}
                    className={`px-4 py-2 rounded font-medium transition-all ${
                      room.phase === 'placement' && !isPlaced
                        ? 'cursor-move ' + (selectedCard === card ? 'bg-blue-600 scale-105 shadow-lg' : 'bg-gray-700 hover:bg-gray-600')
                        : isPlaced
                          ? 'bg-gray-600 opacity-50 cursor-default'
                          : 'bg-gray-700 cursor-default'
                    }`}
                  >
                    {card}
                  </div>
                );
              })}
            </div>
            {selectedCard && room.phase === 'placement' && (
              <div className="mt-2 text-sm text-blue-400">
                選択中: {selectedCard} - ドラッグ or クリックで配置
              </div>
            )}
          </div>
        )}

        {room.phase === 'placement' && (
          <>
            {isHost && (
              <button
                onClick={async () => {
                  await updatePhase('voting');
                }}
                className="mb-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
              >
                投票フェーズへ進む
              </button>
            )}

            <div
              onClick={handleBoardClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative w-full aspect-square bg-white rounded-xl cursor-crosshair shadow-xl"
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
              {myAxis && (
                <>
                  {/* 縦軸 上 (A) */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
                    <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-300 shadow-md">
                      <span className="text-red-600">(A) {myAxis.vertical.negative}</span>
                    </div>
                  </div>
                  {/* 縦軸 下 (B) */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 pointer-events-none">
                    <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-300 shadow-md">
                      <span className="text-blue-600">(B) {myAxis.vertical.positive}</span>
                    </div>
                  </div>
                  {/* 横軸 左 (C) */}
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-300 shadow-md">
                      <span className="text-green-600">(C) {myAxis.horizontal.negative}</span>
                    </div>
                  </div>
                  {/* 横軸 右 (D) */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="bg-white px-4 py-2 rounded-lg font-bold text-lg border-2 border-gray-300 shadow-md">
                      <span className="text-yellow-700">(D) {myAxis.horizontal.positive}</span>
                    </div>
                  </div>
                </>
              )}

              {/* 配置されたカード（プレイヤーカラー付き） */}
              {placedCards.map((card, idx) => {
                const isMyCard = card.player_slot === playerSlot;
                return (
                  <div
                    key={idx}
                    draggable={isMyCard}
                    onDragStart={() => isMyCard && handleDragStart(card.card_id, true)}
                    className={`absolute w-20 h-20 rounded-xl flex flex-col items-center justify-center text-sm font-bold shadow-2xl border-2 border-white/20 transition-transform hover:scale-110 ${
                      isMyCard ? 'cursor-move' : 'cursor-default'
                    }`}
                    style={{
                      left: `${(card.offsets.x + 1) * 50}%`,
                      top: `${(card.offsets.y + 1) * 50}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: getPlayerColorStyle(card.player_slot),
                    }}
                  >
                    <div className="text-white text-center px-1 leading-tight">{card.card_id}</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {room.phase === 'voting' && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="font-bold mb-4 text-xl">投票フェーズ</h2>
            <p className="text-gray-300 mb-6">誰が人狼だと思うか投票してください</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {players.map((player) => {
                const isMyself = player.player_slot === playerSlot;
                const isSelected = selectedVote === player.player_slot;
                const hasVoted = votes.some(v => v.voter_slot === player.player_slot);

                return (
                  <button
                    key={player.player_slot}
                    onClick={() => !isMyself && setSelectedVote(player.player_slot)}
                    disabled={isMyself}
                    className={`
                      p-4 rounded-lg border-2 transition-all
                      ${isMyself
                        ? 'bg-gray-700 border-gray-600 cursor-not-allowed opacity-50'
                        : isSelected
                          ? 'border-yellow-400 bg-yellow-900/50 scale-105 shadow-lg'
                          : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-white"
                        style={{ backgroundColor: getPlayerColorStyle(player.player_slot) }}
                      ></div>
                      <div className="font-bold">{player.player_name}</div>
                      {isMyself && <div className="text-xs text-gray-400">（自分）</div>}
                      {hasVoted && <div className="text-green-400 text-xs">✓ 投票済み</div>}
                      {isSelected && <div className="text-yellow-400 text-xl">✓</div>}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={async () => {
                if (selectedVote !== null && roomCode && playerSlot !== null) {
                  await submitVote(selectedVote);
                  await fetchVotes();
                }
              }}
              disabled={selectedVote === null}
              className={`
                w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors mb-4
                ${selectedVote !== null
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {selectedVote !== null ? '投票する' : '投票先を選択してください'}
            </button>

            {isHost && (
              <button
                onClick={async () => {
                  await fetchVotes();
                  await updatePhase('results');
                }}
                className="w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors bg-purple-600 hover:bg-purple-700 text-white"
              >
                結果を表示
              </button>
            )}
          </div>
        )}

        {room.phase === 'results' && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="font-bold mb-4 text-xl">投票結果</h2>

            {(() => {
              // 投票集計
              const voteCounts: Record<number, number> = {};
              votes.forEach(v => {
                voteCounts[v.target_slot] = (voteCounts[v.target_slot] || 0) + 1;
              });

              // 最多得票数
              const maxVotes = Math.max(...Object.values(voteCounts));
              // 最多得票者（複数いる可能性）
              const topVoted = Object.entries(voteCounts)
                .filter(([, count]) => count === maxVotes)
                .map(([slot]) => parseInt(slot));

              // 人狼を特定
              const wolfSlot = room.round_seed ? (parseInt(room.round_seed) % players.length) : null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {players.map((player) => {
                      const voteCount = voteCounts[player.player_slot] || 0;
                      const isWolf = player.player_slot === wolfSlot;
                      const isMostVoted = topVoted.includes(player.player_slot);

                      return (
                        <div
                          key={player.player_slot}
                          className={`p-4 rounded-lg border-2 ${
                            isMostVoted ? 'border-yellow-400 bg-yellow-900/30' : 'border-gray-600'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className="w-12 h-12 rounded-full border-2 border-white"
                              style={{ backgroundColor: getPlayerColorStyle(player.player_slot) }}
                            ></div>
                            <div className="font-bold">{player.player_name}</div>
                            <div className="text-lg">{voteCount} 票</div>
                            {isWolf && <div className="text-red-400 font-bold">🐺 人狼</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-900/50 p-4 rounded-lg">
                    {wolfSlot !== null && topVoted.includes(wolfSlot) ? (
                      <div>
                        <div className="text-green-400 font-bold text-xl mb-2">✓ 村人の勝利！</div>
                        <div className="text-gray-300">人狼が最多得票を獲得しました</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-red-400 font-bold text-xl mb-2">✗ 人狼の勝利！</div>
                        <div className="text-gray-300">人狼は発見されませんでした</div>
                      </div>
                    )}
                  </div>

                  {isHost && (
                    <button
                      onClick={() => {
                        // 次ラウンドの実装は後で
                        alert('次ラウンド機能は未実装です');
                      }}
                      className="w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors bg-green-600 hover:bg-green-700 text-white"
                    >
                      次のラウンドへ
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
