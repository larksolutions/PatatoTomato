import { useEffect, useRef, useState, useCallback } from "react";
import Peer from "peerjs";

const PEER_CONFIG = {
  host: import.meta.env.VITE_PEER_HOST || "localhost",
  port: Number(import.meta.env.VITE_PEER_PORT || 5001),
  path: "/peerjs/myapp",
  secure: import.meta.env.VITE_PEER_SECURE === "true",
};

export default function usePeer() {
  const peerRef = useRef(null);
  const [peerId, setPeerId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const peer = new Peer(PEER_CONFIG);
    peerRef.current = peer;

    peer.on("open", (id) => {
      setPeerId(id);
      setConnected(true);
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
      setError(err);
    });

    peer.on("disconnected", () => {
      setConnected(false);
    });

    return () => {
      peer.destroy();
    };
  }, []);

  const call = useCallback((remotePeerId, localStream) => {
    if (!peerRef.current) return null;
    return peerRef.current.call(remotePeerId, localStream);
  }, []);

  const onIncomingCall = useCallback((handler) => {
    if (!peerRef.current) return;
    peerRef.current.on("call", handler);
  }, []);

  return { peer: peerRef, peerId, connected, error, call, onIncomingCall };
}
