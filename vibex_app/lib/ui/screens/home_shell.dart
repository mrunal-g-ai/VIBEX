import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/curriculum_data.dart';
import '../../data/models/songs_data.dart';
import '../../data/providers/app_providers.dart';
import 'ai_mentor_screen.dart';
import 'curriculum_screen.dart';
import 'onboarding_modal.dart';
import 'practice_studio_screen.dart';
import 'profile_screen.dart';
import 'song_arena_screen.dart';
import 'song_library_screen.dart';
import 'theme_selector_sheet.dart';

class HomeShell extends ConsumerStatefulWidget {
  const HomeShell({super.key});

  @override
  ConsumerState<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends ConsumerState<HomeShell> {
  int _currentTabIndex = 0;

  Exercise? _activeExercise;
  Lesson? _activeLesson;
  Song? _activeSong;

  @override
  void initState() {
    super.initState();
    // Default initial exercise and song
    _initDefaults();

    // Check if onboarding needs to be shown
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
    if (levels != null && levels.isNotEmpty && levels.first.lessons.isNotEmpty && levels.first.lessons.first.exercises.isNotEmpty) {
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
          setState(() {
            _currentTabIndex = 1; // Direct into practice!
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
      _currentTabIndex = 1; // Practice tab
    });
  }

  void _selectSong(Song song) {
    setState(() {
      _activeSong = song;
      _currentTabIndex = 3; // Arena tab
    });
  }

  @override
  Widget build(BuildContext context) {
    final currentInstrument = ref.watch(instrumentProvider);
    final currentTheme = ref.watch(themeProvider);
    final userProgress = ref.watch(userProgressProvider);
    final colors = currentTheme.colors;

    // Fallback default exercise if not set
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

    // Fallback song
    final song = _activeSong ??
        (kSongsData.firstWhere(
          (s) => s.instrument == currentInstrument,
          orElse: () => kSongsData.first,
        ));

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(68),
        child: Container(
          decoration: BoxDecoration(
            color: colors.bgCard,
            border: Border(bottom: BorderSide(color: colors.borderSubtle)),
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  // Brand Logo
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [colors.accentPrimary, colors.accentSecondary],
                          ),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text(
                          'VIBEX',
                          style: TextStyle(
                            color: Colors.black,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'AI MUSIC LAB',
                            style: TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Color(0xFF10B981),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(width: 16),

                  // Instrument Switcher Dropdown
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
                    decoration: BoxDecoration(
                      color: colors.bgCardElevated,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: colors.borderSubtle),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<InstrumentType>(
                        value: currentInstrument,
                        dropdownColor: colors.bgCardElevated,
                        icon: const Icon(Icons.keyboard_arrow_down, size: 18),
                        style: TextStyle(
                          color: colors.textPrimary,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                        items: InstrumentType.values.map((inst) {
                          return DropdownMenuItem<InstrumentType>(
                            value: inst,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(inst.emoji),
                                const SizedBox(width: 8),
                                Text(inst.displayName),
                              ],
                            ),
                          );
                        }).toList(),
                        onChanged: (newInst) {
                          if (newInst != null) {
                            ref.read(instrumentProvider.notifier).setInstrument(newInst);
                            _initDefaults();
                            setState(() {});
                          }
                        },
                      ),
                    ),
                  ),

                  const Spacer(),

                  // Streak & Minutes Badges
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: colors.bgCardElevated,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: colors.borderSubtle),
                    ),
                    child: Row(
                      children: [
                        const Text('🔥 ', style: TextStyle(fontSize: 12)),
                        Text(
                          '${userProgress.streakDays}d',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '• ${userProgress.totalPracticeMinutes}m',
                          style: TextStyle(color: colors.textMuted, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Theme Studio button
                  IconButton(
                    icon: const Icon(Icons.palette_outlined),
                    tooltip: 'Theme Studio',
                    onPressed: _openThemeSheet,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),

      // Main Content Body indexed by tab
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          // 0: Learn / Curriculum
          CurriculumScreen(onStartExercise: _startExercise),

          // 1: Practice Studio
          PracticeStudioScreen(
            exercise: exercise,
            lesson: _activeLesson,
            onBackToCurriculum: () => setState(() => _currentTabIndex = 0),
          ),

          // 2: Song Library
          SongLibraryScreen(onSelectSong: _selectSong),

          // 3: Performance Arena
          SongArenaScreen(
            song: song,
            onBackToLibrary: () => setState(() => _currentTabIndex = 2),
          ),

          // 4: AI Maestro Mentor Chat
          const AIMentorScreen(),

          // 5: User Profile & Achievements
          ProfileScreen(onOpenThemeModal: _openThemeSheet),
        ],
      ),

      // Bottom Navigation Bar with 6 main tabs
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: colors.borderSubtle)),
        ),
        child: NavigationBar(
          selectedIndex: _currentTabIndex,
          onDestinationSelected: (idx) => setState(() => _currentTabIndex = idx),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.school_outlined),
              selectedIcon: Icon(Icons.school),
              label: 'Learn',
            ),
            NavigationDestination(
              icon: Icon(Icons.fitness_center_outlined),
              selectedIcon: Icon(Icons.fitness_center),
              label: 'Practice',
            ),
            NavigationDestination(
              icon: Icon(Icons.library_music_outlined),
              selectedIcon: Icon(Icons.library_music),
              label: 'Songs',
            ),
            NavigationDestination(
              icon: Icon(Icons.sports_esports_outlined),
              selectedIcon: Icon(Icons.sports_esports),
              label: 'Arena',
            ),
            NavigationDestination(
              icon: Icon(Icons.psychology_outlined),
              selectedIcon: Icon(Icons.psychology),
              label: 'AI Mentor',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
