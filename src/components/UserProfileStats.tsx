import React from 'react';
import { UserProgress, InstrumentType } from '../types';
import {
  Award,
  Flame,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface Props {
  userProgress: UserProgress;
  onSelectInstrument: (inst: InstrumentType) => void;
}

const BADGES = [
  {
    id: 'first_note',
    title: 'First Resonant Note',
    desc: 'Completed your first pitch-perfect exercise',
    icon: '🎵',
  },
  {
    id: 'posture_pro',
    title: 'Flawless Form',
    desc: 'Maintained 95%+ posture score on vision camera',
    icon: '🧘',
  },
  {
    id: 'streak_3',
    title: 'Consistent Maestro',
    desc: 'Maintained a 3-day continuous practice habit',
    icon: '🔥',
  },
  {
    id: 'raag_scholar',
    title: 'Raga Pioneer',
    desc: 'Mastered Sa-Re-Ga-Ma & Raag Bhupali on Bansuri',
    icon: '🪈',
  },
  {
    id: 'finger_freedom',
    title: 'Finger Independence',
    desc: 'Mastered 5-finger piano pattern with zero hesitation',
    icon: '🎹',
  },
  {
    id: 'clean_tone',
    title: 'Pure Intonation',
    desc: 'Maintained intonation within ±5 cents across 10 notes',
    icon: '🎻',
  },
];

export const UserProfileStats: React.FC<Props> = ({
  userProgress,
  onSelectInstrument,
}) => {
  const instruments: { type: InstrumentType; name: string; icon: string }[] = [
    { type: 'keyboard', name: 'Keyboard / Piano', icon: '🎹' },
    { type: 'guitar', name: 'Acoustic / Electric Guitar', icon: '🎸' },
    { type: 'violin', name: 'Violin (Suzuki & Classical)', icon: '🎻' },
    { type: 'bansuri', name: 'Bansuri (Indian Flute)', icon: '🪈' },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Banner Profile Summary */}
      <div className="bg-[#0F1115] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E5C07B] to-[#B8914B] text-black flex items-center justify-center font-bold text-2xl shadow-lg shadow-[#E5C07B]/20">
            VX
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-light font-serif-italic text-white">Musician Profile</h3>
              <span className="px-3 py-1 rounded-full bg-[#E5C07B]/15 text-[#E5C07B] text-[10px] font-bold uppercase tracking-widest border border-[#E5C07B]/30">
                Level 2 Apprentice
              </span>
            </div>
            <p className="text-xs text-white/60 mt-1 max-w-xl leading-relaxed">
              Practicing actively across 4 instruments with AI computer vision & audio pitch analysis.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-[#E5C07B] text-xs font-bold">
              <Flame className="w-4 h-4" />
              <span>Streak</span>
            </div>
            <div className="text-2xl font-light font-serif-italic text-white mt-1">
              {userProgress.streakDays} Days
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-green-400 text-xs font-bold">
              <Clock className="w-4 h-4" />
              <span>Practice</span>
            </div>
            <div className="text-2xl font-light font-serif-italic text-white mt-1">
              {userProgress.totalPracticeMinutes}m
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1 text-blue-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Skills</span>
            </div>
            <div className="text-2xl font-light font-serif-italic text-white mt-1">
              {userProgress.masteredSkills.length}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Instrument Mastery Progress Grid */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#E5C07B] font-bold mb-4 px-1">
          Instrument Mastery Distribution
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {instruments.map((inst) => {
            const mastery = userProgress.instrumentMastery[inst.type] || 25;

            return (
              <div
                key={inst.type}
                className="bg-[#0F1115] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-5 hover:border-white/20 transition-all"
              >
                <div>
                  <div className="text-3xl mb-3">{inst.icon}</div>
                  <h5 className="text-sm font-bold text-white">{inst.name}</h5>
                  <span className="text-[11px] text-white/40">
                    {inst.type === 'keyboard' ? 'Keystroke Audio' : 'Audio + Vision AI'}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-white/50 mb-1.5">
                    <span>Mastery</span>
                    <span className="text-[#E5C07B] font-bold">{mastery}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#B8914B] to-[#E5C07B] rounded-full transition-all"
                      style={{ width: `${mastery}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectInstrument(inst.type)}
                  className="w-full py-2.5 rounded-full bg-white/5 hover:bg-[#E5C07B] hover:text-black text-white/80 border border-white/10 text-xs font-bold transition-all uppercase tracking-wider"
                >
                  OPEN LESSONS
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Micro-Achievements */}
      <div className="bg-[#0F1115] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-[#E5C07B] font-bold text-xs uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>Mastery Milestones & Badges</span>
          </div>
          <span className="text-xs text-white/40 font-mono">
            {userProgress.badges.length} / {BADGES.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {BADGES.map((badge) => {
            const isUnlocked =
              userProgress.badges.includes(badge.id) ||
              badge.id === 'first_note' ||
              badge.id === 'streak_3';

            return (
              <div
                key={badge.id}
                className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                  isUnlocked
                    ? 'bg-black/40 border-[#E5C07B]/30 text-white shadow-lg'
                    : 'bg-black/20 border-white/5 opacity-40 text-white/40'
                }`}
              >
                <span className="text-3xl shrink-0">{badge.icon}</span>
                <div>
                  <h6 className="text-xs font-bold text-white">{badge.title}</h6>
                  <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserProfileStats;
