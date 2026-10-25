import 'package:flutter/material.dart';
import '../../services/audio_engine.dart';

class PitchGaugeWidget extends StatelessWidget {
  final AudioDetectionData? detectionData;
  final String? targetNote;

  const PitchGaugeWidget({
    super.key,
    this.detectionData,
    this.targetNote,
  });

  @override
  Widget build(BuildContext context) {
    final data = detectionData;
    final noteName = data?.noteName ?? '--';
    final cents = data?.cents ?? 0;
    final freq = data?.pitchHz ?? 0.0;
    final swara = data?.closestIndianSwara ?? '--';
    final isStable = data?.isStable ?? false;

    final isInTune = isStable && cents.abs() <= 10;
    final isFlat = cents < -10;

    final statusColor = data == null
        ? const Color(0xFF64748B)
        : isInTune
            ? const Color(0xFF10B981)
            : isFlat
                ? const Color(0xFF38BDF8)
                : const Color(0xFFF59E0B);

    final statusText = data == null
        ? 'Listening...'
        : isInTune
            ? 'PERFECT PITCH'
            : isFlat
                ? 'FLAT (Tune Up 🡑)'
                : 'SHARP (Tune Down 🡓)';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1115),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: statusColor.withAlpha(80)),
        boxShadow: [
          BoxShadow(
            color: statusColor.withAlpha(30),
            blurRadius: 16,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        children: [
          // Header info
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: statusColor,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    statusText,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
              if (targetNote != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1A1D23),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE5C07B).withAlpha(100)),
                  ),
                  child: Text(
                    'TARGET: $targetNote',
                    style: const TextStyle(
                      color: Color(0xFFE5C07B),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),

          // Central Detected Note & Pitch
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                noteName,
                style: TextStyle(
                  color: statusColor,
                  fontSize: 44,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -1,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Swara: $swara',
                    style: const TextStyle(
                      color: Color(0xFFE2E8F0),
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    freq > 0 ? '${freq.toStringAsFixed(1)} Hz' : '0.0 Hz',
                    style: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Cents deviation scale bar (-50 to +50 cents)
          LayoutBuilder(
            builder: (context, constraints) {
              final barWidth = constraints.maxWidth;
              // Map cents [-50, 50] to [0, barWidth]
              final clampedCents = cents.clamp(-50, 50);
              final needleX = ((clampedCents + 50) / 100.0) * barWidth;

              return Column(
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      // Gradient meter bar
                      Container(
                        height: 8,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          gradient: const LinearGradient(
                            colors: [
                              Color(0xFF38BDF8), // Flat
                              Color(0xFF10B981), // In tune center
                              Color(0xFFF59E0B), // Sharp
                            ],
                          ),
                        ),
                      ),

                      // Center In-Tune Notch
                      Positioned(
                        child: Container(
                          width: 3,
                          height: 16,
                          color: Colors.white,
                        ),
                      ),

                      // Moving Indicator Needle
                      Positioned(
                        left: (needleX - 6).clamp(0.0, barWidth - 12.0),
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                            border: Border.all(color: statusColor, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withAlpha(120),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('-50¢ FLAT', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold)),
                      Text('${cents > 0 ? "+$cents" : "$cents"}¢', style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
                      const Text('+50¢ SHARP', style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
