import React from 'react';
import { motion } from 'motion/react';
import { InstrumentType, Exercise, Lesson } from '../types';
import { CURRICULUM_DATA } from '../data/curriculum';
import {
  Sparkles,
  Clock,
  Target,
  Flame,
  Award,
  Play,
  Compass,
  ArrowRight,
  Video,
  Mic,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  instrument: InstrumentType;
  dailyMinutes: number;
  experience: string;
  primaryGoal: string;
  onStartFirstExercise: (exercise: Exercise, lesson: Lesson) => void;
  onExploreCurriculum: () => void;
}

const INSTRUMENT_META: Record<
  InstrumentType,
  { name: string; icon: string; specialty: string; hasVision: boolean }
> = {
  keyboard: {
    name: 'Keyboard / Piano',
    icon: '🎹',
    specialty: 'Audio pitch detection & finger arch keystroke timing',
    hasVision: false,
  },
  guitar: {
    name: 'Acoustic Guitar',
    icon: '🎸',
    specialty: 'Computer vision posture, wrist angle & clean fretboard audio',
    hasVision: true,
  },
  violin: {
    name: 'Violin',
    icon: '🎻',
    specialty: '90° bow angle vision tracking & continuous fretless intonation',
    hasVision: true,
  },
  bansuri: {
    name: 'Bansuri (Indian Flute)',
    icon: '🪈',
    specialty: '45° embouchure vision angle & flat finger-pad seal detection',
    hasVision: true,
  },
};

const GOAL_TITLES: Record<string, string> = {
  songs: 'Play Full Songs & Repertoire',
  technique: 'Master Posture & Ergonomics',
  theory_ear: 'Classical Theory & Ear Training',
};

export const QuickStartSummaryModal: React.FC<Props> = ({
  isOpen,
  instrument,
  dailyMinutes,
  experience,
  primaryGoal,
  onStartFirstExercise,
  onExploreCurriculum,
}) => {
  if (!isOpen) return null;

  const meta = INSTRUMENT_META[instrument] || INSTRUMENT_META.guitar;
  const firstLevel = CURRICULUM_DATA[instrument]?.[0];
  const firstLesson = firstLevel?.lessons?.[0];
  const recommendedExercise = firstLesson?.exercises?.[0];

  const goalName = GOAL_TITLES[primaryGoal] || 'Mastering Instrument Fundamentals';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 24 }}
        className="w-full max-w-2xl bg-[#0F1115] border border-[#E5C07B]/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[92vh] ring-1 ring-[#E5C07B]/20"
      >
        {/* Header */}
        <div className="space-y-2 text-center pb-5 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5C07B]/15 border border-[#E5C07B]/30 text-[#E5C07B] text-[11px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Initialized • Quick Start Plan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-light font-serif-italic text-white">
            Welcome to your {meta.name} Journey
          </h2>
          <p className="text-xs text-white/60 max-w-lg mx-auto">
            Your personalized learning track is ready. Here is your daily practice roadmap and recommended fundamental exercise.
          </p>
        </div>

        {/* Goals & Parameters Summary Grid */}
        <div className="my-5 space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Daily Commitment */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-[#E5C07B]">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-white/50">
                  Daily Goal
                </span>
              </div>
              <p className="text-lg font-bold text-white">{dailyMinutes} Mins / Day</p>
              <p className="text-[11px] text-white/40">~{dailyMinutes * 50} XP per session</p>
            </div>

            {/* Focus Area */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-[#E5C07B]">
                <Target className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-white/50">
                  Primary Focus
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate" title={goalName}>
                {goalName}
              </p>
              <p className="text-[11px] text-white/40 capitalize">{experience} Level</p>
            </div>

            {/* AI Diagnostics Mode */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center gap-2 text-[#E5C07B]">
                {meta.hasVision ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="text-[10px] uppercase tracking-wider font-bold text-white/50">
                  AI Feedback
                </span>
              </div>
              <p className="text-xs font-bold text-white">
                {meta.hasVision ? 'Vision + Audio' : 'Pitch & Timing'}
              </p>
              <p className="text-[11px] text-white/40">Real-time coaching</p>
            </div>
          </div>

          {/* Recommended First Exercise Spotlight */}
          {recommendedExercise && firstLesson && (
            <div className="bg-gradient-to-br from-[#16181D] to-[#0F1115] border border-[#E5C07B]/30 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#E5C07B] text-black text-[10px] font-extrabold uppercase tracking-wider">
                  Recommended First Step
                </span>
                <span className="text-[11px] text-white/40 font-medium">
                  Lesson 1 • Level 1
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {recommendedExercise.title}
                </h3>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">
                  {recommendedExercise.description || recommendedExercise.instructions}
                </p>
              </div>

              {/* Note Highway / Swara Preview */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
                  Target Notes:
                </span>
                {recommendedExercise.targetNotes.slice(0, 6).map((n, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-[#E5C07B]"
                  >
                    {n.displayName || n.note}
                  </span>
                ))}
                <span className="text-[11px] text-white/40 ml-auto font-mono">
                  BPM: {recommendedExercise.bpm || 70}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExploreCurriculum}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explore 12-Lesson Path</span>
          </button>

          {recommendedExercise && firstLesson && (
            <button
              type="button"
              onClick={() => onStartFirstExercise(recommendedExercise, firstLesson)}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#E5C07B] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#E5C07B]/20 hover:scale-105 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Exercise 1 Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuickStartSummaryModal;
