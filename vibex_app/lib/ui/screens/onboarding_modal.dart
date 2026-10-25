import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/providers/app_providers.dart';

class OnboardingModal extends ConsumerStatefulWidget {
  final VoidCallback onFinished;

  const OnboardingModal({
    super.key,
    required this.onFinished,
  });

  @override
  ConsumerState<OnboardingModal> createState() => _OnboardingModalState();
}

class _OnboardingModalState extends ConsumerState<OnboardingModal> {
  int _step = 0;
  InstrumentType _selectedInstrument = InstrumentType.guitar;
  String _experience = 'beginner';
  int _dailyMinutes = 15;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF11141D),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: Color(0xFF2E384D)),
      ),
      child: Container(
        padding: const EdgeInsets.all(24),
        constraints: const BoxConstraints(maxWidth: 520),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE5C07B).withAlpha(30),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        'STEP ${_step + 1} OF 3',
                        style: const TextStyle(
                          color: Color(0xFFE5C07B),
                          fontWeight: FontWeight.w900,
                          fontSize: 11,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      'Welcome to VIBEX',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: _finishOnboarding,
                  child: const Text('SKIP', style: TextStyle(color: Color(0xFF64748B), fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (_step == 0) _buildInstrumentStep(),
            if (_step == 1) _buildExperienceStep(),
            if (_step == 2) _buildGoalStep(),

            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_step > 0)
                  OutlinedButton(
                    onPressed: () => setState(() => _step--),
                    child: const Text('BACK'),
                  )
                else
                  const SizedBox.shrink(),
                ElevatedButton(
                  onPressed: () {
                    if (_step < 2) {
                      setState(() => _step++);
                    } else {
                      _finishOnboarding();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE5C07B),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  child: Text(_step == 2 ? 'START PRACTICING 🚀' : 'NEXT →', style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInstrumentStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Choose your primary instrument to learn',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        const Text(
          'You can switch instruments at any time from the top navigation.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
        ),
        const SizedBox(height: 16),
        ...InstrumentType.values.map((inst) {
          final isSelected = _selectedInstrument == inst;
          return GestureDetector(
            onTap: () => setState(() => _selectedInstrument = inst),
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF1E2433) : const Color(0xFF0F1219),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected ? const Color(0xFFE5C07B) : const Color(0xFF1E293B),
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Text(inst.emoji, style: const TextStyle(fontSize: 24)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(inst.displayName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        Text(inst.subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                      ],
                    ),
                  ),
                  if (isSelected) const Icon(Icons.check_circle, color: Color(0xFFE5C07B), size: 20),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildExperienceStep() {
    final levels = [
      {'id': 'beginner', 'title': 'Complete Beginner', 'desc': 'First time picking up the instrument'},
      {'id': 'intermediate', 'title': 'Some Basics', 'desc': 'Know a few chords, keys, or simple melodies'},
      {'id': 'advanced', 'title': 'Experienced Player', 'desc': 'Focus on advanced timing, nuance & speed'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'What is your current playing experience?',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        const Text('We calibrate lessons to your starting point.', style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
        const SizedBox(height: 16),
        ...levels.map((lvl) {
          final isSelected = _experience == lvl['id'];
          return GestureDetector(
            onTap: () => setState(() => _experience = lvl['id'] as String),
            child: Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF1E2433) : const Color(0xFF0F1219),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected ? const Color(0xFFE5C07B) : const Color(0xFF1E293B),
                  width: isSelected ? 2 : 1,
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(lvl['title'] as String, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        Text(lvl['desc'] as String, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
                      ],
                    ),
                  ),
                  if (isSelected) const Icon(Icons.check_circle, color: Color(0xFFE5C07B), size: 20),
                ],
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildGoalStep() {
    final goals = [10, 15, 25, 45];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Set your daily practice target',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        const Text(
          'Consistency builds muscle memory. Even 15 mins daily leads to mastery.',
          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
        ),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: goals.map((mins) {
            final isSelected = _dailyMinutes == mins;
            return GestureDetector(
              onTap: () => setState(() => _dailyMinutes = mins),
              child: Container(
                width: 90,
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFFE5C07B) : const Color(0xFF0F1219),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isSelected ? const Color(0xFFFBBF24) : const Color(0xFF1E293B),
                    width: isSelected ? 2 : 1,
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      '$mins',
                      style: TextStyle(
                        color: isSelected ? Colors.black : Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      'MINS/DAY',
                      style: TextStyle(
                        color: isSelected ? Colors.black87 : const Color(0xFF94A3B8),
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  void _finishOnboarding() {
    ref.read(instrumentProvider.notifier).setInstrument(_selectedInstrument);
    final prefs = ref.read(sharedPreferencesProvider);
    prefs.setBool('vibex_onboarding_completed', true);
    prefs.setInt('vibex_daily_minutes', _dailyMinutes);
    prefs.setString('vibex_experience', _experience);

    widget.onFinished();
  }
}
