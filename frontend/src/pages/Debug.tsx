import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface DebugRoom {
  room_code: string;
  phase: string;
  active_round: number;
  players_count: number;
  players: Array<{
    player_id: string;
    player_name: string;
    player_slot: number;
    is_host: number;
    status: string;
  }>;
  cards_count: number;
  votes_count: number;
  created_at: string;
  updated_at: string;
  round_seed: string | null;
}

export default function Debug() {
  const [rooms, setRooms] = useState<DebugRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setError(null);
      const data = await api.getDebugRooms();
      setRooms(data.rooms || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to fetch rooms:', err);
      setError(errorMsg);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // 5秒ごとに自動更新
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">デバッグ: ルーム一覧</h1>
          <div className="bg-red-900/50 border border-red-500 p-4 rounded">
            <h2 className="font-bold text-red-400 mb-2">エラーが発生しました</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchRooms();
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">デバッグ: ルーム一覧</h1>
          <button
            onClick={fetchRooms}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            🔄 更新
          </button>
        </div>

        <div className="mb-4 text-gray-400">
          総ルーム数: {rooms.length} | 自動更新: 5秒ごと
        </div>

        {rooms.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-xl text-center text-gray-400">
            ルームが存在しません
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <div key={room.room_code} className="bg-gray-800 p-6 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-400 mb-1">
                      {room.room_code}
                    </h2>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>フェーズ: <span className="text-yellow-400">{room.phase}</span></span>
                      <span>ラウンド: {room.active_round}</span>
                      <span>プレイヤー: {room.players_count}</span>
                      <span>カード: {room.cards_count}</span>
                      <span>投票: {room.votes_count}</span>
                    </div>
                  </div>
                  <a
                    href={`/online/${room.room_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                  >
                    開く
                  </a>
                </div>

                {room.players.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-bold text-gray-400 mb-2">プレイヤー一覧:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {room.players.map((player) => (
                        <div
                          key={player.player_id}
                          className="bg-gray-700 p-2 rounded text-sm"
                        >
                          <div className="font-bold">
                            {player.player_name}
                            {player.is_host === 1 && (
                              <span className="ml-1 text-yellow-400">👑</span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs">
                            Slot: {player.player_slot} | {player.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {room.round_seed && (
                  <div className="mt-4 text-xs text-gray-500">
                    Round Seed: {room.round_seed}
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  作成: {new Date(room.created_at).toLocaleString('ja-JP')} |
                  更新: {new Date(room.updated_at).toLocaleString('ja-JP')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
