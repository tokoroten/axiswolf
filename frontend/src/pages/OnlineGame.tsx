import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { getPlayerColorStyle } from '../utils/playerColors';
import GameBoard from '../components/GameBoard';
import GameRules from '../components/GameRules';
import PlayerAvatar from '../components/PlayerAvatar';
import ChatPanel from '../components/ChatPanel';
import type { AxisPayload } from '../types';
import QRCode from 'qrcode';

export default function OnlineGame() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, players, placedCards, votes, isHost, playerSlot, playerId, ws, updatePhase, updateThemes, placeCard, submitVote, fetchVotes, fetchHand, calculateResults, startNextRound } = useGame();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [myAxis, setMyAxis] = useState<AxisPayload | null>(null);
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
    wolf_axis: AxisPayload;
    normal_axis: AxisPayload;
  } | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [resultsPhaseStartTime, setResultsPhaseStartTime] = useState<number | null>(null);
  const [shouldBlinkNextRound, setShouldBlinkNextRound] = useState(false);
  const [activeTab, setActiveTab] = useState<'game' | 'chat'>('game'); // モバイル用タブ切り替え
  const [isMobile, setIsMobile] = useState(false);

  // 画面サイズによってモバイルかどうかを判定
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px未満をモバイルとする
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // 直接URLアクセス時の対応：必要な接続情報が無い場合はOnlineHomeにリダイレクト
  useEffect(() => {
    if (roomCode && !room && !playerId) {
      // roomCodeはあるが、playerId（接続情報）が無い = 直接URLアクセス
      // OnlineHomeにルームコード付きでリダイレクト
      console.log('[OnlineGame] 接続情報が不足しているため、OnlineHomeにリダイレクトします');
      navigate(`/online?room=${roomCode}`, { replace: true });
    }
  }, [roomCode, room, playerId, navigate]);

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

      // 自分が人狼かどうかを確認（サーバーで決定済みのwolf_slotを使用）
      const wolfSlot = room.wolf_slot;
      const isWolf = wolfSlot !== undefined && wolfSlot !== null && playerSlot === wolfSlot;

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

  // resultsフェーズに入ったら開始時刻を記録
  useEffect(() => {
    if (room?.phase === 'results') {
      setResultsPhaseStartTime(Date.now());
      setShouldBlinkNextRound(false);
    } else {
      setResultsPhaseStartTime(null);
      setShouldBlinkNextRound(false);
    }
  }, [room?.phase]);

  // 30秒経過したら明滅を開始
  useEffect(() => {
    if (resultsPhaseStartTime === null) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - resultsPhaseStartTime;
      if (elapsed >= 30000) {
        setShouldBlinkNextRound(true);
      }
    }, 1000); // 1秒ごとにチェック

    return () => clearInterval(interval);
  }, [resultsPhaseStartTime]);


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
    <div className="min-h-screen bg-gray-900 text-white p-4" style={{ paddingRight: isMobile ? '1rem' : (isChatCollapsed ? '1rem' : 'calc(20rem + 1rem)') }}>
      <div className="max-w-6xl mx-auto">
        {/* モバイル用タブ切り替え */}
        {isMobile && (
          <div className="bg-gray-800 rounded-lg p-1 mb-4 flex gap-1">
            <button
              onClick={() => setActiveTab('game')}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                activeTab === 'game'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🎮 ゲーム
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors relative ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💬 チャット
              {/* 未読バッジはChatPanelから渡す必要があるため、後で実装 */}
            </button>
          </div>
        )}

        {/* ゲームコンテンツ（モバイルではタブで切り替え、デスクトップでは常に表示） */}
        {(!isMobile || activeTab === 'game') && (
          <>
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
                className={`px-4 py-2 rounded font-bold whitespace-nowrap transition-all ${
                  shouldBlinkNextRound
                    ? 'bg-green-500 hover:bg-green-600 shadow-[0_0_25px_rgba(34,197,94,1)]'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
                style={shouldBlinkNextRound ? {
                  animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  boxShadow: '0 0 25px rgba(34, 197, 94, 1), 0 0 50px rgba(34, 197, 94, 0.5)',
                } : undefined}
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
            {isHost && room.phase !== 'lobby' && (
              <button
                onClick={async () => {
                  if (confirm('ロビーに戻りますか？\n（ゲームの進行状況はリセットされます）')) {
                    await updatePhase('lobby');
                  }
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
              >
                🏠 ロビーに戻る
              </button>
            )}
          </div>
        </div>

        {room.phase === 'lobby' && (
          <>
            {/* カードセット選択 */}
            {isHost && (
              <div className="bg-gradient-to-r from-green-900 to-teal-900 p-4 rounded mb-4 border-2 border-green-500">
                <h2 className="font-bold mb-3 text-yellow-300">🎴 カードセット選択</h2>
                <p className="text-sm text-gray-300 mb-3">使用するカードのテーマを選んでください（複数選択可）</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'food', label: '食べ物', icon: '🍕' },
                    { id: 'daily', label: '日用品', icon: '📱' },
                    { id: 'entertainment', label: 'エンタメ', icon: '🎮' },
                    { id: 'animal', label: '動物', icon: '🐶' },
                    { id: 'place', label: '場所', icon: '🏙️' },
                    { id: 'vehicle', label: '乗り物', icon: '🚗' },
                    { id: 'sport', label: 'スポーツ', icon: '⚽' },
                    { id: 'chaos', label: 'カオス', icon: '🌀', special: true },
                  ].map((theme) => {
                    const currentThemes = room.themes ? JSON.parse(room.themes) : ['food', 'daily', 'entertainment'];
                    const isSelected = currentThemes.includes(theme.id);

                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          let newThemes: string[];

                          // カオスモードの特別処理
                          if (theme.id === 'chaos') {
                            // カオスモードを選択した場合、他のテーマを全て解除
                            newThemes = isSelected ? ['food', 'daily', 'entertainment'] : ['chaos'];
                          } else {
                            // 通常テーマの処理
                            // カオスモードが選択されている場合は解除
                            const themesWithoutChaos = currentThemes.filter((t: string) => t !== 'chaos');
                            newThemes = isSelected
                              ? themesWithoutChaos.filter((t: string) => t !== theme.id)
                              : [...themesWithoutChaos, theme.id];

                            // 最低1つは選択する必要がある
                            if (newThemes.length === 0) {
                              alert('最低1つのテーマを選択してください');
                              return;
                            }
                          }

                          // 投機的UI更新：サーバーのレスポンスを待たずに実行
                          updateThemes(newThemes).catch((error) => {
                            console.error('Failed to update themes:', error);
                            alert('テーマの更新に失敗しました');
                          });
                        }}
                        className={`p-3 rounded-lg font-medium transition-all border-2 ${
                          theme.id === 'chaos'
                            ? isSelected
                              ? 'bg-purple-600 border-purple-400 text-white shadow-lg animate-pulse'
                              : 'bg-gray-700 border-purple-600 text-gray-300 hover:bg-gray-600'
                            : isSelected
                              ? 'bg-green-600 border-green-400 text-white shadow-lg'
                              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">{theme.icon}</div>
                        <div className="text-sm">{theme.label}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  {(() => {
                    const currentThemes = room.themes ? JSON.parse(room.themes) : ['food', 'daily', 'entertainment'];
                    const themeLabels = {
                      food: '食べ物',
                      daily: '日用品',
                      entertainment: 'エンタメ',
                      animal: '動物',
                      place: '場所',
                      vehicle: '乗り物',
                      sport: 'スポーツ',
                      chaos: 'カオス（全テーマ混合）',
                    };
                    return `現在の選択: ${currentThemes.map((t: string) => themeLabels[t as keyof typeof themeLabels] || t).join('、')}`;
                  })()}
                </div>
              </div>
            )}

            {/* ホスト以外のプレイヤー向け：選択されたテーマ表示 */}
            {!isHost && (
              <div className="bg-gray-800 p-4 rounded mb-4 border-2 border-gray-700">
                <h2 className="font-bold mb-2 text-gray-300">🎴 使用するカードセット</h2>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const currentThemes = room.themes ? JSON.parse(room.themes) : ['food', 'daily', 'entertainment'];
                    const themeInfo = {
                      food: { label: '食べ物', icon: '🍕' },
                      daily: { label: '日用品', icon: '📱' },
                      entertainment: { label: 'エンタメ', icon: '🎮' },
                      animal: { label: '動物', icon: '🐶' },
                      place: { label: '場所', icon: '🏙️' },
                      vehicle: { label: '乗り物', icon: '🚗' },
                      sport: { label: 'スポーツ', icon: '⚽' },
                      chaos: { label: 'カオス（全テーマ混合）', icon: '🌀' },
                    };
                    return currentThemes.map((t: string) => {
                      const info = themeInfo[t as keyof typeof themeInfo];
                      return (
                        <div key={t} className={`px-3 py-2 rounded-lg text-sm ${t === 'chaos' ? 'bg-purple-700 animate-pulse' : 'bg-gray-700'}`}>
                          <span className="mr-1">{info?.icon || '❓'}</span>
                          <span>{info?.label || t}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}


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

            {/* ゲームボード表示（最下部） - 自分の軸を表示 */}
            {myAxis && (
              <div>
                <h3 className="font-bold mb-3">配置状況（あなたの軸）</h3>
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
          </>
        )}

        {/* チャットコンテンツ（モバイルではタブで切り替え、デスクトップでは非表示） */}
        {isMobile && activeTab === 'chat' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <ChatPanel
              players={players}
              currentPlayerId={playerId}
              ws={ws}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              isMobileFullScreen={true}
            />
          </div>
        )}
      </div>

      {/* ゲームルールポップアップ */}
      <GameRules isOpen={showRules} onClose={() => setShowRules(false)} />

      {/* デスクトップ用チャットパネル（固定サイドバー） */}
      {!isMobile && (
        <ChatPanel
          players={players}
          currentPlayerId={playerId}
          ws={ws}
          isCollapsed={isChatCollapsed}
          onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)}
        />
      )}
    </div>
  );
}
