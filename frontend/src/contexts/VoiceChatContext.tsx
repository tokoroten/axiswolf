import { createContext, useContext, useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import Peer, { type MediaConnection } from 'peerjs';

interface VoiceChatContextType {
  isEnabled: boolean;
  isMuted: boolean;
  volume: number;
  micGain: number;
  isConnected: boolean;
  connectedPeers: string[];
  myPeerId: string | null;
  audioLevel: number;
  micLevel: number;
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
  if (!context) throw new Error('useVoiceChat must be used within a VoiceChatProvider');
  return context;
}

export function VoiceChatProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(100);
  const [micGain, setMicGainState] = useState(100);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [micLevel, setMicLevel] = useState(0);

  const peerRef = useRef<Peer | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);
  const connectionsRef = useRef<Map<string, MediaConnection>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const myPlayerIdRef = useRef<string | null>(null);
  const remoteGainNodesRef = useRef<Map<string, GainNode>>(new Map());
  const remoteAudioElsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const analyserNodesRef = useRef<Map<string, AnalyserNode>>(new Map());
  const audioLevelIntervalRef = useRef<number | null>(null);
  const micLevelIntervalRef = useRef<number | null>(null);

  const attachPcDebug = useCallback((c: MediaConnection) => {
    try {
      const pc = (c as any).peerConnection as RTCPeerConnection | undefined;
      if (!pc) return;
      pc.addEventListener('iceconnectionstatechange', () => {
        console.log('[ICE]', c.peer, 'iceconnectionstate', pc.iceConnectionState);
      });
      pc.addEventListener('connectionstatechange', () => {
        console.log('[ICE]', c.peer, 'connectionstate', pc.connectionState);
      });
      pc.addEventListener('icecandidateerror', (e) => {
        console.warn('[ICE] candidate error', c.peer, e);
      });
    } catch {}
  }, []);

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()?.[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    remoteGainNodesRef.current.forEach((gain) => {
      gain.gain.value = Math.min(3.0, newVolume / 100);
    });
    remoteAudioElsRef.current.forEach((el) => {
      el.volume = Math.min(3.0, newVolume / 100);
    });
  };

  const setMicGain = (newGain: number) => {
    setMicGainState(newGain);
    if (micGainNodeRef.current) micGainNodeRef.current.gain.value = newGain / 100;
  };

  const playRemoteStream = (stream: MediaStream, peerId: string) => {
    const useHtmlAudio = ((import.meta as any).env?.VITE_VC_USE_HTML_AUDIO || '') === '1';
    console.log('[VoiceChat/Play] useHtmlAudio fallback:', useHtmlAudio);

    const tracks = stream.getAudioTracks();
    console.log('[VoiceChat/Play] Remote stream tracks:', tracks.map(t => ({ id: t.id, kind: t.kind, enabled: t.enabled, muted: (t as any).muted, readyState: t.readyState })));

    if (useHtmlAudio) {
      // HTMLAudio要素での再生（ブラウザ自動再生制限の回避やデバイス差異の切り分け）
      let el = remoteAudioElsRef.current.get(peerId);
      if (!el) {
        el = document.createElement('audio');
        el.autoplay = true;
        (el as any).playsInline = true;
        el.muted = false;
        document.body.appendChild(el);
        remoteAudioElsRef.current.set(peerId, el);
      }
      try {
        // @ts-ignore
        el.srcObject = stream;
        el.volume = Math.min(3.0, volume / 100);
        el.play().catch(err => console.warn('[VoiceChat/Play] HTMLAudio play() blocked:', err));
      } catch (e) {
        console.error('[VoiceChat/Play] Failed to bind HTMLAudio:', e);
      }
    } else {
      // WebAudioパイプライン
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ac = audioContextRef.current!;
      if (ac.state === 'suspended') ac.resume();
      try {
        const source = ac.createMediaStreamSource(stream);
        const gain = ac.createGain();
        const analyser = ac.createAnalyser();
        gain.gain.value = Math.min(3.0, volume / 100);
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(gain);
        gain.connect(analyser);
        analyser.connect(ac.destination);
        analyserNodesRef.current.set(peerId, analyser);
        remoteGainNodesRef.current.set(peerId, gain);
      } catch (err) {
        console.error('[VoiceChat/Play] Failed to create WebAudio pipeline:', err);
      }
    }
  };

  const initializeVoiceChat = useCallback(async (_roomCode: string, playerId: string, ws: WebSocket | null) => {
    try {
      if (peerRef.current) { try { peerRef.current.destroy(); } catch {} peerRef.current = null; await new Promise(r => setTimeout(r, 200)); }
      wsRef.current = ws;
      myPlayerIdRef.current = playerId;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
      localStreamRef.current = stream;
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ac;
      try {
        const src = ac.createMediaStreamSource(stream);
        const micGainNode = ac.createGain();
        micGainNode.gain.value = micGain / 100;
        micGainNodeRef.current = micGainNode;
        const analyser = ac.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        src.connect(micGainNode);
        micGainNode.connect(analyser);
        analyserNodesRef.current.set('local', analyser);
      } catch {}

      const peerHost = import.meta.env.VITE_PEERJS_HOST || 'localhost';
      const peerPort = Number(import.meta.env.VITE_PEERJS_PORT) || 9000;
      const peerPath = import.meta.env.VITE_PEERJS_PATH || '/';
      const isSecure = (typeof window !== 'undefined' && window.location.protocol === 'https:') || peerPort === 443;
      const turnUrls = (import.meta.env.VITE_TURN_URLS as string | undefined) || '';
      const turnUsername = (import.meta.env.VITE_TURN_USERNAME as string | undefined) || '';
      const turnCredential = (import.meta.env.VITE_TURN_CREDENTIAL as string | undefined) || '';
      const forceRelay = ((import.meta.env.VITE_FORCE_TURN as string | undefined) || '') === '1';
      const iceServers: RTCIceServer[] = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ];
      if (turnUrls.trim()) {
        turnUrls.split(',').map(s => s.trim()).filter(Boolean).forEach(url => {
          if (turnUsername && turnCredential) iceServers.push({ urls: url, username: turnUsername, credential: turnCredential });
          else iceServers.push({ urls: url });
        });
      }
      const randomId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const peer = new Peer(randomId, {
        host: peerHost,
        port: peerPort,
        path: peerPath,
        secure: isSecure,
        debug: 2,
        config: { iceServers, ...(forceRelay ? { iceTransportPolicy: 'relay' } as any : {}) },
      });
      peerRef.current = peer;

      peer.on('open', (id) => {
        setMyPeerId(id);
        setIsConnected(true);
        const send = () => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify({ type: 'vc_peer_id', player_id: playerId, peer_id: id }));
        };
        send();
        setTimeout(send, 1000);
      });

      peer.on('call', (call) => {
        call.answer(stream);
        connectionsRef.current.set(call.peer, call);
        attachPcDebug(call);
        call.on('stream', (remoteStream) => {
          console.log('🎵 [VoiceChat/Receive] Incoming stream from:', call.peer);
          playRemoteStream(remoteStream, call.peer);
          setConnectedPeers((p) => [...new Set([...p, call.peer])]);
        });
        call.on('close', () => { connectionsRef.current.delete(call.peer); setConnectedPeers((p) => p.filter((id) => id !== call.peer)); });
        call.on('error', () => { connectionsRef.current.delete(call.peer); setConnectedPeers((p) => p.filter((id) => id !== call.peer)); });
      });

      peer.on('error', () => { setIsConnected(false); });
      peer.on('disconnected', () => { setIsConnected(false); });

      setIsEnabled(true);
    } catch (e) {
      console.error('[VoiceChat] init error', e);
      alert('マイクへのアクセスが拒否されました。ブラウザの設定をご確認ください');
    }
  }, [micGain]);

  const connectToPeer = useCallback((remotePeerId: string, remotePlayerId: string) => {
    if (!peerRef.current || !localStreamRef.current) return;
    if (connectionsRef.current.has(remotePeerId)) return;
    if (remotePlayerId === myPlayerIdRef.current) return;
    try {
      const call = peerRef.current.call(remotePeerId, localStreamRef.current);
      connectionsRef.current.set(remotePeerId, call);
      attachPcDebug(call);
      call.on('stream', (remoteStream) => {
        console.log('🎵 [VoiceChat/Receive] Remote stream from callee:', remotePeerId);
        playRemoteStream(remoteStream, remotePeerId);
        setConnectedPeers((p) => [...new Set([...p, remotePeerId])]);
      });
      call.on('close', () => { connectionsRef.current.delete(remotePeerId); setConnectedPeers((p) => p.filter((id) => id !== remotePeerId)); });
      call.on('error', () => { connectionsRef.current.delete(remotePeerId); setConnectedPeers((p) => p.filter((id) => id !== remotePeerId)); });
    } catch (e) {
      console.error('[VoiceChat] call error', e);
    }
  }, []);

  const disconnectVoiceChat = useCallback(() => {
    if (audioLevelIntervalRef.current) { clearInterval(audioLevelIntervalRef.current); audioLevelIntervalRef.current = null; }
    if (micLevelIntervalRef.current) { clearInterval(micLevelIntervalRef.current); micLevelIntervalRef.current = null; }
    connectionsRef.current.forEach((c) => { try { c.close(); } catch {} });
    connectionsRef.current.clear();
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (peerRef.current) { try { peerRef.current.destroy(); } catch {} peerRef.current = null; }
    if (audioContextRef.current) { try { audioContextRef.current.close(); } catch {} audioContextRef.current = null; }
    micGainNodeRef.current = null;
    analyserNodesRef.current.clear();
    remoteGainNodesRef.current.clear();
    // remove any HTMLAudio fallback elements
    remoteAudioElsRef.current.forEach((el) => { try { el.pause(); el.srcObject = null as any; el.remove(); } catch {} });
    remoteAudioElsRef.current.clear();
    setIsEnabled(false);
    setIsConnected(false);
    setConnectedPeers([]);
    setAudioLevel(0);
    setMicLevel(0);
  }, []);

  useEffect(() => {
    const analyser = analyserNodesRef.current.get('local');
    if (!analyser) return;
    if (micLevelIntervalRef.current) clearInterval(micLevelIntervalRef.current);
    micLevelIntervalRef.current = window.setInterval(() => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((s, v) => s + v, 0) / data.length;
      const level = Math.min(100, (avg / 255) * 200);
      setMicLevel(Math.round(level));
    }, 100);
    return () => { if (micLevelIntervalRef.current) clearInterval(micLevelIntervalRef.current); };
  }, [isEnabled]);

  useEffect(() => {
    if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current);
    audioLevelIntervalRef.current = window.setInterval(() => {
      let maxLevel = 0;
      analyserNodesRef.current.forEach((analyser, key) => {
        if (key === 'local') return;
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        const level = Math.min(100, (avg / 255) * 200);
        if (level > maxLevel) maxLevel = level;
      });
      setAudioLevel(Math.round(maxLevel));
    }, 100);
    return () => { if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current); };
  }, [connectedPeers, volume]);

  useEffect(() => () => { disconnectVoiceChat(); }, []);

  return (
    <VoiceChatContext.Provider value={{
      isEnabled, isMuted, volume, micGain, isConnected, connectedPeers, myPeerId, audioLevel, micLevel,
      toggleMute, setVolume, setMicGain, initializeVoiceChat, disconnectVoiceChat, connectToPeer,
    }}>
      {children}
    </VoiceChatContext.Provider>
  );
}
