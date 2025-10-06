import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { getPlayerColorStyle } from '../utils/playerColors';
import GameBoard from '../components/GameBoard';
import { api } from '../lib/api';

export default function OnlineGame() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, players, placedCards, votes, isHost, playerSlot, updatePhase, placeCard, submitVote, fetchVotes, fetchHand, calculateResults, startNextRound } = useGame();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [myAxis, setMyAxis] = useState<any>(null);
  const [myHand, setMyHand] = useState<string[]>([]);
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; isPlaced: boolean } | null>(null);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const lastRoundSeedRef = useRef<string | null>(null);
  const handFetchedRef = useRef<boolean>(false);
  const [gameResults, setGameResults] = useState<{
    wolf_slot: number;
    top_voted: number[];
    wolf_caught: boolean;
    scores: Record<string, number>;
    vote_counts: Record<number, number>;
    all_hands: Record<string, string[]>;
    wolf_axis: any;
    normal_axis: any;
  } | null>(null);

  useEffect(() => {
    if (!roomCode) {
      navigate('/online');
    }
  }, [roomCode, navigate]);

  // プレイヤー退出処理
  const handleLeaveRoom = async () => {
    if (!roomCode) return;

    const savedPlayerId = localStorage.getItem('online_player_id');
    if (savedPlayerId) {
      try {
        await api.leaveRoom(roomCode, savedPlayerId);
      } catch (error) {
        console.error('[OnlineGame] Failed to leave room:', error);
      }
    }

    // LocalStorageをクリア
    localStorage.removeItem('online_room_code');
    localStorage.removeItem('online_player_id');
    localStorage.removeItem('online_player_name');
  };

  // ブラウザを閉じる/タブを閉じるときに退出処理
  useEffect(() => {
    const handleBeforeUnload = () => {
      handleLeaveRoom();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomCode]);

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

    if (room && room.axis_payload && room.round_seed && playerSlot !== null && players.length > 0) {
      // 軸データを取得
      const axisData = typeof room.axis_payload === 'string'
        ? JSON.parse(room.axis_payload)
        : room.axis_payload;

      // 自分が人狼かどうかを確認
      const wolfSlot = (parseInt(room.round_seed) % players.length);
      const isWolf = playerSlot === wolfSlot;

      console.log('[OnlineGame] Setting axis', { playerSlot, wolfSlot, isWolf });

      if (isWolf && room.wolf_axis_payload) {
        const wolfAxisData = typeof room.wolf_axis_payload === 'string'
          ? JSON.parse(room.wolf_axis_payload)
          : room.wolf_axis_payload;
        setMyAxis(wolfAxisData);
      } else {
        setMyAxis(axisData);
      }

      // 手札を取得（ラウンドシードが変わったら、または初回取得）
      if (room.round_seed !== lastRoundSeedRef.current) {
        console.log('[OnlineGame] Fetching hand for player', playerSlot, 'with seed', room.round_seed);
        fetchHand().then(hand => {
          console.log('[OnlineGame] Fetched hand:', hand);
          setMyHand(hand);
          lastRoundSeedRef.current = room.round_seed;
          handFetchedRef.current = true;
        }).catch(error => {
          console.error('[OnlineGame] Failed to fetch hand:', error);
        });
      } else {
        console.log('[OnlineGame] Skipping hand fetch:', {
          playerSlot,
          hasRoundSeed: !!room.round_seed,
          roundSeed: room.round_seed,
          lastRoundSeed: lastRoundSeedRef.current,
          handFetched: handFetchedRef.current,
          same: room.round_seed === lastRoundSeedRef.current
        });
      }
    }
  }, [room, playerSlot, players.length, fetchHand]);

  // resultsフェーズになったら結果を取得（非ホストプレイヤー用）
  useEffect(() => {
    if (room?.phase === 'results' && !gameResults) {
      console.log('[OnlineGame] Fetching results for non-host player');
      calculateResults()
        .then(results => {
          console.log('[OnlineGame] Received results:', results);
          console.log('[OnlineGame] wolf_axis:', results.wolf_axis);
          console.log('[OnlineGame] normal_axis:', results.normal_axis);
          setGameResults({
            wolf_slot: results.wolf_slot,
            top_voted: results.top_voted,
            wolf_caught: results.wolf_caught,
            scores: results.scores,
            vote_counts: results.vote_counts,
            all_hands: results.all_hands,
            wolf_axis: results.wolf_axis,
            normal_axis: results.normal_axis,
          });
        })
        .catch(error => {
          console.error('[OnlineGame] Failed to fetch results:', error);
        });
    }
  }, [room?.phase, gameResults, calculateResults]);

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
            <button
              onClick={async () => {
                if (confirm('ルームから退出しますか？')) {
                  await handleLeaveRoom();
                  navigate('/online');
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
            >
              退出
            </button>
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
          <>
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

            {/* インバイトリンク */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 rounded mb-4 border-2 border-purple-500">
              <h2 className="font-bold mb-2 text-yellow-300">🔗 プレイヤーを招待</h2>
              <p className="text-sm text-gray-300 mb-3">このリンクを共有してプレイヤーを招待しましょう</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/online?room=${roomCode}`}
                  className="flex-1 px-3 py-2 bg-gray-800 text-white rounded font-mono text-sm border border-gray-600"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/online?room=${roomCode}`);
                    alert('リンクをコピーしました！');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium whitespace-nowrap transition-colors"
                >
                  📋 コピー
                </button>
              </div>
            </div>
          </>
        )}

        {room.phase === 'placement' && myHand.length > 0 && (
          <div className="bg-gray-800 p-4 rounded mb-4">
            <h2 className="font-bold mb-2">手札（ドラッグ&ドロップで配置）</h2>
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
            {/* プレイヤー進行状況 */}
            <div className="bg-gray-800 p-4 rounded mb-4">
              <h3 className="font-bold mb-3">プレイヤー進行状況</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {players.map((player) => {
                  const cardCount = placedCards.filter(c => c.player_slot === player.player_slot).length;
                  return (
                    <div key={player.player_slot} className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-4 h-4 rounded-full border border-white"
                          style={{ backgroundColor: getPlayerColorStyle(player.player_slot) }}
                        ></div>
                        <span className="font-medium text-sm truncate">{player.player_name}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        配置済み: {cardCount} / 5
                      </div>
                      <div className="mt-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${(cardCount / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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

            {myAxis && (
              <GameBoard
                axis={myAxis}
                placedCards={placedCards}
                players={players}
                interactive={true}
                onBoardClick={handleBoardClick}
                onCardDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                currentPlayerSlot={playerSlot}
                roomPhase={room.phase}
              />
            )}
          </>
        )}

        {room.phase === 'voting' && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="font-bold mb-4 text-xl">投票フェーズ</h2>
            <p className="text-gray-300 mb-4">誰が人狼だと思うか投票してください</p>

            {/* 投票進行状況 */}
            <div className="bg-gray-700/50 p-3 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">投票状況</span>
                <span className="text-sm text-gray-400">{votes.length} / {players.length}</span>
              </div>
              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(votes.length / players.length) * 100}%` }}
                ></div>
              </div>
            </div>

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
                  try {
                    await fetchVotes();
                    const results = await calculateResults();
                    setGameResults({
                      wolf_slot: results.wolf_slot,
                      top_voted: results.top_voted,
                      wolf_caught: results.wolf_caught,
                      scores: results.scores,
                      vote_counts: results.vote_counts,
                      all_hands: results.all_hands,
                      wolf_axis: results.wolf_axis,
                      normal_axis: results.normal_axis,
                    });
                    await updatePhase('results');
                  } catch (error) {
                    console.error('Failed to calculate results:', error);
                    alert('結果の計算に失敗しました');
                  }
                }}
                className="w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors bg-purple-600 hover:bg-purple-700 text-white mb-6"
              >
                結果を表示
              </button>
            )}

            {/* ゲームボード表示（最下部） */}
            {myAxis && (
              <div>
                <h3 className="font-bold mb-3">配置状況</h3>
                <GameBoard
                  axis={myAxis}
                  placedCards={placedCards}
                  players={players}
                  interactive={false}
                  currentPlayerSlot={playerSlot}
                  roomPhase={room.phase}
                />
              </div>
            )}
          </div>
        )}

        {room.phase === 'results' && gameResults && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="font-bold mb-4 text-xl">投票結果</h2>

            <div className="space-y-4">
              {/* デバッグ情報 */}
              {!gameResults.normal_axis && !gameResults.wolf_axis && (
                <div className="bg-red-900/30 p-4 rounded-lg border-2 border-red-500">
                  <p className="text-red-400">軸データが取得できませんでした</p>
                  <p className="text-xs text-gray-400">ブラウザのコンソールを確認してください (F12)</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {players.map((player) => {
                  const voteCount = gameResults.vote_counts[player.player_slot] || 0;
                  const isWolf = player.player_slot === gameResults.wolf_slot;
                  const isMostVoted = gameResults.top_voted.includes(player.player_slot);
                  const playerScore = gameResults.scores[player.player_slot.toString()] || 0;

                  // このプレイヤーが誰に投票したかを取得
                  const myVote = votes.find(v => v.voter_slot === player.player_slot);
                  const votedPlayer = myVote ? players.find(p => p.player_slot === myVote.target_slot) : null;

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
                        <div className="text-lg">{voteCount} 票獲得</div>
                        {isWolf && <div className="text-red-400 font-bold">🐺 人狼</div>}
                        {votedPlayer && (
                          <div className="text-xs text-gray-300">
                            → {votedPlayer.player_name}に投票
                          </div>
                        )}
                        <div className={`font-bold ${playerScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          スコア: {playerScore >= 0 ? '+' : ''}{playerScore}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-900/50 p-4 rounded-lg">
                {gameResults.wolf_caught ? (
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

              {/* 全プレイヤーの手札 */}
              {gameResults.all_hands && (
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <h3 className="font-bold mb-3">全プレイヤーの手札</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {players.map((player) => {
                      const hand = gameResults.all_hands[player.player_slot.toString()] || [];
                      const isWolf = player.player_slot === gameResults.wolf_slot;
                      return (
                        <div
                          key={player.player_slot}
                          className={`bg-gray-800 p-2 rounded ${isWolf ? 'border-2 border-red-500' : ''}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-4 h-4 rounded-full border border-white"
                              style={{ backgroundColor: getPlayerColorStyle(player.player_slot) }}
                            ></div>
                            <span className="text-sm font-bold">{player.player_name}</span>
                            {isWolf && <span className="text-xs text-red-400">🐺</span>}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {hand.map((card, idx) => (
                              <span key={idx} className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                                {card}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 累積スコア表示 */}
              {room.scores && (() => {
                const totalScores = JSON.parse(room.scores);
                return (
                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="font-bold mb-3">累積スコア</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {players.map((player) => {
                        const totalScore = totalScores[player.player_slot.toString()] || 0;
                        return (
                          <div key={player.player_slot} className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full border border-white"
                              style={{ backgroundColor: getPlayerColorStyle(player.player_slot) }}
                            ></div>
                            <span className="text-sm">{player.player_name}</span>
                            <span className={`font-bold ml-auto ${totalScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {totalScore >= 0 ? '+' : ''}{totalScore}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {isHost && (
                <button
                  onClick={async () => {
                    try {
                      await startNextRound();
                      setGameResults(null);
                    } catch (error) {
                      console.error('Failed to start next round:', error);
                      alert('次ラウンド開始に失敗しました');
                    }
                  }}
                  className="w-full py-3 px-6 rounded-lg font-bold text-lg transition-colors bg-green-600 hover:bg-green-700 text-white mb-6"
                >
                  次のラウンドへ
                </button>
              )}

              {/* ゲームボード（最下部）（村人の軸 + 人狼の軸を1つのボードに表示） */}
              {gameResults.normal_axis && gameResults.wolf_axis ? (
                <div>
                  <h3 className="font-bold mb-3">配置結果（正解の軸 + 人狼の軸）</h3>
                  <GameBoard
                    axis={gameResults.normal_axis}
                    wolfAxis={gameResults.wolf_axis}
                    placedCards={placedCards}
                    players={players}
                    interactive={false}
                    currentPlayerSlot={playerSlot}
                    roomPhase={room.phase}
                  />
                </div>
              ) : gameResults.normal_axis ? (
                <div>
                  <h3 className="font-bold mb-3">配置結果</h3>
                  <GameBoard
                    axis={gameResults.normal_axis}
                    placedCards={placedCards}
                    players={players}
                    interactive={false}
                    currentPlayerSlot={playerSlot}
                    roomPhase={room.phase}
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
