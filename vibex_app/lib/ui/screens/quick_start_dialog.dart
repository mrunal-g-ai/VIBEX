import 'package:flutter/material.dart';
import '../../data/models/curriculum_data.dart';
import '../../data/providers/app_providers.dart';

class QuickStartDialog extends StatelessWidget {
  final InstrumentType instrument;
  final int dailyMinutes;
  final String experience;
  final String primaryGoal;
  final void Function(Exercise exercise, Lesson? lesson) onStartFirstExercise;
  final VoidCallback onExploreCurriculum;

  const QuickStartDialog({
    super.key,
    required this.instrument,
    required this.dailyMinutes,
    required this.experience,
    required this.primaryGoal,
    required this.onStartFirstExercise,
    required this.onExploreCurriculum,
  });

  String get _goalTitle {
    switch (primaryGoal) {
      case 'songs':
        return 'Play Full Songs & Repertoire';
      case 'technique':
        return 'Master Posture & Ergonomics';
      case 'theory_ear':
        return 'Classical Theory & Ear Training';
      default:
        return 'Mastering Instrument Fundamentals';
    }
  }

  String get _instrumentSpecialty {
    switch (instrument) {
      case InstrumentType.keyboard:
        return 'Audio pitch detection & finger arch keystroke timing';
      case InstrumentType.guitar:
        return 'Computer vision posture, wrist angle & clean fretboard audio';
      case InstrumentType.violin:
        return '90° bow angle vision tracking & continuous fretless intonation';
      case InstrumentType.bansuri:
        return '45° embouchure vision angle & flat finger-pad seal detection';
    }
  }

  @override
  Widget build(BuildContext context) {
    final levels = kCurriculumData[instrument] ?? [];
    final firstLesson = levels.isNotEmpty && levels.first.lessons.isNotEmpty ? levels.first.lessons.first : null;
    final recommendedExercise = firstLesson != null && firstLesson.exercises.isNotEmpty ? firstLesson.exercises.first : null;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 620),
        decoration: BoxDecoration(
          color: const Color(0xFF0F1115),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: const Color(0xFFE5C07B).withAlpha(100), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(200),
              blurRadius: 30,
              spreadRadius: 5,
            ),
            BoxShadow(
              color: const Color(0xFFE5C07B).withAlpha(25),
              blurRadius: 40,
            ),
          ],
        ),
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFE5C07B).withAlpha(35),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFE5C07B).withAlpha(80)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Icon(Icons.auto_awesome, color: Color(0xFFE5C07B), size: 14),
                    SizedBox(width: 6),
                    Text(
                      'STUDIO INITIALIZED • QUICK START PLAN',
                      style: TextStyle(
                        color: Color(0xFFE5C07B),
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Title
              Text(
                'Welcome to your ${instrument.displayName} Journey',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w300,
                  fontFamily: 'serif',
                  fontStyle: FontStyle.italic,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Based on your commitment of $dailyMinutes mins/day and $_goalTitle, here is your customized launchpad.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white.withAlpha(160), fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 20),

              // 3-Card Summary Grid
              Row(
                children: [
                  Expanded(
                    child: _buildMetaCard(
                      icon: instrument.emoji,
                      title: 'INSTRUMENT',
                      value: instrument.displayName,
                      subtitle: _instrumentSpecialty,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildMetaCard(
                      icon: '⏱️',
                      title: 'DAILY COMMITMENT',
                      value: '$dailyMinutes Mins/Day',
                      subtitle: 'Streak compounding habit',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _buildMetaCard(
                icon: '🎯',
                title: 'FOCUS TRACK',
                value: _goalTitle,
                subtitle: 'Structured progression with AI verification',
              ),
              const SizedBox(height: 20),

              // Recommended first lesson card
              if (recommendedExercise != null)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF161922),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: Colors.white.withAlpha(20)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE5C07B).withAlpha(30),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'RECOMMENDED FIRST DRILL',
                              style: TextStyle(
                                color: Color(0xFFE5C07B),
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                          const Spacer(),
                          Text(
                            'Target: ${recommendedExercise.requiredPassingScore}%',
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        recommendedExercise.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        (recommendedExercise.description != null && recommendedExercise.description!.isNotEmpty)
                            ? recommendedExercise.description!
                            : 'Foundational tone test and motor positioning.',
                        style: TextStyle(color: Colors.white.withAlpha(160), fontSize: 12),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 24),

              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onExploreCurriculum,
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.white.withAlpha(30)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      child: const Text(
                        'EXPLORE CURRICULUM',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        if (recommendedExercise != null) {
                          onStartFirstExercise(recommendedExercise, firstLesson);
                        } else {
                          onExploreCurriculum();
                        }
                      },
                      icon: const Icon(Icons.play_arrow_rounded, size: 18),
                      label: const Text(
                        'START FIRST DRILL',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE5C07B),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shadowColor: const Color(0xFFE5C07B).withAlpha(100),
                        elevation: 8,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetaCard({
    required String icon,
    required String title,
    required String value,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withAlpha(80),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withAlpha(15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(icon, style: const TextStyle(fontSize: 14)),
              const SizedBox(width: 6),
              Text(
                title,
                style: const TextStyle(
                  color: Color(0xFFE5C07B),
                  fontSize: 9.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: Colors.white.withAlpha(120), fontSize: 10.5),
          ),
        ],
      ),
    );
  }
}
