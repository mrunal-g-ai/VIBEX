import 'package:flutter/material.dart';
import '../../../data/providers/app_providers.dart';
import '../../../services/audio_engine.dart';

class InteractiveKeyboard extends StatelessWidget {
  final List<String> targetNotes;
  final String? activeNote;
  final ValueChanged<String>? onNotePressed;
  final bool showSwaras;

  const InteractiveKeyboard({
    super.key,
    this.targetNotes = const [],
    this.activeNote,
    this.onNotePressed,
    this.showSwaras = true,
  });

  // 2-Octave span: C4 to B5 (14 white keys)
  static const List<String> _whiteKeys = [
    'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
    'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'
  ];

  static const Map<String, double> _blackKeyOffsets = {
    'C#4': 0.65,
    'D#4': 1.65,
    'F#4': 3.65,
    'G#4': 4.65,
    'A#4': 5.65,
    'C#5': 7.65,
    'D#5': 8.65,
    'F#5': 10.65,
    'G#5': 11.65,
    'A#5': 12.65,
  };

  void _handleKeyTap(String note) {
    audioEngine.playNote(note, instrument: InstrumentType.keyboard);
    onNotePressed?.call(note);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final totalWidth = constraints.maxWidth;
        final whiteKeyWidth = totalWidth / _whiteKeys.length;
        final whiteKeyHeight = (whiteKeyWidth * 3.8).clamp(140.0, 220.0);
        final blackKeyWidth = whiteKeyWidth * 0.65;
        final blackKeyHeight = whiteKeyHeight * 0.62;

        return SizedBox(
          width: totalWidth,
          height: whiteKeyHeight,
          child: Stack(
            children: [
              // White keys row
              Row(
                children: _whiteKeys.map((note) {
                  final isTarget = targetNotes.contains(note);
                  final isActive = activeNote == note;
                  final swara = (kSwaraMap[note.substring(0, 1)] ?? '').split(' ').first;

                  return GestureDetector(
                    onTapDown: (_) => _handleKeyTap(note),
                    child: Container(
                      width: whiteKeyWidth,
                      height: whiteKeyHeight,
                      decoration: BoxDecoration(
                        color: isActive
                            ? const Color(0xFF10B981)
                            : isTarget
                                ? const Color(0xFFE5C07B)
                                : const Color(0xFFF8FAFC),
                        borderRadius: const BorderRadius.vertical(
                          bottom: Radius.circular(6),
                        ),
                        border: Border.all(
                          color: const Color(0xFF1E293B),
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(50),
                            blurRadius: 4,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (showSwaras && swara.isNotEmpty)
                            Text(
                              swara,
                              maxLines: 1,
                              overflow: TextOverflow.clip,
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w700,
                                color: (isActive || isTarget)
                                    ? Colors.black
                                    : const Color(0xFF64748B),
                              ),
                            ),
                          const SizedBox(height: 1),
                          Text(
                            note,
                            maxLines: 1,
                            overflow: TextOverflow.clip,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: (isActive || isTarget)
                                  ? Colors.black
                                  : const Color(0xFF334155),
                            ),
                          ),
                          const SizedBox(height: 4),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),

              // Black keys overlays
              ..._blackKeyOffsets.entries.map((entry) {
                final note = entry.key;
                final offsetMultiplier = entry.value;
                final isTarget = targetNotes.contains(note);
                final isActive = activeNote == note;
                final leftPosition = offsetMultiplier * whiteKeyWidth;

                return Positioned(
                  left: leftPosition,
                  top: 0,
                  child: GestureDetector(
                    onTapDown: (_) => _handleKeyTap(note),
                    child: Container(
                      width: blackKeyWidth,
                      height: blackKeyHeight,
                      decoration: BoxDecoration(
                        color: isActive
                            ? const Color(0xFF10B981)
                            : isTarget
                                ? const Color(0xFFE5C07B)
                                : const Color(0xFF0F172A),
                        borderRadius: const BorderRadius.vertical(
                          bottom: Radius.circular(5),
                        ),
                        border: Border.all(
                          color: isTarget
                              ? const Color(0xFFFBBF24)
                              : const Color(0xFF334155),
                          width: 1.2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(120),
                            blurRadius: 6,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          Text(
                            note.replaceAll(RegExp(r'\d'), ''),
                            style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: (isActive || isTarget)
                                  ? Colors.black
                                  : Colors.white70,
                            ),
                          ),
                          const SizedBox(height: 6),
                        ],
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        );
      },
    );
  }
}
