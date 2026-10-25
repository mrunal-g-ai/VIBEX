import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/curriculum_data.dart';
import '../../data/providers/app_providers.dart';

class CurriculumScreen extends ConsumerWidget {
  final void Function(Exercise exercise, Lesson? lesson) onStartExercise;

  const CurriculumScreen({
    super.key,
    required this.onStartExercise,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentInstrument = ref.watch(instrumentProvider);
    final userProgress = ref.watch(userProgressProvider);
    final levels = kCurriculumData[currentInstrument] ?? [];

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      children: [
        // Instrument curriculum header banner
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1E2433), Color(0xFF131722)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFE5C07B).withAlpha(30),
                  border: Border.all(color: const Color(0xFFE5C07B), width: 2),
                ),
                child: Center(
                  child: Text(
                    currentInstrument.emoji,
                    style: const TextStyle(fontSize: 28),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${currentInstrument.displayName.toUpperCase()} CURRICULUM',
                      style: const TextStyle(
                        color: Color(0xFFE5C07B),
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      currentInstrument.subtitle,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${levels.length} Levels • ${levels.fold(0, (sum, l) => sum + l.lessons.length)} Lessons • Step-by-step masterclass',
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // List of Levels
        ...levels.map((level) {
          return _buildLevelSection(context, level, userProgress);
        }),
      ],
    );
  }

  Widget _buildLevelSection(BuildContext context, Level level, UserProgress progress) {
    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1219),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Material(
        color: Colors.transparent,
        child: Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            initiallyExpanded: true,
            tilePadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE5C07B).withAlpha(30),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'LEVEL ${level.levelNumber}',
                    style: const TextStyle(
                      color: Color(0xFFE5C07B),
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    level.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            subtitle: Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                level.description,
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
              ),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: Column(
                  children: level.lessons.map((lesson) {
                    return _buildLessonCard(context, lesson, progress);
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLessonCard(BuildContext context, Lesson lesson, UserProgress progress) {
    final isCompleted = progress.completedLessons.contains(lesson.id);

    return Container(
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161B26),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isCompleted ? const Color(0xFF10B981).withAlpha(80) : const Color(0xFF2E384D),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isCompleted ? Icons.check_circle : Icons.play_circle_outline,
                color: isCompleted ? const Color(0xFF10B981) : const Color(0xFFE5C07B),
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  lesson.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              if (lesson.skillsTrained.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${lesson.skillsTrained.length} Skills',
                    style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            lesson.objective,
            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
          ),
          const SizedBox(height: 12),

          // Exercises list in this lesson
          ...lesson.exercises.map((exercise) {
            final isExDone = progress.completedExercises.contains(exercise.id);

            return Container(
              margin: const EdgeInsets.only(top: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF0F1219),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF1E293B)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              exercise.title,
                              style: const TextStyle(
                                color: Color(0xFFF1F5F9),
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            if (isExDone) ...[
                              const SizedBox(width: 6),
                              const Icon(Icons.check, color: Color(0xFF10B981), size: 14),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${exercise.bpm ?? 70} BPM • Pass Score: ${exercise.requiredPassingScore}% • ${exercise.targetNotes.length} Notes',
                          style: const TextStyle(
                            color: Color(0xFF64748B),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => onStartExercise(exercise, lesson),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE5C07B),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      minimumSize: Size.zero,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.play_arrow, size: 16),
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
