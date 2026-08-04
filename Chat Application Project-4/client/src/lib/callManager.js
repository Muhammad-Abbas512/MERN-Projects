// WebRTC Call Manager - handles peer connection, mic access, and signaling
// This module is framework-agnostic; the React store wires it up to UI.

// ICE servers configuration
// STUN servers are free (Google) and work for most home/mobile networks.
// TURN servers are needed for ~10-20% of users behind strict NATs/corporate firewalls.
// To add TURN: sign up for free at https://www.metered.ca/tools/openrelay/
// and replace the placeholder below with your real credentials.
const TURN_USERNAME = "YOUR_USERNAME"; // Get from metered.ca open relay dashboard
const TURN_CREDENTIAL = "YOUR_CREDENTIAL";

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  // Uncomment and fill in credentials from metered.ca for TURN support:
  // {
  //   urls: "turn:global.relay.metered.ca:80",
  //   username: TURN_USERNAME,
  //   credential: TURN_CREDENTIAL,
  // },
  // {
  //   urls: "turn:global.relay.metered.ca:443",
  //   username: TURN_USERNAME,
  //   credential: TURN_CREDENTIAL,
  // },
];

// Module-level state (single active call at a time)
let peerConnection = null;
let localStream = null;
let remoteStream = null;
let currentRemoteUserId = null;
let onRemoteStreamCallback = null;
let onConnectionStateChangeCallback = null;

// Socket reference - set by the call store to avoid circular imports
let socketRef = null;

// Set the socket reference (called by useCallStore on init)
export function setSocket(socket) {
  socketRef = socket;
}

// Get the current socket reference
const getSocket = () => socketRef;

// Create a new RTCPeerConnection and wire up event handlers
function createPeerConnection(remoteUserId, onRemoteStream, onConnectionStateChange) {
  peerConnection = new RTCPeerConnection({ iceServers });

  currentRemoteUserId = remoteUserId;
  onRemoteStreamCallback = onRemoteStream;
  onConnectionStateChangeCallback = onConnectionStateChange;

  // Send ICE candidates to the remote peer via signaling server
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      const socket = getSocket();
      if (socket) {
        socket.emit("ice-candidate", {
          toUserId: remoteUserId,
          candidate: event.candidate,
        });
      }
    }
  };

  // Receive remote audio track
  peerConnection.ontrack = (event) => {
    remoteStream = event.streams[0];
    if (onRemoteStreamCallback) {
      onRemoteStreamCallback(remoteStream);
    }
  };

  // Monitor connection state
  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection?.connectionState;
    console.log("WebRTC connection state:", state);
    if (onConnectionStateChangeCallback) {
      onConnectionStateChangeCallback(state);
    }
    if (state === "disconnected" || state === "failed") {
      // Auto-cleanup on connection failure
      cleanupCall();
    }
  };

  return peerConnection;
}

// Clean up all WebRTC resources
function cleanupCall() {
  if (peerConnection) {
    try {
      peerConnection.onicecandidate = null;
      peerConnection.ontrack = null;
      peerConnection.onconnectionstatechange = null;
      peerConnection.close();
    } catch (e) {
      console.warn("Error closing peer connection:", e);
    }
    peerConnection = null;
  }

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop());
    localStream = null;
  }

  remoteStream = null;
  currentRemoteUserId = null;
  onRemoteStreamCallback = null;
  onConnectionStateChangeCallback = null;
}

// ============================
// Public API
// ============================

// Caller: start a call to remoteUserId
export async function startCall(remoteUserId, myUserId, myName, onRemoteStream, onConnectionStateChange) {
  // Request microphone access
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  const pc = createPeerConnection(remoteUserId, onRemoteStream, onConnectionStateChange);

  // Add local audio tracks to the peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Create offer and set as local description
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // Send the offer to the callee via signaling server
  const socket = getSocket();
  if (socket) {
    socket.emit("call-user", {
      toUserId: remoteUserId,
      offer,
      fromUserId: myUserId,
      fromName: myName,
    });
  }

  return pc;
}

// Callee: accept an incoming call
export async function acceptCall(offer, callerId, onRemoteStream, onConnectionStateChange) {
  // Request microphone access
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  const pc = createPeerConnection(callerId, onRemoteStream, onConnectionStateChange);

  // Add local audio tracks to the peer connection
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Set the remote offer as remote description
  await pc.setRemoteDescription(offer);

  // Create answer and set as local description
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // Send the answer back to the caller via signaling server
  const socket = getSocket();
  if (socket) {
    socket.emit("answer-call", {
      toUserId: callerId,
      answer,
    });
  }

  return pc;
}

// Callee: reject an incoming call
export function rejectCall(callerId) {
  const socket = getSocket();
  if (socket) {
    socket.emit("reject-call", { toUserId: callerId });
  }
  cleanupCall();
}

// Caller: cancel an outgoing call (before it's answered)
export function cancelCall(remoteUserId) {
  const socket = getSocket();
  if (socket) {
    socket.emit("cancel-call", { toUserId: remoteUserId });
  }
  cleanupCall();
}

// Either side: end an active call
export function endCall(remoteUserId) {
  const socket = getSocket();
  if (socket && remoteUserId) {
    socket.emit("end-call", { toUserId: remoteUserId });
  }
  cleanupCall();
}

// Notify callee of a missed call (caller timeout)
export function notifyMissedCall(toUserId, fromUserId) {
  const socket = getSocket();
  if (socket) {
    socket.emit("missed-call", { toUserId, fromUserId });
  }
}

// Toggle mute on the local audio track
export function toggleMute() {
  const audioTrack = localStream?.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    return !audioTrack.enabled; // returns true if now muted
  }
  return false;
}

// Set the remote answer (caller side, when callee answers)
export async function setRemoteAnswer(answer) {
  if (peerConnection) {
    await peerConnection.setRemoteDescription(answer);
  }
}

// Add an incoming ICE candidate
export async function addIceCandidate(candidate) {
  if (peerConnection) {
    try {
      await peerConnection.addIceCandidate(candidate);
    } catch (err) {
      // It's normal to get candidates before remote description is set
      console.warn("Error adding ICE candidate:", err);
    }
  }
}

// Get current call info (for debugging)
export function getCallInfo() {
  return {
    hasPeerConnection: !!peerConnection,
    hasLocalStream: !!localStream,
    hasRemoteStream: !!remoteStream,
    remoteUserId: currentRemoteUserId,
    connectionState: peerConnection?.connectionState,
  };
}

// Force cleanup (used on unmount/logout)
export function forceCleanup() {
  cleanupCall();
}
