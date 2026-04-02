import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IoVideocamOutline, IoEnterOutline } from "react-icons/io5";
import api from "../utils/api";

const EMOJIS = ["🥔", "🍅", "📹", "🎙️", "💬", "🎉", "✨", "🔥", "👋", "😂", "🤙", "🫡", "💻", "🎧"];

function FloatingEmoji({ emoji, style, onClick }) {
  return (
    <span
      onClick={onClick}
      className="absolute select-none cursor-pointer transition-transform hover:scale-150 active:scale-[2]"
      style={{
        ...style,
        fontSize: style.fontSize || "2.5rem",
        animation: `float ${style.duration}s ease-in-out infinite`,
        animationDelay: `${style.delay}s`,
        "--dx1": style.dx1 + "px",
        "--dy1": style.dy1 + "px",
        "--dx2": style.dx2 + "px",
        "--dy2": style.dy2 + "px",
        "--dx3": style.dx3 + "px",
        "--dy3": style.dy3 + "px",
        "--r1": style.r1 + "deg",
        "--r2": style.r2 + "deg",
        "--r3": style.r3 + "deg",
      }}
    >
      {emoji}
    </span>
  );
}

function generateEmoji(id) {
  return {
    id,
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    style: {
      left: `${Math.random() * 90 + 2}%`,
      top: `${Math.random() * 90 + 2}%`,
      fontSize: `${Math.random() * 2 + 2}rem`,
      opacity: Math.random() * 0.4 + 0.2,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 5,
      dx1: (Math.random() - 0.5) * 60,
      dy1: (Math.random() - 0.5) * 60,
      dx2: (Math.random() - 0.5) * 40,
      dy2: (Math.random() - 0.5) * 40,
      dx3: (Math.random() - 0.5) * 70,
      dy3: (Math.random() - 0.5) * 70,
      r1: (Math.random() - 0.5) * 20,
      r2: (Math.random() - 0.5) * 20,
      r3: (Math.random() - 0.5) * 20,
    },
  };
}

function Lobby() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emojis, setEmojis] = useState(() =>
    Array.from({ length: 20 }, (_, i) => generateEmoji(i))
  );

  // Pop emoji on click — burst into 3 smaller ones, then fade
  const popEmoji = useCallback((id) => {
    setEmojis((prev) => {
      const target = prev.find((e) => e.id === id);
      if (!target) return prev;
      const newOnes = Array.from({ length: 3 }, (_, i) => ({
        ...generateEmoji(Date.now() + i),
        style: {
          ...generateEmoji(0).style,
          left: `${parseFloat(target.style.left) + (Math.random() * 10 - 5)}%`,
          top: `${parseFloat(target.style.top) + (Math.random() * 10 - 5)}%`,
          fontSize: "1rem",
          opacity: 0.5,
        },
      }));
      return [...prev.filter((e) => e.id !== id), ...newOnes];
    });
  }, []);

  // Slowly regenerate emojis to keep the background alive
  useEffect(() => {
    const interval = setInterval(() => {
      setEmojis((prev) => {
        if (prev.length > 30) prev = prev.slice(prev.length - 20);
        return [...prev, generateEmoji(Date.now())];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const createRoom = async () => {
    if (!userName.trim()) return setError("Enter your name");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/rooms", {
        name: roomName || "Untitled Room",
        createdBy: userName,
      });
      navigate(`/room/${data.roomId}`, { state: { userName } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!userName.trim()) return setError("Enter your name");
    if (!joinRoomId.trim()) return setError("Enter a Room ID");
    setLoading(true);
    setError("");
    try {
      await api.get(`/rooms/${joinRoomId}`);
      navigate(`/room/${joinRoomId}`, { state: { userName } });
    } catch (err) {
      setError(err.response?.data?.message || "Room not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Floating Emojis Background */}
      {emojis.map(({ id, emoji, style }) => (
        <FloatingEmoji key={id} emoji={emoji} style={style} onClick={() => popEmoji(id)} />
      ))}

      <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          PatatoTomato
        </h1>
        <p className="text-gray-400 text-center mb-8">Chismisan Room</p>

        {error && (
          <div className="bg-red-500/20 text-red-400 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {/* Name */}
        <input
          type="text"
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
        />

        {/* Create Room */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Room name (optional)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
          />
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
          >
            <IoVideocamOutline className="text-xl" />
            Create Room
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <hr className="flex-1 border-gray-600" />
          <span className="text-gray-500 text-sm">or join</span>
          <hr className="flex-1 border-gray-600" />
        </div>

        {/* Join Room */}
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
          />
          <button
            onClick={joinRoom}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
          >
            <IoEnterOutline className="text-xl" />
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
