import 'package:flutter/material.dart';
import '../../../data/providers/app_providers.dart';
import '../../../services/audio_engine.dart';

class InteractiveFretboard extends StatelessWidget {
  final List<TargetFretNote> targetNotes;
  final String? activeNote;
  final ValueChanged<String>? onNotePressed;

  const InteractiveFretboard({
    super.key,
    this.targetNotes = const [],
    this.activeNote,
    this.onNotePressed,
  });

  // Standard tuning open notes from 1st string (high E) to 6th string (low E)
  static const List<int> _stringOpenSemitones = [64, 59, 55, 50, 45, 40];
  static const List<String> _stringNames = ['E', 'B', 'G', 'D', 'A', 'E'];
  static const List<int> _fretMarkers = [3, 5, 7, 9];

  static String semitoneToNote(int midi) {
    final noteIndex = ((midi % 12) + 12) % 12;
    final octave = (midi / 12).floor() - 1;
    return '${kNoteNames[noteIndex]}$octave';
  }

  void _handleFretTap(int stringIndex, int fret) {
    final midi = _stringOpenSemitones[stringIndex] + fret;
    final note = semitoneToNote(midi);
    audioEngine.playNote(note, instrument: InstrumentType.guitar);
    onNotePressed?.call(note);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Container(
            width: 780,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF1E1712), Color(0xFF130F0B), Color(0xFF1E1712)],
              ),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF3E2D20), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(100),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Fret number row
                Row(
                  children: [
                    const SizedBox(width: 44, child: Center(child: Text('NUT', style: TextStyle(color: Color(0xFF9E8A78), fontSize: 10, fontWeight: FontWeight.bold)))),
                    ...List.generate(12, (index) {
                      final fretNum = index + 1;
                      return SizedBox(
                        width: 58,
                        child: Center(
                          child: Text(
                            '$fretNum',
                            style: TextStyle(
                              color: _fretMarkers.contains(fretNum) || fretNum == 12
                                  ? const Color(0xFFE5C07B)
                                  : const Color(0xFF6B5848),
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
                const SizedBox(height: 4),

                // Strings and Frets Grid
                ...List.generate(6, (stringIndex) {
                  final stringNum = stringIndex + 1;
                  final stringThickness = 1.0 + (stringIndex * 0.45);

                  return SizedBox(
                    height: 28,
                    child: Stack(
                      alignment: Alignment.centerLeft,
                      children: [
                        // The string metal line across the fretboard
                        Positioned(
                          left: 44,
                          right: 0,
                          child: Container(
                            height: stringThickness,
                            decoration: BoxDecoration(
                              color: stringIndex < 3
                                  ? const Color(0xFFD4D4D8)
                                  : const Color(0xFFC0A060),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withAlpha(80),
                                  blurRadius: 1,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Fret dividers and clickable cells
                        Row(
                          children: [
                            // String Tuning Label (Nut cell)
                            GestureDetector(
                              onTap: () => _handleFretTap(stringIndex, 0),
                              child: Container(
                                width: 44,
                                height: 28,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  border: Border(
                                    right: BorderSide(
                                      color: const Color(0xFFE5D5C5),
                                      width: 4,
                                    ),
                                  ),
                                ),
                                child: Text(
                                  _stringNames[stringIndex],
                                  style: const TextStyle(
                                    color: Color(0xFFE5C07B),
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),

                            // Frets 1 to 12
                            ...List.generate(12, (fretIndex) {
                              final fret = fretIndex + 1;
                              final midi = _stringOpenSemitones[stringIndex] + fret;
                              final noteName = semitoneToNote(midi);

                              final target = targetNotes.firstWhere(
                                (t) => t.string == stringNum && t.fret == fret,
                                orElse: () => const TargetFretNote(string: -1, fret: -1, note: ''),
                              );
                              final hasTarget = target.string != -1;
                              final isActive = activeNote == noteName;

                              return GestureDetector(
                                onTap: () => _handleFretTap(stringIndex, fret),
                                child: Container(
                                  width: 58,
                                  height: 28,
                                  decoration: const BoxDecoration(
                                    border: Border(
                                      right: BorderSide(
                                        color: Color(0xFF4A3B2C),
                                        width: 1.5,
                                      ),
                                    ),
                                  ),
                                  child: Center(
                                    child: hasTarget || isActive
                                        ? Container(
                                            width: 22,
                                            height: 22,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: isActive
                                                  ? const Color(0xFF10B981)
                                                  : const Color(0xFFE5C07B),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: (isActive
                                                          ? const Color(0xFF10B981)
                                                          : const Color(0xFFE5C07B))
                                                      .withAlpha(150),
                                                  blurRadius: 6,
                                                  spreadRadius: 1,
                                                ),
                                              ],
                                            ),
                                            alignment: Alignment.center,
                                            child: Text(
                                              target.finger != null
                                                  ? '${target.finger}'
                                                  : noteName.replaceAll(RegExp(r'\d'), ''),
                                              style: const TextStyle(
                                                color: Colors.black,
                                                fontSize: 10,
                                                fontWeight: FontWeight.w900,
                                              ),
                                            ),
                                          )
                                        : null,
                                  ),
                                ),
                              );
                            }),
                          ],
                        ),
                      ],
                    ),
                  );
                }),

                // Inlay dot indicators below strings
                const SizedBox(height: 6),
                Row(
                  children: [
                    const SizedBox(width: 44),
                    ...List.generate(12, (index) {
                      final fret = index + 1;
                      final isMarker = _fretMarkers.contains(fret);
                      final is12 = fret == 12;

                      return SizedBox(
                        width: 58,
                        child: Center(
                          child: is12
                              ? Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    _buildDot(),
                                    const SizedBox(width: 4),
                                    _buildDot(),
                                  ],
                                )
                              : isMarker
                                  ? _buildDot()
                                  : const SizedBox(height: 6),
                        ),
                      );
                    }),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDot() {
    return Container(
      width: 6,
      height: 6,
      decoration: const BoxDecoration(
        shape: BoxShape.circle,
        color: Color(0xFF9E8A78),
      ),
    );
  }
}

class TargetFretNote {
  final int string;
  final int fret;
  final String note;
  final int? finger;

  const TargetFretNote({
    required this.string,
    required this.fret,
    required this.note,
    this.finger,
  });
}
