import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/curriculum_data.dart';
import '../../data/models/songs_data.dart';
import '../../data/providers/app_providers.dart';
import '../../services/audio_engine.dart';
import 'ai_mentor_screen.dart';
import 'curriculum_screen.dart';
import 'onboarding_modal.dart';
import 'practice_studio_screen.dart';
import 'profile_screen.dart';
import 'quick_start_dialog.dart';
import 'song_arena_screen.dart';
import 'song_library_screen.dart';
import 'theme_selector_sheet.dart';

class HomeShell extends ConsumerStatefulWidget {
  const HomeShell({super.key});

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  // 0: Learn, 1: Song Library, 2: Interactive Practice, 3: Song Arena, 4: AI Mentor, 5: Progress
  int _currentTabIndex = 0;

  Exercise? _activeExercise;
  Lesson? _activeLesson;
  Song? _activeSong;

  @override
  void initState() {
    super.initState();
    _initDefaults();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final isOnboarded = ref.read(onboardingCompletedProvider);
      if (!isOnboarded) {
        _showOnboardingModal();
      }
    });
  }

  void _initDefaults() {
    final instrument = ref.read(instrumentProvider);
    final levels = kCurriculumData[instrument];
    if (levels != null &&
        levels.isNotEmpty &&
        levels.first.lessons.isNotEmpty &&
        levels.first.lessons.first.exercises.isNotEmpty) {
      _activeLesson = levels.first.lessons.first;
      _activeExercise = _activeLesson!.exercises.first;
    }
    final songs = kSongsData.where((s) => s.instrument == instrument).toList();
    if (songs.isNotEmpty) {
      _activeSong = songs.first;
    }
  }

  void _showOnboardingModal() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => OnboardingModal(
        onFinished: () {
          Navigator.of(context).pop();
          _initDefaults();
          _showQuickStartModal();
        },
      ),
    );
  }

  void _showQuickStartModal() {
    final instrument = ref.read(instrumentProvider);
    showDialog(
      context: context,
      builder: (context) => QuickStartDialog(
        instrument: instrument,
        dailyMinutes: 15,
        experience: 'Beginner',
        primaryGoal: 'technique',
        onStartFirstExercise: (exercise, lesson) {
          Navigator.of(context).pop();
          _startExercise(exercise, lesson);
        },
        onExploreCurriculum: () {
          Navigator.of(context).pop();
          setState(() {
            _currentTabIndex = 0;
          });
        },
      ),
    );
  }

  void _openThemeSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => const ThemeSelectorSheet(),
    );
  }

  void _startExercise(Exercise exercise, Lesson? lesson) {
    setState(() {
      _activeExercise = exercise;
      _activeLesson = lesson;
      _currentTabIndex = 2; // Interactive Practice tab
    });
  }

  void _selectSong(Song song) {
    setState(() {
      _activeSong = song;
      _currentTabIndex = 3; // Song Performance Arena tab
    });
  }

  @override
  Widget build(BuildContext context) {
    final currentInstrument = ref.watch(instrumentProvider);
    final currentTheme = ref.watch(themeProvider);
    final userProgress = ref.watch(userProgressProvider);
    final colors = currentTheme.colors;

    final exercise = _activeExercise ??
        (kCurriculumData[currentInstrument]?.firstOrNull?.lessons.firstOrNull?.exercises.firstOrNull ??
            const Exercise(
              id: 'fallback_ex',
              title: 'Tone & Pitch Drill',
              targetNotes: [
                TargetNote(note: 'C4'),
                TargetNote(note: 'D4'),
                TargetNote(note: 'E4'),
              ],
            ));

    final song = _activeSong ??
        (kSongsData.firstWhere(
          (s) => s.instrument == currentInstrument,
          orElse: () => kSongsData.first,
        ));

    final totalXp = userProgress.totalPracticeMinutes * 50 + 1200;

    return Scaffold(
      backgroundColor: colors.bgMain,
      body: SafeArea(
        child: Column(
          children: [
            // Sticky Top Header matching React App.tsx
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: colors.bgMain.withAlpha(245),
                border: Border(bottom: BorderSide(color: colors.borderSubtle)),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    // Brand Heading: VIBEX (Instrument Serif italic)
                    Text(
                      'VIBEX',
                      style: GoogleFonts.instrumentSerif(
                        color: colors.accentPrimary,
                        fontSize: 30,
                        fontStyle: FontStyle.italic,
                        fontWeight: FontWeight.normal,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Container(
                      width: 1,
                      height: 22,
                      color: colors.borderSubtle,
                    ),
                    const SizedBox(width: 14),

                    // Instrument Selection Pill Bar
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: colors.bgCardElevated,
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: colors.borderSubtle),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: InstrumentType.values.map((inst) {
                          final isSelected = inst == currentInstrument;
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 2),
                            child: InkWell(
                              onTap: () {
                                ref.read(instrumentProvider.notifier).setInstrument(inst);
                                _initDefaults();
                              },
                              borderRadius: BorderRadius.circular(100),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? colors.accentPrimary
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(100),
                                  boxShadow: isSelected
                                      ? [
                                          BoxShadow(
                                            color: colors.accentPrimary.withAlpha(50),
                                            blurRadius: 8,
                                            offset: const Offset(0, 2),
                                          )
                                        ]
                                      : null,
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(inst.emoji, style: const TextStyle(fontSize: 13)),
                                    const SizedBox(width: 6),
                                    Text(
                                      inst.name.toUpperCase(),
                                      style: TextStyle(
                                        color: isSelected
                                            ? (currentTheme == VibexTheme.zen ? Colors.white : Colors.black)
                                            : colors.textMuted,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 11,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),

                    const SizedBox(width: 16),

                    // Top Action Controls: Theme Studio Button
                    InkWell(
                      onTap: _openThemeSheet,
                      borderRadius: BorderRadius.circular(100),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: colors.accentPrimary.withAlpha(25),
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(color: colors.accentPrimary.withAlpha(60)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.palette_outlined, size: 14, color: colors.accentPrimary),
                            const SizedBox(width: 6),
                            Text(
                              'Theme: ${currentTheme.displayName.split(" ")[0]}',
                              style: TextStyle(
                                color: colors.accentPrimary,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(width: 6),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: currentTheme.paletteColors.map((c) {
                                return Container(
                                  width: 8,
                                  height: 8,
                                  margin: const EdgeInsets.only(left: 2),
                                  decoration: BoxDecoration(
                                    color: c,
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.black.withAlpha(80), width: 0.8),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(width: 8),

                    // Quick Start Plan Button
                    InkWell(
                      onTap: _showQuickStartModal,
                      borderRadius: BorderRadius.circular(100),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: colors.bgCard,
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(color: colors.borderSubtle),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.explore_outlined, size: 14, color: colors.accentPrimary),
                            const SizedBox(width: 5),
                            Text(
                              'Quick Start Plan',
                              style: TextStyle(color: colors.textPrimary, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(width: 8),

                    // Setup button
                    InkWell(
                      onTap: _showOnboardingModal,
                      borderRadius: BorderRadius.circular(100),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: colors.bgCard,
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(color: colors.borderSubtle),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.tune_rounded, size: 14, color: colors.textMuted),
                            const SizedBox(width: 5),
                            Text(
                              'Setup (15m/d)',
                              style: TextStyle(color: colors.textPrimary, fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(width: 8),

                    // Audio Test Button
                    IconButton(
                      icon: Icon(Icons.volume_up_rounded, size: 18, color: colors.accentPrimary),
                      tooltip: 'Test Sound Engine',
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                      style: IconButton.styleFrom(
                        backgroundColor: colors.bgCard,
                        side: BorderSide(color: colors.borderSubtle),
                      ),
                      onPressed: () {
                        audioEngine.playNote('C4', instrument: currentInstrument);
                      },
                    ),

                    const SizedBox(width: 8),
                    Container(width: 1, height: 20, color: colors.borderSubtle),
                    const SizedBox(width: 8),

                    // Streak & XP Telemetry
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          '${userProgress.streakDays}d Streak',
                          style: TextStyle(
                            color: colors.accentPrimary,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          '$totalXp XP',
                          style: TextStyle(
                            color: colors.textPrimary,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 8),

                    // VX Gradient Circle Avatar
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          colors: [colors.accentPrimary, colors.accentSecondary],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: colors.accentPrimary.withAlpha(50),
                            blurRadius: 6,
                          ),
                        ],
                      ),
                      child: Center(
                        child: Text(
                          'VX',
                          style: TextStyle(
                            color: currentTheme == VibexTheme.zen ? Colors.white : Colors.black,
                            fontWeight: FontWeight.w900,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Top Navigation Tabs matching React (BookOpen, Library, Target, Music2, Sparkles, Award)
            Container(
              margin: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: colors.bgCard,
                borderRadius: BorderRadius.circular(100),
                border: Border.all(color: colors.borderSubtle),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(currentTheme.colors.isDark ? 80 : 15),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildNavTab(0, '1. 12-Lesson Path', Icons.menu_book_rounded, colors),
                    _buildNavTab(1, '2. Song Library', Icons.library_music_rounded, colors),
                    _buildNavTab(2, '3. Interactive Practice', Icons.gps_fixed_rounded, colors),
                    _buildNavTab(3, '4. Song Performance', Icons.music_note_rounded, colors),
                    _buildNavTab(4, '5. AI Mentor', Icons.auto_awesome_rounded, colors),
                    _buildNavTab(5, '6. Stats & Badges', Icons.military_tech_rounded, colors),
                  ],
                ),
              ),
            ),

            // Main Dynamic Viewport
            Expanded(
              child: IndexedStack(
                index: _currentTabIndex,
                children: [
                  // Tab 0: Curriculum
                  CurriculumScreen(onStartExercise: _startExercise),

                  // Tab 1: Song Library
                  SongLibraryScreen(onSelectSong: _selectSong),

                  // Tab 2: Practice Studio
                  PracticeStudioScreen(
                    exercise: exercise,
                    lesson: _activeLesson,
                    onBackToCurriculum: () => setState(() => _currentTabIndex = 0),
                  ),

                  // Tab 3: Song Arena
                  SongArenaScreen(
                    song: song,
                    onBackToLibrary: () => setState(() => _currentTabIndex = 1),
                  ),

                  // Tab 4: AI Maestro Mentor
                  AIMentorScreen(
                    onPracticeGeneratedExercise: (drill) {
                      _startExercise(drill, null);
                    },
                  ),

                  // Tab 5: User Stats & Badges
                  ProfileScreen(onOpenThemeModal: _openThemeSheet),
                ],
              ),
            ),

            // Adaptive Footer matching React
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: colors.bgMain,
                border: Border(top: BorderSide(color: colors.borderSubtle)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Wrap(
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      Text('KEYBOARD (PIANO)', style: TextStyle(color: colors.accentPrimary, fontSize: 9.5, fontWeight: FontWeight.w800, letterSpacing: 1.1)),
                      Text('•', style: TextStyle(color: colors.accentPrimary, fontSize: 9.5)),
                      Text('GUITAR (ACOUSTIC)', style: TextStyle(color: colors.accentPrimary, fontSize: 9.5, fontWeight: FontWeight.w800, letterSpacing: 1.1)),
                      Text('•', style: TextStyle(color: colors.accentPrimary, fontSize: 9.5)),
                      Text('VIOLIN (BAROQUE & MODERN)', style: TextStyle(color: colors.accentPrimary, fontSize: 9.5, fontWeight: FontWeight.w800, letterSpacing: 1.1)),
                      Text('•', style: TextStyle(color: colors.accentPrimary, fontSize: 9.5)),
                      Text('BANSURI (INDIAN CLASSICAL)', style: TextStyle(color: colors.accentPrimary, fontSize: 9.5, fontWeight: FontWeight.w800, letterSpacing: 1.1)),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'VIBEX – AI Music Teacher • Computer Vision Posture Feedback • Real-time Intonation Audio Engine',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: colors.textMuted,
                      fontSize: 10.5,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavTab(int index, String label, IconData icon, VibexColorScheme colors) {
    final isActive = _currentTabIndex == index;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 2),
      child: InkWell(
        onTap: () => setState(() => _currentTabIndex = index),
        borderRadius: BorderRadius.circular(100),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: isActive ? colors.accentPrimary : Colors.transparent,
            borderRadius: BorderRadius.circular(100),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: colors.accentPrimary.withAlpha(60),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    )
                  ]
                : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 14,
                color: isActive
                    ? (ref.read(themeProvider) == VibexTheme.zen ? Colors.white : Colors.black)
                    : colors.textMuted,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  color: isActive
                      ? (ref.read(themeProvider) == VibexTheme.zen ? Colors.white : Colors.black)
                      : colors.textMuted,
                  fontSize: 11,
                  fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
