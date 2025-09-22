import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { getPlayerName } from '../data/playerNames';
import { themes } from '../data/themes';
import RulesModal from '../components/RulesModal';

interface PlayerQR {
  id: number;
  name: string;
  url: string;
  qrDataUrl: string;
}

export default function Home() {
  const [keyword, setKeyword] = useState(() => {
    // LocalStorageから保存されたパスコードを読み込み
    return localStorage.getItem('gameKeyword') || '';
  });
  const [playerCount, setPlayerCount] = useState(() => {
    // LocalStorageから保存されたプレイヤー人数を読み込み
    return parseInt(localStorage.getItem('playerCount') || '4');
  });
  const [isOnlineMode, setIsOnlineMode] = useState(() => {
    // LocalStorageから保存されたオンラインモードを読み込み
    return localStorage.getItem('isOnlineMode') === 'true';
  });
  const [selectedThemes, setSelectedThemes] = useState<string[]>(() => {
    // LocalStorageから保存された選択テーマを読み込み
    const saved = localStorage.getItem('selectedThemes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['food', 'daily', 'entertainment'];
      }
    }
    return ['food', 'daily', 'entertainment'];
  });
  const [roomCreated, setRoomCreated] = useState(false);
  const [playerQRs, setPlayerQRs] = useState<PlayerQR[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showRules, setShowRules] = useState(false);
  const navigate = useNavigate();

  const generateRandomKeyword = () => {
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    setKeyword(randomNum);
  };

  const createRoom = () => {
    if (!keyword.trim()) {
      alert('パスコードを入力してください');
      return;
    }
    if (selectedThemes.length === 0) {
      alert('少なくとも1つのテーマを選択してください');
      return;
    }
    setRoomCreated(true);
    // パスコード、プレイヤー人数、選択テーマ、オンラインモードをLocalStorageに保存
    localStorage.setItem('gameKeyword', keyword);
    localStorage.setItem('playerCount', playerCount.toString());
    localStorage.setItem('isOnlineMode', isOnlineMode.toString());
    localStorage.setItem('selectedThemes', JSON.stringify(selectedThemes));
    generatePlayerQRs();
  };

  const generatePlayerQRs = async () => {
    // Viteのbase設定を使用してURLを生成（ローカル・GitHub両対応）
    const baseUrl = window.location.origin;
    const basePath = import.meta.env.BASE_URL; // '/' または '/axiswolf/'
    const players: PlayerQR[] = [];

    // 指定人数分のQRコードを生成
    for (let i = 1; i <= playerCount; i++) {
      const playerInfo = getPlayerName(i);
      const url = `${baseUrl}${basePath}game?keyword=${encodeURIComponent(keyword)}&pid=${i}&playerCount=${playerCount}${isOnlineMode ? '&online=true' : ''}&themes=${encodeURIComponent(selectedThemes.join(','))}`;

      try {
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        players.push({
          id: i,
          name: playerInfo.name,
          url,
          qrDataUrl
        });
      } catch (err) {
        console.error('QRコード生成エラー:', err);
      }
    }

    setPlayerQRs(players);
  };

  const startGame = () => {
    navigate(`/game?keyword=${encodeURIComponent(keyword)}&host=true&playerCount=${playerCount}${isOnlineMode ? '&online=true' : ''}&themes=${encodeURIComponent(selectedThemes.join(','))}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          アクシスウルフ
        </h1>
        <p className="text-center text-gray-600 mb-6">
          軸がズレた人狼を見つけ出せ！
        </p>

        {!roomCreated ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-6">ゲームルームを作成</h2>

            <div className="text-center mb-4">
              <button
                onClick={() => setShowRules(true)}
                className="text-blue-500 hover:text-blue-700 underline font-medium text-sm"
              >
                📖 ルールを確認
              </button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="パスコード（6桁の数字）"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full px-4 py-3 pr-24 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg font-mono"
                  maxLength={6}
                />
                <button
                  onClick={generateRandomKeyword}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors"
                  type="button"
                >
                  自動生成
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プレイヤー人数
                </label>
                <select
                  value={playerCount}
                  onChange={(e) => setPlayerCount(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
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
                  プレイモード
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOnlineMode(false)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      !isOnlineMode
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-bold">通常プレイ</div>
                    <div className="text-xs mt-1">実物のカードを使用</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOnlineMode(true)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      isOnlineMode
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-bold">オンラインプレイ</div>
                    <div className="text-xs mt-1">デジタルカードを使用</div>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  テーマ選択（複数選択可）
                </label>
                <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                  {themes.filter(t => t.id !== 'mixed' && t.id !== 'random').map(theme => (
                    <label
                      key={theme.id}
                      className={`
                        relative flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all
                        ${selectedThemes.includes(theme.id)
                          ? 'bg-white shadow-md border-2 border-purple-400 transform scale-[1.02]'
                          : 'bg-white/80 border-2 border-gray-200 hover:bg-white hover:border-purple-300 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={selectedThemes.includes(theme.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedThemes([...selectedThemes, theme.id]);
                            } else {
                              setSelectedThemes(selectedThemes.filter(t => t !== theme.id));
                            }
                          }}
                          className={`
                            h-5 w-5 rounded border-2 transition-all
                            ${selectedThemes.includes(theme.id)
                              ? 'text-purple-600 border-purple-600 focus:ring-purple-500'
                              : 'text-purple-400 border-gray-300 focus:ring-purple-400'
                            }
                          `}
                        />
                      </div>
                      <div className="flex-1">
                        <div className={`font-bold ${selectedThemes.includes(theme.id) ? 'text-purple-700' : 'text-gray-700'}`}>
                          {theme.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{theme.description}</div>
                      </div>
                      {selectedThemes.includes(theme.id) && (
                        <div className="absolute top-1 right-1">
                          <span className="text-purple-600 text-lg">✓</span>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
                {selectedThemes.length === 0 && (
                  <p className="text-red-500 text-sm mt-2 font-medium">
                    ⚠️ 少なくとも1つのテーマを選択してください
                  </p>
                )}
                {selectedThemes.length > 0 && (
                  <p className="text-purple-600 text-sm mt-2">
                    選択中: {selectedThemes.length}個のテーマ
                  </p>
                )}
                {!isOnlineMode && (
                  <p className="text-amber-600 text-xs mt-2 bg-amber-50 p-2 rounded">
                    💡 通常プレイでは軸のみがテーマに応じて調整されます（カードは手持ちのものを使用）
                  </p>
                )}
              </div>

              <button
                onClick={createRoom}
                className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-purple-600 transition-colors"
              >
                ルームを作成
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600">パスコード</div>
                <div className="text-2xl font-bold font-mono">{keyword}</div>
                <div className="text-sm text-gray-600 mt-2">
                  プレイヤー人数: {playerCount}人 | {isOnlineMode ? 'オンラインプレイ' : '通常プレイ'}
                  {selectedThemes.length > 0 && (
                    <div className="mt-1">
                      選択テーマ: {selectedThemes.map(id => themes.find(t => t.id === id)?.name).filter(Boolean).join('、')}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={startGame}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors"
              >
                ゲームを開始（ホスト表示）
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">プレイヤー用QRコード</h2>
                <button
                  onClick={async () => {
                    const allUrls = playerQRs.map((player) =>
                      `${getPlayerName(player.id).name}: ${player.url}`
                    ).join('\n');
                    try {
                      await navigator.clipboard.writeText(allUrls);
                      setCopiedId(-1);
                      setTimeout(() => setCopiedId(null), 2000);
                    } catch (err) {
                      console.error('URLのコピーに失敗しました:', err);
                    }
                  }}
                  className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                    copiedId === -1
                      ? 'bg-green-500 text-white'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  {copiedId === -1 ? '✓ 全URLコピー済み' : '全URLを一括コピー'}
                </button>
              </div>
              <div className={`grid gap-6 grid-cols-1 ${
                playerCount <= 4 ? 'md:grid-cols-4' :
                playerCount <= 6 ? 'md:grid-cols-3' :
                'md:grid-cols-4'
              }`}>
                {playerQRs.map((player) => {
                  const playerInfo = getPlayerName(player.id);
                  const handleCopyUrl = async () => {
                    try {
                      await navigator.clipboard.writeText(player.url);
                      setCopiedId(player.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    } catch (err) {
                      console.error('URLのコピーに失敗しました:', err);
                    }
                  };

                  return (
                    <div key={player.id} className="text-center">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <img
                          src={player.qrDataUrl}
                          alt={`QR for ${player.name}`}
                          className="mx-auto mb-2"
                        />
                        <div
                          className="font-bold text-lg px-3 py-1 rounded inline-block"
                          style={{
                            backgroundColor: playerInfo.bgColor,
                            color: playerInfo.color
                          }}
                        >
                          {player.name}
                        </div>
                        <button
                          onClick={handleCopyUrl}
                          className={`mt-2 px-3 py-1 rounded text-sm font-medium transition-all ${
                            copiedId === player.id
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {copiedId === player.id ? '✓ コピー済み' : 'URLをコピー'}
                        </button>
                        <a
                          href={player.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-1 text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          デバッグ用リンク
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  各プレイヤーにQRコードを読み取ってもらってください。
                  QRコードを読み取ると、自動的にパスコードとプレイヤー名が設定されます。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}