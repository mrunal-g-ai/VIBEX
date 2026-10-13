import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InstrumentType, ExperienceLevel } from '../types';
import {
  Sparkles,
  Clock,
  Music,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Award,
  Video,
  Mic,
} from 'lucide-react';

interface OnboardingData {
  instrument: InstrumentType;
  dailyMinutes: number;
  experience: ExperienceLevel;
  primaryGoal: string;
}

interface Props {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void;
  initialInstrument?: InstrumentType;
}

const INSTRUMENT_OPTIONS: {
  id: InstrumentType;
  name: string;
  subtitle: string;
  icon: string;
  description: string;
  hasVision: boolean;
}[] = [
  {
    id: 'keyboard',
    name: 'KEYBOARD',
    subtitle: 'Piano & Keystroke Audio',
    icon: '🎹',
    description: 'Learn keyboard layout, Middle C, 5-finger arch, two-hand coordination, and classical pieces.',
    hasVision: false,
  },
  {
    id: 'guitar',
    name: 'GUITAR',
    subtitle: 'Fretboard & Posture Vision',
    icon: '🎸',
    description: 'Master finger arching, clean fretting without buzz, PIMA picking, essential chords, and rock riffs.',
    hasVision: true,
  },
  {
    id: 'violin',
    name: 'VIOLIN',
    subtitle: 'Bow Angle & Intonation',
    icon: '🎻',
    description: 'Fretless fingerboard intonation, master bow frog grip, Suzuki scale methods, and 90° bow angle alignment.',
    hasVision: true,
  },
  {
    id: 'bansuri',
    name: 'BANSURI',
    subtitle: 'Bamboo Flute & Embouchure',
    icon: '🪈',
    description: 'Indian classical bamboo flute. Master 45° air ribbon embouchure, flat pad hole sealing, and sacred Ragas.',
    hasVision: true,
  },
];

const TIME_OPTIONS = [
  { minutes: 10, label: '10 Mins / Day', subtitle: 'Gentle & Sustainable' },
  { minutes: 15, label: '15 Mins / Day', subtitle: 'Recommended for Rapid Growth', popular: true },
  { minutes: 30, label: '30 Mins / Day', subtitle: 'Dedicated Practice' },
  { minutes: 45, label: '45 Mins / Day', subtitle: 'Intensive Mastery' },
];

const EXPERIENCE_OPTIONS: { id: ExperienceLevel; label: string; description: string }[] = [
  {
    id: 'beginner',
    label: 'Complete Beginner',
    description: 'I have never touched or played this instrument before.',
  },
  {
    id: 'basic',
    label: 'Know Some Basics',
    description: 'I know how to hold it or play a few individual notes.',
  },
  {
    id: 'few_songs',
    label: 'Intermediate Learner',
    description: 'I can play basic scales or simple tunes and want to master technique.',
  },
];

const GOAL_OPTIONS = [
  { id: 'songs', label: 'Play Full Songs & Melodies', desc: 'Learn popular repertoire with real-time feedback' },
  { id: 'technique', label: 'Master Posture & Form', desc: 'Fix bad habits using AI camera posture and intonation analysis' },
  { id: 'theory_ear', label: 'Classical Theory & Ear Training', desc: 'Understand scales, chords, swaras, and sheet music' },
];

export const OnboardingFlow: React.FC<Props> = ({ isOpen, onComplete, initialInstrument = 'guitar' }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>(initialInstrument);
  const [dailyMinutes, setDailyMinutes] = useState<number>(15);
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [primaryGoal, setPrimaryGoal] = useState<string>('technique');

  if (!isOpen) return null;

  const handleFinish = () => {
    onComplete({
      instrument: selectedInstrument,
      dailyMinutes,
      experience,
      primaryGoal,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-[#0F1115] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[90vh]"
      >
        {/* Top Header & Progress Dots */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-serif-italic text-[#E5C07B]">VIBEX</span>
              <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                Personalized Learning Studio Setup
              </span>
            </div>

            {/* Step Counter */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === s
                      ? 'w-7 bg-[#E5C07B]'
                      : step > s
                      ? 'w-3 bg-white/40'
                      : 'w-3 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="my-6 overflow-y-auto pr-1">
          {/* STEP 1: Instrument Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B]">
                  Step 1 of 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-light font-serif-italic text-white mt-1">
                  Which instrument would you like to learn?
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Select your primary instrument. You can easily switch anytime in the top bar.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INSTRUMENT_OPTIONS.map((inst) => {
                  const isSelected = selectedInstrument === inst.id;
                  return (
                    <button
                      key={inst.id}
                      type="button"
                      onClick={() => setSelectedInstrument(inst.id)}
                      className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#E5C07B]/10 border-[#E5C07B] shadow-lg shadow-[#E5C07B]/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl">{inst.icon}</span>
                          {inst.hasVision ? (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              <span>Audio + Vision</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                              <Mic className="w-3 h-3" />
                              <span>Audio Analysis</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-wide">{inst.name}</h3>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">{inst.description}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-[11px] font-medium text-white/40">{inst.subtitle}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#E5C07B] flex items-center justify-center text-black">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Daily Practice Commitment */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B]">
                  Step 2 of 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-light font-serif-italic text-white mt-1">
                  How many minutes will you practice daily?
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Small, consistent daily practice creates effortless muscle memory and tone mastery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TIME_OPTIONS.map((opt) => {
                  const isSelected = dailyMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => setDailyMinutes(opt.minutes)}
                      className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#E5C07B]/10 border-[#E5C07B] shadow-lg shadow-[#E5C07B]/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-[#E5C07B]">
                            <Clock className="w-4 h-4" />
                            <span className="text-base font-bold text-white">{opt.label}</span>
                          </div>
                          {opt.popular && (
                            <span className="px-2 py-0.5 rounded-full bg-[#E5C07B] text-black text-[9px] font-extrabold uppercase">
                              Best Choice
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 mt-1">{opt.subtitle}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#E5C07B] flex items-center justify-center text-black">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Experience Level */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B]">
                  Step 3 of 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-light font-serif-italic text-white mt-1">
                  What is your current experience level?
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  We customize the pace of the curriculum and AI guidance to match your background.
                </p>
              </div>

              <div className="space-y-3">
                {EXPERIENCE_OPTIONS.map((exp) => {
                  const isSelected = experience === exp.id;
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      onClick={() => setExperience(exp.id)}
                      className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#E5C07B]/10 border-[#E5C07B] shadow-lg shadow-[#E5C07B]/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <h4 className="text-base font-bold text-white">{exp.label}</h4>
                        <p className="text-xs text-white/60 mt-1">{exp.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#E5C07B] flex items-center justify-center text-black shrink-0 ml-4">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Primary Goal */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B]">
                  Step 4 of 4
                </span>
                <h2 className="text-2xl sm:text-3xl font-light font-serif-italic text-white mt-1">
                  What is your primary musical goal?
                </h2>
                <p className="text-xs text-white/60 mt-1">
                  Your AI Mentor will tailor personalized practice drills around your goals.
                </p>
              </div>

              <div className="space-y-3">
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = primaryGoal === g.id;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setPrimaryGoal(g.id)}
                      className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#E5C07B]/10 border-[#E5C07B] shadow-lg shadow-[#E5C07B]/10'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <h4 className="text-base font-bold text-white">{g.label}</h4>
                        <p className="text-xs text-white/60 mt-1">{g.desc}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#E5C07B] flex items-center justify-center text-black shrink-0 ml-4">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2.5 rounded-full bg-[#E5C07B] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#E5C07B]/20 hover:scale-105 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-8 py-3 rounded-full bg-[#E5C07B] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-[#E5C07B]/25 hover:scale-105 transition-all"
            >
              <span>Enter {selectedInstrument.toUpperCase()} Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingFlow;
