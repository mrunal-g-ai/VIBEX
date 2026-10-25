import 'dart:math' as math;
import 'dart:typed_data';
import 'package:audioplayers/audioplayers.dart';
import '../data/providers/app_providers.dart';

/// Note Pitch and Swara conversion utilities
const List<String> kNoteNames = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

const Map<String, String> kSwaraMap = {
  'C': 'Sa',
  'C#': 're (komal)',
  'D': 'Re (shuddha)',
  'D#': 'ga (komal)',
  'E': 'Ga (shuddha)',
  'F': 'Ma (shuddha)',
  'F#': 'Ma (teevra)',
  'G': 'Pa',
  'G#': 'dha (komal)',
  'A': 'Dha (shuddha)',
  'A#': 'ni (komal)',
  'B': 'Ni (shuddha)',
};

class AudioDetectionData {
  final double pitchHz;
  final String noteName;
  final int octave;
  final int cents;
  final double confidence;
  final double volumeRms;
  final bool isStable;
  final String closestIndianSwara;

  const AudioDetectionData({
    required this.pitchHz,
    required this.noteName,
    required this.octave,
    required this.cents,
    required this.confidence,
    required this.volumeRms,
    required this.isStable,
    required this.closestIndianSwara,
  });
}

double noteToFrequency(String note) {
  var clean = note.trim();
  var octave = 4;

  if (clean.length > 2 && (clean[1] == '#' || clean[1] == 'b')) {
    octave = int.tryParse(clean.substring(2)) ?? 4;
    clean = clean.substring(0, 2);
  } else if (clean.length > 1) {
    octave = int.tryParse(clean.substring(1)) ?? 4;
    clean = clean.substring(0, 1);
  }

  // Handle flat conversions
  if (clean == 'Db') clean = 'C#';
  if (clean == 'Eb') clean = 'D#';
  if (clean == 'Gb') clean = 'F#';
  if (clean == 'Ab') clean = 'G#';
  if (clean == 'Bb') clean = 'A#';

  final noteIndex = kNoteNames.indexOf(clean);
  if (noteIndex == -1) return 440.0;

  final semitonesFromA4 = (noteIndex - 9) + (octave - 4) * 12;
  return 440.0 * math.pow(2.0, semitonesFromA4 / 12.0);
}

AudioDetectionData? frequencyToNoteData(double freq) {
  if (freq < 50 || freq > 4200) return null;

  final noteNumber = 12 * (math.log(freq / 440.0) / math.ln2) + 69;
  final roundedNoteNumber = noteNumber.round();
  final cents = ((noteNumber - roundedNoteNumber) * 100).round();

  final noteIndex = ((roundedNoteNumber % 12) + 12) % 12;
  final octave = (roundedNoteNumber / 12).floor() - 1;
  final baseName = kNoteNames[noteIndex];

  return AudioDetectionData(
    pitchHz: (freq * 10).round() / 10.0,
    noteName: '$baseName$octave',
    octave: octave,
    cents: cents,
    confidence: 0.94,
    volumeRms: 0.65,
    isStable: cents.abs() < 20,
    closestIndianSwara: kSwaraMap[baseName] ?? 'Sa',
  );
}

/// Offline Sound Synthesizer that generates 16-bit PCM WAV audio for notes on the fly
class SoundSynthesizer {
  static final Map<String, Uint8List> _cache = {};

  static Uint8List generateWav(
    double freq, {
    InstrumentType instrument = InstrumentType.keyboard,
    double duration = 0.8,
    int sampleRate = 22050,
  }) {
    final cacheKey = '${freq.round()}_${instrument.name}_$duration';
    if (_cache.containsKey(cacheKey)) {
      return _cache[cacheKey]!;
    }

    final totalSamples = (duration * sampleRate).toInt();
    final byteRate = sampleRate * 2; // 16-bit mono
    final dataSize = totalSamples * 2;
    final totalSize = 36 + dataSize;

    final bytes = BytesBuilder();

    // ─── RIFF Header ──────────────────────────────────────────
    bytes.add('RIFF'.codeUnits);
    bytes.add(_int32ToBytes(totalSize));
    bytes.add('WAVE'.codeUnits);

    // ─── fmt chunk ────────────────────────────────────────────
    bytes.add('fmt '.codeUnits);
    bytes.add(_int32ToBytes(16)); // Chunk size
    bytes.add(_int16ToBytes(1)); // Audio format 1 = PCM
    bytes.add(_int16ToBytes(1)); // Num channels = 1 (mono)
    bytes.add(_int32ToBytes(sampleRate));
    bytes.add(_int32ToBytes(byteRate));
    bytes.add(_int16ToBytes(2)); // Block align = 2
    bytes.add(_int16ToBytes(16)); // Bits per sample = 16

    // ─── data chunk ───────────────────────────────────────────
    bytes.add('data'.codeUnits);
    bytes.add(_int32ToBytes(dataSize));

    // Synthesize samples with instrument-specific timbre
    final pcmData = Int16List(totalSamples);
    final twoPiF = 2.0 * math.pi * freq / sampleRate;

    for (var i = 0; i < totalSamples; i++) {
      final t = i / sampleRate;
      final progress = i / totalSamples;

      // Amplitude envelope
      double env;
      double sample = 0;

      switch (instrument) {
        case InstrumentType.keyboard:
          // Piano: Fast attack, percussive decay + sustain
          env = math.exp(-3.5 * progress);
          sample = 0.6 * math.sin(twoPiF * i) +
              0.25 * math.sin(2 * twoPiF * i) +
              0.15 * math.sin(3 * twoPiF * i);
          break;

        case InstrumentType.guitar:
          // Guitar: Crisp plucked attack + metallic overtone decay
          env = math.exp(-4.2 * progress);
          sample = 0.5 * math.sin(twoPiF * i) +
              0.3 * math.sin(2 * twoPiF * i) +
              0.15 * math.sin(3 * twoPiF * i) +
              0.05 * math.sin(4 * twoPiF * i);
          break;

        case InstrumentType.violin:
          // Violin: Gentle bow attack, rich harmonics, slight vibrato
          final vibrato = 1.0 + 0.015 * math.sin(2 * math.pi * 5.5 * t);
          final attack = (progress < 0.15) ? (progress / 0.15) : 1.0;
          final decay = (progress > 0.75) ? (1.0 - (progress - 0.75) / 0.25) : 1.0;
          env = attack * decay;
          final vPhase = twoPiF * vibrato * i;
          sample = 0.45 * math.sin(vPhase) +
              0.30 * math.sin(2 * vPhase) +
              0.15 * math.sin(3 * vPhase) +
              0.10 * math.sin(4 * vPhase);
          break;

        case InstrumentType.bansuri:
          // Bansuri (Indian Bamboo Flute): Warm breathy tone, strong fundamental, soft attack
          final breath = 0.02 * (math.Random(i).nextDouble() - 0.5);
          final attack = (progress < 0.2) ? (progress / 0.2) : 1.0;
          final decay = (progress > 0.8) ? (1.0 - (progress - 0.8) / 0.2) : 1.0;
          env = attack * decay;
          sample = 0.85 * math.sin(twoPiF * i) +
              0.10 * math.sin(2 * twoPiF * i) +
              0.05 * math.sin(3 * twoPiF * i) +
              breath;
          break;
      }

      final value = (sample * env * 24000.0).clamp(-32768.0, 32767.0).toInt();
      pcmData[i] = value;
    }

    // Convert Int16List to bytes
    final byteData = pcmData.buffer.asUint8List();
    bytes.add(byteData);

    final result = bytes.toBytes();
    _cache[cacheKey] = result;
    return result;
  }

  static List<int> _int16ToBytes(int value) {
    return [value & 0xFF, (value >> 8) & 0xFF];
  }

  static List<int> _int32ToBytes(int value) {
    return [
      value & 0xFF,
      (value >> 8) & 0xFF,
      (value >> 16) & 0xFF,
      (value >> 24) & 0xFF,
    ];
  }
}

/// Singleton Audio Engine to play notes and chords
class AudioEngine {
  static final AudioEngine _instance = AudioEngine._internal();
  factory AudioEngine() => _instance;
  AudioEngine._internal();

  final List<AudioPlayer> _players = [];
  int _playerIndex = 0;

  void init() {
    if (_players.isEmpty) {
      for (var i = 0; i < 6; i++) {
        _players.add(AudioPlayer());
      }
    }
  }

  Future<void> playNote(
    String note, {
    InstrumentType instrument = InstrumentType.keyboard,
    double duration = 0.8,
  }) async {
    try {
      init();
      final freq = noteToFrequency(note);
      final wav = SoundSynthesizer.generateWav(
        freq,
        instrument: instrument,
        duration: duration,
      );

      final player = _players[_playerIndex];
      _playerIndex = (_playerIndex + 1) % _players.length;

      await player.play(BytesSource(wav));
    } catch (e) {
      // Audio playback fallback
    }
  }

  Future<void> playMetronomeTick({bool isAccent = false}) async {
    try {
      init();
      final freq = isAccent ? 1200.0 : 800.0;
      final wav = SoundSynthesizer.generateWav(
        freq,
        instrument: InstrumentType.keyboard,
        duration: 0.08,
      );
      final player = _players[_playerIndex];
      _playerIndex = (_playerIndex + 1) % _players.length;
      await player.play(BytesSource(wav));
    } catch (_) {}
  }
}

final audioEngine = AudioEngine();
