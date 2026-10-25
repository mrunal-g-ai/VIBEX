import React, { useState, useEffect } from 'react';
import {
  InstrumentType,
  ThemeMode,
  Exercise,
  Lesson,
  Song,
  UserProgress,
  ExperienceLevel,
} from './types';
import { CURRICULUM_DATA } from './data/curriculum';
import { SONGS_DATA } from './data/songs';
import { audioEngine } from './services/audioEngine';
import { LearnCurriculumView } from './components/LearnCurriculumView';
import { PracticeExerciseView } from './components/PracticeExerciseView';
import { SongPracticeView } from './components/SongPracticeView';
import { SongLibraryView } from './components/SongLibraryView';
import { AITeacherChat } from './components/AITeacherChat';
import { UserProfileStats } from './components/UserProfileStats';
import { OnboardingFlow } from './components/OnboardingFlow';
import { QuickStartSummaryModal } from './components/QuickStartSummaryModal';
import { ThemeSelectorModal, THEMES_LIST } from './components/ThemeSelectorModal';
import {
  BookOpen,
  Target,
  Music2,
  Library,
  Sparkles,
  Award,
  Volume2,
  SlidersHorizontal,
  Compass,
  Palette,
} from 'lucide-react';

const INSTRUMENTS: { id: InstrumentType; name: string; icon: string; subtitle: string }[] = [
  { id: 'keyboard', name: 'KEYBOARD', icon: '🎹', subtitle: 'Piano & Keystroke Audio' },
  { id: 'guitar', name: 'GUITAR', icon: '🎸', subtitle: 'Fretboard & Posture Vision' },
  { id: 'violin', name: 'VIOLIN', icon: '🎻', subtitle: 'Bow Angle & Intonation' },
  { id: 'bansuri', name: 'BANSURI', icon: '🪈', subtitle: 'Hole Seal & Breath Embouchure' },
];

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('vibex_theme');
    if (saved && (saved === 'obsidian' || saved === 'zen' || saved === 'arcade' || saved === 'nordic')) {
      return saved as ThemeMode;
    }
    return 'obsidian';
  });

  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('vibex_onboarding_completed');
  });

  const [showQuickStartModal, setShowQuickStartModal] = useState<boolean>(false);

  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>(() => {
    const saved = localStorage.getItem('vibex_selected_instrument');
    if (saved && (saved === 'keyboard' || saved === 'guitar' || saved === 'violin' || saved === 'bansuri')) {
      return saved as InstrumentType;
    }
    return 'guitar';
  });

  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('vibex_daily_minutes');
    return saved ? parseInt(saved, 10) : 15;
  });

  const [userExperience, setUserExperience] = useState<string>(() => {
    return localStorage.getItem('vibex_experience') || 'beginner';
  });

  const [primaryGoal, setPrimaryGoal] = useState<string>(() => {
    return localStorage.getItem('vibex_primary_goal') || 'technique';
  });

  const [activeTab, setActiveTab] = useState<'learn' | 'song-library' | 'practice' | 'song-arena' | 'ai-mentor' | 'progress'>('learn');

  // Currently loaded exercise for Practice mode
  const [currentExercise, setCurrentExercise] = useState<{
    exercise: Exercise;
    lesson?: Lesson;
  } | null>(null);

  // Currently loaded song for Performance Arena
  const [activeSong, setActiveSong] = useState<Song | null>(null);

  // User progress state (with localStorage persistence)
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('vibex_user_progress');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      userId: 'student_1',
      streakDays: 7,
      totalPracticeMinutes: 85,
      completedLessons: ['gt_l1'],
      completedExercises: ['gt_ex_1'],
      instrumentMastery: {
        keyboard: 25,
        guitar: 40,
        violin: 15,
        bansuri: 20,
      },
      masteredSkills: ['gt_thumb_position', 'gt_clean_frets'],
      badges: ['first_note', 'streak_3', 'posture_pro'],
    };
  });

  useEffect(() => {
    localStorage.setItem('vibex_user_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    localStorage.setItem('vibex_selected_instrument', selectedInstrument);
  }, [selectedInstrument]);

  useEffect(() => {
    localStorage.setItem('vibex_theme', theme);
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  // Handle onboarding completion -> immediately trigger Quick Start Summary Modal
  const handleOnboardingComplete = (data: {
    instrument: InstrumentType;
    dailyMinutes: number;
    experience: string;
    primaryGoal: string;
  }) => {
    setSelectedInstrument(data.instrument);
    setDailyGoalMinutes(data.dailyMinutes);
    setUserExperience(data.experience);
    setPrimaryGoal(data.primaryGoal);

    localStorage.setItem('vibex_onboarding_completed', 'true');
    localStorage.setItem('vibex_daily_minutes', data.dailyMinutes.toString());
    localStorage.setItem('vibex_selected_instrument', data.instrument);
    localStorage.setItem('vibex_experience', data.experience);
    localStorage.setItem('vibex_primary_goal', data.primaryGoal);

    setShowOnboarding(false);
    setShowQuickStartModal(true);
  };

  // Handle launching exercise from Quick Start / Curriculum / AI Generator
  const handleStartExercise = (exercise: Exercise, lesson?: Lesson) => {
    setCurrentExercise({ exercise, lesson });
    setShowQuickStartModal(false);
    setActiveTab('practice');
  };

  // Handle selecting song from Song Library to play in Arena
  const handleSelectSongFromLibrary = (song: Song) => {
    setActiveSong(song);
    setActiveTab('song-arena');
  };

  // When exercise is completed with passing score
  const handleExerciseCompleted = (exerciseId: string, score: number) => {
    setUserProgress((prev) => {
      const alreadyCompleted = prev.completedExercises.includes(exerciseId);
      const newCompleted = alreadyCompleted
        ? prev.completedExercises
        : [...prev.completedExercises, exerciseId];

      const currentInstrumentMastery = prev.instrumentMastery[selectedInstrument] || 10;
      const updatedMastery = Math.min(100, currentInstrumentMastery + (alreadyCompleted ? 2 : 8));

      return {
        ...prev,
        completedExercises: newCompleted,
        totalPracticeMinutes: prev.totalPracticeMinutes + 5,
        instrumentMastery: {
          ...prev.instrumentMastery,
          [selectedInstrument]: updatedMastery,
        },
      };
    });
  };

  // Get default exercise if practice tab is opened without selection
  const defaultExercise =
    CURRICULUM_DATA[selectedInstrument]?.[0]?.lessons?.[0]?.exercises?.[0] || {
      id: 'default_ex',
      title: 'Foundation Practice',
      description: 'Foundational tone test',
      targetNotes: [{ note: 'C4', duration: 1 }],
      requiredPassingScore: 70,
      skillsCovered: [],
      bpm: 70,
    };

  const activePracticeExercise = currentExercise?.exercise || defaultExercise;

  const activeThemeMeta = THEMES_LIST.find((t) => t.id === theme) || THEMES_LIST[0];

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        theme === 'zen'
          ? 'bg-[#FAF7F2] text-[#1C1917] selection:bg-[#C26715] selection:text-white'
          : theme === 'arcade'
          ? 'bg-[#070A14] text-[#F8FAFC] selection:bg-[#10B981] selection:text-black'
          : theme === 'nordic'
          ? 'bg-[#0B1120] text-[#F1F5F9] selection:bg-[#38BDF8] selection:text-black'
          : 'bg-[#0A0B0D] text-white selection:bg-[#E5C07B] selection:text-black'
      }`}
    >
      {/* Theme Studio Modal */}
      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={theme}
        onSelectTheme={(newTheme) => setTheme(newTheme)}
      />

      {/* Onboarding / Setup Dialog */}
      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        initialInstrument={selectedInstrument}
      />

      {/* Quick Start Post-Onboarding Summary Modal */}
      <QuickStartSummaryModal
        isOpen={showQuickStartModal}
        instrument={selectedInstrument}
        dailyMinutes={dailyGoalMinutes}
        experience={userExperience}
        primaryGoal={primaryGoal}
        onStartFirstExercise={handleStartExercise}
        onExploreCurriculum={() => {
          setShowQuickStartModal(false);
          setActiveTab('learn');
        }}
      />

      {/* Top Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors px-6 lg:px-10 py-4 ${
          theme === 'zen'
            ? 'bg-[#FAF7F2]/95 border-stone-200'
            : theme === 'arcade'
            ? 'bg-[#070A14]/95 border-emerald-500/20'
            : theme === 'nordic'
            ? 'bg-[#0B1120]/95 border-sky-500/20'
            : 'bg-[#0A0B0D]/95 border-white/10'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Instrument Selector */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <h1
                className={`text-3xl font-serif-italic font-normal tracking-tight drop-shadow-sm ${
                  theme === 'zen'
                    ? 'text-[#C26715]'
                    : theme === 'arcade'
                    ? 'text-[#10B981]'
                    : theme === 'nordic'
                    ? 'text-[#38BDF8]'
                    : 'text-[#E5C07B]'
                }`}
              >
                VIBEX
              </h1>
              <span
                className={`hidden sm:inline-block w-px h-6 ${
                  theme === 'zen' ? 'bg-stone-300' : 'bg-white/10'
                }`}
              />
            </div>

            {/* Instrument Selection Pill Bar */}
            <nav
              className={`flex items-center gap-1 rounded-full p-1 border shadow-inner max-w-full overflow-x-auto ${
                theme === 'zen'
                  ? 'bg-stone-200/70 border-stone-300'
                  : theme === 'arcade'
                  ? 'bg-emerald-950/40 border-emerald-500/20'
                  : theme === 'nordic'
                  ? 'bg-sky-950/40 border-sky-500/20'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {INSTRUMENTS.map((inst) => {
                const isSelected = selectedInstrument === inst.id;
                let activeStyle = 'bg-[#E5C07B] text-black shadow-lg shadow-[#E5C07B]/20 scale-105';
                if (theme === 'zen') {
                  activeStyle = 'bg-[#C26715] text-white shadow-md scale-105';
                } else if (theme === 'arcade') {
                  activeStyle = 'bg-[#10B981] text-black shadow-lg shadow-emerald-500/20 scale-105';
                } else if (theme === 'nordic') {
                  activeStyle = 'bg-[#38BDF8] text-slate-950 shadow-lg shadow-sky-500/20 scale-105';
                }

                return (
                  <button
                    key={inst.id}
                    type="button"
                    onClick={() => {
                      setSelectedInstrument(inst.id);
                      setCurrentExercise(null);
                      setActiveSong(null);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all uppercase tracking-wider flex items-center gap-1.5 ${
                      isSelected
                        ? activeStyle
                        : theme === 'zen'
                        ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/50'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm">{inst.icon}</span>
                    <span>{inst.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Telemetry Status & User Quick Setup Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* UI/UX Theme Switcher Studio Trigger */}
            <button
              type="button"
              onClick={() => setShowThemeModal(true)}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                theme === 'zen'
                  ? 'bg-amber-100/80 hover:bg-amber-200/80 border-amber-300 text-amber-900'
                  : theme === 'arcade'
                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : theme === 'nordic'
                  ? 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300'
                  : 'bg-[#E5C07B]/10 hover:bg-[#E5C07B]/20 border-[#E5C07B]/30 text-[#E5C07B]'
              }`}
              title="Change UI/UX Theme Style"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Theme:</span>
              <span className="font-extrabold">{activeThemeMeta.name.split(' ')[0]}</span>
              {/* Mini Color Dots */}
              <span className="flex items-center -space-x-1 ml-1">
                {activeThemeMeta.paletteColors.slice(0, 3).map((c, i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 rounded-full border border-black/40"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
            </button>

            {/* Quick Start / Blueprint modal opener */}
            <button
              type="button"
              onClick={() => setShowQuickStartModal(true)}
              className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition ${
                theme === 'zen'
                  ? 'bg-stone-200 hover:bg-stone-300 border-stone-300 text-stone-800'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/90'
              }`}
              title="Open Quick Start Session Plan"
            >
              <Compass className="w-3.5 h-3.5 text-[#E5C07B]" />
              <span className="hidden lg:inline">Quick Start Plan</span>
            </button>

            {/* Preferences Setup Button */}
            <button
              type="button"
              onClick={() => setShowOnboarding(true)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition ${
                theme === 'zen'
                  ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
              }`}
              title="Change instrument or practice commitment"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 opacity-70" />
              <span className="hidden sm:inline">Setup</span>
              <span className="text-[11px] font-bold text-[#E5C07B]">({dailyGoalMinutes}m/d)</span>
            </button>

            {/* Audio Test button */}
            <button
              type="button"
              onClick={() => {
                audioEngine.playNote('C4', selectedInstrument, 0.5);
              }}
              className={`p-2 rounded-full border transition-colors ${
                theme === 'zen'
                  ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-[#C26715]'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-[#E5C07B]'
              }`}
              title="Test Sound Engine"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {/* Streak & XP Badge */}
            <div
              className={`flex items-center gap-2.5 pl-2 border-l ${
                theme === 'zen' ? 'border-stone-300' : 'border-white/10'
              }`}
            >
              <div className="text-right">
                <p
                  className={`text-[10px] uppercase tracking-wider font-bold ${
                    theme === 'zen'
                      ? 'text-[#C26715]'
                      : theme === 'arcade'
                      ? 'text-[#10B981]'
                      : theme === 'nordic'
                      ? 'text-[#38BDF8]'
                      : 'text-[#E5C07B]'
                  }`}
                >
                  {userProgress.streakDays}d Streak
                </p>
                <p
                  className={`text-xs font-bold ${
                    theme === 'zen' ? 'text-stone-800' : 'text-white/90'
                  }`}
                >
                  {userProgress.totalPracticeMinutes * 50 + 1200} XP
                </p>
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
                  theme === 'zen'
                    ? 'bg-gradient-to-br from-[#C26715] to-[#9A4C08] text-white'
                    : theme === 'arcade'
                    ? 'bg-gradient-to-br from-[#10B981] to-[#06B6D4] text-black'
                    : theme === 'nordic'
                    ? 'bg-gradient-to-br from-[#38BDF8] to-[#2563EB] text-black'
                    : 'bg-gradient-to-br from-[#E5C07B] to-[#B8914B] text-black'
                }`}
              >
                VX
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Learning Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs Header */}
        <div
          className={`flex p-1.5 rounded-full overflow-x-auto gap-1 shadow-2xl border transition-colors ${
            theme === 'zen'
              ? 'bg-stone-200/90 border-stone-300 shadow-stone-300/40'
              : theme === 'arcade'
              ? 'bg-slate-900/90 border-emerald-500/30 shadow-emerald-950/40'
              : theme === 'nordic'
              ? 'bg-slate-900/90 border-sky-500/30 shadow-sky-950/40'
              : 'bg-[#0F1115] border-white/10'
          }`}
        >
          {[
            { id: 'learn', label: '1. 12-Lesson Path', icon: BookOpen },
            { id: 'song-library', label: '2. Song Library', icon: Library },
            { id: 'practice', label: '3. Interactive Practice', icon: Target },
            { id: 'song-arena', label: '4. Song Performance', icon: Music2 },
            { id: 'ai-mentor', label: '5. AI Mentor', icon: Sparkles },
            { id: 'progress', label: '6. Stats & Badges', icon: Award },
          ].map((tab) => {
            const isTabActive = activeTab === tab.id;
            const Icon = tab.icon;

            let activeTabStyle = 'bg-[#E5C07B] text-black shadow-lg shadow-[#E5C07B]/20';
            if (theme === 'zen') {
              activeTabStyle = 'bg-[#C26715] text-white shadow-md shadow-[#C26715]/25';
            } else if (theme === 'arcade') {
              activeTabStyle = 'bg-[#10B981] text-black shadow-lg shadow-emerald-500/30';
            } else if (theme === 'nordic') {
              activeTabStyle = 'bg-[#38BDF8] text-slate-950 shadow-lg shadow-sky-500/30';
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[130px] py-2.5 px-4 rounded-full text-xs font-bold transition flex items-center justify-center gap-2 ${
                  isTabActive
                    ? activeTabStyle
                    : theme === 'zen'
                    ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/60'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Viewport Module */}
        <div className="w-full">
          {activeTab === 'learn' && (
            <LearnCurriculumView
              instrument={selectedInstrument}
              onStartExercise={handleStartExercise}
              completedExerciseIds={userProgress.completedExercises}
            />
          )}

          {activeTab === 'song-library' && (
            <SongLibraryView
              instrument={selectedInstrument}
              onSelectSong={handleSelectSongFromLibrary}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeExerciseView
              instrument={selectedInstrument}
              exercise={activePracticeExercise}
              lesson={currentExercise?.lesson}
              onBack={() => setActiveTab('learn')}
              onExerciseCompleted={handleExerciseCompleted}
              onStartNextLesson={(nextLesson) => {
                if (nextLesson.exercises[0]) {
                  handleStartExercise(nextLesson.exercises[0], nextLesson);
                } else {
                  setActiveTab('learn');
                }
              }}
            />
          )}

          {activeTab === 'song-arena' && (
            <SongPracticeView
              instrument={selectedInstrument}
            />
          )}

          {activeTab === 'ai-mentor' && (
            <AITeacherChat
              instrument={selectedInstrument}
              onPracticeGeneratedExercise={(exercise) => {
                setCurrentExercise({ exercise });
                setActiveTab('practice');
              }}
            />
          )}

          {activeTab === 'progress' && (
            <UserProfileStats
              userProgress={userProgress}
              onSelectInstrument={(inst) => {
                setSelectedInstrument(inst);
                setActiveTab('learn');
              }}
            />
          )}
        </div>
      </main>

      {/* Sophisticated Adaptive Footer */}
      <footer
        className={`border-t py-6 px-8 text-center text-xs space-y-2 transition-colors ${
          theme === 'zen'
            ? 'bg-[#FAF7F2] border-stone-200 text-stone-500'
            : theme === 'arcade'
            ? 'bg-[#070A14] border-emerald-500/20 text-slate-400'
            : theme === 'nordic'
            ? 'bg-[#0B1120] border-sky-500/20 text-slate-400'
            : 'bg-[#0A0B0D] border-white/10 text-white/40'
        }`}
      >
        <div
          className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] uppercase tracking-widest font-bold ${
            theme === 'zen'
              ? 'text-[#C26715]'
              : theme === 'arcade'
              ? 'text-[#10B981]'
              : theme === 'nordic'
              ? 'text-[#38BDF8]'
              : 'text-[#E5C07B]'
          }`}
        >
          <span>Keyboard (Piano)</span>
          <span>•</span>
          <span>Guitar (Acoustic)</span>
          <span>•</span>
          <span>Violin (Baroque & Modern)</span>
          <span>•</span>
          <span>Bansuri (Indian Classical)</span>
        </div>
        <p className={theme === 'zen' ? 'text-stone-600' : 'text-white/60'}>
          VIBEX – AI Music Teacher • Computer Vision Posture Feedback • Real-time Intonation Audio Engine
        </p>
      </footer>
    </div>
  );
};

export default App;
