import 'package:flutter/material.dart';
import '../../../data/providers/app_providers.dart';
import '../../../services/audio_engine.dart';

class InteractiveViolinFingerboard extends StatelessWidget {
  final List<String> targetNotes;
  final String? activeNote;
  final ValueChanged<String>? onNotePressed;
  final String bowDirection; // 'down' or 'up'

  const InteractiveViolinFingerboard({
    super.key,
    this.targetNotes = const [],
    this.activeNote,
    this.onNotePressed,
    this.bowDirection = 'down',
  });

  // Violin open strings: G3, D4, A4, E5
  static const List<String> _strings = ['E5', 'A4', 'D4', 'G3'];
  static const List<double> _tapePositions = [0.15, 0.28, 0.42, 0.55]; // 1st, 2nd, 3rd, 4th fingers

  void _handleTap(String note) {
    audioEngine.playNote(note, instrument: InstrumentType.violin);
    onNotePressed?.call(note);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF13151A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2E384D)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'VIOLIN FINGERBOARD (1st Position)',
                style: TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.8,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF38BDF8).withAlpha(100)),
                ),
                child: Row(
                  children: [
                    Text(
                      bowDirection == 'down' ? '⊓ DOWN-BOW' : '∨ UP-BOW',
                      style: const TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Ebony fingerboard
          Container(
            height: 130,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F0F12), Color(0xFF1B1B22), Color(0xFF0F0F12)],
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF333340)),
            ),
            child: Stack(
              children: [
                // Finger position tapes
                ..._tapePositions.asMap().entries.map((entry) {
                  final idx = entry.key + 1;
                  final leftFrac = entry.value;

                  return Align(
                    alignment: Alignment(leftFrac * 2 - 1, 0),
                    child: Container(
                      width: 2,
                      height: double.infinity,
                      color: const Color(0x33FBBF24),
                      child: Align(
                        alignment: Alignment.topCenter,
                        child: Text(
                          '$idx',
                          style: const TextStyle(
                            color: Color(0x66FBBF24),
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  );
                }),

                // 4 Strings horizontal
                Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: _strings.map((openNote) {
                    final isActive = activeNote == openNote;
                    final isTarget = targetNotes.contains(openNote);

                    return GestureDetector(
                      onTap: () => _handleTap(openNote),
                      child: Container(
                        height: 24,
                        color: Colors.transparent,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          children: [
                            Container(
                              width: 32,
                              alignment: Alignment.center,
                              child: Text(
                                openNote,
                                style: const TextStyle(
                                  color: Color(0xFFE2E8F0),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Container(
                                height: 2,
                                decoration: BoxDecoration(
                                  color: isActive
                                      ? const Color(0xFF10B981)
                                      : isTarget
                                          ? const Color(0xFFE5C07B)
                                          : const Color(0xFF94A3B8),
                                  boxShadow: (isActive || isTarget)
                                      ? [
                                          BoxShadow(
                                            color: (isActive
                                                    ? const Color(0xFF10B981)
                                                    : const Color(0xFFE5C07B))
                                                .withAlpha(180),
                                            blurRadius: 6,
                                          ),
                                        ]
                                      : null,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
