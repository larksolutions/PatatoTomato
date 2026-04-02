import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoVideocamOutline, IoEnterOutline } from "react-icons/io5";
import api from "../utils/api";

function Lobby() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          PatatoTomato
        </h1>
        <p className="text-gray-400 text-center mb-8">Video Conference</p>

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
