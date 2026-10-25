import 'package:flutter/material.dart';
import '../../../data/providers/app_providers.dart';
import '../../../services/audio_engine.dart';

class InteractiveBansuri extends StatefulWidget {
  final List<bool>? targetHolePattern; // 6 booleans: true = closed, false = open
  final String? activeNote;
  final ValueChanged<String>? onNotePressed;

  const InteractiveBansuri({
    super.key,
    this.targetHolePattern,
    this.activeNote,
    this.onNotePressed,
  });

  @override
  State<InteractiveBansuri> createState() => _InteractiveBansuriState();
}

class _InteractiveBansuriState extends State<InteractiveBansuri> {
  // Current hole states: 6 holes (true = closed, false = open)
  late List<bool> _holes;

  static const List<String> _swaraLabels = ['Ma', 'Ga', 'Re', 'Sa', 'Dha', 'Ni'];

  @override
  void initState() {
    super.initState();
    _holes = List<bool>.from(widget.targetHolePattern ?? [true, true, true, false, false, false]);
  }

  @override
  void didUpdateWidget(covariant InteractiveBansuri oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.targetHolePattern != null && widget.targetHolePattern != oldWidget.targetHolePattern) {
      _holes = List<bool>.from(widget.targetHolePattern!);
    }
  }

  void _toggleHole(int index) {
    setState(() {
      _holes[index] = !_holes[index];
    });

    // Calculate approximate note based on closed holes from top
    int closedCount = 0;
    for (var i = 0; i < 6; i++) {
      if (_holes[i]) {
        closedCount++;
      } else {
        break;
      }
    }

    final notesByClosed = ['G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'A3'];
    final playedNote = notesByClosed[closedCount.clamp(0, 6)];

    audioEngine.playNote(playedNote, instrument: InstrumentType.bansuri);
    widget.onNotePressed?.call(playedNote);
  }

  @override
  Widget build(BuildContext context) {
    final targetPattern = widget.targetHolePattern ?? [true, true, true, false, false, false];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF13151A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF33291F)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Text(
                  'BANSURI (Bamboo Flute — 6 Tone Holes)',
                  style: TextStyle(
                    color: Color(0xFFC0A060),
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF261D15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFC26715).withAlpha(120)),
                ),
                child: const Text(
                  'Key: E Middle / C Natural',
                  style: TextStyle(
                    color: Color(0xFFE5C07B),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Bamboo body
          Container(
            height: 72,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF5C3B1E), Color(0xFF9E6E38), Color(0xFFC59458), Color(0xFF9E6E38), Color(0xFF5C3B1E)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(36),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(120),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                // Blowing hole (Embouchure)
                Container(
                  margin: const EdgeInsets.only(left: 20, right: 28),
                  width: 26,
                  height: 26,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: const Color(0xFF1A1008),
                    border: Border.all(color: const Color(0xFFE5C07B), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(140),
                        blurRadius: 4,
                        offset: const Offset(1, 1),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.air, size: 14, color: Color(0xFFE5C07B)),
                  ),
                ),

                // Decorative silk thread binding
                Container(
                  width: 6,
                  height: double.infinity,
                  color: const Color(0xFF8B0000),
                ),
                const SizedBox(width: 20),

                // 6 Tone Holes
                Expanded(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(6, (index) {
                      final isClosed = _holes[index];
                      final isTargetClosed = targetPattern.length > index && targetPattern[index];
                      final isMatch = isClosed == isTargetClosed;

                      return GestureDetector(
                        onTap: () => _toggleHole(index),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isClosed
                                    ? (isMatch ? const Color(0xFF10B981) : const Color(0xFF1E293B))
                                    : const Color(0xFFFAF7F2),
                                border: Border.all(
                                  color: isTargetClosed
                                      ? const Color(0xFFE5C07B)
                                      : const Color(0xFF2E1C0C),
                                  width: 2.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withAlpha(100),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  isClosed ? '●' : '○',
                                  style: TextStyle(
                                    color: isClosed ? Colors.white : Colors.black87,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _swaraLabels[index],
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      );
                    }),
                  ),
                ),

                const SizedBox(width: 14),
                // End binding
                Container(
                  width: 6,
                  height: double.infinity,
                  color: const Color(0xFF8B0000),
                ),
                const SizedBox(width: 16),
              ],
            ),
          ),
          const SizedBox(height: 10),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildHandLegend('Left Hand (Holes 1-3)', const Color(0xFF38BDF8)),
              const SizedBox(width: 24),
              _buildHandLegend('Right Hand (Holes 4-6)', const Color(0xFF10B981)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHandLegend(String title, Color color) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(shape: BoxShape.circle, color: color),
        ),
        const SizedBox(width: 6),
        Text(
          title,
          style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
