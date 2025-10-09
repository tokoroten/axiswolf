import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { getPlayerColorStyle } from '../utils/playerColors';
import GameBoard from '../components/GameBoard';
import GameRules from '../components/GameRules';
import PlayerAvatar from '../components/PlayerAvatar';
import ChatPanel from '../components/ChatPanel';
import { api } from '../lib/api';
import QRCode from 'qrcode';

export default function OnlineGame() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, players, placedCards, votes, isHost, playerSlot, playerId, ws, updatePhase, placeCard, submitVote, fetchVotes, fetchHand, calculateResults, startNextRound } = useGame();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [myAxis, setMyAxis] = useState<any>(null);
  const [myHand, setMyHand] = useState<string[]>([]);
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; isPlaced: boolean } | null>(null);
  const lastRoundSeedRef = useRef<string | null>(null);
  const handFetchedRef = useRef<boolean>(false);
  const [gameResults, setGameResults] = useState<{
    wolf_slot: number;
    top_voted: number[];
    wolf_caught: boolean;
    scores: Record<string, number>;
    total_scores: Record<string, number>;
    vote_counts: Record<number, number>;
    all_hands: Record<string, string[]>;
    wolf_axis: any;
    normal_axis: any;
  } | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // roomCodeがない場合、LocalStorageから復元を試みる
  useEffect(() => {
    if (!roomCode) {
      const savedRoomCode = localStorage.getItem('online_room_code');
      if (savedRoomCode) {
        // LocalStorageにルームコードがあれば、そのページにリダイレクト
        navigate(`/online/${savedRoomCode}`, { replace: true });
      } else {
        // LocalStorageにもない場合はトップページへ
        navigate('/online');
      }
    }
  }, [roomCode, navigate]);

  // QRコード生成
  useEffect(() => {
    if (roomCode) {
      const inviteUrl = `${window.location.origin}/online?room=${roomCode}`;
      QRCode.toDataURL(inviteUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error('[QRCode] 生成エラー:', err);
        });
    }
  }, [roomCode]);

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
  };

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
      // resultsフェーズでは軸を設定しない（gameResultsから設定する）
      if (room.phase === 'results') {
        return;
      }

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
            total_scores: results.total_scores || results.scores,
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
  // 再接続中の表示
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">接続中...</p>
          <p className="text-sm text-gray-400">ゲームルームに参加しています</p>
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
    <div className="min-h-screen bg-gray-900 text-white p-4" style={{ paddingRight: isChatCollapsed ? '1rem' : 'calc(20rem + 1rem)' }}>
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">ルーム: {roomCode}</h1>

            {/* ホストの進行ボタン */}
            {isHost && room.phase === 'lobby' && (
              <button
                onClick={() => {
                  if (confirm('ゲームを開始しますか？')) {
                    handleStartGame();
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold transition-colors whitespace-nowrap"
              >
                ゲーム開始
              </button>
            )}

            {isHost && room.phase === 'placement' && (() => {
              // 全プレイヤーが3枚ずつカードを配置したかチェック
              const allPlayersPlaced = players.every(player => {
                const playerCards = placedCards.filter(c => c.player_slot === player.player_slot);
                return playerCards.length >= 3;
              });
              return (
                <button
                  onClick={async () => {
                    if (confirm('投票フェーズに進みますか？')) {
                      await updatePhase('voting');
                    }
                  }}
                  className={`px-4 py-2 rounded font-bold whitespace-nowrap transition-all ${
                    allPlayersPlaced
                      ? 'bg-yellow-500 hover:bg-yellow-600 shadow-[0_0_25px_rgba(234,179,8,1)]'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                  style={allPlayersPlaced ? {
                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    boxShadow: '0 0 25px rgba(234, 179, 8, 1), 0 0 50px rgba(234, 179, 8, 0.5)',
                  } : undefined}
                >
                  投票フェーズへ
                </button>
              );
            })()}

            {isHost && room.phase === 'voting' && (() => {
              const allVoted = votes.length === players.length;
              return (
                <button
                  onClick={async () => {
                    if (confirm('結果を表示しますか？')) {
                      try {
                        await fetchVotes();
                        // まずフェーズを更新（バックエンドでスコア計算が実行される）
                        await updatePhase('results');
                        // その後、計算済みの結果を取得
                        const results = await calculateResults();
                        setGameResults({
                          wolf_slot: results.wolf_slot,
                          top_voted: results.top_voted,
                          wolf_caught: results.wolf_caught,
                          scores: results.scores,
                          total_scores: results.total_scores,
                          vote_counts: results.vote_counts,
                          all_hands: results.all_hands,
                          wolf_axis: results.wolf_axis,
                          normal_axis: results.normal_axis,
                        });
                      } catch (error) {
                        console.error('Failed to calculate results:', error);
                        alert('結果の計算に失敗しました');
                      }
                    }
                  }}
                  className={`px-4 py-2 rounded font-bold whitespace-nowrap transition-all ${
                    allVoted
                      ? 'bg-purple-500 hover:bg-purple-600 shadow-[0_0_25px_rgba(168,85,247,1)]'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                  style={allVoted ? {
                    animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    boxShadow: '0 0 25px rgba(168, 85, 247, 1), 0 0 50px rgba(168, 85, 247, 0.5)',
                  } : undefined}
                >
                  結果を表示
                </button>
              );
            })()}

            {isHost && room.phase === 'results' && (
              <button
                onClick={async () => {
                  if (confirm('次のラウンドを開始しますか？')) {
                    try {
                      await startNextRound();
                      setGameResults(null);
                    } catch (error) {
                      console.error('Failed to start next round:', error);
                      alert('次ラウンド開始に失敗しました');
                    }
                  }
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold transition-colors whitespace-nowrap"
              >
                次のラウンドへ
              </button>
            )}
          </div>

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
              onClick={() => setShowRules(true)}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition-colors"
            >
              📖 ルール
            </button>
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

        {room.phase === 'lobby' && (
          <>
            <div className="bg-gray-800 p-4 rounded mb-4">
              <h2 className="font-bold mb-2">プレイヤー一覧</h2>
              <ul className="space-y-2">
                {players.map((p) => (
                  <li key={p.player_slot} className="flex items-center gap-3 bg-gray-700 px-3 py-2 rounded">
                    <PlayerAvatar player={p} size="medium" />
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
              <p className="text-sm text-gray-300 mb-3">このリンクやQRコードを共有してプレイヤーを招待しましょう</p>

              <div className="flex gap-4 items-start">
                {/* QRコード */}
                {qrCodeUrl && (
                  <div className="bg-white p-3 rounded-lg">
                    <img src={qrCodeUrl} alt="招待用QRコード" className="w-40 h-40" />
                  </div>
                )}

                {/* リンク */}
                <div className="flex-1 flex flex-col gap-2">
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
                  <p className="text-xs text-gray-400">
                    スマートフォンでQRコードを読み取るか、リンクを共有してください
                  </p>
                </div>
              </div>
            </div>

            {/* ゲームルール説明 */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-4 rounded mb-4 border-2 border-blue-500">
              <h2 className="font-bold mb-3 text-yellow-300">📖 ゲームの流れ</h2>
              <ol className="space-y-2 text-sm text-gray-200">
                <li className="flex gap-2">
                  <span className="font-bold text-yellow-300">1.</span>
                  <span>全員に二軸が表示されます（<span className="text-red-400 font-bold">人狼だけ異なる軸</span>）</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-yellow-300">2.</span>
                  <span>カードを軸上に配置しながら議論します</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-yellow-300">3.</span>
                  <span>誰が人狼かを推理して投票します</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-yellow-300">4.</span>
                  <span>結果発表！人狼を当てられればスコアゲット</span>
                </li>
              </ol>
              <button
                onClick={() => setShowRules(true)}
                className="mt-3 w-full py-2 bg-white text-purple-700 rounded font-bold hover:bg-gray-100 transition-colors"
              >
                詳しいルールを見る →
              </button>
            </div>
          </>
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
                        <PlayerAvatar player={player} size="small" />
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

            {myHand.length > 0 && (
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

            {/* 自分が投票済みかチェック */}
            {(() => {
              const myVote = votes.find(v => v.voter_slot === playerSlot);
              const hasVoted = !!myVote;

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {players.map((player) => {
                    const isMyself = player.player_slot === playerSlot;
                    const playerHasVoted = votes.some(v => v.voter_slot === player.player_slot);
                    const isVotedByMe = myVote?.target_slot === player.player_slot;

                    // 自分が投票済みで、このプレイヤーに投票していない場合は表示しない
                    if (hasVoted && !isVotedByMe && !isMyself) {
                      return null;
                    }

                    return (
                      <div key={player.player_slot} className="flex flex-col gap-3">
                        <div
                          className={`
                            p-4 rounded-lg border-2 transition-all
                            ${isMyself
                              ? 'bg-gray-700 border-gray-600 opacity-50'
                              : isVotedByMe
                                ? 'border-green-400 bg-green-900/50'
                                : 'border-gray-600 bg-gray-700'
                            }
                          `}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <PlayerAvatar player={player} size="large" />
                            <div className="font-bold">{player.player_name}</div>
                            {isMyself && <div className="text-xs text-gray-400">（自分）</div>}
                            {playerHasVoted && <div className="text-green-400 text-xs">✓ 投票済み</div>}
                            {isVotedByMe && <div className="text-green-400 text-2xl">✓</div>}
                          </div>
                        </div>

                        {/* 投票ボタン（自分以外 & 未投票の場合のみ表示） */}
                        {!isMyself && !hasVoted && (
                          <button
                            onClick={async () => {
                              if (roomCode && playerSlot !== null) {
                                await submitVote(player.player_slot);
                                // fetchVotes()は不要 - WebSocketで自動更新される
                              }
                            }}
                            className="py-2 px-4 rounded-lg font-bold text-sm transition-colors bg-red-600 hover:bg-red-700 text-white"
                          >
                            🐺 投票する
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ゲームボード表示（最下部） - 村人の軸のみ表示 */}
            {room.axis_payload && (
              <div>
                <h3 className="font-bold mb-3">配置状況（村人の軸）</h3>
                <GameBoard
                  axis={typeof room.axis_payload === 'string' ? JSON.parse(room.axis_payload) : room.axis_payload}
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
              {/* 勝利表示を最上部に */}
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
                  const roundScore = gameResults.scores?.[player.player_slot.toString()] || 0;  // このラウンドで獲得したスコア
                  const totalScore = gameResults.total_scores?.[player.player_slot.toString()] || 0;  // 累積スコア

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
                        <PlayerAvatar player={player} size="large" />
                        <div className="font-bold">{player.player_name}</div>
                        <div className="text-lg">{voteCount} 票獲得</div>
                        {isWolf && <div className="text-red-400 font-bold">🐺 人狼</div>}
                        {votedPlayer && (
                          <div className="text-xs text-gray-300">
                            → {votedPlayer.player_name}に投票
                          </div>
                        )}
                        <div className={`font-bold text-lg ${roundScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {roundScore >= 0 ? '+' : ''}{roundScore}点
                        </div>
                        <div className="font-bold text-xl text-white mt-1">
                          累積：{totalScore}点
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      {/* ゲームルールポップアップ */}
      <GameRules isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* チャットパネル */}
      <ChatPanel
        players={players}
        currentPlayerId={playerId}
        ws={ws}
        isCollapsed={isChatCollapsed}
        onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
      />
    </div>
  );
}
