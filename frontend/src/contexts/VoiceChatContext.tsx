import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import Peer, { type MediaConnection } from 'peerjs';

interface VoiceChatContextType {
  isEnabled: boolean;
  isMuted: boolean;
  volume: number;
  micGain: number; // マイクゲイン 0-100
  isConnected: boolean;
  connectedPeers: string[];
  myPeerId: string | null;
  audioLevel: number; // 受信音声レベル 0-100
  micLevel: number; // マイク入力レベル 0-100
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setMicGain: (gain: number) => void;
  initializeVoiceChat: (roomCode: string, playerId: string, ws: WebSocket | null) => void;
  disconnectVoiceChat: () => void;
  connectToPeer: (remotePeerId: string, remotePlayerId: string) => void;
}

const VoiceChatContext = createContext<VoiceChatContextType | null>(null);

export function useVoiceChat() {
  const context = useContext(VoiceChatContext);
  if (!context) {
    throw new Error('useVoiceChat must be used within a VoiceChatProvider');
  }
  return context;
}

interface VoiceChatProviderProps {
  children: ReactNode;
}

export function VoiceChatProvider({ children }: VoiceChatProviderProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(100);
  const [micGain, setMicGainState] = useState(100); // デフォルト100%
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // 受信音声レベル
  const [micLevel, setMicLevel] = useState(0); // マイク入力レベル

  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null); // マイクゲイン用
  const connectionsRef = useRef<Map<string, MediaConnection>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const myPlayerIdRef = useRef<string | null>(null);
  const remoteAudiosRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map());
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const micLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    // すべてのリモートオーディオ（実際はGainNode）の音量を更新
    remoteAudiosRef.current.forEach((gainNode: any) => {
      if (gainNode && gainNode.gain) {
        gainNode.gain.value = Math.min(3.0, newVolume / 100);
      }
    });
  };

  const setMicGain = (newGain: number) => {
    setMicGainState(newGain);
    // マイクゲインノードが存在する場合は更新
    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = newGain / 100;
    }
  };

  const initializeVoiceChat = useCallback(async (roomCode: string, playerId: string, ws: WebSocket | null) => {
    try {
      console.log('[VoiceChat] Initializing voice chat', { roomCode, playerId });

      // 既存のPeerがあれば先に破棄して少し待つ
      if (peerRef.current) {
        console.log('[VoiceChat] Destroying existing peer before creating new one');
        peerRef.current.destroy();
        peerRef.current = null;
        // PeerJSサーバーが古い接続をクリーンアップする時間を与える
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      wsRef.current = ws;
      myPlayerIdRef.current = playerId;

      // マイク許可を取得（エコーキャンセレーション無効化）
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        video: false
      });
      localStreamRef.current = stream;
      console.log('🎤 [VoiceChat/Mic] Got local media stream');

      // トラックのミュート状態を確認・解除
      stream.getAudioTracks().forEach(track => {
        if (track.muted) {
          console.warn('⚠️ [VoiceChat/Mic] Audio track is muted, attempting to unmute');
          // ミュート状態の場合、トラックを有効化
          track.enabled = true;
        }
      });

      console.log('🎤 [VoiceChat/Mic] Audio tracks:', stream.getAudioTracks().map(t => ({
        id: t.id,
        kind: t.kind,
        label: t.label,
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState,
        settings: t.getSettings()
      })));

      // AudioContextを作成して音量制御を設定
      const audioContext = new AudioContext();
      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume / 100;
      audioContextRef.current = audioContext;
      gainNodeRef.current = gainNode;

      // 自分のマイク入力用のAnalyserNodeとゲインノードを作成
      try {
        const localSource = audioContext.createMediaStreamSource(stream);

        // マイクゲイン用のGainNodeを作成
        const micGainNode = audioContext.createGain();
        micGainNode.gain.value = micGain / 100;
        micGainNodeRef.current = micGainNode;

        // Analyserノードを作成（レベル監視用）
        const localAnalyser = audioContext.createAnalyser();
        localAnalyser.fftSize = 256;
        localAnalyser.smoothingTimeConstant = 0.8;

        // 接続: マイク → ゲイン → Analyser
        localSource.connect(micGainNode);
        micGainNode.connect(localAnalyser);

        analyserNodesRef.current.set('local', localAnalyser);

        console.log('[VoiceChat] Created analyser and gain nodes for local microphone');
      } catch (err) {
        console.error('[VoiceChat] Failed to create local analyser node:', err);
      }

      // 完全にランダムなPeer IDを生成（UUIDのような形式）
      const randomId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      console.log('[VoiceChat] Creating peer with random ID:', randomId);

      // PeerJSサーバーの設定（環境変数から取得）
      const peerHost = import.meta.env.VITE_PEERJS_HOST || 'localhost';
      const peerPort = Number(import.meta.env.VITE_PEERJS_PORT) || 9000;
      const peerPath = import.meta.env.VITE_PEERJS_PATH || '/';

      console.log('[VoiceChat] PeerJS server config:', { host: peerHost, port: peerPort, path: peerPath });

      const peer = new Peer(randomId, {
        host: peerHost,
        port: peerPort,
        path: peerPath,
        debug: 2,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('🟢 [VoiceChat/P2P] Peer connected with ID:', id);
        setMyPeerId(id);
        setIsConnected(true);

        // WebSocketで自分のPeer IDをブロードキャスト
        const broadcastPeerId = () => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            const message = {
              type: 'vc_peer_id',
              player_id: playerId,
              peer_id: id,
            };
            ws.send(JSON.stringify(message));
            console.log('📤 [VoiceChat/P2P] Sent peer ID to server:', message);
          } else {
            console.warn('⚠️ [VoiceChat/P2P] WebSocket not ready, waiting...', ws?.readyState);
            // WebSocketが接続されるまで待つ（最大5秒間、100msごとにチェック）
            let retries = 0;
            const maxRetries = 50;
            const checkInterval = setInterval(() => {
              retries++;
              if (ws && ws.readyState === WebSocket.OPEN) {
                clearInterval(checkInterval);
                const message = {
                  type: 'vc_peer_id',
                  player_id: playerId,
                  peer_id: id,
                };
                ws.send(JSON.stringify(message));
                console.log('📤 [VoiceChat/P2P] Sent peer ID to server (after waiting):', message);
              } else if (retries >= maxRetries) {
                clearInterval(checkInterval);
                console.error('🔴 [VoiceChat/P2P] WebSocket not ready after 5 seconds, giving up');
              }
            }, 100);
          }
        };

        // 即座に送信（または待機）
        broadcastPeerId();

        // 1秒後に再送信（他のプレイヤーのVC接続を待つため）
        setTimeout(() => {
          console.log('🔁 [VoiceChat/P2P] Re-broadcasting peer ID for late joiners');
          broadcastPeerId();
        }, 1000);
      });

      peer.on('call', (call) => {
        console.log('📞 [VoiceChat/P2P] Receiving call from:', call.peer);

        // 着信に応答
        call.answer(stream);
        connectionsRef.current.set(call.peer, call);
        console.log('✅ [VoiceChat/P2P] Answered call from:', call.peer);

        call.on('stream', (remoteStream) => {
          console.log('🎵 [VoiceChat/Receive] Received remote stream from:', call.peer);
          console.log('🎵 [VoiceChat/Receive] Stream tracks:', remoteStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, muted: t.muted })));
          playRemoteStream(remoteStream, call.peer);
          setConnectedPeers((prev) => [...new Set([...prev, call.peer])]);
        });

        call.on('close', () => {
          console.log('🔌 [VoiceChat/P2P] Call closed:', call.peer);
          connectionsRef.current.delete(call.peer);
          setConnectedPeers((prev) => prev.filter((id) => id !== call.peer));
        });

        call.on('error', (err) => {
          console.error('🔴 [VoiceChat/P2P] Call error:', call.peer, err);
        });
      });

      peer.on('error', (err) => {
        console.error('[VoiceChat] Peer error:', err);
        setIsConnected(false);
      });

      peer.on('disconnected', () => {
        console.log('[VoiceChat] Peer disconnected');
        setIsConnected(false);
      });

      setIsEnabled(true);
    } catch (error) {
      console.error('[VoiceChat] Failed to initialize voice chat:', error);
      alert('マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。');
    }
  }, [volume]);

  const connectToPeer = useCallback((remotePeerId: string, remotePlayerId: string) => {
    if (!peerRef.current || !localStreamRef.current) {
      console.warn('⚠️ [VoiceChat/P2P] Cannot connect: peer or stream not ready');
      return;
    }

    // 既に接続済みの場合はスキップ
    if (connectionsRef.current.has(remotePeerId)) {
      console.log('⏭️ [VoiceChat/P2P] Already connected to:', remotePeerId);
      return;
    }

    // 自分自身には接続しない
    if (remotePlayerId === myPlayerIdRef.current) {
      console.log('⏭️ [VoiceChat/P2P] Skipping self-connection');
      return;
    }

    console.log('📞 [VoiceChat/P2P] Calling peer:', { remotePeerId, remotePlayerId });
    console.log('📤 [VoiceChat/Send] Local stream tracks:', localStreamRef.current.getTracks().map(t => ({
      kind: t.kind,
      enabled: t.enabled,
      muted: t.muted,
      readyState: t.readyState,
      id: t.id
    })));
    console.log('📤 [VoiceChat/Send] Local stream details:', {
      id: localStreamRef.current.id,
      active: localStreamRef.current.active,
      trackCount: localStreamRef.current.getTracks().length
    });

    try {
      const call = peerRef.current.call(remotePeerId, localStreamRef.current);
      connectionsRef.current.set(remotePeerId, call);
      console.log('✅ [VoiceChat/P2P] Call initiated to:', remotePeerId);
      console.log('✅ [VoiceChat/P2P] Call metadata:', {
        peer: call.peer,
        type: call.type,
        open: call.open
      });

      call.on('stream', (remoteStream) => {
        console.log('🎵 [VoiceChat/Receive] Received remote stream from:', remotePeerId);
        console.log('🎵 [VoiceChat/Receive] Stream tracks:', remoteStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, muted: t.muted })));
        playRemoteStream(remoteStream, remotePeerId);
        setConnectedPeers((prev) => [...new Set([...prev, remotePeerId])]);
      });

      call.on('close', () => {
        console.log('🔌 [VoiceChat/P2P] Call closed:', remotePeerId);
        connectionsRef.current.delete(remotePeerId);
        setConnectedPeers((prev) => prev.filter((id) => id !== remotePeerId));
      });

      call.on('error', (err) => {
        console.error('🔴 [VoiceChat/P2P] Call error:', remotePeerId, err);
        connectionsRef.current.delete(remotePeerId);
        setConnectedPeers((prev) => prev.filter((id) => id !== remotePeerId));
      });
    } catch (error) {
      console.error('🔴 [VoiceChat/P2P] Failed to call peer:', error);
    }
  }, []);

  const playRemoteStream = (stream: MediaStream, peerId: string) => {
    console.log('🔧 [VoiceChat/Play] Setting up remote stream for peer:', peerId);
    console.log('🔧 [VoiceChat/Play] Remote stream details:', {
      id: stream.id,
      active: stream.active,
      tracks: stream.getTracks().map(t => ({
        id: t.id,
        kind: t.kind,
        label: t.label,
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState,
        settings: t.getSettings()
      }))
    });

    // AudioContextがない場合は作成
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      console.log('🎛️ [VoiceChat/Play] Created new AudioContext');
    }

    const audioContext = audioContextRef.current;

    // AudioContextを再開（一部のブラウザで必要）
    if (audioContext.state === 'suspended') {
      console.log('⏸️ [VoiceChat/Play] AudioContext suspended, resuming...');
      audioContext.resume().then(() => {
        console.log('▶️ [VoiceChat/Play] AudioContext resumed');
      });
    } else {
      console.log('▶️ [VoiceChat/Play] AudioContext state:', audioContext.state);
    }

    // 音声レベル検出用のAnalyserNodeとGainNodeを作成
    try {
      const source = audioContext.createMediaStreamSource(stream);
      const gainNode = audioContext.createGain();
      const analyser = audioContext.createAnalyser();

      // 音量を300%まで対応（gain値は3.0まで）
      gainNode.gain.value = Math.min(3.0, volume / 100);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // 接続: ソース → ゲイン → Analyser → スピーカー
      source.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(audioContext.destination);

      analyserNodesRef.current.set(peerId, analyser);
      remoteAudiosRef.current.set(peerId, gainNode as any);

      console.log('✅ [VoiceChat/Play] Audio pipeline created:', {
        peerId,
        gain: gainNode.gain.value,
        contextState: audioContext.state,
        destination: audioContext.destination,
      });

      // 定期的に音声レベルをチェック（デバッグ用）
      let checkCount = 0;
      const levelCheckInterval = setInterval(() => {
        checkCount++;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const max = Math.max(...dataArray);

        console.log(`🎵 [VoiceChat/Play] Audio level check ${checkCount} for`, peerId, ':', {
          average: average.toFixed(2),
          max: max,
          samples: dataArray.slice(0, 10) // 最初の10サンプルを表示
        });

        // 10回チェックしたら停止
        if (checkCount >= 10) {
          clearInterval(levelCheckInterval);
          console.log('🎵 [VoiceChat/Play] Level check completed for', peerId);
        }
      }, 1000); // 1秒ごとにチェック
    } catch (err) {
      console.error('🔴 [VoiceChat/Play] Failed to create audio pipeline:', err);
    }
  };

  const disconnectVoiceChat = useCallback(() => {
    console.log('[VoiceChat] Disconnecting voice chat');

    // 音声レベル監視を停止
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    if (micLevelIntervalRef.current) {
      clearInterval(micLevelIntervalRef.current);
      micLevelIntervalRef.current = null;
    }

    // すべての接続を切断
    connectionsRef.current.forEach((call) => {
      call.close();
    });
    connectionsRef.current.clear();

    // リモートオーディオ（GainNode）をクリア
    // GainNodeは自動的に切断されるので特別な処理は不要
    remoteAudiosRef.current.clear();

    // Analyserノードをクリア
    analyserNodesRef.current.clear();

    // ローカルストリームを停止
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Peerを破棄
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // AudioContextをクローズ
    if (audioContextRef.current && 'close' in audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // ゲインノードをクリア
    micGainNodeRef.current = null;

    setIsEnabled(false);
    setIsConnected(false);
    setConnectedPeers([]);
    setAudioLevel(0);
    setMicLevel(0);
  }, []);

  // マイク入力レベルを監視
  useEffect(() => {
    const localAnalyser = analyserNodesRef.current.get('local');
    if (!localAnalyser) {
      return;
    }

    console.log('🎤 [VoiceChat/Mic] Starting microphone level monitoring');

    // 既存の監視があればクリア
    if (micLevelIntervalRef.current) {
      clearInterval(micLevelIntervalRef.current);
    }

    // 100msごとにマイクレベルをチェック
    micLevelIntervalRef.current = setInterval(() => {
      const dataArray = new Uint8Array(localAnalyser.frequencyBinCount);
      localAnalyser.getByteFrequencyData(dataArray);

      // 全周波数の平均を計算
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      // 0-255を0-100に正規化
      const level = Math.min(100, (average / 255) * 100 * 2); // 感度を2倍に

      setMicLevel(Math.round(level));
    }, 100);

    return () => {
      if (micLevelIntervalRef.current) {
        clearInterval(micLevelIntervalRef.current);
        micLevelIntervalRef.current = null;
      }
    };
  }, [isEnabled]);

  // 受信音声レベルを監視（リモートのみ）
  useEffect(() => {
    // ローカルを除くリモートのAnalyserが1つもない場合は監視しない
    const remoteAnalysers = Array.from(analyserNodesRef.current.entries()).filter(([key]) => key !== 'local');
    if (remoteAnalysers.length === 0) {
      setAudioLevel(0);
      return;
    }

    console.log('🔊 [VoiceChat/Receive] Starting remote audio level monitoring for', remoteAnalysers.length, 'peer(s)');

    // 既存の監視があればクリア
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
    }

    // 100msごとに音声レベルをチェック
    audioLevelIntervalRef.current = setInterval(() => {
      let maxLevel = 0;

      remoteAnalysers.forEach(([, analyser]) => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        // 全周波数の平均を計算
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        // 0-255を0-100に正規化
        const level = Math.min(100, (average / 255) * 100 * 2); // 感度を2倍に

        if (level > maxLevel) {
          maxLevel = level;
        }
      });

      setAudioLevel(Math.round(maxLevel));
    }, 100);

    return () => {
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
        audioLevelIntervalRef.current = null;
      }
    };
  }, [connectedPeers]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      disconnectVoiceChat();
    };
  }, []);

  return (
    <VoiceChatContext.Provider
      value={{
        isEnabled,
        isMuted,
        volume,
        micGain,
        isConnected,
        connectedPeers,
        myPeerId,
        audioLevel,
        micLevel,
        toggleMute,
        setVolume,
        setMicGain,
        initializeVoiceChat,
        disconnectVoiceChat,
        connectToPeer,
      }}
    >
      {children}
    </VoiceChatContext.Provider>
  );
}
