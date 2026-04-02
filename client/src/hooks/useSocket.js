import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5001";

export default function useSocket(roomId) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      if (roomId) socket.emit("join-room", roomId);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (roomId, message, sender) => {
    socketRef.current?.emit("send-message", {
      roomId,
      message,
      sender,
      timestamp: Date.now(),
    });
  };

  const onMessage = (handler) => {
    socketRef.current?.on("receive-message", handler);
    return () => socketRef.current?.off("receive-message", handler);
  };

  return { socket: socketRef, sendMessage, onMessage };
}
