import '../../data/providers/app_providers.dart';

/// VIBEX Curriculum Data — Dart port of src/data/curriculum.ts
/// Structured as: instrument → `List<Level>` → `List<Lesson>` → `List<Exercise>`

// ─── Data models ─────────────────────────────────────────────────────────────

class TargetNote {
  final String note;
  final String? displayName;
  final double duration;
  final int? fret;
  final int? string;
  final int? fingerNumber;
  final int? keyIndex;
  final List<bool>? holePattern;
  final double? startTime;
  final double? pitchHz;

  const TargetNote({
    required this.note,
    this.displayName,
    this.duration = 1.0,
    this.fret,
    this.string,
    this.fingerNumber,
    this.keyIndex,
    this.holePattern,
    this.startTime,
    this.pitchHz,
  });
}

class Exercise {
  final String id;
  final String title;
  final String? type;
  final String? description;
  final String? instructions;
  final List<TargetNote> targetNotes;
  final int? bpm;
  final int? difficulty;
  final int requiredPassingScore;
  final List<String> skillsCovered;
  final String? correctiveTip;

  const Exercise({
    required this.id,
    required this.title,
    this.type,
    this.description,
    this.instructions,
    required this.targetNotes,
    this.bpm = 70,
    this.difficulty,
    this.requiredPassingScore = 70,
    this.skillsCovered = const [],
    this.correctiveTip,
  });
}

class Lesson {
  final String id;
  final String title;
  final String? subtitle;
  final String description;
  final String? theorySummary;
  final List<String> learningOutcomes;
  final List<Exercise> exercises;
  final List<String> skillIds;

  const Lesson({
    required this.id,
    required this.title,
    this.subtitle,
    required this.description,
    this.theorySummary,
    this.learningOutcomes = const [],
    required this.exercises,
    this.skillIds = const [],
  });

  List<String> get skillsTrained => skillIds;
  String get objective => description;
}

class Level {
  final String id;
  final InstrumentType instrument;
  final int number;
  final String title;
  final String? tagline;
  final List<Lesson> lessons;

  const Level({
    required this.id,
    required this.instrument,
    required this.number,
    required this.title,
    this.tagline,
    required this.lessons,
  });

  int get levelNumber => number;
  String get description => tagline ?? '';
}

// ─── Guitar Curriculum ────────────────────────────────────────────────────────

const _guitarLevels = <Level>[
  Level(
    id: 'gt_l1',
    instrument: InstrumentType.guitar,
    number: 1,
    title: 'Foundations & Posture',
    tagline: 'Build the bedrock of great guitar playing',
    lessons: [
      Lesson(
        id: 'gt_l1_lesson1',
        title: 'Holding the Guitar',
        subtitle: 'Classical & Casual Positions',
        description: 'Learn the two primary ways to hold a guitar and why correct posture prevents injury.',
        theorySummary: 'Good posture keeps tension out of your wrist and shoulder, allowing fluid movement.',
        learningOutcomes: ['Classical sitting position', 'Casual/standing position', 'Wrist angle fundamentals'],
        exercises: [
          Exercise(
            id: 'gt_ex_posture_1',
            title: 'Posture Check',
            type: 'posture_vision',
            description: 'Hold the guitar in the correct classical position and maintain for 30 seconds.',
            instructions: 'Sit on the edge of a chair. Rest the guitar body on your left thigh (right-handed). Keep your back straight.',
            targetNotes: [],
            bpm: 0,
            requiredPassingScore: 70,
            skillsCovered: ['gt_thumb_position', 'gt_posture_spine'],
            correctiveTip: 'Keep your elbow relaxed and wrist straight. Avoid curling the wrist under the neck.',
          ),
        ],
        skillIds: ['gt_thumb_position', 'gt_posture_spine'],
      ),
      Lesson(
        id: 'gt_l1_lesson2',
        title: 'Left-Hand Finger Placement',
        subtitle: 'Fretting Clean Notes',
        description: 'Master proper finger placement to produce clear, buzz-free notes on the fretboard.',
        theorySummary: 'Press strings close to the fret wire with the tip of your finger, not the pad.',
        learningOutcomes: ['Finger arch', 'Clean fret pressure', 'Avoiding muting adjacent strings'],
        exercises: [
          Exercise(
            id: 'gt_ex_1',
            title: 'Open String Exercise',
            type: 'note_playing',
            description: 'Play each open string clearly one at a time — E, A, D, G, B, e.',
            targetNotes: [
              TargetNote(note: 'E2', displayName: 'E (low)', duration: 1, string: 6, fret: 0),
              TargetNote(note: 'A2', displayName: 'A', duration: 1, string: 5, fret: 0),
              TargetNote(note: 'D3', displayName: 'D', duration: 1, string: 4, fret: 0),
              TargetNote(note: 'G3', displayName: 'G', duration: 1, string: 3, fret: 0),
              TargetNote(note: 'B3', displayName: 'B', duration: 1, string: 2, fret: 0),
              TargetNote(note: 'E4', displayName: 'e (high)', duration: 1, string: 1, fret: 0),
            ],
            bpm: 60,
            requiredPassingScore: 65,
            skillsCovered: ['gt_clean_frets', 'gt_string_names'],
          ),
          Exercise(
            id: 'gt_ex_2',
            title: 'C Major Scale — First Position',
            type: 'note_playing',
            description: 'Play the C major scale ascending and descending in first position.',
            targetNotes: [
              TargetNote(note: 'C4', displayName: 'C', duration: 1, string: 2, fret: 1),
              TargetNote(note: 'D4', displayName: 'D', duration: 1, string: 2, fret: 3),
              TargetNote(note: 'E4', displayName: 'E', duration: 1, string: 1, fret: 0),
              TargetNote(note: 'F4', displayName: 'F', duration: 1, string: 1, fret: 1),
              TargetNote(note: 'G4', displayName: 'G', duration: 1, string: 1, fret: 3),
              TargetNote(note: 'A4', displayName: 'A', duration: 1, string: 1, fret: 5),
              TargetNote(note: 'B4', displayName: 'B', duration: 1, string: 1, fret: 7),
              TargetNote(note: 'C5', displayName: 'C (high)', duration: 2, string: 1, fret: 8),
            ],
            bpm: 65,
            requiredPassingScore: 70,
            skillsCovered: ['gt_scale_cMaj', 'gt_clean_frets'],
          ),
        ],
        skillIds: ['gt_clean_frets', 'gt_finger_arch'],
      ),
    ],
  ),
  Level(
    id: 'gt_l2',
    instrument: InstrumentType.guitar,
    number: 2,
    title: 'First Chords',
    tagline: 'Em, Am, G, C — the essential four',
    lessons: [
      Lesson(
        id: 'gt_l2_lesson1',
        title: 'Em & Am Chords',
        subtitle: 'Minor open chords',
        description: 'Learn the first two minor chords and transition between them.',
        theorySummary: 'Em and Am share a similar shape — practice the pivot movement.',
        learningOutcomes: ['Em fingering', 'Am fingering', 'Em→Am transition'],
        exercises: [
          Exercise(
            id: 'gt_ex_em',
            title: 'Em Chord Hold',
            type: 'finger_placement',
            description: 'Form the Em chord and strum all 6 strings clearly.',
            targetNotes: [
              TargetNote(note: 'E2', displayName: 'E', duration: 4, string: 6, fret: 0),
              TargetNote(note: 'B2', displayName: 'B', duration: 4, string: 5, fret: 2),
              TargetNote(note: 'E3', displayName: 'E', duration: 4, string: 4, fret: 2),
              TargetNote(note: 'G3', displayName: 'G', duration: 4, string: 3, fret: 0),
              TargetNote(note: 'B3', displayName: 'B', duration: 4, string: 2, fret: 0),
              TargetNote(note: 'E4', displayName: 'E', duration: 4, string: 1, fret: 0),
            ],
            bpm: 60,
            requiredPassingScore: 70,
            skillsCovered: ['gt_chord_em'],
          ),
        ],
        skillIds: ['gt_chord_em', 'gt_chord_am'],
      ),
    ],
  ),
  Level(
    id: 'gt_l3',
    instrument: InstrumentType.guitar,
    number: 3,
    title: 'Strumming Patterns',
    tagline: 'Rhythm is the heartbeat of music',
    lessons: [
      Lesson(
        id: 'gt_l3_lesson1',
        title: 'Down-Down-Up Pattern',
        subtitle: 'Basic strumming rhythm',
        description: 'Master the foundational D-DU strum pattern at 70 BPM.',
        learningOutcomes: ['Wrist rotation', 'Consistent pick angle', 'Rhythm accuracy'],
        exercises: [
          Exercise(
            id: 'gt_ex_strum1',
            title: 'D-DU on Em',
            type: 'rhythm_training',
            description: 'Strum Em with Down-Down-Up pattern for 8 bars at 70 BPM.',
            targetNotes: [
              TargetNote(note: 'E2', displayName: 'Em', duration: 0.5, startTime: 0),
              TargetNote(note: 'E2', displayName: 'Em', duration: 0.5, startTime: 0.5),
              TargetNote(note: 'E2', displayName: 'Em', duration: 0.25, startTime: 1.0),
            ],
            bpm: 70,
            requiredPassingScore: 70,
            skillsCovered: ['gt_strumming_ddu'],
          ),
        ],
        skillIds: ['gt_strumming_ddu'],
      ),
    ],
  ),
];

// ─── Keyboard Curriculum ──────────────────────────────────────────────────────

const _keyboardLevels = <Level>[
  Level(
    id: 'kb_l1',
    instrument: InstrumentType.keyboard,
    number: 1,
    title: 'Keys & Hand Position',
    tagline: 'Find your way around 88 keys',
    lessons: [
      Lesson(
        id: 'kb_l1_lesson1',
        title: 'Finger Numbering & Arch',
        subtitle: 'Right and Left Hand',
        description: 'Learn proper hand position with a relaxed arch for both hands.',
        learningOutcomes: ['Finger numbers 1-5', 'Curved fingers', 'Wrist height'],
        exercises: [
          Exercise(
            id: 'kb_ex_1',
            title: 'C Major Five-Finger Exercise',
            type: 'note_playing',
            description: 'Play C-D-E-F-G with right hand fingers 1-2-3-4-5, then return.',
            targetNotes: [
              TargetNote(note: 'C4', displayName: 'C', duration: 1, keyIndex: 0, fingerNumber: 1),
              TargetNote(note: 'D4', displayName: 'D', duration: 1, keyIndex: 2, fingerNumber: 2),
              TargetNote(note: 'E4', displayName: 'E', duration: 1, keyIndex: 4, fingerNumber: 3),
              TargetNote(note: 'F4', displayName: 'F', duration: 1, keyIndex: 5, fingerNumber: 4),
              TargetNote(note: 'G4', displayName: 'G', duration: 1, keyIndex: 7, fingerNumber: 5),
              TargetNote(note: 'F4', displayName: 'F', duration: 1, keyIndex: 5, fingerNumber: 4),
              TargetNote(note: 'E4', displayName: 'E', duration: 1, keyIndex: 4, fingerNumber: 3),
              TargetNote(note: 'D4', displayName: 'D', duration: 1, keyIndex: 2, fingerNumber: 2),
              TargetNote(note: 'C4', displayName: 'C', duration: 2, keyIndex: 0, fingerNumber: 1),
            ],
            bpm: 70,
            requiredPassingScore: 70,
            skillsCovered: ['kb_finger_numbering', 'kb_c_position'],
          ),
        ],
        skillIds: ['kb_finger_numbering'],
      ),
    ],
  ),
  Level(
    id: 'kb_l2',
    instrument: InstrumentType.keyboard,
    number: 2,
    title: 'C Major Scale',
    tagline: 'The foundation of western harmony',
    lessons: [
      Lesson(
        id: 'kb_l2_lesson1',
        title: 'C Major Scale — Right Hand',
        description: 'Play the full C major scale with thumb tuck on finger 3 to 1.',
        learningOutcomes: ['Thumb tuck technique', 'Smooth legato', 'Even dynamics'],
        exercises: [
          Exercise(
            id: 'kb_ex_cmaj',
            title: 'C Major Scale (1 octave)',
            type: 'note_playing',
            description: 'Ascending and descending C major scale with proper fingering.',
            targetNotes: [
              TargetNote(note: 'C4', duration: 1, keyIndex: 0, fingerNumber: 1),
              TargetNote(note: 'D4', duration: 1, keyIndex: 2, fingerNumber: 2),
              TargetNote(note: 'E4', duration: 1, keyIndex: 4, fingerNumber: 3),
              TargetNote(note: 'F4', duration: 1, keyIndex: 5, fingerNumber: 1),
              TargetNote(note: 'G4', duration: 1, keyIndex: 7, fingerNumber: 2),
              TargetNote(note: 'A4', duration: 1, keyIndex: 9, fingerNumber: 3),
              TargetNote(note: 'B4', duration: 1, keyIndex: 11, fingerNumber: 4),
              TargetNote(note: 'C5', duration: 2, keyIndex: 12, fingerNumber: 5),
            ],
            bpm: 72,
            requiredPassingScore: 72,
            skillsCovered: ['kb_cmaj_scale', 'kb_thumb_tuck'],
          ),
        ],
        skillIds: ['kb_cmaj_scale'],
      ),
    ],
  ),
];

// ─── Violin Curriculum ───────────────────────────────────────────────────────

const _violinLevels = <Level>[
  Level(
    id: 'vl_l1',
    instrument: InstrumentType.violin,
    number: 1,
    title: 'Bow Hold & Posture',
    tagline: 'The bow is your voice',
    lessons: [
      Lesson(
        id: 'vl_l1_lesson1',
        title: 'The Franco-Belgian Bow Hold',
        subtitle: 'Balanced, flexible grip',
        description: 'Learn the standard bow hold with relaxed thumb and curved fingers.',
        learningOutcomes: ['Thumb contact point', 'Little finger curve', 'Balanced weight'],
        exercises: [
          Exercise(
            id: 'vl_ex_openD',
            title: 'Open D String — Whole Bows',
            type: 'note_playing',
            description: 'Draw 4 slow, even whole bows on the D string, listening for a full tone.',
            targetNotes: [
              TargetNote(note: 'D4', displayName: 'D', duration: 4, string: 3, pitchHz: 293.66),
              TargetNote(note: 'D4', displayName: 'D', duration: 4, string: 3, pitchHz: 293.66),
              TargetNote(note: 'D4', displayName: 'D', duration: 4, string: 3, pitchHz: 293.66),
              TargetNote(note: 'D4', displayName: 'D', duration: 4, string: 3, pitchHz: 293.66),
            ],
            bpm: 40,
            requiredPassingScore: 65,
            skillsCovered: ['vl_bow_distribution', 'vl_tone_open_d'],
          ),
        ],
        skillIds: ['vl_bow_hold', 'vl_bow_distribution'],
      ),
    ],
  ),
];

// ─── Bansuri Curriculum ───────────────────────────────────────────────────────

const _bansuriLevels = <Level>[
  Level(
    id: 'bn_l1',
    instrument: InstrumentType.bansuri,
    number: 1,
    title: 'Embouchure & Breath',
    tagline: 'Air is the soul of the Bansuri',
    lessons: [
      Lesson(
        id: 'bn_l1_lesson1',
        title: 'Embouchure & First Tone',
        subtitle: 'Producing your first note',
        description: 'Learn the correct lip placement on the blowing hole to produce a clear, resonant tone.',
        learningOutcomes: ['Embouchure (lip position)', 'Steady airstream', 'Sa (C) tone production'],
        exercises: [
          Exercise(
            id: 'bn_ex_sa',
            title: 'Sa — Sustain Exercise',
            type: 'note_playing',
            description: 'Cover all 6 holes and produce a sustained Sa note for 4 beats.',
            targetNotes: [
              TargetNote(
                note: 'C4',
                displayName: 'Sa',
                duration: 4,
                pitchHz: 261.63,
                holePattern: [true, true, true, true, true, true],
              ),
              TargetNote(
                note: 'C4',
                displayName: 'Sa',
                duration: 4,
                pitchHz: 261.63,
                holePattern: [true, true, true, true, true, true],
              ),
            ],
            bpm: 40,
            requiredPassingScore: 60,
            skillsCovered: ['bn_sa_pitch', 'bn_embouchure'],
            correctiveTip: 'Roll the flute slightly inward or outward to find the sweet spot for maximum resonance.',
          ),
          Exercise(
            id: 'bn_ex_sargam1',
            title: 'Sa-Re-Ga-Ma (Ascending)',
            type: 'note_playing',
            description: 'Play the first four swaras of the middle octave.',
            targetNotes: [
              TargetNote(
                note: 'C4',
                displayName: 'Sa',
                duration: 1,
                holePattern: [true, true, true, true, true, true],
              ),
              TargetNote(
                note: 'D4',
                displayName: 'Re',
                duration: 1,
                holePattern: [false, true, true, true, true, true],
              ),
              TargetNote(
                note: 'E4',
                displayName: 'Ga',
                duration: 1,
                holePattern: [false, false, true, true, true, true],
              ),
              TargetNote(
                note: 'F4',
                displayName: 'Ma',
                duration: 1,
                holePattern: [false, false, false, true, true, true],
              ),
            ],
            bpm: 50,
            requiredPassingScore: 65,
            skillsCovered: ['bn_sa_pitch', 'bn_re_pitch', 'bn_sargam'],
          ),
        ],
        skillIds: ['bn_embouchure', 'bn_sa_pitch'],
      ),
    ],
  ),
];

// ─── Curriculum Data Map ─────────────────────────────────────────────────────

const Map<InstrumentType, List<Level>> curriculumData = {
  InstrumentType.guitar: _guitarLevels,
  InstrumentType.keyboard: _keyboardLevels,
  InstrumentType.violin: _violinLevels,
  InstrumentType.bansuri: _bansuriLevels,
};

const kCurriculumData = curriculumData;

/// Returns the first exercise for a given instrument (fallback/default).
Exercise getDefaultExercise(InstrumentType instrument) {
  final levels = curriculumData[instrument];
  if (levels != null && levels.isNotEmpty) {
    final lessons = levels.first.lessons;
    if (lessons.isNotEmpty && lessons.first.exercises.isNotEmpty) {
      return lessons.first.exercises.first;
    }
  }
  return const Exercise(
    id: 'default_ex',
    title: 'Foundation Practice',
    description: 'Foundational tone test',
    targetNotes: [TargetNote(note: 'C4', duration: 1)],
    requiredPassingScore: 70,
    bpm: 70,
  );
}
