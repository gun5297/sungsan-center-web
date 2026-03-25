// ===== 종소리 (Web Audio API) =====

export function playBell(type) {
  const AudioCtx = window.AudioContext || window['webkitAudioContext'];
  const ctx = new AudioCtx();

  function playTone(freq, startTime, duration) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2.756;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    gain2.gain.setValueAtTime(0, startTime);
    gain2.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
    osc2.start(startTime);
    osc2.stop(startTime + duration);
  }

  if (type === 'in') {
    playTone(784.0, ctx.currentTime, 0.8);
    playTone(1046.5, ctx.currentTime + 0.22, 1.2);
  } else {
    playTone(659.3, ctx.currentTime, 0.8);
    playTone(523.3, ctx.currentTime + 0.22, 1.2);
  }
}
