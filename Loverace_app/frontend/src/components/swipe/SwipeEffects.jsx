import { useRef, useEffect } from 'react';
import { Howl } from 'howler';
import confetti from 'canvas-confetti';

// ── Audio (lazy-initialised after first user gesture) ────────────────────────
let kissSound = null;
let fartSound = null;
let matchSound = null;
let levelUpSound = null;

function ensureSounds() {
  if (!kissSound) {
    kissSound = new Howl({ src: ['/assests/27571-Voice-Female-Kiss-2f.mp3'], volume: 0.7, preload: true });
  }
  if (!fartSound) {
    fartSound = new Howl({ src: ['/assests/1100264.audio-Fart_16.mp3'], volume: 0.6, preload: true });
  }
  if (!matchSound) {
    // Synthesise a cheerful ascending arpeggio via Web Audio
    matchSound = { play: () => playTone([523, 659, 784, 1047], 0.12) };
  }
  if (!levelUpSound) {
    levelUpSound = { play: () => playTone([392, 494, 587, 784], 0.1) };
  }
}

function playTone(frequencies, stepDuration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * stepDuration;
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + stepDuration * 1.5);
      osc.start(start);
      osc.stop(start + stepDuration * 2);
    });
  } catch {
    // Ignore audio context errors (e.g., blocked by browser)
  }
}

// ── Confetti helpers ──────────────────────────────────────────────────────────
function kissConfetti() {
  const emojis = ['💋', '💕', '💗', '💝', '❤️', '😍', '🥰'];
  const scalar = 2.5;
  const shapes = emojis.map((e) => confetti.shapeFromText({ text: e, scalar }));
  confetti({
    particleCount: 80,
    spread: 120,
    origin: { y: 0.5, x: 0.5 },
    scalar,
    shapes,
    gravity: 0.8,
    drift: 0.5,
  });
}

function poopConfetti() {
  const emojis = ['💩', '🤢', '👎', '😬', '💔'];
  const scalar = 2.5;
  const shapes = emojis.map((e) => confetti.shapeFromText({ text: e, scalar }));
  confetti({
    particleCount: 60,
    spread: 100,
    origin: { y: 0.4, x: 0.5 },
    scalar,
    shapes,
    gravity: 1.2,
    startVelocity: 25,
    decay: 0.9,
  });
}

function matchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;
  const colors = ['#C0002A', '#FF4D6D', '#FF0A54', '#FFB3C6', '#FFE4EC', '#ffffff'];
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function levelUpConfetti() {
  confetti({
    particleCount: 50,
    spread: 80,
    origin: { y: 0.8 },
    colors: ['#C0002A', '#FF4D6D', '#FFB3C6', '#8B0015'],
    startVelocity: 35,
    gravity: 0.7,
  });
}

// ── Public API ────────────────────────────────────────────────────────────────
export function triggerLike() {
  ensureSounds();
  kissSound?.play();
  kissConfetti();
}

export function triggerPass() {
  ensureSounds();
  fartSound?.play();
  poopConfetti();
}

export function triggerMatch() {
  ensureSounds();
  matchSound?.play();
  matchConfetti();
}

export function triggerLevelUp() {
  ensureSounds();
  levelUpSound?.play();
  levelUpConfetti();
}

// React hook — primes sounds on first interaction
export function useSwipeEffects() {
  const primed = useRef(false);

  useEffect(() => {
    const prime = () => {
      if (primed.current) return;
      primed.current = true;
      ensureSounds();
      // Touch the AudioContext to unlock it
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        ctx.resume().then(() => ctx.close());
      } catch {/* */}
    };
    window.addEventListener('pointerdown', prime, { once: true });
    window.addEventListener('touchstart', prime, { once: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', prime);
      window.removeEventListener('touchstart', prime);
    };
  }, []);
}
