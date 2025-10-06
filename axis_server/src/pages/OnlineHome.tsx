import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

export default function OnlineHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createRoom, joinRoom } = useGame();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId] = useState(() => `player_${Math.random().toString(36).slice(2)}`);
  const [savedRoom, setSavedRoom] = useState<{ roomCode: string; playerName: string } | null>(null);

  // URLパラメータからルームコードを取得
  useEffect(() => {
    const inviteRoomCode = searchParams.get('room');
    if (inviteRoomCode) {
      setRoomCode(inviteRoomCode.toUpperCase());
      setMode('join'); // 自動的に参加モードに切り替え
    }
  }, [searchParams]);

  // LocalStorageから保存されたルーム情報を読み込み
  useEffect(() => {
    const savedRoomCode = localStorage.getItem('online_room_code');
    const savedPlayerName = localStorage.getItem('online_player_name');

    if (savedRoomCode && savedPlayerName) {
      setSavedRoom({ roomCode: savedRoomCode, playerName: savedPlayerName });
    }
  }, []);

  // 保存されたルームに復帰
  const handleRejoin = () => {
    if (savedRoom) {
      navigate(`/online/${savedRoom.roomCode}`);
    }
  };

  const handleCreate = async () => {
    if (!roomCode.trim() || !playerName.trim()) {
      alert('ルームコードと名前を入力してください');
      return;
    }
    try {
      await createRoom(roomCode, playerId, playerName);
      navigate(`/online/${roomCode}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('ルーム作成に失敗しました');
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim() || !playerName.trim()) {
      alert('ルームコードと名前を入力してください');
      return;
    }
    try {
      await joinRoom(roomCode, playerId, playerName);
      navigate(`/online/${roomCode}`);
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('ルーム参加に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          オンライン対戦モード
        </h1>
        <p className="text-center text-gray-600 mb-6">
          遠隔地のプレイヤーとリアルタイムで対戦
        </p>

        {/* 保存されたルームに復帰するボタン */}
        {savedRoom && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
            <p className="text-sm text-gray-700 mb-2 font-medium">前回のゲームに戻る</p>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500">ルーム</p>
                <p className="font-bold text-lg font-mono text-green-700">{savedRoom.roomCode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">プレイヤー名</p>
                <p className="font-bold text-green-700">{savedRoom.playerName}</p>
              </div>
            </div>
            <button
              onClick={handleRejoin}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md"
            >
              このゲームに復帰する →
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              mode === 'create'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ルーム作成
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              mode === 'join'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ルーム参加
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ルームコード
              {searchParams.get('room') && (
                <span className="ml-2 text-xs text-green-600 font-bold">✓ 招待リンクから自動入力</span>
              )}
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="例: ABCD1234"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg font-mono ${
                searchParams.get('room')
                  ? 'border-green-400 bg-green-50 focus:border-green-500'
                  : 'border-gray-200 focus:border-purple-500'
              }`}
              maxLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              あなたの名前
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="名前を入力"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
            />
          </div>

          {mode === 'create' ? (
            <button
              onClick={handleCreate}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              ルームを作成
            </button>
          ) : (
            <button
              onClick={handleJoin}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              ルームに参加
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            ← ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}
