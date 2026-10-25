import 'package:flutter/material.dart';

class HandFingerGuide extends StatelessWidget {
  final int? activeFinger; // 1, 2, 3, 4, or null
  final String label;

  const HandFingerGuide({
    super.key,
    this.activeFinger,
    this.label = 'Fretting Hand Finger Guide',
  });

  static const List<Map<String, dynamic>> _fingers = [
    {'id': 1, 'name': 'Index', 'tag': '1'},
    {'id': 2, 'name': 'Middle', 'tag': '2'},
    {'id': 3, 'name': 'Ring', 'tag': '3'},
    {'id': 4, 'name': 'Pinky', 'tag': '4'},
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF131722),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label.toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.6,
                ),
              ),
              if (activeFinger != null)
                Text(
                  'Use Finger $activeFinger',
                  style: const TextStyle(
                    color: Color(0xFFE5C07B),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // Thumb indicator
              _buildFingerPill(
                tag: 'T',
                title: 'Thumb',
                isActive: false,
                isThumb: true,
              ),
              ..._fingers.map((f) {
                final isCurrent = activeFinger == f['id'];
                return _buildFingerPill(
                  tag: f['tag'] as String,
                  title: f['name'] as String,
                  isActive: isCurrent,
                  isThumb: false,
                );
              }),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFingerPill({
    required String tag,
    required String title,
    required bool isActive,
    required bool isThumb,
  }) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isActive
                ? const Color(0xFFE5C07B)
                : (isThumb ? const Color(0xFF1E293B) : const Color(0xFF0F172A)),
            border: Border.all(
              color: isActive
                  ? const Color(0xFFFBBF24)
                  : const Color(0xFF334155),
              width: isActive ? 2 : 1,
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: const Color(0xFFE5C07B).withAlpha(120),
                      blurRadius: 8,
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: Text(
              tag,
              style: TextStyle(
                color: isActive ? Colors.black : Colors.white70,
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: TextStyle(
            color: isActive ? const Color(0xFFE5C07B) : const Color(0xFF64748B),
            fontSize: 9,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
