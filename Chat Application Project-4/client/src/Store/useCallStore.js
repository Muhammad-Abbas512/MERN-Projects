import { create } from "zustand";
import { useAuthStore } from "./useAuthStore.js";
import { useChatStore } from "./useChatStore.js";
import {
  startCall as startCallRTC,
  acceptCall as acceptCallRTC,
  rejectCall as rejectCallRTC,
  cancelCall as cancelCallRTC,
  endCall as endCallRTC,
  notifyMissedCall,
  toggleMute as toggleMuteRTC,
  setRemoteAnswer,
  addIceCandidate,
  setSocket,
  forceCleanup,
} from "../lib/callManager.js";
import {
  startRingtone,
  stopRingtone,
  playCallConnectedSound,
  playCallEndedSound,
} from "../lib/sound.js";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

// Call timeout duration (ms)
const CALL_TIMEOUT = 35000;

export const useCallStore = create((set, get) => ({
  // ============================
  // State
  // ============================
  callState: "idle", // idle | ringing-outgoing | ringing-incoming | connected | ended
  remoteUser: null, // { id, name, offer?, profilePic? }
  remoteStream: null,
  isMuted: false,
  callStartTime: null,
  callDuration: 0,

  // Internal (not exposed to UI)
  _callTimeoutId: null,
  _durationIntervalId: null,

  // ============================
  // Initialize - register socket listeners
  // ============================
  initCallListeners: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      return;
    }

    // Provide socket reference to callManager
    setSocket(socket);

    // Remove any previously registered listeners to avoid duplicates
    socket.off("incoming-call");
    socket.off("call-answered");
    socket.off("call-rejected");
    socket.off("call-cancelled");
    socket.off("call-ended");
    socket.off("call-failed");
    socket.off("call-missed");
    socket.off("ice-candidate");

    // Incoming call
    socket.on("incoming-call", ({ offer, fromUserId, fromName }) => {
      // Don't accept a new call if already in one
      if (get().callState !== "idle") {
        // Auto-reject since we're busy
        rejectCallRTC(fromUserId);
        return;
      }

      stopRingtone();
      startRingtone();

      set({
        callState: "ringing-incoming",
        remoteUser: { id: fromUserId, name: fromName, offer },
      });
    });

    // Call answered (caller side)
    socket.on("call-answered", async ({ answer }) => {
      stopRingtone();
      try {
        await setRemoteAnswer(answer);
        playCallConnectedSound();
        set({
          callState: "connected",
          callStartTime: Date.now(),
        });

        // Start duration timer
        const durationIntervalId = setInterval(() => {
          const startTime = get().callStartTime;
          if (startTime) {
            set({ callDuration: Math.floor((Date.now() - startTime) / 1000) });
          }
        }, 1000);
        set({ _durationIntervalId: durationIntervalId });

        // Clear the call timeout
        const timeoutId = get()._callTimeoutId;
        if (timeoutId) {
          clearTimeout(timeoutId);
          set({ _callTimeoutId: null });
        }
      } catch (err) {
        console.error("Error setting remote answer:", err);
        get().hangUp();
      }
    });

    // Call rejected
    socket.on("call-rejected", () => {
      stopRingtone();
      playCallEndedSound();
      toast.error("Call declined");
      get()._resetCallState();
      // Create missed call message (caller perspective: callee rejected)
      const remoteUser = get().remoteUser;
      if (remoteUser) {
        get()._createMissedCallMessage(remoteUser.id);
      }
    });

    // Call cancelled (callee side - caller hung up before answer)
    socket.on("call-cancelled", () => {
      stopRingtone();
      get()._resetCallState();
    });

    // Call ended by remote
    socket.on("call-ended", ({ fromUserId }) => {
      stopRingtone();
      playCallEndedSound();
      get()._resetCallState();
    });

    // Call failed (offline/busy)
    socket.on("call-failed", ({ reason, toUserId }) => {
      stopRingtone();
      toast.error(reason || "Call failed");
      get()._resetCallState();
    });

    // Call missed (callee side - caller timed out)
    socket.on("call-missed", ({ fromUserId }) => {
      stopRingtone();
      get()._resetCallState();
    });

    // ICE candidate from remote
    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await addIceCandidate(candidate);
      } catch (err) {
        console.warn("Failed to add ICE candidate:", err);
      }
    });
  },

  // ============================
  // Internal helper: reset call state
  // ============================
  _resetCallState: () => {
    const { _callTimeoutId, _durationIntervalId } = get();
    if (_callTimeoutId) clearTimeout(_callTimeoutId);
    if (_durationIntervalId) clearInterval(_durationIntervalId);

    set({
      callState: "idle",
      remoteUser: null,
      remoteStream: null,
      isMuted: false,
      callStartTime: null,
      callDuration: 0,
      _callTimeoutId: null,
      _durationIntervalId: null,
    });
  },

  // ============================
  // Internal helper: create missed call message
  // ============================
  _createMissedCallMessage: async (receiverId) => {
    try {
      const res = await axiosInstance.post(`/messages/missed-call/${receiverId}`);
      // Add to local messages if this is the active chat
      const { selectedUser, messages } = useChatStore.getState();
      if (selectedUser && selectedUser._id === receiverId) {
        useChatStore.setState({
          messages: [...messages, res.data.newMessage],
        });
      }
      // Refresh sidebar
      useChatStore.getState().getChatPartners();
    } catch (err) {
      console.error("Failed to create missed call message:", err);
    }
  },

  // ============================
  // Initiate a call (caller)
  // ============================
  initiateCall: async (targetUser) => {
    const { callState } = get();
    if (callState !== "idle") {
      toast.error("You're already in a call");
      return;
    }

    const authUser = useAuthStore.getState().authUser;
    const onlineUsers = useAuthStore.getState().onlineUsers;
    if (!authUser) return;

    const targetUserId = targetUser._id || targetUser.id;
    if (!onlineUsers?.includes(targetUserId)) {
      toast.error("User is offline");
      return;
    }

    const myUserId = authUser._id;
    const myName = authUser.fullName || authUser.username;

    set({
      callState: "ringing-outgoing",
      remoteUser: {
        id: targetUser._id || targetUser.id,
        name: targetUser.fullName || targetUser.username || targetUser.name,
      },
    });

    // Set up call timeout
    const timeoutId = setTimeout(() => {
      const currentState = get().callState;
      if (currentState === "ringing-outgoing") {
        // Call not answered - timeout
        const remoteUserId = get().remoteUser?.id;
        cancelCallRTC(remoteUserId);
        notifyMissedCall(remoteUserId, myUserId);
        toast.error("Call not answered");
        get()._createMissedCallMessage(remoteUserId);
        get()._resetCallState();
      }
    }, CALL_TIMEOUT);
    set({ _callTimeoutId: timeoutId });

    try {
      await startCallRTC(
        targetUser._id || targetUser.id,
        myUserId,
        myName,
        (stream) => set({ remoteStream: stream }),
        (connectionState) => {
          if (connectionState === "disconnected" || connectionState === "failed") {
            get().hangUp();
          }
        }
      );
    } catch (err) {
      console.error("Failed to start call:", err);
      let errorMsg = "Failed to start call";
      if (err.name === "NotAllowedError") {
        errorMsg = "Microphone access denied. Please allow mic access.";
      } else if (err.name === "NotFoundError") {
        errorMsg = "No microphone found. Please connect a mic.";
      }
      toast.error(errorMsg);
      get()._resetCallState();
    }
  },

  // ============================
  // Accept an incoming call (callee)
  // ============================
  accept: async () => {
    const { remoteUser } = get();
    if (!remoteUser || !remoteUser.offer) return;

    stopRingtone();

    try {
      await acceptCallRTC(
        remoteUser.offer,
        remoteUser.id,
        (stream) => set({ remoteStream: stream }),
        (connectionState) => {
          if (connectionState === "connected") {
            playCallConnectedSound();
            set({ callState: "connected", callStartTime: Date.now() });
            startDurationTimer();
          } else if (connectionState === "disconnected" || connectionState === "failed") {
            get().hangUp();
          }
        }
      );
      set({ callState: "connected", callStartTime: Date.now() });
      startDurationTimer();
    } catch (err) {
      console.error("Failed to accept call:", err);
      let errorMsg = "Failed to accept call";
      if (err.name === "NotAllowedError") {
        errorMsg = "Microphone access denied. Please allow mic access.";
      } else if (err.name === "NotFoundError") {
        errorMsg = "No microphone found. Please connect a mic.";
      }
      toast.error(errorMsg);
      get()._resetCallState();
    }
  },

  // ============================
  // Reject an incoming call (callee)
  // ============================
  reject: () => {
    const { remoteUser } = get();
    if (!remoteUser) return;

    stopRingtone();
    rejectCallRTC(remoteUser.id);
    get()._resetCallState();
  },

  // ============================
  // Cancel an outgoing call (caller, before answer)
  // ============================
  cancel: () => {
    const { remoteUser } = get();
    if (!remoteUser) return;

    stopRingtone();
    cancelCallRTC(remoteUser.id);
    get()._resetCallState();
  },

  // ============================
  // Hang up (either side, during active call)
  // ============================
  hangUp: () => {
    const { remoteUser, _callTimeoutId, _durationIntervalId } = get();

    stopRingtone();
    playCallEndedSound();

    if (_callTimeoutId) clearTimeout(_callTimeoutId);
    if (_durationIntervalId) clearInterval(_durationIntervalId);

    if (remoteUser) {
      endCallRTC(remoteUser.id);
    }

    get()._resetCallState();
  },

  // ============================
  // Toggle mute
  // ============================
  toggleMute: () => {
    const isNowMuted = toggleMuteRTC();
    set({ isMuted: isNowMuted });
    return isNowMuted;
  },

  // ============================
  // Cleanup on logout/unmount
  // ============================
  cleanup: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("call-rejected");
      socket.off("call-cancelled");
      socket.off("call-ended");
      socket.off("call-failed");
      socket.off("call-missed");
      socket.off("ice-candidate");
    }
    stopRingtone();
    forceCleanup();
    get()._resetCallState();
  },
}));

// Helper function to start the call duration timer
function startDurationTimer() {
  const durationIntervalId = setInterval(() => {
    const startTime = useCallStore.getState().callStartTime;
    if (startTime) {
      useCallStore.setState({
        callDuration: Math.floor((Date.now() - startTime) / 1000),
      });
    }
  }, 1000);
  useCallStore.setState({ _durationIntervalId: durationIntervalId });
}
