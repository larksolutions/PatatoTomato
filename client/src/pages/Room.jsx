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
} from "react-icons/io5";
import usePeer from "../hooks/usePeer";
import api from "../utils/api";

function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userName = location.state?.userName || "Guest";

  const { peerId, connected, call, onIncomingCall } = usePeer();
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [remoteStreams, setRemoteStreams] = useState([]); // { peerId, stream }
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [room, setRoom] = useState(null);

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
      if (p.peerId === peerId) return; // skip self
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

  const addRemoteStream = useCallback((remotePeerId, stream) => {
    setRemoteStreams((prev) => {
      if (prev.find((s) => s.peerId === remotePeerId)) return prev;
      return [...prev, { peerId: remotePeerId, stream }];
    });
  }, []);

  // Toggle mic
  const toggleMic = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMicOn(audioTrack.enabled);
    }
  };

  // Toggle camera
  const toggleCam = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCamOn(videoTrack.enabled);
    }
  };

  // Leave room
  const leaveRoom = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    navigate("/");
  };

  // Copy room ID
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalVideos = 1 + remoteStreams.length;
  const gridCols =
    totalVideos <= 1
      ? "grid-cols-1"
      : totalVideos <= 4
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-800">
        <div>
          <h1 className="text-white font-semibold">{room?.name || "Room"}</h1>
          <button
            onClick={copyRoomId}
            className="flex items-center gap-1 text-gray-400 text-xs hover:text-white transition"
          >
            {copied ? (
              <IoCheckmarkOutline className="text-green-400" />
            ) : (
              <IoCopyOutline />
            )}
            {roomId}
          </button>
        </div>
        <span className="text-gray-400 text-sm">
          {totalVideos} participant{totalVideos !== 1 && "s"}
        </span>
      </div>

      {/* Video Grid */}
      <div className={`flex-1 grid ${gridCols} gap-2 p-4 auto-rows-fr`}>
        {/* Local Video */}
        <div className="relative bg-gray-800 rounded-xl overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {userName} (You)
          </span>
        </div>

        {/* Remote Videos */}
        {remoteStreams.map(({ peerId: rPeerId, stream }) => (
          <RemoteVideo key={rPeerId} stream={stream} peerId={rPeerId} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-4 bg-gray-800">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition ${
            micOn
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {micOn ? (
            <IoMicOutline className="text-xl" />
          ) : (
            <IoMicOffOutline className="text-xl" />
          )}
        </button>

        <button
          onClick={toggleCam}
          className={`p-4 rounded-full transition ${
            camOn
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {camOn ? (
            <IoVideocamOutline className="text-xl" />
          ) : (
            <IoVideocamOffOutline className="text-xl" />
          )}
        </button>

        <button
          onClick={leaveRoom}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
        >
          <IoCallOutline className="text-xl rotate-[135deg]" />
        </button>
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
    <div className="relative bg-gray-800 rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {peerId.slice(0, 8)}
      </span>
    </div>
  );
}

export default Room;
