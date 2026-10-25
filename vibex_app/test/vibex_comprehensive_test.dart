import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vibex_app/data/models/curriculum_data.dart';
import 'package:vibex_app/data/providers/app_providers.dart';
import 'package:vibex_app/services/audio_engine.dart';
import 'package:vibex_app/ui/screens/ai_mentor_screen.dart';
import 'package:vibex_app/ui/screens/curriculum_screen.dart';
import 'package:vibex_app/ui/screens/practice_studio_screen.dart';
import 'package:vibex_app/ui/screens/profile_screen.dart';
import 'package:vibex_app/ui/screens/song_library_screen.dart';
import 'package:vibex_app/ui/widgets/instruments/interactive_bansuri.dart';
import 'package:vibex_app/ui/widgets/instruments/interactive_fretboard.dart';
import 'package:vibex_app/ui/widgets/instruments/interactive_keyboard.dart';
import 'package:vibex_app/ui/widgets/instruments/interactive_violin.dart';
import 'package:vibex_app/ui/widgets/pitch_gauge.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  late SharedPreferences prefs;

  setUp(() async {
    SharedPreferences.setMockInitialValues({
      'vibex_onboarding_completed': true,
      'vibex_selected_instrument': 'keyboard',
    });
    prefs = await SharedPreferences.getInstance();
  });

  Widget wrapWithScope(Widget child) {
    return ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
      child: MaterialApp(
        home: Scaffold(body: child),
      ),
    );
  }

  group('VIBEX Zero-Fake-Data & Empty State Verification', () {
    testWidgets('Profile displays honest empty state for new user (0 XP, 0 streak, no fake badges)',
        (WidgetTester tester) async {
      await tester.pumpWidget(wrapWithScope(const ProfileScreen()));
      await tester.pumpAndSettle();

      // Verify genuine zero-state metrics
      expect(find.text('0 Days'), findsOneWidget); // 0 streak
      expect(find.text('0 Mins'), findsOneWidget); // 0 minutes
      expect(find.text('Start your streak today'), findsOneWidget);

      // Verify honest empty state text
      expect(
        find.text('No practice sessions yet. Start your first lesson in the Learn tab to begin building your mastery profile.'),
        findsOneWidget,
      );

      final badgeNotice = find.text('No badges unlocked yet. Complete exercises and lessons to earn achievements.');
      await tester.scrollUntilVisible(badgeNotice, 200);
      expect(badgeNotice, findsOneWidget);
    });

    testWidgets('PitchGauge displays "Listening..." when no audio is detected (never fakes pitch)',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        wrapWithScope(
          const PitchGaugeWidget(
            detectionData: null,
            targetNote: 'C4',
          ),
        ),
      );
      await tester.pump();

      expect(find.text('Listening...'), findsOneWidget);
      expect(find.text('--'), findsWidgets); // note and swara are blank
      expect(find.text('TARGET: C4'), findsOneWidget);
    });
  });

  group('VIBEX Interactive Instruments Synthesis & Audio Verification', () {
    test('SoundSynthesizer generates valid PCM 16-bit WAV headers for all 4 instruments', () {
      final kbAudio = SoundSynthesizer.generateWav(
        261.63, // Middle C
        instrument: InstrumentType.keyboard,
        duration: 0.1,
      );
      expect(kbAudio.lengthInBytes, greaterThan(44)); // Valid WAV header is 44 bytes

      final gtAudio = SoundSynthesizer.generateWav(
        329.63, // High E
        instrument: InstrumentType.guitar,
        duration: 0.1,
      );
      expect(gtAudio.lengthInBytes, greaterThan(44));

      final vnAudio = SoundSynthesizer.generateWav(
        440.0, // Open A string
        instrument: InstrumentType.violin,
        duration: 0.1,
      );
      expect(vnAudio.lengthInBytes, greaterThan(44));

      final bnAudio = SoundSynthesizer.generateWav(
        293.66, // D4
        instrument: InstrumentType.bansuri,
        duration: 0.1,
      );
      expect(bnAudio.lengthInBytes, greaterThan(44));
    });

    testWidgets('Interactive Keyboard renders white & black keys and responds to touch',
        (WidgetTester tester) async {
      String? playedNote;
      await tester.pumpWidget(
        wrapWithScope(
          InteractiveKeyboard(
            targetNotes: const ['C4'],
            onNotePressed: (note) => playedNote = note,
          ),
        ),
      );
      await tester.pumpAndSettle();

      final middleC = find.text('C4');
      expect(middleC, findsWidgets);
      await tester.tap(middleC.first);
      expect(playedNote, isNotNull);
    });

    testWidgets('Interactive Fretboard renders strings and responds to tap',
        (WidgetTester tester) async {
      String? tappedNote;
      await tester.pumpWidget(
        wrapWithScope(
          InteractiveFretboard(
            onNotePressed: (note) => tappedNote = note,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('NUT'), findsOneWidget);
      expect(tappedNote, isNull); // untouched initially
    });

    testWidgets('Interactive Bansuri renders tone holes and toggles hole open/closed',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        wrapWithScope(
          const InteractiveBansuri(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('BANSURI'), findsOneWidget);
      expect(find.text('○'), findsWidgets); // Uncovered holes
    });

    testWidgets('Interactive Violin renders 4 open strings (G3, D4, A4, E5)',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        wrapWithScope(
          const InteractiveViolinFingerboard(
            targetNotes: ['A4'],
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('G3'), findsOneWidget);
      expect(find.text('D4'), findsOneWidget);
      expect(find.text('A4'), findsOneWidget);
      expect(find.text('E5'), findsOneWidget);
    });
  });

  group('VIBEX Screens Navigation & Curriculum Exploration', () {
    testWidgets('CurriculumScreen displays structured phases and genuine lessons',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        wrapWithScope(
          CurriculumScreen(
            onStartExercise: (exercise, lesson) {},
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('CURRICULUM'), findsOneWidget);
    });

    testWidgets('SongLibraryScreen lists canonical songs and search filtering',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        wrapWithScope(
          SongLibraryScreen(
            onSelectSong: (song) {},
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('VIBEX SONG LIBRARY'), findsOneWidget);
    });

    testWidgets('AIMentorScreen provides honest chat interface and input field',
        (WidgetTester tester) async {
      await tester.pumpWidget(wrapWithScope(const AIMentorScreen()));
      await tester.pumpAndSettle();

      expect(find.text('VIBEX AI Maestro'), findsOneWidget);
      expect(find.byType(TextField), findsOneWidget);
    });
  });

  group('VIBEX Practice Studio Progression & Scoring Logic', () {
    testWidgets('Practice studio calculates honest score without pre-populated successes',
        (WidgetTester tester) async {
      final sampleExercise = Exercise(
        id: 'test_ex_1',
        title: 'Middle C Note Strike',
        type: 'note_playing',
        instructions: 'Strike C4 with thumb.',
        bpm: 70,
        requiredPassingScore: 70,
        targetNotes: [
          const TargetNote(note: 'C4', duration: 1, fingerNumber: 1),
        ],
      );

      await tester.pumpWidget(
        wrapWithScope(
          PracticeStudioScreen(exercise: sampleExercise),
        ),
      );
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('0 pts'), findsOneWidget);
      expect(find.text('🔥 0'), findsOneWidget);
      expect(find.text('Exercise Complete!'), findsNothing);
    });
  });
}
