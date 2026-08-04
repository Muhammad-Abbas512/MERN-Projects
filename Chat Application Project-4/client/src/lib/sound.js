// Sound utility using Web Audio API - no external files needed
let audioContext = null;

// Ensure AudioContext is created after user interaction (browser requirement)
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Play a short notification sound
function playTone(frequencies, durations, type = "sine", gainValue = 0.15) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    let time = ctx.currentTime;

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const duration = durations[i] || 0.1;

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, time);

      // Simple envelope to avoid clicks
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      oscillator.start(time);
      oscillator.stop(time + duration + 0.05);

      time += duration;
    });
  } catch (error) {
    // Silently fail if audio not available
    console.warn("Audio playback failed:", error);
  }
}

// Sent message sound - quick soft "pop"
export const playSendSound = () => {
  playTone([660, 880], [0.08, 0.08], "sine", 0.12);
};

// Received message sound - WhatsApp-like double tone
export const playReceiveSound = () => {
  playTone([523.25, 659.25], [0.12, 0.12], "sine", 0.12);
};

// Online status change sound (subtle)
export const playOnlineSound = () => {
  playTone([880, 1100], [0.06, 0.06], "sine", 0.08);
};

// ============================
// Call Ringtone (looping)
// ============================

let ringtoneInterval = null;

// Start the ringtone loop (for incoming calls)
export const startRingtone = () => {
  if (ringtoneInterval) return; // already playing

  const playRingCycle = () => {
    // Two-tone ring pattern, like a phone
    playTone([440, 550], [0.4, 0.4], "sine", 0.15);
  };

  playRingCycle();
  // Repeat every 2 seconds
  ringtoneInterval = setInterval(playRingCycle, 2000);
};

// Stop the ringtone loop
export const stopRingtone = () => {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
};

// Play a short "call connected" beep
export const playCallConnectedSound = () => {
  playTone([660, 880, 1100], [0.1, 0.1, 0.15], "sine", 0.12);
};

// Play a "call ended" tone
export const playCallEndedSound = () => {
  playTone([440, 330], [0.2, 0.3], "sine", 0.12);
};
