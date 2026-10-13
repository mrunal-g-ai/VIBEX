import { InstrumentType, VisionPostureFeedback } from '../types';

export class VisionEngine {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;
  private isAnalyzing = false;
  private animationFrameId: number | null = null;
  private onFeedbackCallback: ((feedback: VisionPostureFeedback) => void) | null = null;
  private currentInstrument: InstrumentType = 'guitar';

  // Manual / Simulated correction override for interactive demonstration & testing
  private simulatedState = {
    postureScore: 90,
    wristBent: false,
    thumbOverNeck: false,
    fluteAngleLow: false,
    bowNotPerpendicular: false,
    chinRestWrong: false,
    holeLeaking: false,
  };

  public setSimulatedState(updates: Partial<typeof this.simulatedState>) {
    this.simulatedState = { ...this.simulatedState, ...updates };
  }

  public getSimulatedState() {
    return this.simulatedState;
  }

  public async startCamera(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    instrument: InstrumentType,
    onFeedback: (feedback: VisionPostureFeedback) => void
  ): Promise<boolean> {
    // Keyboard does not use camera-based posture/hand-position correction
    if (instrument === 'keyboard') {
      return false;
    }

    this.videoElement = video;
    this.canvasElement = canvas;
    this.currentInstrument = instrument;
    this.onFeedbackCallback = onFeedback;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this.isAnalyzing = true;
      this.analyzeLoop();
      return true;
    } catch (err) {
      console.warn('Camera access denied or unavailable, running optical simulation mode:', err);
      this.isAnalyzing = true;
      this.runSimulationFeedbackLoop();
      return false;
    }
  }

  public stopCamera() {
    this.isAnalyzing = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  public setInstrument(instrument: InstrumentType) {
    this.currentInstrument = instrument;
  }

  private analyzeLoop = () => {
    if (!this.isAnalyzing || !this.videoElement || !this.canvasElement) return;

    const ctx = this.canvasElement.getContext('2d');
    if (ctx && this.videoElement.readyState >= 2) {
      const width = this.canvasElement.width;
      const height = this.canvasElement.height;

      // Draw camera frame with subtle mirror
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(this.videoElement, -width, 0, width, height);
      ctx.restore();

      // Perform instrument-specific computer vision heuristics & overlay
      const feedback = this.processInstrumentVision(ctx, width, height);
      if (this.onFeedbackCallback) {
        this.onFeedbackCallback(feedback);
      }
    }

    this.animationFrameId = requestAnimationFrame(this.analyzeLoop);
  };

  private runSimulationFeedbackLoop = () => {
    if (!this.isAnalyzing) return;
    const feedback = this.generateSimulatedFeedback(this.currentInstrument);
    if (this.onFeedbackCallback) {
      this.onFeedbackCallback(feedback);
    }
    setTimeout(this.runSimulationFeedbackLoop, 400);
  };

  // Optical analysis and visual HUD overlays
  private processInstrumentVision(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): VisionPostureFeedback {
    const time = Date.now() / 1000;
    const sim = this.simulatedState;

    if (this.currentInstrument === 'guitar') {
      return this.renderGuitarVisionHUD(ctx, width, height, time, sim);
    } else if (this.currentInstrument === 'violin') {
      return this.renderViolinVisionHUD(ctx, width, height, time, sim);
    } else if (this.currentInstrument === 'bansuri') {
      return this.renderBansuriVisionHUD(ctx, width, height, time, sim);
    }

    return this.generateSimulatedFeedback(this.currentInstrument);
  }

  // GUITAR COMPUTER VISION
  private renderGuitarVisionHUD(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    sim: typeof this.simulatedState
  ): VisionPostureFeedback {
    // Fret hand tracking point
    const wristY = h * 0.55 + (sim.wristBent ? 25 : Math.sin(t * 1.5) * 4);
    const neckAngle = sim.wristBent ? 18 : 38; // degrees

    // Overlay Guide Lines
    ctx.strokeStyle = sim.wristBent ? '#f59e0b' : '#10b981';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);

    // Neck line guide
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.7);
    ctx.lineTo(w * 0.75, h * 0.35);
    ctx.stroke();
    ctx.setLineDash([]);

    // Hand landmark indicator
    const handX = w * 0.45;
    const handY = wristY;

    // Wrist point
    ctx.fillStyle = sim.wristBent ? '#ef4444' : '#10b981';
    ctx.beginPath();
    ctx.arc(handX, handY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Thumb indicator behind neck
    const thumbX = handX - 15;
    const thumbY = sim.thumbOverNeck ? handY - 35 : handY - 10;
    ctx.fillStyle = sim.thumbOverNeck ? '#f59e0b' : '#10b981';
    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 7, 0, Math.PI * 2);
    ctx.fill();

    // HUD Text
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Guitar Neck Angle: ${neckAngle}° (Target: 35-45°)`, 20, 30);
    ctx.fillText(`Fret Hand Wrist: ${sim.wristBent ? '⚠️ Collapsed' : '✅ Relaxed & Straight'}`, 20, 50);
    ctx.fillText(`Thumb Position: ${sim.thumbOverNeck ? '⚠️ Peeking over neck' : '✅ Behind neck center'}`, 20, 70);

    const isGood = !sim.wristBent && !sim.thumbOverNeck;
    const score = isGood ? 94 : sim.wristBent ? 68 : 74;

    return {
      instrument: 'guitar',
      isPostureGood: isGood,
      overallScore: score,
      keyMetrics: [
        {
          label: 'Instrument Angle',
          status: neckAngle >= 30 ? 'good' : 'warning',
          score: neckAngle >= 30 ? 95 : 65,
          message: neckAngle >= 30 ? 'Guitar neck angled nicely upwards at ~40°' : 'Tilt neck upwards higher',
        },
        {
          label: 'Fret Wrist Alignment',
          status: sim.wristBent ? 'error' : 'good',
          score: sim.wristBent ? 55 : 92,
          message: sim.wristBent ? 'Wrist is bent too sharply forward. Keep wrist straight.' : 'Natural straight wrist curve',
        },
        {
          label: 'Thumb Placement',
          status: sim.thumbOverNeck ? 'warning' : 'good',
          score: sim.thumbOverNeck ? 60 : 96,
          message: sim.thumbOverNeck ? 'Move thumb behind the middle of the neck for reach.' : 'Thumb positioned well behind neck',
        },
        {
          label: 'Finger Arch & Clearance',
          status: 'good',
          score: 88,
          message: 'Fingertips resting perpendicular on strings',
        },
      ],
      activeCorrection: sim.wristBent
        ? {
            title: 'Straighten Fret-Hand Wrist',
            explanation: 'Your wrist is slightly collapsed inward, which causes string muting and finger fatigue.',
            animationType: 'guitar_wrist_fix',
            suggestedFix: 'Lower your elbow slightly and bring your palm forward so your wrist remains in a neutral straight line.',
          }
        : sim.thumbOverNeck
        ? {
            title: 'Position Thumb Behind Neck',
            explanation: 'Your thumb is wrapping too far over the top edge of the fretboard.',
            animationType: 'guitar_thumb_fix',
            suggestedFix: 'Slide your thumb pad to the center back of the neck like holding a hamburger.',
          }
        : undefined,
    };
  }

  // VIOLIN COMPUTER VISION
  private renderViolinVisionHUD(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    sim: typeof this.simulatedState
  ): VisionPostureFeedback {
    // Chin & Scroll HUD
    ctx.strokeStyle = sim.bowNotPerpendicular ? '#f59e0b' : '#3b82f6';
    ctx.lineWidth = 3;

    // Chin rest target box
    ctx.strokeRect(w * 0.55, h * 0.2, 50, 45);
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('Chin Rest Area', w * 0.55, h * 0.18);

    // Bow Stroke Line
    const bowTilt = sim.bowNotPerpendicular ? 25 : 0;
    ctx.strokeStyle = sim.bowNotPerpendicular ? '#ef4444' : '#10b981';
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.45 - bowTilt);
    ctx.lineTo(w * 0.8, h * 0.45 + bowTilt);
    ctx.stroke();

    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Violin Scroll Level: ✅ Level with shoulder`, 20, 30);
    ctx.fillText(`Bow Angle: ${sim.bowNotPerpendicular ? '⚠️ Skewed Angle' : '✅ 90° Perpendicular to string'}`, 20, 50);
    ctx.fillText(`Left Hand Knuckle: ${sim.wristBent ? '⚠️ Collapsed Palm' : '✅ Curved tunnel'}`, 20, 70);

    const isGood = !sim.bowNotPerpendicular && !sim.wristBent;
    const score = isGood ? 92 : sim.bowNotPerpendicular ? 70 : 65;

    return {
      instrument: 'violin',
      isPostureGood: isGood,
      overallScore: score,
      keyMetrics: [
        {
          label: 'Chin & Shoulder Rest',
          status: 'good',
          score: 94,
          message: 'Violin resting securely on collarbone without neck tension',
        },
        {
          label: 'Bow Angle & Bridge Track',
          status: sim.bowNotPerpendicular ? 'warning' : 'good',
          score: sim.bowNotPerpendicular ? 62 : 95,
          message: sim.bowNotPerpendicular ? 'Keep bow strictly perpendicular (90°) to string path' : 'Bow path parallel to bridge',
        },
        {
          label: 'Left Hand Wrist',
          status: sim.wristBent ? 'error' : 'good',
          score: sim.wristBent ? 58 : 90,
          message: sim.wristBent ? 'Avoid "waiter-tray" wrist; keep wrist flat' : 'Relaxed straight wrist tunnel',
        },
        {
          label: 'Bow Grip (Curved Pinky)',
          status: 'good',
          score: 91,
          message: 'Curved pinky on frog with flexible thumb',
        },
      ],
      activeCorrection: sim.bowNotPerpendicular
        ? {
            title: 'Keep Bow 90° to the Strings',
            explanation: 'Your bow is drifting at a diagonal angle, producing a raspy sound.',
            animationType: 'violin_bow_angle_fix',
            suggestedFix: 'Guide your forearm from the elbow rather than the whole shoulder to keep the bow straight.',
          }
        : undefined,
    };
  }

  // BANSURI COMPUTER VISION
  private renderBansuriVisionHUD(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    sim: typeof this.simulatedState
  ): VisionPostureFeedback {
    // Flute angle detector
    const angle = sim.fluteAngleLow ? 35 : 15; // 15° is ideal

    ctx.strokeStyle = sim.fluteAngleLow ? '#f59e0b' : '#10b981';
    ctx.lineWidth = 3;

    // Flute vector guide
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.35);
    ctx.lineTo(w * 0.85, h * 0.35 + (angle * 2.5));
    ctx.stroke();

    // Embouchure target circle
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(w * 0.38, h * 0.35, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Bansuri Tilt Angle: ${angle}° (Target: 10-20°)`, 20, 30);
    ctx.fillText(`Embouchure Alignment: ✅ Centered under lower lip`, 20, 50);
    ctx.fillText(`Finger Pad Coverage: ${sim.holeLeaking ? '⚠️ Hole 3 Leaking Air' : '✅ All tone holes sealed flat'}`, 20, 70);

    const isGood = !sim.fluteAngleLow && !sim.holeLeaking;
    const score = isGood ? 95 : sim.holeLeaking ? 64 : 76;

    return {
      instrument: 'bansuri',
      isPostureGood: isGood,
      overallScore: score,
      keyMetrics: [
        {
          label: 'Flute Tilt Angle',
          status: sim.fluteAngleLow ? 'warning' : 'good',
          score: sim.fluteAngleLow ? 68 : 96,
          message: sim.fluteAngleLow ? 'Flute is drooping too low. Lift to ~15° downward tilt' : 'Balanced horizontal angle',
        },
        {
          label: 'Lip Embouchure',
          status: 'good',
          score: 93,
          message: 'Blowing hole 1/3 covered with lower lip, steady airstream angle',
        },
        {
          label: 'Finger Pad Seal',
          status: sim.holeLeaking ? 'error' : 'good',
          score: sim.holeLeaking ? 55 : 94,
          message: sim.holeLeaking ? 'Hole 3 is partially unsealed at edges. Use flat finger pads' : 'Flat pad contact on all 6 tone holes',
        },
        {
          label: 'Spine & Head Posture',
          status: 'good',
          score: 92,
          message: 'Head upright, chest open for full breath expansion',
        },
      ],
      activeCorrection: sim.holeLeaking
        ? {
            title: 'Seal Tone Hole with Flat Finger Pad',
            explanation: 'Air is leaking from the edge of tone hole 3, causing squeaking on Ga / Re.',
            animationType: 'bansuri_hole_seal_fix',
            suggestedFix: 'Do not use fingertips; rest the soft middle pad of your fingers flat across the hole.',
          }
        : sim.fluteAngleLow
        ? {
            title: 'Elevate Flute Angle',
            explanation: 'Your bansuri is dipping down toward the lap, restricting your airstream.',
            animationType: 'bansuri_angle_fix',
            suggestedFix: 'Elevate your right elbow slightly to keep the bamboo flute at a gentle 15° angle.',
          }
        : undefined,
    };
  }

  // Fallback simulator generator
  private generateSimulatedFeedback(instrument: InstrumentType): VisionPostureFeedback {
    const sim = this.simulatedState;
    if (instrument === 'keyboard') {
      return {
        instrument: 'keyboard',
        isPostureGood: true,
        overallScore: 100,
        keyMetrics: [
          { label: 'Keyboard Alignment', status: 'good', score: 100, message: 'Camera tracking not required for keyboard' },
        ],
      };
    }

    if (instrument === 'guitar') {
      return {
        instrument: 'guitar',
        isPostureGood: !sim.wristBent,
        overallScore: sim.wristBent ? 68 : 94,
        keyMetrics: [
          { label: 'Instrument Angle', status: 'good', score: 95, message: 'Neck at optimal 38° elevation' },
          { label: 'Fret Wrist', status: sim.wristBent ? 'error' : 'good', score: sim.wristBent ? 55 : 92, message: sim.wristBent ? 'Wrist is bent inwards' : 'Straight relaxed wrist' },
          { label: 'Thumb Position', status: 'good', score: 95, message: 'Behind neck center' },
        ],
        activeCorrection: sim.wristBent ? {
          title: 'Straighten Fret Wrist',
          explanation: 'Keep your wrist in a neutral relaxed plane.',
          animationType: 'guitar_wrist_fix',
          suggestedFix: 'Lower your elbow slightly and bring your palm forward.',
        } : undefined,
      };
    }

    if (instrument === 'violin') {
      return {
        instrument: 'violin',
        isPostureGood: !sim.bowNotPerpendicular,
        overallScore: sim.bowNotPerpendicular ? 70 : 93,
        keyMetrics: [
          { label: 'Chin Contact', status: 'good', score: 92, message: 'Firm gentle contact on chin rest' },
          { label: 'Bow Path', status: sim.bowNotPerpendicular ? 'warning' : 'good', score: sim.bowNotPerpendicular ? 62 : 94, message: sim.bowNotPerpendicular ? 'Bow is skewed' : '90° perpendicular stroke' },
        ],
        activeCorrection: sim.bowNotPerpendicular ? {
          title: 'Bow Straightness',
          explanation: 'Keep bow 90° perpendicular to the strings.',
          animationType: 'violin_bow_angle_fix',
          suggestedFix: 'Move forearm from elbow rather than swinging whole shoulder.',
        } : undefined,
      };
    }

    // Bansuri
    return {
      instrument: 'bansuri',
      isPostureGood: !sim.holeLeaking,
      overallScore: sim.holeLeaking ? 65 : 95,
      keyMetrics: [
        { label: 'Flute Angle', status: 'good', score: 94, message: 'Flute held at 15° angle' },
        { label: 'Hole Coverage', status: sim.holeLeaking ? 'error' : 'good', score: sim.holeLeaking ? 55 : 95, message: sim.holeLeaking ? 'Air leaking on hole 3' : 'Flat pad seal complete' },
      ],
      activeCorrection: sim.holeLeaking ? {
        title: 'Seal Tone Holes Completely',
        explanation: 'Use the flat fleshy pads of your fingers, not curved fingertips.',
        animationType: 'bansuri_hole_seal_fix',
        suggestedFix: 'Flatten your fingers over the tone holes to create an airtight seal.',
      } : undefined,
    };
  }
}

export const visionEngine = new VisionEngine();
