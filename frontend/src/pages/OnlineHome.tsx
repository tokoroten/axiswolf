import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';

export default function OnlineHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { createRoom, joinRoom, resetGameState } = useGame();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(() => {
    // localStorageから保存された名前を読み込む
    return localStorage.getItem('saved_player_name') || '';
  });
  const [playerId] = useState(() => {
    // LocalStorageに保存されているplayer_idがあればそれを使用、なければ新規生成
    const savedPlayerId = localStorage.getItem('online_player_id');
    if (savedPlayerId) {
      console.log('[OnlineHome] Using saved player_id:', savedPlayerId);
      return savedPlayerId;
    }
    const newPlayerId = `player_${Math.random().toString(36).slice(2)}`;
    console.log('[OnlineHome] Generated new player_id:', newPlayerId);
    // 新規生成したIDをすぐにLocalStorageに保存（直接URLアクセス時に必要）
    localStorage.setItem('online_player_id', newPlayerId);
    return newPlayerId;
  });
  const [savedRoom, setSavedRoom] = useState<{ roomCode: string; playerName: string } | null>(null);
  const [showRules, setShowRules] = useState(false);

  // ロビーに入った時にゲーム状態をリセット（古い状態を消す）
  useEffect(() => {
    console.log('[OnlineHome] ロビーに入ったのでゲーム状態をリセット');
    resetGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const handleRejoin = async () => {
    if (!savedRoom) return;

    const savedPlayerId = localStorage.getItem('online_player_id');
    if (!savedPlayerId) {
      alert('プレイヤー情報が見つかりません');
      return;
    }

    try {
      await joinRoom(savedRoom.roomCode, savedPlayerId, savedRoom.playerName);
      navigate(`/online/${savedRoom.roomCode}`);
    } catch (error: any) {
      console.error('Failed to rejoin room:', error);

      // エラー処理
      if (error?.message?.includes('after game has started') || error?.response?.status === 403) {
        alert('このルームは既にゲーム中です。\n\n途中参加はできません。\n新しいゲームが始まるまでお待ちいただくか、\n別のルームを作成してください。');
      } else if (error?.response?.status === 404) {
        alert('ルームが見つかりません。\nルームは削除された可能性があります。');
        // LocalStorageをクリア
        localStorage.removeItem('online_room_code');
        localStorage.removeItem('online_player_id');
        localStorage.removeItem('online_player_name');
        setSavedRoom(null);
      } else {
        alert('ルーム参加に失敗しました');
      }
    }
  };

  // ランダムなルームコードを生成
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字(I, O, 0, 1)を除外
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setRoomCode(code);
  };

  const handleCreate = async () => {
    if (!playerName.trim()) {
      alert('名前を入力してください');
      return;
    }

    // ルームコードが空の場合は自動生成
    let finalRoomCode = roomCode.trim();
    if (!finalRoomCode) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 紛らわしい文字(I, O, 0, 1)を除外
      finalRoomCode = '';
      for (let i = 0; i < 10; i++) {
        finalRoomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      console.log('[OnlineHome] ルームコードを自動生成しました:', finalRoomCode);
    } else if (finalRoomCode.length < 4) {
      alert('ルームコードは4文字以上で入力してください');
      return;
    }

    try {
      // プレイヤー名をlocalStorageに保存
      localStorage.setItem('saved_player_name', playerName.trim());

      await createRoom(finalRoomCode, playerId, playerName);
      navigate(`/online/${finalRoomCode}`);
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
      // プレイヤー名をlocalStorageに保存
      localStorage.setItem('saved_player_name', playerName.trim());

      await joinRoom(roomCode, playerId, playerName);
      navigate(`/online/${roomCode}`);
    } catch (error: any) {
      console.error('Failed to join room:', error);

      // ゲーム開始後の参加エラーを特別に処理
      if (error?.message?.includes('after game has started') || error?.response?.status === 403) {
        alert('このルームは既にゲーム中です。\n\n途中参加はできません。\n新しいゲームが始まるまでお待ちいただくか、\n別のルームを作成してください。');
      } else if (error?.response?.status === 404) {
        alert('ルームが見つかりません。\nルームコードを確認してください。');
      } else {
        alert('ルーム参加に失敗しました');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            アクシスウルフ
          </h1>
          <p className="text-sm text-gray-500 mb-3">AXIS WOLF</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-6">
          <p className="text-center text-purple-700 font-bold text-lg">
            オンライン対戦モード
          </p>
          <p className="text-center text-gray-600 text-sm">
            遠隔地のプレイヤーとリアルタイムで対戦
          </p>
        </div>

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

        {/* タブUI */}
        <div className="flex border-b-2 border-gray-200 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-3 font-bold transition-all relative ${
              mode === 'create'
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ルーム作成
            {mode === 'create' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-3 font-bold transition-all relative ${
              mode === 'join'
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ルーム参加
            {mode === 'join' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="space-y-4">
          {mode === 'create' ? (
            // ルーム作成タブ
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ルームコード（任意・空欄で自動生成）
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="例: ABCD1234"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg font-mono text-gray-900"
                    maxLength={10}
                  />
                  <button
                    type="button"
                    onClick={generateRoomCode}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors whitespace-nowrap"
                    title="ランダムなコードを生成"
                  >
                    🎲 自動生成
                  </button>
                </div>
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg text-gray-900"
                />
              </div>

              <button
                onClick={handleCreate}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                作成して開始 →
              </button>
            </>
          ) : (
            // ルーム参加タブ
            <>
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
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none text-lg font-mono text-gray-900 ${
                    searchParams.get('room')
                      ? 'border-green-400 bg-green-50 focus:border-green-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  maxLength={10}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg text-gray-900"
                />
              </div>

              <button
                onClick={handleJoin}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                参加する →
              </button>
            </>
          )}

          <button
            onClick={() => setShowRules(true)}
            className="w-full mb-3 py-2 px-4 bg-white border-2 border-purple-200 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
          >
            📖 ルールを確認する
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            ← ホームに戻る
          </button>
        </div>
      </div>

      {/* ルール説明ダイアログ */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowRules(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">ゲームルール</h2>
              <button
                onClick={() => setShowRules(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-3">🎯 ゲームの目的</h3>
                <p className="text-gray-700 leading-relaxed">
                  全員に共有された二軸に沿ってカードを配置します。ただし1人だけは異なる軸が提示されており、その人（人狼）を見破りましょう。
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-3">👥 プレイ人数・時間</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>人数：</strong>4人（3〜8人でも可）</li>
                  <li><strong>時間：</strong>1ラウンド 5〜8分</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-3">📝 遊び方</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-3">
                  <li><strong>ルーム作成：</strong>ホストがルームコードを設定してルーム作成</li>
                  <li><strong>参加：</strong>他のプレイヤーがルームコードを入力して参加</li>
                  <li><strong>軸の確認：</strong>全員に共通の二軸が表示される（人狼だけ異なる二軸）</li>
                  <li><strong>カード配置：</strong>物理カードをその軸上に配置しながら議論</li>
                  <li><strong>投票：</strong>全員が3枚配置したら、人狼だと思う人に投票</li>
                  <li><strong>結果発表：</strong>最多票を集めた人が人狼候補として明かされる</li>
                  <li><strong>得点計算：</strong>正解・不正解に応じて得点が加算される</li>
                </ol>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-3">⚡ 重要なルール</h3>
                <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-3">
                  <p className="font-bold text-red-700 mb-2">🚫 禁止事項</p>
                  <p className="text-gray-700">
                    <strong>軸の名前を直接言ってはいけません！</strong><br/>
                    例：「この軸は『甘い-辛い』だよね」と言うのはNG<br/>
                    カードの配置理由は説明してOKです。
                  </p>
                </div>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>人狼は自分の軸がバレないようにカードを配置する</li>
                  <li>村人は議論を通じて人狼の違和感を見つける</li>
                  <li>カードの配置位置と理由が重要な手がかりになる</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-3">🏆 得点ルール</h3>
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-3">
                  <h4 className="font-bold text-green-800 mb-2">村人が勝利した場合（人狼を単独で指摘）</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                    <li>村人全員：<strong className="text-green-600">+1点</strong></li>
                    <li>人狼を指したプレイヤー：<strong className="text-green-600">さらに+1点</strong>（合計+2点）</li>
                    <li>人狼：0点</li>
                  </ul>
                </div>
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <h4 className="font-bold text-red-800 mb-2">人狼が勝利した場合（同票または逃げ切り）</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-2">
                    <li>人狼：<strong className="text-red-600">+3点</strong></li>
                    <li>人狼を指したプレイヤー：<strong className="text-blue-600">+1点</strong></li>
                    <li>他の村人：0点</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-purple-600 mb-3">🎮 オンライン対戦の特徴</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>遠隔地のプレイヤーとリアルタイムで対戦可能</li>
                  <li>カードの配置状況がリアルタイムで同期される</li>
                  <li>投票と結果発表が自動で進行する</li>
                  <li>複数ラウンドの累計スコアで競う</li>
                </ul>
              </section>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-6">
              <button
                onClick={() => setShowRules(false)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
