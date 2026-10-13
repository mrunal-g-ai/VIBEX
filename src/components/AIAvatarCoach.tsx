import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InstrumentType, Lesson, Exercise } from '../types';
import {
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Award,
  ChevronRight,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

export type AvatarMood = 'idle' | 'listening' | 'correcting' | 'praising' | 'celebrating' | 'explaining';

export interface AIAvatarCoachProps {
  instrument: InstrumentType;
  mood?: AvatarMood;
  customMessage?: string;
  isWrongPlaying?: boolean;
  wrongReason?: string;
  isLessonCompleted?: boolean;
  completedLessonTitle?: string;
  nextLesson?: Lesson | null;
  onStartNextLesson?: (lesson: Lesson) => void;
  onRetryExercise?: () => void;
  compact?: boolean;
  className?: string;
}

export const AIAvatarCoach: React.FC<AIAvatarCoachProps> = ({
  instrument,
  mood = 'idle',
  customMessage,
  isWrongPlaying = false,
  wrongReason,
  isLessonCompleted = false,
  completedLessonTitle,
  nextLesson,
  onStartNextLesson,
  onRetryExercise,
  compact = false,
  className = '',
}) => {
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [displayedText, setDisplayedText] = useState<string>('');
  const lastSpokenTextRef = useRef<string>('');

  // Determine current active mood and message
  const currentMood: AvatarMood = (isLessonCompleted
    ? 'celebrating'
    : isWrongPlaying
    ? 'correcting'
    : mood) as AvatarMood;

  // Determine intelligent advice based on instrument and state
  const computedMessage = React.useMemo(() => {
    if (customMessage) return customMessage;

    if (isLessonCompleted) {
      if (nextLesson) {
        return `Bravo! You've mastered ${completedLessonTitle || 'this milestone'} with high precision. Next up: "${nextLesson.title}" to advance your ${instrument} technique.`;
      }
      return `Outstanding achievement! You've accomplished your primary goals for ${completedLessonTitle || 'this stage'}. Keep this daily streak rolling!`;
    }

    if (isWrongPlaying) {
      if (wrongReason) return wrongReason;
      if (instrument === 'violin') {
        return 'Careful! Your bow stroke is drifting off the perpendicular 90° sounding lane. Flex your right wrist on the up-bow to keep the hair flat.';
      }
      if (instrument === 'bansuri') {
        return 'Tone airy or pitch flat! Make sure your lower lip covers exactly 1/3 of the blowhole and your finger pads seal the holes completely flat without leaking.';
      }
      if (instrument === 'guitar') {
        return 'Buzz detected! Place your fretting fingertip arched at 90° directly behind the fret wire, and keep your thumb resting on the neck midline.';
      }
      if (instrument === 'keyboard') {
        return 'Tension warning! Keep your wrist floating neutral at 180° with your hand arched naturally like holding a tennis ball.';
      }
      return 'Check your pitch and rhythm! Slow down tempo and follow the highlighted motion guides.';
    }

    // Default proactive coaching tips
    if (instrument === 'violin') {
      return 'Maestro tip: Keep your right pinky curved on top of the bow stick as a flexible shock absorber during direction changes.';
    }
    if (instrument === 'bansuri') {
      return 'Focus your breath into a thin, 45° downward ribbon against the outer blowhole splitting edge for crisp, resonant swaras.';
    }
    if (instrument === 'guitar') {
      return 'Practice relaxing your fretting thumb counter-pressure — use arm weight rather than squeezing the neck.';
    }
    return 'Play with relaxed shoulders and let your fingers articulate with light, precise finger-pad strikes.';
  }, [customMessage, isLessonCompleted, isWrongPlaying, wrongReason, instrument, completedLessonTitle, nextLesson]);

  // Sync displayed text
  useEffect(() => {
    setDisplayedText(computedMessage);
  }, [computedMessage]);

  // Optional Voice Synthesis for real-time coach feedback
  useEffect(() => {
    if (!speechEnabled || !computedMessage || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    if (lastSpokenTextRef.current === computedMessage) return;

    lastSpokenTextRef.current = computedMessage;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(computedMessage);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    utterance.volume = 0.75;

    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Audio speech fallback
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [computedMessage, speechEnabled]);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl transition-all duration-300 ${
        currentMood === 'correcting'
          ? 'bg-gradient-to-r from-red-950/40 via-[#161214] to-red-950/20 border-2 border-red-500/50 shadow-2xl shadow-red-950/30'
          : currentMood === 'celebrating'
          ? 'bg-gradient-to-r from-amber-950/50 via-[#181611] to-emerald-950/40 border-2 border-[#E5C07B]/60 shadow-2xl shadow-[#E5C07B]/20'
          : 'bg-[#12141A]/95 border border-white/10 shadow-xl'
      } ${compact ? 'p-3.5 sm:p-4' : 'p-5 sm:p-6'} ${className}`}
    >
      {/* Background Animated Gradient Aura */}
      <div
        className={`absolute -right-16 -bottom-16 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ${
          currentMood === 'correcting'
            ? 'bg-red-500/15'
            : currentMood === 'celebrating'
            ? 'bg-[#E5C07B]/25'
            : 'bg-sky-500/10'
        }`}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
        {/* Animated AI Avatar Graphic Frame */}
        <div className="relative shrink-0 flex items-center justify-center">
          {/* Outer Pulsing Halo */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              currentMood === 'correcting'
                ? 'bg-red-500/20 border-2 border-red-500 shadow-lg shadow-red-500/30 animate-pulse'
                : currentMood === 'celebrating'
                ? 'bg-amber-400/20 border-2 border-[#E5C07B] shadow-lg shadow-[#E5C07B]/40 animate-bounce'
                : 'bg-sky-500/15 border-2 border-sky-400/50 shadow-md shadow-sky-500/10'
            }`}
          >
            {/* SVG Interactive Avatar Character (Maestro Aria) */}
            <svg viewBox="0 0 100 100" className="w-12 h-12 sm:w-16 sm:h-16 select-none">
              <defs>
                <linearGradient id="avatarFaceGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="avatarHairGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Maestro Hair / Crown */}
              <path
                d="M 25 45 C 20 20 80 20 75 45 C 85 30 75 10 50 10 C 25 10 15 30 25 45 Z"
                fill="url(#avatarHairGrad)"
              />

              {/* Head / Face Silhouette */}
              <circle cx="50" cy="52" r="32" fill="url(#avatarFaceGrad)" stroke="#431407" strokeWidth="2" />

              {/* Animated Eyes */}
              {currentMood === 'correcting' ? (
                // Focused diagnostic eyes with furrowed brow
                <g>
                  <line x1="32" y1="40" x2="44" y2="45" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="68" y1="40" x2="56" y2="45" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="38" cy="50" r="4" fill="#0f172a" />
                  <circle cx="62" cy="50" r="4" fill="#0f172a" />
                </g>
              ) : currentMood === 'celebrating' ? (
                // Happy curved eyes (smiling)
                <g>
                  <path d="M 32 50 Q 38 43 44 50" stroke="#431407" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M 56 50 Q 62 43 68 50" stroke="#431407" strokeWidth="3" fill="none" strokeLinecap="round" />
                </g>
              ) : (
                // Attentive neutral eyes
                <g>
                  <circle cx="38" cy="49" r="4.5" fill="#0f172a" />
                  <circle cx="40" cy="47" r="1.5" fill="#ffffff" />
                  <circle cx="62" cy="49" r="4.5" fill="#0f172a" />
                  <circle cx="64" cy="47" r="1.5" fill="#ffffff" />
                </g>
              )}

              {/* Cheeks Blush in praise/celebrate */}
              {(currentMood === 'celebrating' || currentMood === 'praising') && (
                <g>
                  <ellipse cx="28" cy="58" rx="5" ry="3" fill="#f43f5e" opacity="0.5" />
                  <ellipse cx="72" cy="58" rx="5" ry="3" fill="#f43f5e" opacity="0.5" />
                </g>
              )}

              {/* Animated Mouth (Synced with Speech & Mood) */}
              {isSpeaking ? (
                // Animated speaking mouth loop
                <ellipse cx="50" cy="67" rx="6" ry="4" fill="#881337">
                  <animate attributeName="ry" values="2;5;2;6;3" dur="0.4s" repeatCount="indefinite" />
                </ellipse>
              ) : currentMood === 'celebrating' ? (
                // Big warm smile
                <path d="M 36 62 Q 50 78 64 62" stroke="#881337" strokeWidth="3" fill="#881337" strokeLinecap="round" />
              ) : currentMood === 'correcting' ? (
                // Thoughtful coach mouth
                <path d="M 40 68 Q 50 64 60 68" stroke="#431407" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              ) : (
                // Gentle smile
                <path d="M 40 65 Q 50 72 60 65" stroke="#431407" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              )}

              {/* Instrument Icon Badge */}
              <circle cx="80" cy="75" r="13" fill="#18181b" stroke="#E5C07B" strokeWidth="1.5" />
              <text x="80" y="80" fontSize="11" textAnchor="middle">
                {instrument === 'violin' ? '🎻' : instrument === 'bansuri' ? '🪈' : instrument === 'guitar' ? '🎸' : '🎹'}
              </text>
            </svg>
          </div>

          {/* Real-time speech ripple waves */}
          {isSpeaking && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E5C07B] opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#E5C07B]" />
            </span>
          )}
        </div>

        {/* Coach Name, Status, Message Bubble & Navigation Actions */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold tracking-wider uppercase text-[#E5C07B] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Vibex AI Maestro
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-white/10 text-white/70">
                {currentMood === 'correcting'
                  ? 'Real-Time Diagnostic'
                  : currentMood === 'celebrating'
                  ? 'Milestone Mastered'
                  : 'Live Guidance'}
              </span>
            </div>

            {/* Voice Mute / Unmute Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !speechEnabled;
                setSpeechEnabled(next);
                if (!next && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              className={`p-1.5 rounded-full text-xs transition border flex items-center gap-1 ${
                speechEnabled
                  ? 'bg-[#E5C07B]/15 border-[#E5C07B]/40 text-[#E5C07B]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
              }`}
              title={speechEnabled ? 'Mute AI Voice Coach' : 'Enable AI Voice Coach'}
            >
              {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-mono hidden sm:inline">{speechEnabled ? 'Voice On' : 'Muted'}</span>
            </button>
          </div>

          {/* Spoken Text Coach Bubble */}
          <div
            className={`text-sm leading-relaxed rounded-2xl p-3.5 transition-all ${
              currentMood === 'correcting'
                ? 'bg-red-500/15 text-red-100 border border-red-500/30'
                : currentMood === 'celebrating'
                ? 'bg-[#E5C07B]/15 text-amber-100 border border-[#E5C07B]/30 font-medium'
                : 'bg-white/5 text-white/90 border border-white/5'
            }`}
          >
            {displayedText}
          </div>

          {/* Milestone Next-Lesson Prompt Action Button */}
          {isLessonCompleted && nextLesson && onStartNextLesson && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onStartNextLesson(nextLesson)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E5C07B] to-[#b8914b] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#E5C07B]/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Continue to Next Lesson: {nextLesson.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {onRetryExercise && (
                <button
                  type="button"
                  onClick={onRetryExercise}
                  className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Replay for 100% Score</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAvatarCoach;
