import React, { useState, useMemo } from 'react';
import { InstrumentType, Level, Lesson, Exercise } from '../types';
import { CURRICULUM_DATA } from '../data/curriculum';
import { AnimatedDemo } from './AnimatedDemo';
import { AIAvatarCoach } from './AIAvatarCoach';
import {
  CheckCircle2,
  Play,
  ChevronRight,
  Video,
  Target,
  Sparkles,
} from 'lucide-react';

interface Props {
  instrument: InstrumentType;
  onStartExercise: (exercise: Exercise, lesson: Lesson) => void;
  completedExerciseIds: string[];
}

export const LearnCurriculumView: React.FC<Props> = ({
  instrument,
  onStartExercise,
  completedExerciseIds,
}) => {
  const levels = CURRICULUM_DATA[instrument] || [];
  const [selectedLevelId, setSelectedLevelId] = useState<string>(levels[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(levels[0]?.lessons[0]?.id || '');
  const [activeDemoExercise, setActiveDemoExercise] = useState<Exercise | null>(null);

  const currentLevel = levels.find((l) => l.id === selectedLevelId) || levels[0];
  const currentLesson = currentLevel?.lessons.find((l) => l.id === selectedLessonId) || currentLevel?.lessons[0];

  // All lessons flat array to determine next sequential lesson
  const allLessons = useMemo(() => levels.flatMap((lvl) => lvl.lessons), [levels]);

  const isCurrentLessonCompleted = useMemo(() => {
    if (!currentLesson || currentLesson.exercises.length === 0) return false;
    return currentLesson.exercises.every((ex) => completedExerciseIds.includes(ex.id));
  }, [currentLesson, completedExerciseIds]);

  const nextLesson = useMemo(() => {
    if (!currentLesson) return allLessons[1] || null;
    const currentIdx = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIdx !== -1 && currentIdx + 1 < allLessons.length) {
      return allLessons[currentIdx + 1];
    }
    return null;
  }, [allLessons, currentLesson]);

  const handleGoToNextLesson = (nextL: Lesson) => {
    // Find parent level of next lesson
    const parentLevel = levels.find((lvl) => lvl.lessons.some((l) => l.id === nextL.id));
    if (parentLevel) {
      setSelectedLevelId(parentLevel.id);
    }
    setSelectedLessonId(nextL.id);
    setActiveDemoExercise(null);
    if (nextL.exercises[0]) {
      onStartExercise(nextL.exercises[0], nextL);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header Banner in Sophisticated Dark Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F1115] via-[#16181D] to-[#0A0B0D] border border-white/10 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#E5C07B]/15 text-[#E5C07B] text-[10px] font-bold uppercase tracking-widest border border-[#E5C07B]/30">
                Learning Path
              </span>
              <span className="text-[11px] text-white/50 font-medium">
                {levels.length} Structured Levels • {levels.reduce((acc, l) => acc + l.lessons.length, 0)} Master Lessons
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-light font-serif-italic text-white capitalize">
              {instrument} <span className="text-[#E5C07B] italic">Mastery Journey</span>
            </h2>
            <p className="text-xs md:text-sm text-white/60 mt-1 max-w-2xl font-normal leading-relaxed">
              Step-by-step curriculum with posture vision validation, intonation accuracy, and structured micro-drills.
            </p>
          </div>

          {/* Level Selector Pills */}
          <div className="flex bg-black/40 p-1.5 rounded-full border border-white/10 shrink-0 gap-1">
            {levels.map((lvl, idx) => {
              const isSelected = lvl.id === selectedLevelId;
              const isCompleted = lvl.lessons.every((les) =>
                les.exercises.every((ex) => completedExerciseIds.includes(ex.id))
              );

              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    setSelectedLevelId(lvl.id);
                    setSelectedLessonId(lvl.lessons[0]?.id || '');
                    setActiveDemoExercise(null);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#E5C07B] text-black shadow-lg shadow-[#E5C07B]/20 scale-105'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isSelected
                        ? 'bg-black text-[#E5C07B]'
                        : isCompleted
                        ? 'bg-green-500/20 text-green-400'
                        : 'border border-white/20 text-white/60'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  <span>{lvl.title.split('–')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Learning Grid: Lessons Sidebar + Detailed Lesson View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lessons Navigation Sidebar */}
        <aside className="lg:col-span-4 bg-[#0F1115] border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-[#E5C07B] font-bold mb-4">
              {currentLevel?.title || 'Lessons'}
            </h3>

            <div className="space-y-2.5">
              {currentLevel?.lessons.map((lesson, idx) => {
                const isSelected = lesson.id === selectedLessonId;
                const completedCount = lesson.exercises.filter((ex) =>
                  completedExerciseIds.includes(ex.id)
                ).length;
                const isLessonComplete = completedCount === lesson.exercises.length && lesson.exercises.length > 0;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setActiveDemoExercise(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-white/10 border-[#E5C07B]/40 shadow-lg shadow-[#E5C07B]/5 ring-1 ring-[#E5C07B]/30'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isLessonComplete
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : isSelected
                            ? 'bg-[#E5C07B] text-black'
                            : 'border border-white/20 text-white/60'
                        }`}
                      >
                        {isLessonComplete ? '✓' : idx + 1}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white leading-snug">{lesson.title}</h4>
                        <p className="text-[10px] text-white/50 mt-0.5">
                          {isLessonComplete ? (
                            <span className="text-green-400 font-medium">100% Mastered</span>
                          ) : (
                            `${completedCount}/${lesson.exercises.length} Exercises Complete`
                          )}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-[#E5C07B] translate-x-0.5' : 'text-white/30'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mastery Overview in Sidebar */}
          <div className="mt-8 pt-5 border-t border-white/10 bg-black/20 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">
              Mastery Progress
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-white/60">Level Completion</span>
                  <span className="text-[#E5C07B] font-bold">
                    {Math.round(
                      ((currentLevel?.lessons.reduce(
                        (acc, les) =>
                          acc + les.exercises.filter((ex) => completedExerciseIds.includes(ex.id)).length,
                        0
                      ) || 0) /
                        Math.max(
                          1,
                          currentLevel?.lessons.reduce((acc, les) => acc + les.exercises.length, 0) || 1
                        )) *
                        100
                    )}
                    %
                  </span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B8914B] to-[#E5C07B] rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((currentLevel?.lessons.reduce(
                            (acc, les) =>
                              acc + les.exercises.filter((ex) => completedExerciseIds.includes(ex.id)).length,
                            0
                          ) || 0) /
                            Math.max(
                              1,
                              currentLevel?.lessons.reduce((acc, les) => acc + les.exercises.length, 0) || 1
                            )) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Selected Lesson Detail & Micro Exercises */}
        <div className="lg:col-span-8 space-y-6">
          {currentLesson && (
            <div className="bg-[#0F1115] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
              {/* Active Lesson Header */}
              <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-[#E5C07B] text-[10px] font-bold uppercase tracking-widest mb-1">
                    Current Lesson
                  </p>
                  <h3 className="text-3xl font-light font-serif-italic text-white">
                    {currentLesson.title}
                  </h3>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed max-w-xl">
                    {currentLesson.description}
                  </p>

                  {/* Learning Outcomes Badges */}
                  {currentLesson.learningOutcomes && currentLesson.learningOutcomes.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {currentLesson.learningOutcomes.map((outcome, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/80 flex items-center gap-1.5"
                        >
                          <Target className="w-3 h-3 text-[#E5C07B]" />
                          {outcome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Action Button */}
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const firstEx = currentLesson.exercises[0];
                      if (firstEx) onStartExercise(firstEx, currentLesson);
                    }}
                    className="px-6 py-2.5 bg-[#E5C07B] text-black rounded-full text-xs font-bold shadow-lg shadow-[#E5C07B]/20 hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>START LESSON</span>
                  </button>
                </div>
              </div>

              {/* Animated Demonstration Canvas */}
              {(() => {
                const demoEx =
                  activeDemoExercise ||
                  currentLesson.exercises.find((e) => e.animationDemo) ||
                  currentLesson.exercises[0];

                const animType =
                  demoEx?.animationDemo?.type ||
                  currentLesson.demonstrationDetails?.animationType ||
                  `${instrument}_technique`;

                const animTitle =
                  demoEx?.animationDemo?.title ||
                  currentLesson.demonstrationDetails?.title ||
                  `${currentLesson.title} – Technique Stance`;

                const animDesc =
                  demoEx?.animationDemo?.description ||
                  currentLesson.demonstrationDetails?.description ||
                  currentLesson.description;

                const animKeyPoints =
                  demoEx?.animationDemo?.keyPoints ||
                  currentLesson.demonstrationDetails?.keyPoints || [
                    'Maintain natural joint curvature and soft shoulders',
                    'Align fingertip vectors perpendicular to the contact surface',
                    'Practice steady slow-motion cycles before increasing speed',
                  ];

                const animMistake =
                  demoEx?.animationDemo?.mistakeToAvoid ||
                  currentLesson.demonstrationDetails?.mistakeToAvoid ||
                  'Collapsing joints, resting palms heavily, or excessive forearm tension.';

                return (
                  <AnimatedDemo
                    animationType={animType}
                    title={animTitle}
                    description={animDesc}
                    keyPoints={animKeyPoints}
                    mistakeToAvoid={animMistake}
                    instrument={instrument}
                  />
                );
              })()}

              {/* AI Avatar Coach: Lesson Completion & Next Lesson Guide */}
              {isCurrentLessonCompleted && (
                <AIAvatarCoach
                  instrument={instrument}
                  isLessonCompleted={true}
                  completedLessonTitle={currentLesson.title}
                  nextLesson={nextLesson}
                  onStartNextLesson={handleGoToNextLesson}
                />
              )}

              {/* Step-by-step Micro-exercises List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5C07B]">
                    Interactive Micro-Drills
                  </h4>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    LEARN ➔ WATCH ➔ TRY ➔ MASTER
                  </span>
                </div>

                <div className="space-y-3">
                  {currentLesson.exercises.map((exercise, index) => {
                    const isCompleted = completedExerciseIds.includes(exercise.id);

                    return (
                      <div
                        key={exercise.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCompleted
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-[#E5C07B]/20 text-[#E5C07B] text-xs font-bold flex items-center justify-center">
                                {index + 1}
                              </span>
                              <h5 className="text-sm font-bold text-white">
                                {exercise.title}
                              </h5>
                              {isCompleted && (
                                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/30 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Mastered
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/60">
                              {exercise.description || exercise.instructions}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] font-mono text-white/40 pt-1">
                              <span>BPM: {exercise.bpm || exercise.expectedBpm || 70}</span>
                              <span>•</span>
                              <span>Target Notes: {exercise.targetNotes.length}</span>
                              <span>•</span>
                              <span>Passing: {exercise.requiredPassingScore ?? 75}%</span>
                            </div>
                          </div>

                          {/* Exercise Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {exercise.animationDemo && (
                              <button
                                type="button"
                                onClick={() => setActiveDemoExercise(exercise)}
                                className="px-4 py-2 rounded-full border border-white/20 text-xs font-bold text-white/80 hover:bg-white/5 hover:text-white flex items-center gap-1.5 transition-colors"
                              >
                                <Video className="w-3.5 h-3.5 text-[#E5C07B]" />
                                <span>WATCH DEMO</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onStartExercise(exercise, currentLesson)}
                              className="px-5 py-2 rounded-full bg-[#E5C07B] text-black text-xs font-bold shadow-lg shadow-[#E5C07B]/20 hover:scale-105 transition-all flex items-center gap-1.5"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{isCompleted ? 'PRACTICE AGAIN' : 'START EXERCISE'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LearnCurriculumView;
