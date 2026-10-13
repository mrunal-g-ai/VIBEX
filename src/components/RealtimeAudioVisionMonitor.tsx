import React, { useRef, useEffect, useState } from 'react';
import { InstrumentType, AudioDetectionData, VisionPostureFeedback } from '../types';
import { audioEngine } from '../services/audioEngine';
import { visionEngine } from '../services/visionEngine';
import { Mic, MicOff, Camera, CameraOff, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  instrument: InstrumentType;
  onAudioData?: (data: AudioDetectionData | null) => void;
  onVisionFeedback?: (feedback: VisionPostureFeedback) => void;
  onRequestCorrection?: (correction: NonNullable<VisionPostureFeedback['activeCorrection']>) => void;
}

export const RealtimeAudioVisionMonitor: React.FC<Props> = ({
  instrument,
  onAudioData,
  onVisionFeedback,
  onRequestCorrection,
}) => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [audioData, setAudioData] = useState<AudioDetectionData | null>(null);
  const [visionFeedback, setVisionFeedback] = useState<VisionPostureFeedback | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Toggle Microphone
  const toggleMic = async () => {
    if (isMicActive) {
      audioEngine.stopMicrophoneListening();
      setIsMicActive(false);
      setAudioData(null);
      if (onAudioData) onAudioData(null);
    } else {
      const success = await audioEngine.startMicrophoneListening((data) => {
        setAudioData(data);
        if (onAudioData) onAudioData(data);
      });
      setIsMicActive(success);
    }
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (isCameraActive) {
      visionEngine.stopCamera();
      setIsCameraActive(false);
      setVisionFeedback(null);
    } else {
      if (videoRef.current && canvasRef.current) {
        await visionEngine.startCamera(
          videoRef.current,
          canvasRef.current,
          instrument,
          (feedback) => {
            setVisionFeedback(feedback);
            if (onVisionFeedback) onVisionFeedback(feedback);
          }
        );
        setIsCameraActive(true);
      }
    }
  };

  useEffect(() => {
    visionEngine.setInstrument(instrument);
  }, [instrument]);

  useEffect(() => {
    return () => {
      audioEngine.stopMicrophoneListening();
      visionEngine.stopCamera();
    };
  }, []);

  // Cents indicator calculation (-50 to +50 cents)
  const cents = audioData ? Math.max(-50, Math.min(50, audioData.cents)) : 0;
  const centsPercent = ((cents + 50) / 100) * 100;
  const isInTune = Math.abs(cents) <= 10;

  return (
    <div className="w-full bg-[#0F1115] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
      {/* Top Bar: Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-[#E5C07B]" />
          <h4 className="text-xs uppercase tracking-widest font-bold text-white">Live AI Telemetry & Vision</h4>
        </div>

        <div className="flex items-center gap-3">
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              isMicActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-lg shadow-red-500/10'
                : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
            }`}
          >
            {isMicActive ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isMicActive ? 'Listening (Mic On)' : 'Enable Microphone'}</span>
          </button>

          {/* Camera Button (Only for Guitar, Violin, Bansuri) */}
          {instrument !== 'keyboard' && (
            <button
              type="button"
              onClick={toggleCamera}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                isCameraActive
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/10'
              }`}
            >
              {isCameraActive ? <Camera className="w-3.5 h-3.5 animate-pulse" /> : <CameraOff className="w-3.5 h-3.5" />}
              <span>{isCameraActive ? 'Tracking Posture' : 'Enable Camera Vision'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
        {/* AUDIO PITCH & TIMING METER */}
        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-white/50">Audio Pitch & Intonation</span>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              audioData
                ? isInTune
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-[#E5C07B]/20 text-[#E5C07B] border border-[#E5C07B]/30'
                : 'bg-white/5 text-white/40 border border-white/5'
            }`}>
              {audioData ? (isInTune ? 'Perfect Pitch' : cents > 0 ? 'Sharp ♯' : 'Flat ♭') : 'Waiting for audio'}
            </span>
          </div>

          {/* Large Note Badge */}
          <div className="my-3 flex items-center justify-center gap-5">
            <div className="text-center">
              <div className="text-4xl font-extrabold font-mono text-[#E5C07B]">
                {audioData?.noteName || '—'}
              </div>
              <div className="text-xs text-white/40 mt-1 font-mono">
                {audioData?.pitchHz ? `${audioData.pitchHz} Hz` : 'Play a note'}
              </div>
            </div>

            {audioData?.closestIndianSwara && (
              <div className="border-l border-white/10 pl-5 text-center">
                <div className="text-2xl font-bold font-mono text-green-400">
                  {audioData.closestIndianSwara}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Swara</div>
              </div>
            )}
          </div>

          {/* Cents Deviation Gauge (-50c to +50c) */}
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-[9px] font-mono uppercase text-white/40">
              <span>-50c (Flat)</span>
              <span className="text-green-400 font-bold">In-Tune (0c)</span>
              <span>+50c (Sharp)</span>
            </div>
            <div className="relative w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
              {/* In-Tune Center Zone */}
              <div className="absolute left-[40%] right-[40%] top-0 bottom-0 bg-green-500/20" />
              {/* Center Zero line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40" />
              {/* Active needle */}
              {audioData && (
                <div
                  className={`absolute top-0 bottom-0 w-2.5 rounded-full shadow transition-all duration-100 ${
                    isInTune ? 'bg-green-400' : 'bg-[#E5C07B]'
                  }`}
                  style={{ left: `calc(${centsPercent}% - 5px)` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* COMPUTER VISION / POSTURE TRACKER */}
        <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-white/50">
              {instrument === 'keyboard' ? 'Technique Tracking' : 'Camera Posture & Vision HUD'}
            </span>
            {visionFeedback && (
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                visionFeedback.isPostureGood
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-[#E5C07B]/20 text-[#E5C07B] border border-[#E5C07B]/30'
              }`}>
                Posture Score: {visionFeedback.overallScore}%
              </span>
            )}
          </div>

          {/* Video / Canvas Element for Computer Vision */}
          {instrument !== 'keyboard' ? (
            <div className="relative w-full h-32 bg-black/60 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
              <video ref={videoRef} className="hidden" playsInline muted />
              <canvas ref={canvasRef} width={320} height={200} className="w-full h-full object-cover" />

              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 bg-black/80 backdrop-blur-sm">
                  <Camera className="w-6 h-6 text-white/40 mb-1" />
                  <p className="text-xs text-white/60">
                    Enable camera to track {instrument} posture & form in real-time
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-black/50 rounded-2xl border border-white/5 text-xs text-white/80 space-y-2">
              <div className="flex items-center gap-2 text-green-400 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Keyboard Keystroke Audio Tracking Active</span>
              </div>
              <p className="text-white/50 text-[11px] leading-relaxed">
                Camera vision is unnecessary for keyboard. VIBEX monitors keystroke timing, finger intervals, and note durations via MIDI & Audio Analysis.
              </p>
            </div>
          )}

          {/* Active Posture Metrics or Correction Trigger */}
          {visionFeedback?.activeCorrection && onRequestCorrection && (
            <div className="mt-3 p-3 bg-[#E5C07B]/15 border border-[#E5C07B]/30 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E5C07B] shrink-0" />
                <span className="text-xs text-white font-medium truncate">
                  {visionFeedback.activeCorrection.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRequestCorrection(visionFeedback.activeCorrection!)}
                className="px-3.5 py-1.5 rounded-full bg-[#E5C07B] text-black text-[10px] font-bold uppercase tracking-wider hover:bg-[#d4ae67] transition"
              >
                VIEW CORRECTION
              </button>
            </div>
          )}

          {/* Posture Simulation Test Buttons */}
          {instrument !== 'keyboard' && (
            <div className="flex flex-wrap gap-2 mt-3 pt-2.5 border-t border-white/5">
              <span className="text-[10px] text-white/40 uppercase tracking-wider w-full font-bold">Simulate Posture Correction:</span>
              {instrument === 'guitar' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = visionEngine.getSimulatedState().wristBent;
                      visionEngine.setSimulatedState({ wristBent: !cur });
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-white/70 border border-white/10"
                  >
                    Toggle Wrist Bend
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = visionEngine.getSimulatedState().thumbOverNeck;
                      visionEngine.setSimulatedState({ thumbOverNeck: !cur });
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-white/70 border border-white/10"
                  >
                    Toggle Thumb
                  </button>
                </>
              )}

              {instrument === 'violin' && (
                <button
                  type="button"
                  onClick={() => {
                    const cur = visionEngine.getSimulatedState().bowNotPerpendicular;
                    visionEngine.setSimulatedState({ bowNotPerpendicular: !cur });
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-white/70 border border-white/10"
                >
                  Toggle Bow Skew Angle
                </button>
              )}

              {instrument === 'bansuri' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = visionEngine.getSimulatedState().holeLeaking;
                      visionEngine.setSimulatedState({ holeLeaking: !cur });
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-white/70 border border-white/10"
                  >
                    Toggle Hole Air Leak
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = visionEngine.getSimulatedState().fluteAngleLow;
                      visionEngine.setSimulatedState({ fluteAngleLow: !cur });
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-white/70 border border-white/10"
                  >
                    Toggle Flute Tilt
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeAudioVisionMonitor;
