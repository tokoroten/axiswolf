import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { playerNames } from '../data/playerNames';
import RulesModal from '../components/RulesModal';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [playerCount, setPlayerCount] = useState(4);
  const [selectedPlayerId, setSelectedPlayerId] = useState(1);
  const [gameMode, setGameMode] = useState<'normal' | 'expert'>('normal');
  const [showRules, setShowRules] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // LocalStorageから保存された情報を読み込み
    const savedKeyword = localStorage.getItem('gameKeyword');
    const savedPlayerCount = localStorage.getItem('playerCount');
    const savedPlayerId = localStorage.getItem('playerId');
    const savedGameMode = localStorage.getItem('gameMode');
    
    if (savedKeyword) {
      setKeyword(savedKeyword);
    }
    if (savedPlayerCount) {
      setPlayerCount(parseInt(savedPlayerCount));
    }
    if (savedPlayerId) {
      setSelectedPlayerId(parseInt(savedPlayerId));
    }
    if (savedGameMode) {
      setGameMode(savedGameMode as 'normal' | 'expert');
    }
  }, []);

  const handleLogin = () => {
    if (!keyword.trim()) {
      alert('パスコードを入力してください');
      return;
    }
    // LocalStorageに保存
    localStorage.setItem('gameKeyword', keyword);
    localStorage.setItem('playerCount', playerCount.toString());
    localStorage.setItem('playerId', selectedPlayerId.toString());
    localStorage.setItem('gameMode', gameMode);
    navigate(`/game?keyword=${encodeURIComponent(keyword)}&pid=${selectedPlayerId}&mode=${gameMode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          アクシスウルフ
        </h1>
        <p className="text-center text-gray-600 mb-6">
          軸がズレた人狼を見つけ出せ！
        </p>
        
        <div className="text-center mb-6">
          <button
            onClick={() => setShowRules(true)}
            className="text-blue-500 hover:text-blue-700 underline font-medium"
          >
            📖 ルールを確認
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスコード
            </label>
            <input
              type="text"
              placeholder="6桁の数字"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg font-mono"
              maxLength={6}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プレイ人数
            </label>
            <select
              value={playerCount}
              onChange={(e) => {
                const count = Number(e.target.value);
                setPlayerCount(count);
                // 選択中のプレイヤーIDが人数を超えたら調整
                if (selectedPlayerId > count) {
                  setSelectedPlayerId(1);
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            >
              <option value={3}>3人</option>
              <option value={4}>4人</option>
              <option value={5}>5人</option>
              <option value={6}>6人</option>
              <option value={7}>7人</option>
              <option value={8}>8人</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ゲームモード
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGameMode('normal')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  gameMode === 'normal'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-bold">一般向け</div>
                <div className="text-xs mt-1">わかりやすい軸のみ</div>
              </button>
              <button
                type="button"
                onClick={() => setGameMode('expert')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  gameMode === 'expert'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-bold">インテリ向け</div>
                <div className="text-xs mt-1">専門知識が必要な軸も含む</div>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              あなたのキャラクター
            </label>
            <div className="grid grid-cols-2 gap-2">
              {playerNames.slice(0, playerCount).map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`px-3 py-2 rounded-lg font-bold transition-all ${
                    selectedPlayerId === player.id
                      ? 'ring-4 ring-blue-400 ring-offset-2'
                      : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: player.bgColor,
                    color: player.color
                  }}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-600 transition-colors"
          >
            ゲームに参加
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">または</span>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/host')}
            className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-purple-600 transition-colors"
          >
            ホストとしてゲームを開始
          </button>
        </div>
      </div>
      
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}