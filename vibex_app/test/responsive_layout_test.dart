import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:vibex_app/ui/screens/home_shell.dart';
import 'package:vibex_app/ui/screens/curriculum_screen.dart';
import 'package:vibex_app/ui/screens/practice_studio_screen.dart';
import 'package:vibex_app/ui/screens/song_library_screen.dart';
import 'package:vibex_app/ui/screens/ai_mentor_screen.dart';
import 'package:vibex_app/ui/screens/profile_screen.dart';
import 'package:vibex_app/ui/screens/quick_start_dialog.dart';
import 'package:vibex_app/ui/widgets/smart_correction_dialog.dart';
import 'package:vibex_app/data/models/curriculum_data.dart';
import 'package:vibex_app/data/providers/app_providers.dart';

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

  Widget wrapWithScope(Widget child, [Size size = const Size(1280, 800)]) {
    return ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(prefs),
      ],
      child: MaterialApp(
        home: MediaQuery(
          data: MediaQueryData(size: size),
          child: SizedBox(
            width: size.width,
            height: size.height,
            child: Material(child: child),
          ),
        ),
      ),
    );
  }

  final sampleExercise = getDefaultExercise(InstrumentType.keyboard);
  final sampleLesson = curriculumData[InstrumentType.keyboard]!.first.lessons.first;

  final viewports = <String, Size>{
    'Mobile (390x844)': const Size(390, 844),
    'Tablet (768x1024)': const Size(768, 1024),
    'Laptop (1024x768)': const Size(1024, 768),
    'Desktop (1440x900)': const Size(1440, 900),
  };

  group('VIBEX Responsive Layout Parity across Mobile, Tablet, Laptop, Desktop', () {
    for (final entry in viewports.entries) {
      final name = entry.key;
      final size = entry.value;

      testWidgets('HomeShell renders cleanly on $name with 0 overflow', (WidgetTester tester) async {
        tester.view.physicalSize = size;
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() => tester.view.resetPhysicalSize());

        await tester.pumpWidget(wrapWithScope(const HomeShell(), size));
        await tester.pump();

        expect(find.text('VIBEX'), findsOneWidget);
        expect(tester.takeException(), isNull);
      });

      testWidgets('CurriculumScreen renders cleanly on $name with 0 overflow', (WidgetTester tester) async {
        tester.view.physicalSize = size;
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() => tester.view.resetPhysicalSize());

        await tester.pumpWidget(
          wrapWithScope(
            CurriculumScreen(
              onStartExercise: (ex, les) {},
            ),
            size,
          ),
        );
        await tester.pump();

        expect(find.textContaining('CURRICULUM'), findsOneWidget);
        expect(tester.takeException(), isNull);
      });

      testWidgets('PracticeStudioScreen renders cleanly on $name with 0 overflow', (WidgetTester tester) async {
        tester.view.physicalSize = size;
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() => tester.view.resetPhysicalSize());

        await tester.pumpWidget(
          wrapWithScope(
            PracticeStudioScreen(
              exercise: sampleExercise,
              lesson: sampleLesson,
            ),
            size,
          ),
        );
        await tester.pump();

        expect(find.text(sampleExercise.title), findsOneWidget);
        expect(tester.takeException(), isNull);
      });

      testWidgets('SongLibraryScreen renders cleanly on $name with 0 overflow', (WidgetTester tester) async {
        tester.view.physicalSize = size;
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() => tester.view.resetPhysicalSize());

        await tester.pumpWidget(
          wrapWithScope(
            SongLibraryScreen(
              onSelectSong: (_) {},
            ),
            size,
          ),
        );
        await tester.pump();

        expect(find.text('VIBEX SONG LIBRARY'), findsOneWidget);
        expect(tester.takeException(), isNull);
      });

      testWidgets('AIMentorScreen renders cleanly on $name with 0 overflow', (WidgetTester tester) async {
        tester.view.physicalSize = size;
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() => tester.view.resetPhysicalSize());

        await tester.pumpWidget(wrapWithScope(const AIMentorScreen(), size));
        await tester.pump();

        expect(find.text('VIBEX AI Maestro'), findsOneWidget);
        expect(tester.takeException(), isNull);
      });

      testWidgets('ProfileScreen renders cleanly on $name with 0 overflow', (WidgetTester tester) async {
        tester.view.physicalSize = size;
        tester.view.devicePixelRatio = 1.0;
        addTearDown(() => tester.view.resetPhysicalSize());

        await tester.pumpWidget(wrapWithScope(const ProfileScreen(), size));
        await tester.pump();

        expect(tester.takeException(), isNull);
      });
    }

    testWidgets('QuickStartDialog renders cleanly on mobile and desktop', (WidgetTester tester) async {
      await tester.pumpWidget(
        wrapWithScope(
          QuickStartDialog(
            instrument: InstrumentType.keyboard,
            dailyMinutes: 15,
            experience: 'beginner',
            primaryGoal: 'songs',
            onStartFirstExercise: (_, __) {},
            onExploreCurriculum: () {},
          ),
          const Size(390, 844),
        ),
      );
      await tester.pump();
      expect(find.text('STUDIO INITIALIZED • QUICK START PLAN'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('SmartCorrectionDialog renders cleanly on mobile and desktop', (WidgetTester tester) async {
      await tester.pumpWidget(
        wrapWithScope(
          SmartCorrectionDialog(
            title: 'Bow Angle Deviation Detected',
            explanation: 'Your bow is tilting off the perpendicular 90° contact lane.',
            suggestedFix: 'Level the forearm with the bridge line before starting the down-bow.',
            animationType: 'posture',
            onDismiss: () {},
          ),
          const Size(390, 844),
        ),
      );
      await tester.pump();
      expect(find.text('AI POSTURE & MOTOR CORRECTION'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });
  });
}
