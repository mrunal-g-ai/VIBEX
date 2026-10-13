import { InstrumentType, AudioDetectionData } from '../types';

// Standard Note Frequencies mapping for A4 = 440Hz
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Indian Classical Swara mapping (relative to C root)
const SWARA_MAP: Record<string, string> = {
  'C': 'Sa',
  'C#': 're (komal)',
  'D': 'Re (shuddha)',
  'D#': 'ga (komal)',
  'E': 'Ga (shuddha)',
  'F': 'Ma (shuddha)',
  'F#': 'Ma (teevra)',
  'G': 'Pa',
  'G#': 'dha (komal)',
  'A': 'Dha (shuddha)',
  'A#': 'ni (komal)',
  'B': 'Ni (shuddha)',
};

export function noteToFrequency(note: string): number {
  // Parses "C4", "A#3", "Db5"
  let clean = note.trim();
  let accidental = '';
  let octave = 4;

  if (clean.length > 2 && (clean[1] === '#' || clean[1] === 'b')) {
    accidental = clean[1];
    octave = parseInt(clean.slice(2), 10) || 4;
    clean = clean.slice(0, 2);
  } else if (clean.length > 1) {
    octave = parseInt(clean.slice(1), 10) || 4;
    clean = clean[0];
  }

  // Handle flat notation by converting to sharp
  if (clean === 'Db') clean = 'C#';
  else if (clean === 'Eb') clean = 'D#';
  else if (clean === 'Gb') clean = 'F#';
  else if (clean === 'Ab') clean = 'G#';
  else if (clean === 'Bb') clean = 'A#';

  const noteIndex = NOTE_NAMES.indexOf(clean);
  if (noteIndex === -1) return 440; // fallback

  const semitonesFromA4 = (noteIndex - 9) + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

export function frequencyToNoteData(freq: number): AudioDetectionData | null {
  if (freq < 50 || freq > 4200) return null;

  const noteNumber = 12 * (Math.log2(freq / 440)) + 69;
  const roundedNoteNumber = Math.round(noteNumber);
  const cents = Math.round((noteNumber - roundedNoteNumber) * 100);

  const noteIndex = (roundedNoteNumber % 12 + 12) % 12;
  const octave = Math.floor(roundedNoteNumber / 12) - 1;
  const noteName = NOTE_NAMES[noteIndex];

  return {
    pitchHz: Math.round(freq * 10) / 10,
    noteName: `${noteName}${octave}`,
    octave,
    cents,
    confidence: 0.92,
    volumeRms: 0.5,
    isStable: Math.abs(cents) < 20,
    closestIndianSwara: SWARA_MAP[noteName] || 'Sa',
  };
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private micStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private onPitchCallback: ((data: AudioDetectionData | null) => void) | null = null;

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      this.ctx = new AudioCtx();
      this.isInitialized = true;
    }
  }

  public getContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  // Play synthetic instrument tones
  public playNote(noteOrFreq: string | number, instrument: InstrumentType = 'keyboard', duration = 0.8) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const freq = typeof noteOrFreq === 'number' ? noteOrFreq : noteToFrequency(noteOrFreq);
    const now = this.ctx.currentTime;

    switch (instrument) {
      case 'keyboard':
        this.playPianoSound(freq, now, duration);
        break;
      case 'guitar':
        this.playGuitarSound(freq, now, duration);
        break;
      case 'violin':
        this.playViolinSound(freq, now, duration);
        break;
      case 'bansuri':
        this.playBansuriSound(freq, now, duration);
        break;
      default:
        this.playPianoSound(freq, now, duration);
    }
  }

  // 1. Piano: Multi-oscillator with warm harmonic envelope & percussive attack
  private playPianoSound(freq: number, startTime: number, duration: number) {
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    masterGain.connect(this.ctx.destination);

    // Dynamic gain envelope
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.linearRampToValueAtTime(0.35, startTime + 0.015);
    masterGain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Fundamental + 2nd & 3rd harmonic
    const harmonics = [
      { ratio: 1, gain: 0.6, type: 'triangle' as OscillatorType },
      { ratio: 2, gain: 0.25, type: 'sine' as OscillatorType },
      { ratio: 3, gain: 0.15, type: 'sine' as OscillatorType },
    ];

    harmonics.forEach(h => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = h.type;
      osc.frequency.setValueAtTime(freq * h.ratio, startTime);

      g.gain.setValueAtTime(h.gain, startTime);
      osc.connect(g);
      g.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  // 2. Guitar: Plucked string sound with snappy transient & wood resonance
  private playGuitarSound(freq: number, startTime: number, duration: number) {
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 5, 8000), startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration);

    masterGain.connect(filter);
    filter.connect(this.ctx.destination);

    masterGain.gain.setValueAtTime(0.001, startTime);
    masterGain.gain.linearRampToValueAtTime(0.4, startTime + 0.008);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 1.2);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    const g1 = this.ctx.createGain();
    const g2 = this.ctx.createGain();
    g1.gain.value = 0.7;
    g2.gain.value = 0.3;

    osc1.connect(g1);
    osc2.connect(g2);
    g1.connect(masterGain);
    g2.connect(masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration * 1.25);
    osc2.stop(startTime + duration * 1.25);
  }

  // 3. Violin: Sustained bowed sound with warm vibrato & resonant formant
  private playViolinSound(freq: number, startTime: number, duration: number) {
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    const bandpass = this.ctx.createBiquadFilter();

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(freq * 2, startTime);
    bandpass.Q.value = 2.0;

    // Bowing envelope (gentle attack, sustained body, gentle release)
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.linearRampToValueAtTime(0.28, startTime + 0.08);
    masterGain.gain.setValueAtTime(0.25, startTime + duration - 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    masterGain.connect(bandpass);
    bandpass.connect(this.ctx.destination);

    // Vibrato LFO (5.5 Hz pitch modulation)
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    vibrato.frequency.setValueAtTime(5.5, startTime);
    vibratoGain.gain.setValueAtTime(freq * 0.015, startTime); // ~1.5% vibrato depth

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);

    osc.connect(masterGain);

    vibrato.start(startTime);
    osc.start(startTime);

    vibrato.stop(startTime + duration);
    osc.stop(startTime + duration);
  }

  // 4. Bansuri (Indian Flute): Breathy tone with overtone warmth & portamento/meend
  private playBansuriSound(freq: number, startTime: number, duration: number) {
    if (!this.ctx) return;

    const masterGain = this.ctx.createGain();
    const lowpass = this.ctx.createBiquadFilter();

    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(Math.min(freq * 3.5, 6000), startTime);

    masterGain.connect(lowpass);
    lowpass.connect(this.ctx.destination);

    // Soft breath attack
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.linearRampToValueAtTime(0.32, startTime + 0.09);
    masterGain.gain.setValueAtTime(0.3, startTime + duration - 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Primary pure tone (Sine + subtle triangle)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    // Air breath noise generator
    const bufferSize = this.ctx.sampleRate * 0.1;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.04;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(freq * 1.5, startTime);
    noiseFilter.Q.value = 4;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, startTime);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    const g1 = this.ctx.createGain();
    const g2 = this.ctx.createGain();
    g1.gain.value = 0.75;
    g2.gain.value = 0.2;

    osc1.connect(g1);
    osc2.connect(g2);
    g1.connect(masterGain);
    g2.connect(masterGain);

    osc1.start(startTime);
    osc2.start(startTime);
    whiteNoise.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);
    whiteNoise.stop(startTime + duration);
  }

  // Metronome Click generator
  public playMetronomeTick(isDownbeat = false) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isDownbeat ? 1200 : 800, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Real-time Microphone Pitch Detection using Autocorrelation Algorithm
  public async startMicrophoneListening(onPitch: (data: AudioDetectionData | null) => void): Promise<boolean> {
    try {
      this.init();
      if (!this.ctx) return false;

      this.onPitchCallback = onPitch;
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });

      this.micSource = this.ctx.createMediaStreamSource(this.micStream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;

      this.micSource.connect(this.analyser);
      this.detectPitchLoop();
      return true;
    } catch (err) {
      console.warn('Microphone access denied or error:', err);
      return false;
    }
  }

  public stopMicrophoneListening() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    this.onPitchCallback = null;
  }

  private detectPitchLoop = () => {
    if (!this.analyser || !this.ctx) return;

    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    // 1. Calculate RMS volume
    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / buffer.length);

    // RMS Gate threshold (ignore background ambient room noise)
    if (rms < 0.015) {
      if (this.onPitchCallback) this.onPitchCallback(null);
    } else {
      const pitch = this.autoCorrelate(buffer, this.ctx.sampleRate);
      if (pitch > 0) {
        const noteData = frequencyToNoteData(pitch);
        if (noteData) {
          noteData.volumeRms = Math.min(rms * 8, 1.0);
          if (this.onPitchCallback) this.onPitchCallback(noteData);
        }
      } else {
        if (this.onPitchCallback) this.onPitchCallback(null);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.detectPitchLoop);
  };

  // High precision autocorrelation pitch detection
  private autoCorrelate(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let sumOfSquares = 0;
    for (let i = 0; i < SIZE; i++) {
      const val = buffer[i];
      sumOfSquares += val * val;
    }

    const rootMeanSquare = Math.sqrt(sumOfSquares / SIZE);
    if (rootMeanSquare < 0.01) return -1; // Not enough signal

    // Trim noise boundaries
    let r1 = 0;
    let r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmedBuffer = buffer.slice(r1, r2);
    const trimmedSize = trimmedBuffer.length;

    const c = new Array(trimmedSize).fill(0);
    for (let i = 0; i < trimmedSize; i++) {
      for (let j = 0; j < trimmedSize - i; j++) {
        c[i] = c[i] + trimmedBuffer[j] * trimmedBuffer[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxVal = -1;
    let maxPos = -1;
    for (let i = d; i < trimmedSize; i++) {
      if (c[i] > maxVal) {
        maxVal = c[i];
        maxPos = i;
      }
    }

    let T0 = maxPos;

    // Parabolic interpolation for sub-bin precision
    const x1 = c[T0 - 1];
    const x2 = c[T0];
    const x3 = c[T0 + 1];
    if (x1 && x2 && x3) {
      const a = (x1 + x3 - 2 * x2) / 2;
      const b = (x3 - x1) / 2;
      if (a) T0 = T0 - b / (2 * a);
    }

    return sampleRate / T0;
  }
}

export const audioEngine = new AudioEngine();
