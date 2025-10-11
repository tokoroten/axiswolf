/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { api, type Room, type Player, type PlacedCard, type Vote } from '../lib/api';
import type { AxisPayload } from '../types';

interface GameContextType {
  room: Room | null;
  players: Player[];
  placedCards: PlacedCard[];
  votes: Vote[];
  playerSlot: number | null;
  playerId: string;
  ws: WebSocket | null;
  isHost: boolean;
  joinRoom: (roomCode: string, playerId: string, playerName: string) => Promise<void>;
  createRoom: (roomCode: string, playerId: string, playerName: string) => Promise<void>;
  updatePhase: (phase: string, axisPayload?: AxisPayload, wolfAxisPayload?: AxisPayload, roundSeed?: string) => Promise<void>;
  updateThemes: (themes: string[]) => Promise<void>;
  placeCard: (cardId: string, quadrant: number, offsets: { x: number; y: number }) => Promise<void>;
  submitVote: (targetSlot: number) => Promise<void>;
  fetchVotes: () => Promise<void>;
  fetchHand: () => Promise<string[]>;
  calculateResults: () => Promise<{
    wolf_slot: number;
    top_voted: number[];
    wolf_caught: boolean;
    scores: Record<string, number>;
    total_scores: Record<string, number>;
    vote_counts: Record<number, number>;
    all_hands: Record<string, string[]>;
    wolf_axis: AxisPayload;
    normal_axis: AxisPayload;
  }>;
  startNextRound: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [placedCards, setPlacedCards] = useState<PlacedCard[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [playerSlot, setPlayerSlot] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket初回接続フラグ（セッション全体で1回のみtrue）
  const isFirstConnection = useRef(true);

  const isHost = players.find(p => p.player_slot === playerSlot)?.is_host === 1;

  // LocalStorageから接続情報を復元
  useEffect(() => {
    const savedRoomCode = localStorage.getItem('online_room_code');
    const savedPlayerId = localStorage.getItem('online_player_id');
    const savedPlayerName = localStorage.getItem('online_player_name');
    const savedToken = localStorage.getItem('online_player_token');

    // 現在のURLパスを確認
    const currentPath = window.location.pathname;
    const isOnGamePage = currentPath.startsWith('/online/');

    if (savedRoomCode && savedPlayerId && savedPlayerName && !room) {
      // ゲームページにいる場合のみ再接続を試みる
      if (isOnGamePage) {
        console.log('[GameContext] 保存された接続情報から再接続を試みます', {
          roomCode: savedRoomCode,
          playerId: savedPlayerId,
          playerName: savedPlayerName,
        });

        // 再接続を試みる（直接APIを呼ぶ）
        (async () => {
          try {
            // トークンが存在する場合は検証
            if (savedToken) {
              const isValid = await api.verifyToken(savedPlayerId, savedToken);
              if (!isValid) {
                console.error('[GameContext] トークン検証失敗。再ログインが必要です。');
                // トークンが無効なので、LocalStorageをクリア
                localStorage.removeItem('online_room_code');
                localStorage.removeItem('online_player_id');
                localStorage.removeItem('online_player_name');
                localStorage.removeItem('online_player_token');
                return;
              }
              console.log('[GameContext] トークン検証成功');
            }

            const { player_slot, token } = await api.joinRoom(savedRoomCode, savedPlayerId, savedPlayerName);
            const { room: newRoom, players: newPlayers } = await api.getRoom(savedRoomCode);
            setRoom(newRoom);
            setPlayers(newPlayers);
            setPlayerSlot(player_slot);
            setPlayerId(savedPlayerId);

            // 新しいトークンを保存（既存プレイヤーでも更新される可能性がある）
            if (token) {
              localStorage.setItem('online_player_token', token);
            }

            console.log('[GameContext] 再接続に成功しました');
          } catch (err) {
            console.error('[GameContext] 再接続に失敗しました:', err);
            // 失敗してもLocalStorageは保持（手動で「前回のゲームに戻る」を使える）
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!room || !playerId) return;

    let websocket: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 2000; // 2秒
    let pingInterval: NodeJS.Timeout | null = null;

    const connect = () => {
      // 初回接続のみ過去ログをロード
      const loadHistory = isFirstConnection.current;
      websocket = api.connectWebSocket(room.room_code, playerId, loadHistory);
      setWs(websocket);

      websocket.onopen = () => {
        console.log('[GameContext] WebSocket接続しました');
        reconnectAttempts = 0; // 成功したらリセット
        isFirstConnection.current = false; // 初回接続完了

        // 3分ごとにpingを送信してサーバーをアクティブに保つ
        pingInterval = setInterval(() => {
          if (websocket && websocket.readyState === WebSocket.OPEN) {
            console.log('[GameContext] Pingを送信');
            websocket.send(JSON.stringify({ type: 'ping' }));
          }
        }, 3 * 60 * 1000); // 3分 = 180,000ミリ秒
      };

      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('📨 [GameContext/WS] Received message:', message.type, message);

        switch (message.type) {
          case 'chat':
            // チャットメッセージをカスタムイベントとして再発火
            window.dispatchEvent(new CustomEvent('chat-message', { detail: message }));
            break;

          case 'player_joined':
            api.getRoom(room.room_code).then(({ players: newPlayers }) => {
              setPlayers(newPlayers);
            });
            break;

          case 'player_left':
            console.log('[GameContext] プレイヤーが退出しました:', message.player_name);
            api.getRoom(room.room_code).then(({ players: newPlayers }) => {
              setPlayers(newPlayers);
            });
            break;

          case 'player_online':
            // オンライン状態が変更されたらルーム情報を再取得
            api.getRoom(room.room_code).then(({ players: newPlayers }) => {
              setPlayers(newPlayers);
            });
            break;

          case 'player_offline':
            // オンライン状態が変更されたらルーム情報を再取得
            api.getRoom(room.room_code).then(({ players: newPlayers }) => {
              setPlayers(newPlayers);
            });
            break;

          case 'phase_changed':
            // フェーズが変更されたら、サーバーから最新のルーム情報を取得
            // (軸データやシード値が更新されている可能性があるため)
            api.getRoom(room.room_code).then(({ room: updatedRoom }) => {
              setRoom(updatedRoom);

              // 投票フェーズに入ったら投票をクリア
              if (updatedRoom.phase === 'voting') {
                setVotes([]);
              }
            });
            break;

          case 'card_placed':
            setPlacedCards(prev => [
              ...prev.filter(c => !(c.player_slot === message.player_slot && c.card_id === message.card_id)),
              {
                room_code: room.room_code,
                round: room.active_round,
                player_slot: message.player_slot,
                card_id: message.card_id,
                quadrant: message.quadrant,
                offsets: message.offsets,
                locked: 0,
                placed_at: new Date().toISOString(),
              },
            ]);
            break;

          case 'vote_submitted':
            // 投票が送信されたら投票状況を更新
            setVotes(prev => {
              // 既存の同じvoter_slotの投票を削除
              const filtered = prev.filter(v => v.voter_slot !== message.voter_slot);
              // 新しい投票を追加
              return [
                ...filtered,
                {
                  room_code: room.room_code,
                  round: room.active_round,
                  voter_slot: message.voter_slot,
                  target_slot: message.target_slot,
                  submitted_at: new Date().toISOString(),
                },
              ];
            });
            break;

          case 'themes_updated':
            // テーマが更新されたらルーム情報を再取得
            api.getRoom(room.room_code).then(({ room: newRoom }) => {
              setRoom(newRoom);
            });
            break;

          case 'round_started':
            // 新しいラウンドが始まったらルーム情報を再取得
            api.getRoom(room.room_code).then(({ room: newRoom }) => {
              setRoom(newRoom);
            });
            // カードと投票をクリア
            setPlacedCards([]);
            setVotes([]);
            break;
        }
      };

      websocket.onclose = (event) => {
        console.log('[GameContext] WebSocket接続が切断されました', event);

        // pingタイマーをクリア
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }

        // 正常なクローズ（コード1000）または意図的なクローズの場合は再接続しない
        if (event.code === 1000 || event.wasClean) {
          console.log('[GameContext] 正常なクローズのため再接続しません');
          return;
        }

        // 再接続を試みる
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`[GameContext] ${reconnectDelay}ms後に再接続を試みます (試行回数: ${reconnectAttempts}/${maxReconnectAttempts})`);
          setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error('[GameContext] 再接続の最大試行回数に達しました');
          alert('サーバーとの接続が切断されました。ページを再読み込みしてください。');
        }
      };

      websocket.onerror = (error) => {
        console.error('[GameContext] WebSocketエラー:', error);
      };
    };

    connect();

    return () => {
      // pingタイマーをクリア
      if (pingInterval) {
        clearInterval(pingInterval);
      }

      if (websocket) {
        // クリーンアップ時は正常なクローズとしてマーク
        websocket.close(1000, 'Component unmounted');
      }
    };
  }, [room?.room_code, playerId]);

  const joinRoom = async (roomCode: string, pid: string, playerName: string) => {
    const { player_slot, token } = await api.joinRoom(roomCode, pid, playerName);
    const { room: newRoom, players: newPlayers } = await api.getRoom(roomCode);
    setRoom(newRoom);
    setPlayers(newPlayers);
    setPlayerSlot(player_slot);
    setPlayerId(pid);

    // 古いゲーム状態をクリア
    setPlacedCards([]);
    setVotes([]);

    // LocalStorageに保存（再接続用）
    localStorage.setItem('online_room_code', roomCode);
    localStorage.setItem('online_player_id', pid);
    localStorage.setItem('online_player_name', playerName);
    localStorage.setItem('online_player_token', token);
    console.log('[GameContext] 接続情報をLocalStorageに保存しました');
  };

  const createRoom = async (roomCode: string, pid: string, playerName: string) => {
    const { token } = await api.createRoom(roomCode, pid, playerName);
    const { room: newRoom, players: newPlayers } = await api.getRoom(roomCode);
    setRoom(newRoom);
    setPlayers(newPlayers);
    setPlayerSlot(0);
    setPlayerId(pid);

    // 古いゲーム状態をクリア
    setPlacedCards([]);
    setVotes([]);

    // LocalStorageに保存（再接続用）
    localStorage.setItem('online_room_code', roomCode);
    localStorage.setItem('online_player_id', pid);
    localStorage.setItem('online_player_name', playerName);
    localStorage.setItem('online_player_token', token);
    console.log('[GameContext] 接続情報をLocalStorageに保存しました');
  };

  const updatePhase = async (phase: string, axisPayload?: AxisPayload, wolfAxisPayload?: AxisPayload, roundSeed?: string) => {
    if (!room) return;
    await api.updatePhase(room.room_code, phase, axisPayload, wolfAxisPayload, roundSeed);
    // サーバーから最新のルーム情報を取得（サーバー側で軸が生成される可能性があるため）
    const { room: updatedRoom } = await api.getRoom(room.room_code);
    setRoom(updatedRoom);
  };

  const updateThemes = async (themes: string[]) => {
    if (!room) return;
    await api.updateThemes(room.room_code, themes);
    // サーバーから最新のルーム情報を取得
    const { room: updatedRoom } = await api.getRoom(room.room_code);
    setRoom(updatedRoom);
  };

  const placeCard = async (cardId: string, quadrant: number, offsets: { x: number; y: number }) => {
    if (!room || !playerId) return;
    await api.placeCard(room.room_code, playerId, cardId, quadrant, offsets);
  };

  const submitVote = async (targetSlot: number) => {
    if (!room || !playerId) return;
    await api.submitVote(room.room_code, playerId, targetSlot);
  };

  const fetchVotes = async () => {
    if (!room) return;
    const { votes: newVotes } = await api.getVotes(room.room_code);
    setVotes(newVotes);
  };

  const fetchHand = async (): Promise<string[]> => {
    if (!room || !playerId) return [];
    const { hand } = await api.getHand(room.room_code, playerId);
    return hand;
  };

  const calculateResults = async () => {
    if (!room) throw new Error('No room');
    const results = await api.calculateResults(room.room_code);
    // スコアが更新されたのでルーム情報を再取得
    const { room: updatedRoom } = await api.getRoom(room.room_code);
    setRoom(updatedRoom);
    return results;
  };

  const startNextRound = async () => {
    if (!room) throw new Error('No room');
    await api.startNextRound(room.room_code);
    // サーバーから最新のルーム情報を取得
    const { room: updatedRoom } = await api.getRoom(room.room_code);
    setRoom(updatedRoom);
    // カードと投票をクリア
    setPlacedCards([]);
    setVotes([]);
  };

  return (
    <GameContext.Provider
      value={{
        room,
        players,
        placedCards,
        votes,
        playerSlot,
        playerId,
        ws,
        isHost,
        joinRoom,
        createRoom,
        updatePhase,
        updateThemes,
        placeCard,
        submitVote,
        fetchVotes,
        fetchHand,
        calculateResults,
        startNextRound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}