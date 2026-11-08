// Web Audio API pure synthesizer for offline sound effects
class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Countdown tick for 3, 2, 1
  public playTick() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore audio failure
    }
  }

  // Go / Finish Beep
  public playFinish() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, now); // E6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(now + 0.4);
    } catch {
      // Ignore audio failure
    }
  }

  // Rest completed or set completed chord
  public playRestComplete() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch {
      // Ignore audio failure
    }
  }

  // Workout Complete Victory Fanfare
  public playWorkoutComplete() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.5, d: 0.45 }  // C6
      ];

      let t = ctx.currentTime;
      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + note.d);

        t += note.d * 0.9;
      });
    } catch {
      // Ignore audio failure
    }
  }
}

export const soundEngine = new SoundEngine();

// Browser speech synthesis for offline hands-free workout coaching
class SpeechEngine {
  private enabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public isVoiceSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public speak(text: string) {
    if (!this.enabled || !this.isVoiceSupported()) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // SpeechSynthesis failure fallback
    }
  }

  public stop() {
    if (this.isVoiceSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore failure
      }
    }
  }

  public announceExercise(exerciseName: string, targetRepsOrDuration: number, unit: 'reps' | 'seconds', durationSeconds: number) {
    const targetText = unit === 'reps'
      ? `${targetRepsOrDuration} repetitions`
      : `${targetRepsOrDuration} seconds`;
    this.speak(`${exerciseName}. ${targetText}. ${durationSeconds} seconds.`);
  }

  public announceRest(restSeconds: number) {
    this.speak(`Rest. ${restSeconds} seconds.`);
  }

  public announceNextUpcoming(_nextName?: string) {
    this.speak(`Next set starting in three, two, one.`);
  }
}

export const speechEngine = new SpeechEngine();

