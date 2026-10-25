import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/curriculum_data.dart';
import '../../data/providers/app_providers.dart';
import '../widgets/hand_finger_guide.dart';
import '../widgets/technique_demo.dart';

class CurriculumScreen extends ConsumerStatefulWidget {
  final void Function(Exercise exercise, Lesson? lesson) onStartExercise;

  const CurriculumScreen({
    super.key,
    required this.onStartExercise,
  });

  @override
  ConsumerState<CurriculumScreen> createState() => _CurriculumScreenState();
}

class _CurriculumScreenState extends ConsumerState<CurriculumScreen> {
  int _selectedLevelIndex = 0;
  int _selectedLessonIndex = 0;

  @override
  Widget build(BuildContext context) {
    final currentInstrument = ref.watch(instrumentProvider);
    final userProgress = ref.watch(userProgressProvider);
    final currentTheme = ref.watch(themeProvider);
    final colors = currentTheme.colors;

    final levels = kCurriculumData[currentInstrument] ?? [];
    if (levels.isEmpty) {
      return const Center(child: Text('No curriculum available for this instrument.'));
    }

    final safeLevelIndex = _selectedLevelIndex.clamp(0, levels.length - 1);
    final currentLevel = levels[safeLevelIndex];

    final lessons = currentLevel.lessons;
    final safeLessonIndex = _selectedLessonIndex.clamp(0, lessons.isEmpty ? 0 : lessons.length - 1);
    final currentLesson = lessons.isNotEmpty ? lessons[safeLessonIndex] : null;

    final totalLessons = levels.fold<int>(0, (sum, l) => sum + l.lessons.length);

    return LayoutBuilder(
      builder: (context, constraints) {
        final isWideScreen = constraints.maxWidth >= 900;

        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top Header Banner matching React LearnCurriculumView.tsx
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [colors.bgCard, colors.bgCardElevated, colors.bgMain],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: colors.borderSubtle),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(currentTheme.colors.isDark ? 100 : 20),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 500),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            spacing: 8,
                            runSpacing: 4,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: colors.accentPrimary.withAlpha(35),
                                  borderRadius: BorderRadius.circular(100),
                                  border: Border.all(color: colors.accentPrimary.withAlpha(70)),
                                ),
                                child: Text(
                                  '${currentInstrument.displayName.toUpperCase()} CURRICULUM',
                                  style: TextStyle(
                                    color: colors.accentPrimary,
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                              ),
                              Text(
                                '${levels.length} Structured Levels • $totalLessons Master Lessons',
                                style: TextStyle(
                                  color: colors.textMuted,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          RichText(
                            text: TextSpan(
                              style: TextStyle(
                                color: colors.textPrimary,
                                fontSize: 26,
                                fontWeight: FontWeight.w300,
                              ),
                              children: [
                                TextSpan(
                                  text: '${currentInstrument.displayName} ',
                                  style: GoogleFonts.instrumentSerif(
                                    fontStyle: FontStyle.italic,
                                    fontSize: 28,
                                    color: colors.textPrimary,
                                  ),
                                ),
                                TextSpan(
                                  text: 'Mastery Journey',
                                  style: GoogleFonts.instrumentSerif(
                                    fontStyle: FontStyle.italic,
                                    fontSize: 28,
                                    color: colors.accentPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Step-by-step curriculum with posture vision validation, intonation accuracy, and structured micro-drills.',
                            style: TextStyle(
                              color: colors.textMuted,
                              fontSize: 12,
                              height: 1.4,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Level Selector Pills
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(currentTheme.colors.isDark ? 90 : 20),
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: colors.borderSubtle),
                      ),
                      child: Wrap(
                        spacing: 4,
                        children: levels.asMap().entries.map((entry) {
                          final idx = entry.key;
                          final lvl = entry.value;
                          final isSelected = idx == safeLevelIndex;
                          final isCompleted = lvl.lessons.every((les) =>
                              les.exercises.every((ex) => userProgress.completedExercises.contains(ex.id)));

                          return InkWell(
                            onTap: () {
                              setState(() {
                                _selectedLevelIndex = idx;
                                _selectedLessonIndex = 0;
                              });
                            },
                            borderRadius: BorderRadius.circular(100),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 180),
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: isSelected ? colors.accentPrimary : Colors.transparent,
                                borderRadius: BorderRadius.circular(100),
                                boxShadow: isSelected
                                    ? [
                                        BoxShadow(
                                          color: colors.accentPrimary.withAlpha(50),
                                          blurRadius: 8,
                                        ),
                                      ]
                                    : null,
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 16,
                                    height: 16,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: isSelected
                                          ? Colors.black
                                          : (isCompleted
                                              ? const Color(0xFF10B981).withAlpha(40)
                                              : colors.borderSubtle),
                                    ),
                                    child: Center(
                                      child: Text(
                                        isCompleted ? '✓' : '${idx + 1}',
                                        style: TextStyle(
                                          color: isSelected
                                              ? colors.accentPrimary
                                              : (isCompleted ? const Color(0xFF10B981) : colors.textMuted),
                                          fontSize: 9,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    'Level ${lvl.levelNumber}',
                                    style: TextStyle(
                                      color: isSelected
                                          ? (currentTheme == VibexTheme.zen ? Colors.white : Colors.black)
                                          : colors.textMuted,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Main Learning Grid (Sidebar + Lesson Detail)
              if (isWideScreen)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Sidebar (Left 340px)
                    SizedBox(
                      width: 340,
                      child: _buildLessonsSidebar(currentLevel, safeLessonIndex, userProgress, colors),
                    ),
                    const SizedBox(width: 20),
                    // Main Lesson Detail View (Right Expanded)
                    Expanded(
                      child: currentLesson != null
                          ? _buildLessonDetail(currentLesson, userProgress, colors)
                          : const SizedBox.shrink(),
                    ),
                  ],
                )
              else ...[
                // Mobile stacked layout
                _buildLessonsSidebar(currentLevel, safeLessonIndex, userProgress, colors),
                const SizedBox(height: 20),
                if (currentLesson != null) _buildLessonDetail(currentLesson, userProgress, colors),
              ],
            ],
          ),
        );
      },
    );
  }

  Widget _buildLessonsSidebar(
    Level currentLevel,
    int activeLessonIdx,
    UserProgress progress,
    VibexColorScheme colors,
  ) {
    final lessons = currentLevel.lessons;
    final totalExercises = currentLevel.lessons.fold<int>(0, (sum, l) => sum + l.exercises.length);
    final completedExercisesInLevel = currentLevel.lessons.fold<int>(
      0,
      (sum, l) => sum + l.exercises.where((ex) => progress.completedExercises.contains(ex.id)).length,
    );
    final levelPercent = totalExercises > 0 ? ((completedExercisesInLevel / totalExercises) * 100).round() : 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colors.bgCard,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            currentLevel.title.toUpperCase(),
            style: TextStyle(
              color: colors.accentPrimary,
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 14),

          // Lessons List
          ...lessons.asMap().entries.map((entry) {
            final idx = entry.key;
            final lesson = entry.value;
            final isSelected = idx == activeLessonIdx;
            final completedCount =
                lesson.exercises.where((ex) => progress.completedExercises.contains(ex.id)).length;
            final isLessonComplete = completedCount == lesson.exercises.length && lesson.exercises.isNotEmpty;

            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              child: InkWell(
                onTap: () {
                  setState(() {
                    _selectedLessonIndex = idx;
                  });
                },
                borderRadius: BorderRadius.circular(16),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isSelected ? colors.bgCardElevated : Colors.transparent,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? colors.accentPrimary.withAlpha(80) : colors.borderSubtle,
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 26,
                        height: 26,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isLessonComplete
                              ? const Color(0xFF10B981).withAlpha(40)
                              : (isSelected ? colors.accentPrimary : colors.borderSubtle),
                        ),
                        child: Center(
                          child: Text(
                            isLessonComplete ? '✓' : '${idx + 1}',
                            style: TextStyle(
                              color: isLessonComplete
                                  ? const Color(0xFF10B981)
                                  : (isSelected ? Colors.black : colors.textMuted),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              lesson.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: colors.textPrimary,
                                fontSize: 12.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              isLessonComplete
                                  ? '100% Mastered'
                                  : '$completedCount/${lesson.exercises.length} Complete',
                              style: TextStyle(
                                color: isLessonComplete ? const Color(0xFF10B981) : colors.textMuted,
                                fontSize: 10.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Icon(
                        Icons.chevron_right_rounded,
                        size: 18,
                        color: isSelected ? colors.accentPrimary : colors.textMuted,
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),

          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),

          // Level Completion Progress Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'LEVEL MASTERY',
                style: TextStyle(color: colors.textMuted, fontSize: 10, fontWeight: FontWeight.w700),
              ),
              Text(
                '$levelPercent%',
                style: TextStyle(color: colors.accentPrimary, fontSize: 11, fontWeight: FontWeight.w900),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: LinearProgressIndicator(
              value: levelPercent / 100,
              minHeight: 6,
              backgroundColor: colors.borderSubtle,
              valueColor: AlwaysStoppedAnimation<Color>(colors.accentPrimary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLessonDetail(
    Lesson lesson,
    UserProgress progress,
    VibexColorScheme colors,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colors.bgCard,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: colors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Current Lesson Header
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 14,
            runSpacing: 12,
            children: [
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 450),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'CURRENT LESSON',
                      style: TextStyle(
                        color: colors.accentPrimary,
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      lesson.title,
                      style: GoogleFonts.instrumentSerif(
                        fontStyle: FontStyle.italic,
                        fontSize: 26,
                        color: colors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      lesson.description.isNotEmpty ? lesson.description : lesson.objective,
                      style: TextStyle(color: colors.textMuted, fontSize: 12.5, height: 1.4),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  if (lesson.exercises.isNotEmpty) {
                    widget.onStartExercise(lesson.exercises.first, lesson);
                  }
                },
                icon: const Icon(Icons.play_arrow_rounded, size: 16),
                label: const Text('START LESSON'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: colors.accentPrimary,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                  textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                ),
              ),
            ],
          ),

          // Learning Outcomes Badges
          if (lesson.skillsTrained.isNotEmpty) ...[
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: lesson.skillsTrained.map((outcome) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: colors.bgCardElevated,
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: colors.borderSubtle),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.gps_fixed_rounded, size: 12, color: colors.accentPrimary),
                      const SizedBox(width: 5),
                      Text(
                        outcome,
                        style: TextStyle(color: colors.textPrimary, fontSize: 11, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],

          const SizedBox(height: 20),
          const Divider(),
          const SizedBox(height: 16),

          // Technique Demonstration Canvas
          TechniqueDemonstrationWidget(
            instrument: ref.watch(instrumentProvider),
            title: 'Anatomy & Kinetic Form Demonstration',
            tip: lesson.objective,
          ),

          const SizedBox(height: 14),

          // Hand Finger Guide
          const HandFingerGuide(
            activeFinger: 1,
            label: 'Instrument Kinetic Finger Guide',
          ),

          const SizedBox(height: 20),

          // Micro-Exercises Section
          Text(
            'LESSON EXERCISES & MICRO-DRILLS',
            style: TextStyle(
              color: colors.accentPrimary,
              fontSize: 10.5,
              fontWeight: FontWeight.w900,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),

          ...lesson.exercises.map((exercise) {
            final isDone = progress.completedExercises.contains(exercise.id);

            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: colors.bgCardElevated,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDone ? const Color(0xFF10B981).withAlpha(60) : colors.borderSubtle,
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isDone ? const Color(0xFF10B981).withAlpha(40) : colors.borderSubtle,
                    ),
                    child: Center(
                      child: Icon(
                        isDone ? Icons.check : Icons.music_note_rounded,
                        size: 16,
                        color: isDone ? const Color(0xFF10B981) : colors.accentPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          exercise.title,
                          style: TextStyle(
                            color: colors.textPrimary,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${exercise.bpm ?? 70} BPM • Passing Score: ${exercise.requiredPassingScore}% • ${exercise.targetNotes.length} Target Notes',
                          style: TextStyle(color: colors.textMuted, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  ElevatedButton(
                    onPressed: () => widget.onStartExercise(exercise, lesson),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colors.accentPrimary,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      minimumSize: Size.zero,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.play_arrow, size: 14),
                        SizedBox(width: 4),
                        Text('PRACTICE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}
