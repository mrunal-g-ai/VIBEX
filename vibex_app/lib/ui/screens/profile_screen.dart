import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
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
      'title': 'First Resonant Note',
      'desc': 'Completed your first pitch-perfect exercise',
      'icon': '🎵',
    },
    {
      'id': 'posture_pro',
      'title': 'Flawless Form',
      'desc': 'Maintained 95%+ posture score on vision camera',
      'icon': '🧘',
    },
    {
      'id': 'streak_3',
      'title': 'Consistent Maestro',
      'desc': 'Maintained a 3-day continuous practice habit',
      'icon': '🔥',
    },
    {
      'id': 'raag_scholar',
      'title': 'Raga Pioneer',
      'desc': 'Mastered Sa-Re-Ga-Ma & Raag Bhupali on Bansuri',
      'icon': '🪈',
    },
    {
      'id': 'finger_freedom',
      'title': 'Finger Independence',
      'desc': 'Mastered 5-finger piano pattern with zero hesitation',
      'icon': '🎹',
    },
    {
      'id': 'clean_tone',
      'title': 'Pure Intonation',
      'desc': 'Maintained intonation within ±5 cents across 10 notes',
      'icon': '🎻',
    },
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progress = ref.watch(userProgressProvider);
    final theme = ref.watch(themeProvider);
    final colors = theme.colors;
    final currentInstrument = ref.watch(instrumentProvider);

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      children: [
        // Profile Avatar & Headline matching React UserProfileStats.tsx
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [colors.bgCard, colors.bgCardElevated, colors.bgMain],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Row(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [colors.accentPrimary, colors.accentSecondary],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: colors.accentPrimary.withAlpha(90),
                      blurRadius: 12,
                    ),
                  ],
                ),
                child: Center(
                  child: Text(
                    'VX',
                    style: TextStyle(
                      color: theme == VibexTheme.zen ? Colors.white : Colors.black,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 8,
                      runSpacing: 4,
                      children: [
                        Text(
                          'Musician Profile',
                          style: GoogleFonts.instrumentSerif(
                            fontStyle: FontStyle.italic,
                            fontSize: 24,
                            color: colors.textPrimary,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: colors.accentPrimary.withAlpha(30),
                            borderRadius: BorderRadius.circular(100),
                            border: Border.all(color: colors.accentPrimary.withAlpha(80)),
                          ),
                          child: Text(
                            progress.xp > 2000 ? 'LEVEL 3 VIRTUOSO' : (progress.xp > 500 ? 'LEVEL 2 APPRENTICE' : 'LEVEL 1 NOVICE'),
                            style: TextStyle(
                              color: colors.accentPrimary,
                              fontSize: 9.5,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Focus Instrument: ${currentInstrument.displayName}',
                      style: TextStyle(
                        color: colors.accentPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Practicing actively across 4 instruments with AI computer vision & audio pitch analysis.',
                      style: TextStyle(color: colors.textMuted, fontSize: 11.5, height: 1.3),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Key Metrics: Streak, Practice, XP
        LayoutBuilder(
          builder: (context, constraints) {
            final isNarrow = constraints.maxWidth < 360;
            if (isNarrow) {
              return Column(
                children: [
                  _buildMetricTile(
                    '🔥 Streak',
                    '${progress.streakDays} Days',
                    progress.streakDays == 0 ? 'Start your streak today' : 'Keep practicing daily!',
                    const Color(0xFFF59E0B),
                    colors,
                  ),
                  const SizedBox(height: 10),
                  _buildMetricTile(
                    '⏱ Practice',
                    '${progress.totalPracticeMinutes} Mins',
                    'Deliberate practice time',
                    const Color(0xFF38BDF8),
                    colors,
                  ),
                  const SizedBox(height: 10),
                  _buildMetricTile(
                    '⭐ Total XP',
                    '${progress.xp}',
                    progress.xp == 0 ? 'Rank: Beginner' : (progress.xp > 2000 ? 'Rank: Virtuoso' : 'Rank: Apprentice'),
                    const Color(0xFF10B981),
                    colors,
                  ),
                ],
              );
            }
            return Row(
              children: [
                Expanded(
                  child: _buildMetricTile(
                    '🔥 Streak',
                    '${progress.streakDays} Days',
                    progress.streakDays == 0 ? 'Start your streak today' : 'Keep practicing daily!',
                    const Color(0xFFF59E0B),
                    colors,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricTile(
                    '⏱ Practice',
                    '${progress.totalPracticeMinutes} Mins',
                    'Deliberate practice time',
                    const Color(0xFF38BDF8),
                    colors,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildMetricTile(
                    '⭐ Total XP',
                    '${progress.xp}',
                    progress.xp == 0 ? 'Rank: Beginner' : (progress.xp > 2000 ? 'Rank: Virtuoso' : 'Rank: Apprentice'),
                    const Color(0xFF10B981),
                    colors,
                  ),
                ),
              ],
            );
          },
        ),
        const SizedBox(height: 16),

        if (progress.completedLessons.isEmpty && progress.completedExercises.isEmpty) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colors.bgCardElevated,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: colors.borderSubtle),
            ),
            child: Row(
              children: [
                Icon(Icons.info_outline, color: colors.accentPrimary, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'No practice sessions yet. Start your first lesson in the Learn tab to begin building your mastery profile.',
                    style: TextStyle(color: colors.textMuted, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Instrument Mastery Section
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: colors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'INSTRUMENT MASTERY BREAKDOWN',
                style: TextStyle(
                  color: colors.accentPrimary,
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                ),
              ),
              const SizedBox(height: 16),
              ...InstrumentType.values.map((inst) {
                final mastery = progress.instrumentMastery[inst] ?? 0;
                final isCurrent = inst == currentInstrument;

                return InkWell(
                  onTap: () {
                    ref.read(instrumentProvider.notifier).setInstrument(inst);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isCurrent ? colors.bgCardElevated : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isCurrent ? colors.accentPrimary.withAlpha(80) : Colors.transparent,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(inst.emoji, style: const TextStyle(fontSize: 16)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                inst.displayName,
                                style: TextStyle(
                                  color: colors.textPrimary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '$mastery%',
                              style: TextStyle(
                                color: colors.accentPrimary,
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(100),
                          child: LinearProgressIndicator(
                            value: mastery / 100,
                            minHeight: 6,
                            backgroundColor: colors.borderSubtle,
                            valueColor: AlwaysStoppedAnimation<Color>(colors.accentPrimary),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Achievement Badges Section
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: colors.bgCard,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'AUTHENTIC EARNED ACHIEVEMENTS',
                      style: TextStyle(
                        color: colors.accentPrimary,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.1,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${progress.badges.length}/${_allBadges.length} Unlocked',
                    style: TextStyle(color: colors.textMuted, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 220,
                  mainAxisExtent: 110,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: _allBadges.length,
                itemBuilder: (context, index) {
                  final badge = _allBadges[index];
                  final isUnlocked = progress.badges.contains(badge['id']);

                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isUnlocked ? colors.bgCardElevated : Colors.black.withAlpha(40),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isUnlocked ? colors.accentPrimary.withAlpha(80) : colors.borderSubtle,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              badge['icon'] as String,
                              style: TextStyle(
                                fontSize: 18,
                                color: isUnlocked ? null : Colors.grey,
                              ),
                            ),
                            const Spacer(),
                            if (isUnlocked)
                              Icon(Icons.check_circle_rounded, color: colors.accentPrimary, size: 14)
                            else
                              Icon(Icons.lock_outline_rounded, color: colors.textMuted, size: 14),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          badge['title'] as String,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: isUnlocked ? colors.textPrimary : colors.textMuted,
                            fontSize: 11.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          badge['desc'] as String,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: colors.textMuted,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMetricTile(
    String label,
    String value,
    String subtitle,
    Color color,
    VibexColorScheme colors,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: colors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: colors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: colors.textMuted, fontSize: 10),
          ),
        ],
      ),
    );
  }
}
