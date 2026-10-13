export type InstrumentType = 'keyboard' | 'guitar' | 'violin' | 'bansuri';

export type ThemeMode = 'obsidian' | 'zen' | 'arcade' | 'nordic';

export type ExperienceLevel = 'beginner' | 'basic' | 'few_songs' | 'intermediate';

export type ActiveTab = 'learn' | 'practice' | 'songs' | 'ai-mentor' | 'progress';

export interface TargetNote {
  note: string; // e.g. "C4", "D4", "G3", "Sa", "Re"
  displayName?: string; // e.g. "C", "Sa (C)", "D"
  duration: number; // in beats or seconds
  fret?: number; // 0 for open string, 1-12
  string?: number; // 1 to 6 for guitar, 1 to 4 for violin
  fingerNumber?: number; // 1 (Thumb/Index), 2, 3, 4, 5
  keyIndex?: number; // for piano
  holePattern?: boolean[]; // for bansuri: 6 booleans [true = covered, false = open]
  startTime?: number; // in song beats
  pitchHz?: number;
}

export type ExerciseType = 
  | 'note_identification'
  | 'note_playing'
  | 'ear_training'
  | 'rhythm_training'
  | 'timing'
  | 'finger_placement'
  | 'posture_vision'
  | 'swara_practice'
  | 'song_section';

export interface Exercise {
  id: string;
  title: string;
  type?: ExerciseType;
  description?: string;
  instructions?: string;
  targetNotes: TargetNote[];
  bpm?: number;
  expectedBpm?: number;
  toleranceMs?: number;
  difficulty?: number | string;
  requiredPassingScore?: number;
  skillsCovered?: string[];
  skillId?: string;
  animationDemo?: {
    type: string;
    title: string;
    description: string;
    keyPoints: string[];
    mistakeToAvoid: string;
  };
  demonstrationId?: string;
  correctiveTip?: string;
  correctiveAnimation?: string;
}

export interface Lesson {
  id: string;
  levelId?: string;
  instrument?: InstrumentType;
  title: string;
  subtitle?: string;
  description: string;
  theorySummary?: string;
  learningOutcomes?: string[];
  demonstrationType?: 'posture' | 'fingers' | 'rhythm' | 'technique' | 'embouchure';
  demonstrationDetails?: {
    title: string;
    description: string;
    keyPoints: string[];
    animationType: string;
    mistakeToAvoid: string;
  };
  exercises: Exercise[];
  skillIds?: string[];
}

export interface Level {
  id: string;
  instrument: InstrumentType;
  number?: number;
  title: string;
  tagline?: string;
  lessons: Lesson[];
  requiredScore?: number;
}

export interface SongSection {
  id: string;
  name: string;
  startBeat: number;
  endBeat: number;
  notes: TargetNote[];
}

export interface Song {
  id: string;
  title: string;
  instrument: InstrumentType;
  difficulty: 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' | string;
  genre: string;
  key: string;
  tempo: number; // BPM
  durationSec: number;
  description: string;
  coverGradient: string;
  sections: SongSection[];
  skillsTrained: string[];
}

export interface UserProgress {
  userId: string;
  streakDays: number;
  totalPracticeMinutes: number;
  completedLessons: string[];
  completedExercises: string[];
  instrumentMastery: Record<InstrumentType, number>;
  masteredSkills: string[];
  badges: string[];
}

export interface AIPracticeFeedback {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  microDrillRecommendation?: string;
}

export interface SkillMastery {
  [skillId: string]: {
    name: string;
    category: 'Posture' | 'Fingering' | 'Intonation' | 'Rhythm' | 'Theory' | 'Transition';
    percentage: number; // 0 - 100
    timesPracticed: number;
    lastScore: number;
    commonMistakes: string[];
  };
}

export interface AudioDetectionData {
  pitchHz: number;
  noteName: string;
  octave: number;
  cents: number;
  confidence: number;
  volumeRms: number;
  isStable: boolean;
  closestIndianSwara?: string;
}

export interface VisionPostureFeedback {
  instrument: InstrumentType;
  isPostureGood: boolean;
  overallScore: number; // 0 - 100
  keyMetrics: {
    label: string;
    status: 'good' | 'warning' | 'error';
    score: number;
    message: string;
  }[];
  activeCorrection?: {
    title: string;
    explanation: string;
    animationType: string;
    suggestedFix: string;
  };
}

export interface AIMentorInsight {
  advice: string;
  praises: string[];
  areasToImprove: string[];
  specificCorrection?: string;
  recommendation: {
    title: string;
    action: string;
    type?: 'lesson' | 'exercise' | 'song';
    id?: string;
  };
  motivationalQuote: string;
}
