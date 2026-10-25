import '../../data/providers/app_providers.dart';

/// VIBEX Song Library — Dart port of src/data/songs.ts

class SongSection {
  final String id;
  final String name;
  final int startBeat;
  final int endBeat;
  final List<SongNote> notes;

  const SongSection({
    required this.id,
    required this.name,
    required this.startBeat,
    required this.endBeat,
    required this.notes,
  });
}

class SongNote {
  final String note;
  final String? displayName;
  final double duration;
  final int? startTime;
  final int? fret;
  final int? string;

  const SongNote({
    required this.note,
    this.displayName,
    this.duration = 1.0,
    this.startTime,
    this.fret,
    this.string,
  });
}

class Song {
  final String id;
  final String title;
  final InstrumentType instrument;
  final String difficulty;
  final String genre;
  final String key;
  final int tempo;
  final int durationSec;
  final String description;
  final List<String> coverGradientColors;
  final List<SongSection> sections;
  final List<String> skillsTrained;

  const Song({
    required this.id,
    required this.title,
    required this.instrument,
    required this.difficulty,
    required this.genre,
    required this.key,
    required this.tempo,
    required this.durationSec,
    required this.description,
    required this.coverGradientColors,
    required this.sections,
    required this.skillsTrained,
  });
}

// ─── Guitar Songs ─────────────────────────────────────────────────────────────

const _guitarSongs = [
  Song(
    id: 'gt_song_smoke',
    title: 'Smoke on the Water — Riff',
    instrument: InstrumentType.guitar,
    difficulty: 'Beginner',
    genre: 'Rock',
    key: 'G minor',
    tempo: 112,
    durationSec: 45,
    description: 'The iconic Deep Purple riff. Three notes, two strings — perfect for absolute beginners.',
    coverGradientColors: ['#7C3AED', '#DB2777'],
    sections: [
      SongSection(
        id: 'main_riff',
        name: 'Main Riff',
        startBeat: 0,
        endBeat: 8,
        notes: [
          SongNote(note: 'G3', duration: 0.5, startTime: 0, fret: 5, string: 4),
          SongNote(note: 'Bb3', duration: 0.5, startTime: 1, fret: 8, string: 4),
          SongNote(note: 'C4', duration: 1, startTime: 2, fret: 10, string: 4),
          SongNote(note: 'G3', duration: 0.5, startTime: 4, fret: 5, string: 4),
          SongNote(note: 'Bb3', duration: 0.5, startTime: 5, fret: 8, string: 4),
          SongNote(note: 'Db4', duration: 0.25, startTime: 6, fret: 11, string: 4),
          SongNote(note: 'C4', duration: 1, startTime: 7, fret: 10, string: 4),
        ],
      ),
    ],
    skillsTrained: ['single_string_melodies', 'gt_string_4', 'basic_rhythm'],
  ),
  Song(
    id: 'gt_song_jingle',
    title: 'Jingle Bells — Melody',
    instrument: InstrumentType.guitar,
    difficulty: 'Beginner',
    genre: 'Folk / Seasonal',
    key: 'G Major',
    tempo: 120,
    durationSec: 60,
    description: 'The festive classic adapted for single-string guitar melody practice.',
    coverGradientColors: ['#16A34A', '#DC2626'],
    sections: [
      SongSection(
        id: 'verse',
        name: 'Verse',
        startBeat: 0,
        endBeat: 16,
        notes: [
          SongNote(note: 'E4', duration: 0.5, startTime: 0, fret: 0, string: 1),
          SongNote(note: 'E4', duration: 0.5, startTime: 1, fret: 0, string: 1),
          SongNote(note: 'E4', duration: 1, startTime: 2, fret: 0, string: 1),
          SongNote(note: 'E4', duration: 0.5, startTime: 4, fret: 0, string: 1),
          SongNote(note: 'E4', duration: 0.5, startTime: 5, fret: 0, string: 1),
          SongNote(note: 'E4', duration: 1, startTime: 6, fret: 0, string: 1),
          SongNote(note: 'E4', duration: 0.5, startTime: 8, fret: 0, string: 1),
          SongNote(note: 'G4', duration: 0.5, startTime: 9, fret: 3, string: 1),
          SongNote(note: 'C4', duration: 0.5, startTime: 10, fret: 1, string: 2),
          SongNote(note: 'D4', duration: 0.25, startTime: 11, fret: 3, string: 2),
          SongNote(note: 'E4', duration: 2, startTime: 12, fret: 0, string: 1),
        ],
      ),
    ],
    skillsTrained: ['single_string_melodies', 'melody_reading', 'timing'],
  ),
  Song(
    id: 'gt_song_house',
    title: 'House of the Rising Sun — Arpeggio',
    instrument: InstrumentType.guitar,
    difficulty: 'Intermediate',
    genre: 'Blues / Folk',
    key: 'A minor',
    tempo: 98,
    durationSec: 90,
    description: 'The Animals\' 6/8 arpeggio pattern over Am-C-D-F-Am. Beautiful fingerpicking.',
    coverGradientColors: ['#EA580C', '#B45309'],
    sections: [
      SongSection(
        id: 'intro_arpeggio',
        name: 'Am-C Arpeggio',
        startBeat: 0,
        endBeat: 12,
        notes: [
          SongNote(note: 'A2', duration: 0.33, startTime: 0, fret: 0, string: 5),
          SongNote(note: 'E3', duration: 0.33, startTime: 1, fret: 2, string: 4),
          SongNote(note: 'A3', duration: 0.33, startTime: 2, fret: 2, string: 3),
          SongNote(note: 'C4', duration: 0.33, startTime: 3, fret: 1, string: 2),
          SongNote(note: 'E4', duration: 0.33, startTime: 4, fret: 0, string: 1),
          SongNote(note: 'C4', duration: 0.33, startTime: 5, fret: 1, string: 2),
        ],
      ),
    ],
    skillsTrained: ['fingerpicking', 'arpeggio', 'chord_Am', 'chord_C'],
  ),
];

// ─── Keyboard Songs ─────────────────────────────────────────────────────────

const _keyboardSongs = [
  Song(
    id: 'kb_song_ode',
    title: 'Ode to Joy — Melody',
    instrument: InstrumentType.keyboard,
    difficulty: 'Beginner',
    genre: 'Classical',
    key: 'C Major',
    tempo: 104,
    durationSec: 60,
    description: 'Beethoven\'s iconic melody using only right-hand fingers 3-4-5 in the five-finger position.',
    coverGradientColors: ['#1D4ED8', '#7C3AED'],
    sections: [
      SongSection(
        id: 'theme',
        name: 'Main Theme',
        startBeat: 0,
        endBeat: 16,
        notes: [
          SongNote(note: 'E4', duration: 1, startTime: 0),
          SongNote(note: 'E4', duration: 1, startTime: 1),
          SongNote(note: 'F4', duration: 1, startTime: 2),
          SongNote(note: 'G4', duration: 1, startTime: 3),
          SongNote(note: 'G4', duration: 1, startTime: 4),
          SongNote(note: 'F4', duration: 1, startTime: 5),
          SongNote(note: 'E4', duration: 1, startTime: 6),
          SongNote(note: 'D4', duration: 1, startTime: 7),
          SongNote(note: 'C4', duration: 1, startTime: 8),
          SongNote(note: 'C4', duration: 1, startTime: 9),
          SongNote(note: 'D4', duration: 1, startTime: 10),
          SongNote(note: 'E4', duration: 1, startTime: 11),
          SongNote(note: 'E4', duration: 2, startTime: 12),
          SongNote(note: 'D4', duration: 2, startTime: 14),
        ],
      ),
    ],
    skillsTrained: ['melody_reading', 'five_finger_position', 'legato'],
  ),
  Song(
    id: 'kb_song_fur',
    title: 'Für Elise — Opening Theme',
    instrument: InstrumentType.keyboard,
    difficulty: 'Elementary',
    genre: 'Classical',
    key: 'A minor',
    tempo: 84,
    durationSec: 75,
    description: 'Beethoven\'s most beloved piano piece — the iconic alternating motif that every pianist learns.',
    coverGradientColors: ['#0F766E', '#0EA5E9'],
    sections: [
      SongSection(
        id: 'motif',
        name: 'Opening Motif',
        startBeat: 0,
        endBeat: 8,
        notes: [
          SongNote(note: 'E5', duration: 0.25, startTime: 0),
          SongNote(note: 'Eb5', duration: 0.25, startTime: 1),
          SongNote(note: 'E5', duration: 0.25, startTime: 2),
          SongNote(note: 'Eb5', duration: 0.25, startTime: 3),
          SongNote(note: 'E5', duration: 0.25, startTime: 4),
          SongNote(note: 'B4', duration: 0.25, startTime: 5),
          SongNote(note: 'D5', duration: 0.25, startTime: 6),
          SongNote(note: 'C5', duration: 0.25, startTime: 7),
          SongNote(note: 'A4', duration: 1, startTime: 8),
        ],
      ),
    ],
    skillsTrained: ['alternating_motif', 'smooth_transitions', 'dynamics'],
  ),
];

// ─── Violin Songs ─────────────────────────────────────────────────────────────

const _violinSongs = [
  Song(
    id: 'vl_song_twinkle',
    title: 'Twinkle Twinkle — Suzuki Variation',
    instrument: InstrumentType.violin,
    difficulty: 'Beginner',
    genre: 'Classical / Folk',
    key: 'A Major',
    tempo: 96,
    durationSec: 55,
    description: 'The first Suzuki method piece. A milestone in every violinist\'s journey.',
    coverGradientColors: ['#B45309', '#D97706'],
    sections: [
      SongSection(
        id: 'theme',
        name: 'Main Theme',
        startBeat: 0,
        endBeat: 16,
        notes: [
          SongNote(note: 'A4', duration: 1, startTime: 0, string: 1, fret: 0),
          SongNote(note: 'A4', duration: 1, startTime: 1, string: 1, fret: 0),
          SongNote(note: 'E5', duration: 1, startTime: 2, string: 1, fret: 4),
          SongNote(note: 'E5', duration: 1, startTime: 3, string: 1, fret: 4),
          SongNote(note: 'F#5', duration: 1, startTime: 4, string: 1, fret: 2),
          SongNote(note: 'F#5', duration: 1, startTime: 5, string: 1, fret: 2),
          SongNote(note: 'E5', duration: 2, startTime: 6, string: 1, fret: 4),
        ],
      ),
    ],
    skillsTrained: ['open_strings', 'first_finger', 'bow_distribution'],
  ),
];

// ─── Bansuri Songs ─────────────────────────────────────────────────────────────

const _bansuriSongs = [
  Song(
    id: 'bn_song_raga_yaman',
    title: 'Yaman Aaroha-Avaroha',
    instrument: InstrumentType.bansuri,
    difficulty: 'Beginner',
    genre: 'Indian Classical',
    key: 'G (Teevra Ma)',
    tempo: 50,
    durationSec: 60,
    description: 'The ascending and descending scale of Raga Yaman — the first raag for North Indian classical.',
    coverGradientColors: ['#4F46E5', '#7C3AED'],
    sections: [
      SongSection(
        id: 'aaroha',
        name: 'Aaroha (Ascending)',
        startBeat: 0,
        endBeat: 8,
        notes: [
          SongNote(note: 'C4', displayName: 'Sa', duration: 1, startTime: 0),
          SongNote(note: 'D4', displayName: 'Re', duration: 1, startTime: 1),
          SongNote(note: 'E4', displayName: 'Ga', duration: 1, startTime: 2),
          SongNote(note: 'F#4', displayName: 'Ma (Teevra)', duration: 1, startTime: 3),
          SongNote(note: 'G4', displayName: 'Pa', duration: 1, startTime: 4),
          SongNote(note: 'A4', displayName: 'Dha', duration: 1, startTime: 5),
          SongNote(note: 'B4', displayName: 'Ni', duration: 1, startTime: 6),
          SongNote(note: 'C5', displayName: "Sa'", duration: 2, startTime: 7),
        ],
      ),
    ],
    skillsTrained: ['bn_sargam', 'bn_hole_coverage', 'bn_breath_control'],
  ),
];

// ─── Song Data Map ─────────────────────────────────────────────────────────

const Map<InstrumentType, List<Song>> songsData = {
  InstrumentType.guitar: _guitarSongs,
  InstrumentType.keyboard: _keyboardSongs,
  InstrumentType.violin: _violinSongs,
  InstrumentType.bansuri: _bansuriSongs,
};

List<Song> getSongsForInstrument(InstrumentType instrument) {
  return songsData[instrument] ?? [];
}

List<Song> getAllSongs() {
  return songsData.values.expand((s) => s).toList();
}

List<Song> get kSongsData => getAllSongs();
