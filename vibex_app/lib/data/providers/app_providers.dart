import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_theme.dart';

// ─── Shared Preferences provider ───────────────────────────────────────────
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('Override in ProviderScope');
});

// ─── Theme provider ─────────────────────────────────────────────────────────
class ThemeNotifier extends Notifier<VibexTheme> {
  static const _key = 'vibex_theme';

  @override
  VibexTheme build() {
    final prefs = ref.read(sharedPreferencesProvider);
    final saved = prefs.getString(_key);
    return _fromString(saved);
  }

  VibexTheme _fromString(String? value) {
    switch (value) {
      case 'zen':
        return VibexTheme.zen;
      case 'arcade':
        return VibexTheme.arcade;
      case 'nordic':
        return VibexTheme.nordic;
      default:
        return VibexTheme.obsidian;
    }
  }

  String _toString(VibexTheme t) => t.name;

  void setTheme(VibexTheme theme) {
    state = theme;
    ref.read(sharedPreferencesProvider).setString(_key, _toString(theme));
  }
}

final themeProvider = NotifierProvider<ThemeNotifier, VibexTheme>(ThemeNotifier.new);

// ─── Instrument provider ────────────────────────────────────────────────────
enum InstrumentType { keyboard, guitar, violin, bansuri }

extension InstrumentTypeExt on InstrumentType {
  String get displayName {
    switch (this) {
      case InstrumentType.keyboard:
        return 'Keyboard';
      case InstrumentType.guitar:
        return 'Guitar';
      case InstrumentType.violin:
        return 'Violin';
      case InstrumentType.bansuri:
        return 'Bansuri';
    }
  }

  String get emoji {
    switch (this) {
      case InstrumentType.keyboard:
        return '🎹';
      case InstrumentType.guitar:
        return '🎸';
      case InstrumentType.violin:
        return '🎻';
      case InstrumentType.bansuri:
        return '🪈';
    }
  }

  String get subtitle {
    switch (this) {
      case InstrumentType.keyboard:
        return 'Piano & Keystroke Audio';
      case InstrumentType.guitar:
        return 'Fretboard & Posture Vision';
      case InstrumentType.violin:
        return 'Bow Angle & Intonation';
      case InstrumentType.bansuri:
        return 'Hole Seal & Breath Embouchure';
    }
  }
}

class InstrumentNotifier extends Notifier<InstrumentType> {
  static const _key = 'vibex_selected_instrument';

  @override
  InstrumentType build() {
    final prefs = ref.read(sharedPreferencesProvider);
    final saved = prefs.getString(_key);
    return _fromString(saved);
  }

  InstrumentType _fromString(String? value) {
    switch (value) {
      case 'keyboard':
        return InstrumentType.keyboard;
      case 'violin':
        return InstrumentType.violin;
      case 'bansuri':
        return InstrumentType.bansuri;
      default:
        return InstrumentType.guitar;
    }
  }

  void setInstrument(InstrumentType instrument) {
    state = instrument;
    ref.read(sharedPreferencesProvider).setString(_key, instrument.name);
  }
}

final instrumentProvider =
    NotifierProvider<InstrumentNotifier, InstrumentType>(InstrumentNotifier.new);

// ─── User Progress provider ─────────────────────────────────────────────────
class UserProgress {
  final int streakDays;
  final int totalPracticeMinutes;
  final List<String> completedLessons;
  final List<String> completedExercises;
  final Map<InstrumentType, int> instrumentMastery;
  final List<String> masteredSkills;
  final List<String> badges;

  const UserProgress({
    this.streakDays = 0,
    this.totalPracticeMinutes = 0,
    this.completedLessons = const [],
    this.completedExercises = const [],
    this.instrumentMastery = const {
      InstrumentType.keyboard: 0,
      InstrumentType.guitar: 0,
      InstrumentType.violin: 0,
      InstrumentType.bansuri: 0,
    },
    this.masteredSkills = const [],
    this.badges = const [],
  });

  int get xp => totalPracticeMinutes * 50;

  UserProgress copyWith({
    int? streakDays,
    int? totalPracticeMinutes,
    List<String>? completedLessons,
    List<String>? completedExercises,
    Map<InstrumentType, int>? instrumentMastery,
    List<String>? masteredSkills,
    List<String>? badges,
  }) {
    return UserProgress(
      streakDays: streakDays ?? this.streakDays,
      totalPracticeMinutes: totalPracticeMinutes ?? this.totalPracticeMinutes,
      completedLessons: completedLessons ?? this.completedLessons,
      completedExercises: completedExercises ?? this.completedExercises,
      instrumentMastery: instrumentMastery ?? this.instrumentMastery,
      masteredSkills: masteredSkills ?? this.masteredSkills,
      badges: badges ?? this.badges,
    );
  }
}

class UserProgressNotifier extends Notifier<UserProgress> {
  @override
  UserProgress build() => const UserProgress();

  void completeExercise(String exerciseId, InstrumentType instrument) {
    final current = state;
    final alreadyDone = current.completedExercises.contains(exerciseId);
    final newExercises = alreadyDone
        ? current.completedExercises
        : [...current.completedExercises, exerciseId];
    final currentMastery = current.instrumentMastery[instrument] ?? 10;
    final updatedMastery = (currentMastery + (alreadyDone ? 2 : 8)).clamp(0, 100);
    final updatedMasteryMap = Map<InstrumentType, int>.from(current.instrumentMastery)
      ..[instrument] = updatedMastery;

    state = current.copyWith(
      completedExercises: newExercises,
      totalPracticeMinutes: current.totalPracticeMinutes + 5,
      instrumentMastery: updatedMasteryMap,
    );
  }
}

final userProgressProvider =
    NotifierProvider<UserProgressNotifier, UserProgress>(UserProgressNotifier.new);

// ─── Onboarding provider ────────────────────────────────────────────────────
final onboardingCompletedProvider = Provider<bool>((ref) {
  final prefs = ref.read(sharedPreferencesProvider);
  return prefs.getBool('vibex_onboarding_completed') ?? false;
});

// ─── Daily goal minutes ─────────────────────────────────────────────────────
final dailyGoalMinutesProvider = StateProvider<int>((ref) {
  final prefs = ref.read(sharedPreferencesProvider);
  return prefs.getInt('vibex_daily_minutes') ?? 15;
});

// ─── Experience / Goal ──────────────────────────────────────────────────────
final userExperienceProvider = StateProvider<String>((ref) {
  final prefs = ref.read(sharedPreferencesProvider);
  return prefs.getString('vibex_experience') ?? 'beginner';
});

final primaryGoalProvider = StateProvider<String>((ref) {
  final prefs = ref.read(sharedPreferencesProvider);
  return prefs.getString('vibex_primary_goal') ?? 'technique';
});
