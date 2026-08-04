import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { useCallStore } from "../../Store/useCallStore.js";

const CallScreen = () => {
  const {
    callState,
    remoteUser,
    remoteStream,
    isMuted,
    callDuration,
    accept,
    reject,
    cancel,
    hangUp,
    toggleMute,
  } = useCallStore();

  const remoteAudioRef = useRef(null);

  // Attach remote stream to audio element
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Don't render if idle
  if (callState === "idle" || !remoteUser) {
    return null;
  }

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusText = () => {
    switch (callState) {
      case "ringing-outgoing":
        return "Calling...";
      case "ringing-incoming":
        return "Incoming call...";
      case "connected":
        return formatDuration(callDuration);
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#008069] to-[#005c4b] flex flex-col items-center justify-center text-white">
      {/* Hidden audio element for remote audio */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Avatar */}
      <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl font-semibold mb-6 shadow-xl">
        {getInitial(remoteUser.name)}
      </div>

      {/* Name */}
      <h2 className="text-2xl font-semibold mb-2">
        {remoteUser.name || "Unknown"}
      </h2>

      {/* Status */}
      <p className="text-white/80 text-lg mb-2">
        {getStatusText()}
      </p>

      {/* Call state indicator */}
      {callState === "ringing-outgoing" && (
        <div className="flex gap-1.5 mb-8">
          <span className="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
          <span className="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
          <span className="w-2.5 h-2.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
        </div>
      )}

      {callState === "ringing-incoming" && (
        <p className="text-white/70 text-sm mb-8 animate-pulse">
          📞 Incoming voice call...
        </p>
      )}

      {callState === "connected" && (
        <div className="mb-8 flex items-center gap-2 text-white/70">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
          <span className="text-sm">Connected</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Incoming call: Accept / Reject */}
        {callState === "ringing-incoming" && (
          <>
            <button
              onClick={reject}
              className="flex flex-col items-center gap-2 group"
              aria-label="Decline call"
            >
              <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors cursor-pointer">
                <PhoneOff className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-white/80">Decline</span>
            </button>
            <button
              onClick={accept}
              className="flex flex-col items-center gap-2 group"
              aria-label="Accept call"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg transition-colors cursor-pointer animate-pulse">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-white/80">Accept</span>
            </button>
          </>
        )}

        {/* Outgoing call (ringing): Cancel */}
        {callState === "ringing-outgoing" && (
          <button
            onClick={cancel}
            className="flex flex-col items-center gap-2 group"
            aria-label="Cancel call"
          >
            <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors cursor-pointer">
              <PhoneOff className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-white/80">Cancel</span>
          </button>
        )}

        {/* Connected: Mute + Hang up */}
        {callState === "connected" && (
          <>
            <button
              onClick={toggleMute}
              className="flex flex-col items-center gap-2 group"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer ${
                isMuted ? "bg-white text-[#008069]" : "bg-white/20 hover:bg-white/30 text-white"
              }`}>
                {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </div>
              <span className="text-xs text-white/80">{isMuted ? "Unmute" : "Mute"}</span>
            </button>
            <button
              onClick={hangUp}
              className="flex flex-col items-center gap-2 group"
              aria-label="End call"
            >
              <div className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors cursor-pointer">
                <PhoneOff className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-white/80">End Call</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CallScreen;