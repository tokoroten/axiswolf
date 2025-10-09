import { useState, useEffect, useRef } from 'react';
import type { Player } from '../lib/api';
import { getPlayerColorStyle } from '../utils/playerColors';
import { useVoiceChat } from '../contexts/VoiceChatContext';

interface ChatMessage {
  player_id: string;
  player_name: string;
  player_slot: number;
  message: string;
  timestamp: string;
}

interface ChatPanelProps {
  players: Player[];
  currentPlayerId: string;
  ws: WebSocket | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ChatPanel({
  players,
  currentPlayerId,
  ws,
  isCollapsed,
  onToggleCollapse,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isConnected: vcConnected, isMuted, volume, micGain, audioLevel, micLevel, toggleMute, setVolume, setMicGain } = useVoiceChat();

  // スナップ処理（100%付近でスナップ）
  const handleVolumeChange = (value: number) => {
    const snapThreshold = 5; // 100±5%の範囲でスナップ
    if (Math.abs(value - 100) <= snapThreshold) {
      setVolume(100);
    } else {
      setVolume(value);
    }
  };

  const handleMicGainChange = (value: number) => {
    const snapThreshold = 5; // 100±5%の範囲でスナップ
    if (Math.abs(value - 100) <= snapThreshold) {
      setMicGain(100);
    } else {
      setMicGain(value);
    }
  };

  // デバッグ用
  useEffect(() => {
    console.log('[ChatPanel] vcConnected:', vcConnected);
  }, [vcConnected]);

  // 通知音を再生する関数
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // 音の設定（心地よい通知音）
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // ボリューム30%
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15); // 150msでフェードアウト

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      console.error('[Chat] 通知音の再生に失敗:', error);
    }
  };

  // 自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // カスタムイベント経由でチャットメッセージを受信
  useEffect(() => {
    const handleChatMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail;

      // 自分のメッセージかどうかをチェック
      const isOwnMessage = data.player_id === currentPlayerId;

      setMessages((prev) => [
        ...prev,
        {
          player_id: data.player_id,
          player_name: data.player_name,
          player_slot: data.player_slot,
          message: data.message,
          timestamp: data.timestamp,
        },
      ]);

      // 自分以外のメッセージの場合のみ通知音を再生
      if (!isOwnMessage) {
        playNotificationSound();
      }

      // チャットが閉じている場合は未読マークを付ける
      if (isCollapsed && !isOwnMessage) {
        setHasUnread(true);
      }
    };

    window.addEventListener('chat-message', handleChatMessage);
    return () => window.removeEventListener('chat-message', handleChatMessage);
  }, [isCollapsed, currentPlayerId]);

  // メッセージ送信
  const sendMessage = () => {
    console.log('[Chat] sendMessage 呼び出し:', {
      hasMessage: !!inputMessage.trim(),
      hasWs: !!ws,
      wsState: ws?.readyState,
      wsStateNames: { 0: 'CONNECTING', 1: 'OPEN', 2: 'CLOSING', 3: 'CLOSED' }
    });

    if (!inputMessage.trim()) {
      console.log('[Chat] 送信失敗: メッセージが空');
      return;
    }

    if (!ws) {
      console.log('[Chat] 送信失敗: WebSocketがnull');
      return;
    }

    if (ws.readyState !== WebSocket.OPEN) {
      console.error('[Chat] 送信失敗: WebSocketが接続されていません。状態:', ws.readyState);
      alert('チャット接続が切断されています。ページを再読み込みしてください。');
      return;
    }

    const currentPlayer = players.find((p) => p.player_id === currentPlayerId);
    if (!currentPlayer) {
      console.error('[Chat] プレイヤーが見つかりません:', { currentPlayerId, playersLength: players.length });
      return;
    }

    const chatMessage = {
      type: 'chat',
      player_id: currentPlayer.player_id,
      player_name: currentPlayer.player_name,
      player_slot: currentPlayer.player_slot,
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      console.log('[Chat] WebSocket送信試行:', chatMessage);
      ws.send(JSON.stringify(chatMessage));
      console.log('[Chat] WebSocket送信成功');
      setInputMessage('');
    } catch (error) {
      console.error('[Chat] WebSocket送信エラー:', error);
      alert('メッセージ送信に失敗しました: ' + error);
    }
  };

  // Enterキーで送信
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !(e.nativeEvent as any).isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={() => {
            setHasUnread(false);
            onToggleCollapse();
          }}
          className="bg-purple-600 text-white px-3 py-6 rounded-l-lg shadow-lg hover:bg-purple-700 transition-colors flex flex-col items-center gap-2 relative"
          title="チャットを開く"
        >
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
          )}
          <span className="text-xl">💬</span>
          <span className="text-xs writing-mode-vertical">チャット</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l-2 border-gray-700 shadow-xl flex flex-col z-40">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h3 className="font-bold">チャット</h3>
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-white hover:text-gray-200 transition-colors"
          title="チャットを閉じる"
        >
          ✕
        </button>
      </div>

      {/* VC制御パネル */}
      {vcConnected && (
        <div className="bg-gray-900 border-b-2 border-gray-700 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-green-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              VC接続中
            </span>
            <button
              onClick={toggleMute}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              title={isMuted ? 'ミュート解除' : 'ミュート'}
            >
              {isMuted ? '🔇 ミュート中' : '🎤 マイクON'}
            </button>
          </div>

          {/* マイクゲインコントロール */}
          <div className="mb-3 bg-gray-800 p-2 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300">🎤 マイクゲイン</span>
              <span className={`text-xs font-medium ${micGain === 100 ? 'text-green-400' : 'text-gray-400'}`}>
                {micGain}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              value={micGain}
              onChange={(e) => handleMicGainChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
              title="マイクゲイン (100%でスナップ)"
            />
            {/* マイク入力レベルインジケーター */}
            <div className="mt-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    micLevel > 50
                      ? 'bg-gradient-to-r from-yellow-500 to-red-500'
                      : 'bg-gradient-to-r from-green-500 to-yellow-500'
                  }`}
                  style={{ width: `${micLevel}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">
                入力レベル: {micLevel > 0 ? `${micLevel}%` : '音声待機中'}
              </span>
            </div>
          </div>

          {/* 受信音量コントロール */}
          <div className="mb-3 bg-gray-800 p-2 rounded">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300">🔊 受信音量</span>
              <span className={`text-xs font-medium ${volume === 100 ? 'text-green-400' : 'text-gray-400'}`}>
                {volume}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              title="受信音量 (100%でスナップ)"
            />
            {/* 受信音声レベルインジケーター */}
            <div className="mt-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    audioLevel > 50
                      ? 'bg-gradient-to-r from-yellow-500 to-red-500'
                      : 'bg-gradient-to-r from-green-500 to-yellow-500'
                  }`}
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400">
                受信レベル: {audioLevel > 0 ? `${audioLevel}%` : '音声待機中'}
              </span>
            </div>
          </div>

          {/* プレイヤー一覧 */}
          <div className="space-y-1">
            {players.map((player) => {
              const isCurrentPlayer = player.player_id === currentPlayerId;
              const isSpeaking = false; // TODO: 音声レベル検出を実装
              const isOnline = player.is_online === true;

              return (
                <div
                  key={player.player_slot}
                  className={`flex items-center gap-2 p-2 rounded ${
                    isSpeaking ? 'bg-green-600/20 ring-2 ring-green-500' : 'bg-gray-800'
                  }`}
                >
                  <div className="relative">
                    <div
                      className={`w-6 h-6 rounded-full flex-shrink-0 border-2 transition-all ${
                        isSpeaking ? 'border-green-400 shadow-lg shadow-green-500/50' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: getPlayerColorStyle(player.player_slot) }}
                    ></div>
                    {/* オンライン/オフラインインジケーター */}
                    <div
                      className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-gray-900 ${
                        isOnline ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                      title={isOnline ? 'オンライン' : 'オフライン'}
                    ></div>
                  </div>
                  <span className={`text-xs flex-1 truncate ${isCurrentPlayer ? 'font-bold' : ''}`}>
                    {player.player_name}
                    {isCurrentPlayer && ' (あなた)'}
                  </span>
                  {isSpeaking && (
                    <span className="text-green-400 text-xs">🎤</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">まだメッセージがありません</p>
            <p className="text-xs mt-2">最初のメッセージを送信してみましょう！</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.player_id === currentPlayerId;
            return (
              <div
                key={index}
                className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                {/* プレイヤーアイコン */}
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 border-2 border-white shadow"
                  style={{ backgroundColor: getPlayerColorStyle(msg.player_slot) }}
                  title={msg.player_name}
                ></div>

                {/* メッセージバブル */}
                <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className={`text-xs font-bold ${isOwnMessage ? 'order-2' : ''}`}
                      style={{ color: getPlayerColorStyle(msg.player_slot) }}
                    >
                      {msg.player_name}
                    </span>
                    <span className={`text-xs text-gray-400 ${isOwnMessage ? 'order-1' : ''}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    className={`inline-block px-3 py-2 rounded-lg max-w-[85%] break-words ${
                      isOwnMessage
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-100 shadow'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力欄 */}
      <div className="border-t border-gray-700 p-4 bg-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="flex-1 px-3 py-2 border-2 border-gray-600 bg-gray-700 text-white rounded-lg focus:border-purple-500 focus:outline-none placeholder-gray-400"
            maxLength={200}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            送信
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Enter で送信 / {inputMessage.length}/200
        </p>
      </div>
    </div>
  );
}
