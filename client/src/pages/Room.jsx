import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  IoMicOutline,
  IoMicOffOutline,
  IoVideocamOutline,
  IoVideocamOffOutline,
  IoCallOutline,
  IoCopyOutline,
  IoCheckmarkOutline,
  IoSendOutline,
  IoChatbubblesOutline,
} from "react-icons/io5";
import usePeer from "../hooks/usePeer";
import useSocket from "../hooks/useSocket";
import api from "../utils/api";

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userName = location.state?.userName || "Guest";

  const { peerId, connected, call, onIncomingCall } = usePeer();
  const { sendMessage, onMessage } = useSocket(roomId);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const chatEndRef = useRef(null);

  const [remoteStreams, setRemoteStreams] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [chatOpen, setChatOpen] = useState(true);

  // Get local media
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Media error:", err));

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Join room once peer is connected
  useEffect(() => {
    if (!peerId || !connected) return;

    api
      .post(`/rooms/${roomId}/join`, { peerId, name: userName })
      .then(({ data }) => setRoom(data))
      .catch((err) => {
        console.error("Join error:", err);
        navigate("/");
      });

    return () => {
      api.post(`/rooms/${roomId}/leave`, { peerId }).catch(() => {});
    };
  }, [peerId, connected, roomId, userName, navigate]);

  // Call existing participants when room data arrives
  useEffect(() => {
    if (!room || !peerId || !localStreamRef.current) return;

    room.participants.forEach((p) => {
      if (p.peerId === peerId) return;
      const outgoing = call(p.peerId, localStreamRef.current);
      if (outgoing) {
        outgoing.on("stream", (remoteStream) => {
          addRemoteStream(p.peerId, remoteStream);
        });
      }
    });
  }, [room, peerId, call]);

  // Handle incoming calls
  useEffect(() => {
    if (!connected) return;

    onIncomingCall((incoming) => {
      incoming.answer(localStreamRef.current);
      incoming.on("stream", (remoteStream) => {
        addRemoteStream(incoming.peer, remoteStream);
      });
    });
  }, [connected, onIncomingCall]);

  // Listen for chat messages
  useEffect(() => {
    const unsub = onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return unsub;
  }, [onMessage]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addRemoteStream = useCallback((remotePeerId, stream) => {
    setRemoteStreams((prev) => {
      if (prev.find((s) => s.peerId === remotePeerId)) return prev;
      return [...prev, { peerId: remotePeerId, stream }];
    });
  }, []);

  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  const toggleCam = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
  };

  const leaveRoom = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    navigate("/");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    sendMessage(roomId, msgInput.trim(), userName);
    setMsgInput("");
  };

  const totalVideos = 1 + remoteStreams.length;
  const gridCols =
    totalVideos <= 1
      ? "grid-cols-1"
      : totalVideos <= 4
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 shrink-0">
        <div>
          <h1 className="text-white font-semibold text-sm">{room?.name || "Room"}</h1>
          <button
            onClick={copyRoomId}
            className="flex items-center gap-1 text-gray-400 text-xs hover:text-white transition"
          >
            {copied ? <IoCheckmarkOutline className="text-green-400" /> : <IoCopyOutline />}
            {roomId}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs">
            {totalVideos} participant{totalVideos !== 1 && "s"}
          </span>
          <button
            onClick={() => setChatOpen((o) => !o)}
            className={`p-2 rounded-lg transition ${chatOpen ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-400 hover:text-white"}`}
          >
            <IoChatbubblesOutline className="text-lg" />
          </button>
        </div>
      </div>

      {/* Main Content: Video + Chat */}
      <div className="flex flex-1 min-h-0">
        {/* Video Section */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`flex-1 grid ${gridCols} gap-2 p-3 auto-rows-fr max-h-[calc(100vh-8rem)]`}>
            {/* Local Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                {userName} (You)
              </span>
            </div>

            {/* Remote Videos */}
            {remoteStreams.map(({ peerId: rPeerId, stream }) => (
              <RemoteVideo key={rPeerId} stream={stream} peerId={rPeerId} />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 py-3 bg-gray-800 shrink-0">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-full transition ${micOn ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-red-600 text-white hover:bg-red-700"}`}
            >
              {micOn ? <IoMicOutline className="text-lg" /> : <IoMicOffOutline className="text-lg" />}
            </button>
            <button
              onClick={toggleCam}
              className={`p-3 rounded-full transition ${camOn ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-red-600 text-white hover:bg-red-700"}`}
            >
              {camOn ? <IoVideocamOutline className="text-lg" /> : <IoVideocamOffOutline className="text-lg" />}
            </button>
            <button
              onClick={leaveRoom}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
            >
              <IoCallOutline className="text-lg rotate-[135deg]" />
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {chatOpen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-700">
              <h2 className="text-white text-sm font-semibold">Chat</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <p className="text-gray-500 text-xs text-center mt-4">No messages yet</p>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender === userName;
                return (
                  <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-[10px] text-gray-500 mb-0.5">{msg.sender}</span>
                    <div
                      className={`px-3 py-2 rounded-xl max-w-[85%] text-sm break-words ${
                        isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-700 text-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {msg.message}
                    </div>
                    <span className="text-[9px] text-gray-600 mt-0.5">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700 flex gap-2">
              <input
                type="text"
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                <IoSendOutline className="text-lg" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function RemoteVideo({ stream, peerId }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
        {peerId.slice(0, 8)}
      </span>
    </div>
  );
}

export default Room;
