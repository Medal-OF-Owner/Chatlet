// WebRTC Optimized Hook
import { useCallback, useEffect, useRef, useState } from 'react';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
  { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
];

export function useWebRTC() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const peerRef = useRef(null);
  const localRef = useRef(null);

  const startCall = useCallback(async () => {
    try {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 }, 
          audio: true 
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      }
      localRef.current = stream;
      setLocalStream(stream);
      
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      
      pc.ontrack = e => setRemoteStream(e.streams[0]);
      pc.oniceconnectionstatechange = () => setIsConnected(pc.iceConnectionState === 'connected');
      pc.onicecandidate = e => { if (e.candidate) console.log('ICE:', e.candidate); };
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const endCall = useCallback(() => {
    localRef.current?.getTracks().forEach(t => t.stop());
    peerRef.current?.close();
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
  }, []);

  return { localStream, remoteStream, isConnected, startCall, endCall, error };
}

export function useOutgoingCall() {
  const webrtc = useWebRTC();
  const [offer, setOffer] = useState(null);
  
  const createOffer = useCallback(async () => {
    if (!webrtc.localStream) await webrtc.startCall();
    if (webrtc.localStream && peerRef.current) {
      const o = await peerRef.current.createOffer();
      await peerRef.current.setLocalDescription(o);
      setOffer(o);
      return o;
    }
  }, [webrtc.localStream]);
  
  return { ...webrtc, offer, createOffer };
}

export function useIncomingCall() {
  const webrtc = useWebRTC();
  const [answer, setAnswer] = useState(null);
  
  const accept = useCallback(async (remoteOffer) => {
    if (!webrtc.localStream) await webrtc.startCall();
    if (webrtc.localStream && peerRef.current) {
      await peerRef.current.setRemoteDescription(remoteOffer);
      const a = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(a);
      setAnswer(a);
      return a;
    }
  }, [webrtc.localStream]);
  
  return { ...webrtc, answer, accept };
}

export default useWebRTC;
