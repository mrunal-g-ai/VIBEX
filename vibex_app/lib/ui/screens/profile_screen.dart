import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../data/providers/app_providers.dart';

class ProfileScreen extends ConsumerWidget {
  final VoidCallback? onOpenThemeModal;

  const ProfileScreen({
    super.key,
    this.onOpenThemeModal,
  });

  static const List<Map<String, dynamic>> _allBadges = [
    {
      'id': 'first_note',
      'title': 'First Note',
      'desc': 'Played your first pitch accurately',
      'icon': '🎵',
    },
    {
      'id': 'streak_3',
      'title': 'Dedicated Student',
      'desc': 'Maintained a 3-day practice streak',
      'icon': '🔥',
    },
    {
      'id': 'posture_pro',
      'title': 'Posture Pro',
      'desc': 'Optimal camera wrist alignment score',
      'icon': '📷',
    },
    {
      'id': 'scale_master',
      'title': 'Scale Master',
      'desc': 'Complete major scale drill without misses',
      'icon': '⚡',
    },
    {
      'id': 'multi_instrument',
      'title': 'Maestro Polymath',
      'desc': 'Practice 2 or more instruments in VIBEX',
      'icon': '👑',
    },
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progress = ref.watch(userProgressProvider);
    final theme = ref.watch(themeProvider);
    final currentInstrument = ref.watch(instrumentProvider);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      children: [
        // Profile Avatar & Headline
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
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const LinearGradient(
                    colors: [Color(0xFFE5C07B), Color(0xFFB8914B)],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE5C07B).withAlpha(100),
                      blurRadius: 10,
                    ),
                  ],
                ),
                child: const Center(
                  child: Text('🎓', style: TextStyle(fontSize: 32)),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'VIBEX Scholar',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Focus Instrument: ${currentInstrument.displayName}',
                      style: const TextStyle(
                        color: Color(0xFFE5C07B),
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${progress.completedLessons.length} Lessons Finished • ${progress.completedExercises.length} Drills Mastered',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Key Metrics Row
        Row(
          children: [
            Expanded(
              child: _buildMetricTile(
                '🔥 Streak',
                '${progress.streakDays} Days',
                progress.streakDays == 0 ? 'Start your streak today' : 'Keep practicing daily!',
                const Color(0xFFF59E0B),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricTile(
                '⏱ Practice',
                '${progress.totalPracticeMinutes} Mins',
                'Deliberate practice time',
                const Color(0xFF38BDF8),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildMetricTile(
                '⭐ Total XP',
                '${progress.xp}',
                progress.xp == 0 ? 'Rank: Beginner' : (progress.xp > 2000 ? 'Rank: Virtuoso' : 'Rank: Apprentice'),
                const Color(0xFF10B981),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        if (progress.completedLessons.isEmpty && progress.completedExercises.isEmpty) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF161B26),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF2E384D)),
            ),
            child: Row(
              children: const [
                Icon(Icons.info_outline, color: Color(0xFFE5C07B), size: 20),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'No practice sessions yet. Start your first lesson in the Learn tab to begin building your mastery profile.',
                    style: TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Instrument Mastery Section
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: const Color(0xFF11141D),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'INSTRUMENT MASTERY BREAKDOWN',
                style: TextStyle(
                  color: Color(0xFFE5C07B),
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 14),
              ...InstrumentType.values.map((inst) {
                final mastery = progress.instrumentMastery[inst] ?? 10;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(inst.emoji, style: const TextStyle(fontSize: 16)),
                              const SizedBox(width: 8),
                              Text(
                                inst.displayName,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                          Text(
                            '$mastery%',
                            style: const TextStyle(
                              color: Color(0xFFE5C07B),
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: mastery / 100.0,
                          minHeight: 6,
                          backgroundColor: const Color(0xFF1E2433),
                          valueColor: AlwaysStoppedAnimation(
                            inst == currentInstrument
                                ? const Color(0xFFE5C07B)
                                : const Color(0xFF64748B),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Achievements & Badges
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: const Color(0xFF11141D),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'ACHIEVEMENT TROPHY VAULT',
                style: TextStyle(
                  color: Color(0xFFE5C07B),
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(height: 14),
              if (progress.badges.isEmpty)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F1219),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'No badges unlocked yet. Complete exercises and lessons to earn achievements.',
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                  ),
                ),
              ..._allBadges.map((badge) {
                final isUnlocked = progress.badges.contains(badge['id']);

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isUnlocked ? const Color(0xFF161B26) : const Color(0xFF0F1219),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isUnlocked ? const Color(0xFF10B981).withAlpha(100) : const Color(0xFF1E2433),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isUnlocked ? const Color(0xFF10B981).withAlpha(30) : const Color(0xFF1E2433),
                        ),
                        child: Center(
                          child: Text(badge['icon'] as String, style: const TextStyle(fontSize: 18)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              badge['title'] as String,
                              style: TextStyle(
                                color: isUnlocked ? Colors.white : const Color(0xFF64748B),
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            Text(
                              badge['desc'] as String,
                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                      if (isUnlocked)
                        const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 18),
                    ],
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Theme and Visual Studio
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF11141D),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Active Theme', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                  const SizedBox(height: 2),
                  Text(
                    theme.displayName,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ],
              ),
              OutlinedButton.icon(
                onPressed: onOpenThemeModal,
                icon: const Icon(Icons.palette, size: 16),
                label: const Text('CHANGE THEME'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMetricTile(String label, String value, String sub, Color accentColor) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF11141D),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(color: accentColor, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(sub, style: const TextStyle(color: Color(0xFF64748B), fontSize: 9)),
        ],
      ),
    );
  }
}
