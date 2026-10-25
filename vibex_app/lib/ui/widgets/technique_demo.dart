import 'package:flutter/material.dart';
import '../../data/providers/app_providers.dart';

class TechniqueDemonstrationWidget extends StatefulWidget {
  final InstrumentType instrument;
  final String title;
  final String tip;

  const TechniqueDemonstrationWidget({
    super.key,
    required this.instrument,
    required this.title,
    required this.tip,
  });

  @override
  State<TechniqueDemonstrationWidget> createState() => _TechniqueDemonstrationWidgetState();
}

class _TechniqueDemonstrationWidgetState extends State<TechniqueDemonstrationWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animCtrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    _pulseAnim = CurvedAnimation(parent: _animCtrl, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF11141D),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFFE5C07B).withAlpha(30),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.lightbulb_outline, color: Color(0xFFE5C07B), size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  widget.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Animated visual container
          AnimatedBuilder(
            animation: _pulseAnim,
            builder: (context, child) {
              return Container(
                height: 80,
                decoration: BoxDecoration(
                  color: const Color(0xFF090D16),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Color.lerp(
                      const Color(0xFF334155),
                      const Color(0xFFE5C07B),
                      _pulseAnim.value,
                    )!,
                  ),
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Moving scan wave
                    Positioned(
                      left: 20 + _pulseAnim.value * 180,
                      child: Container(
                        width: 40,
                        height: 60,
                        decoration: BoxDecoration(
                          gradient: RadialGradient(
                            colors: [
                              const Color(0xFFE5C07B).withAlpha(50),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          _getInstrumentIcon(widget.instrument),
                          size: 32,
                          color: const Color(0xFFE5C07B),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _getPostureKeyPoint(widget.instrument),
                              style: const TextStyle(
                                color: Color(0xFFF1F5F9),
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const Text(
                              'Technique Reference Guide',
                              style: TextStyle(
                                color: Color(0xFF38BDF8),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 10),

          // Tip description
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF161B26),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.check_circle_outline, color: Color(0xFF10B981), size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.tip,
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 12,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getInstrumentIcon(InstrumentType inst) {
    switch (inst) {
      case InstrumentType.keyboard:
        return Icons.piano;
      case InstrumentType.guitar:
        return Icons.music_note;
      case InstrumentType.violin:
        return Icons.audiotrack;
      case InstrumentType.bansuri:
        return Icons.air;
    }
  }

  String _getPostureKeyPoint(InstrumentType inst) {
    switch (inst) {
      case InstrumentType.keyboard:
        return 'Curved Finger Arches & Flat Wrist';
      case InstrumentType.guitar:
        return 'Thumb Centered Behind 2nd Fret';
      case InstrumentType.violin:
        return 'Bow Perpendicular to Strings';
      case InstrumentType.bansuri:
        return 'Complete Finger Pad Seal Over Holes';
    }
  }
}
