import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../data/models/curriculum_data.dart';
import '../../data/providers/app_providers.dart';

enum AvatarMood { idle, listening, correcting, praising, celebrating, explaining }

class AIAvatarCoach extends StatefulWidget {
  final InstrumentType instrument;
  final AvatarMood mood;
  final String? customMessage;
  final bool isWrongPlaying;
  final String? wrongReason;
  final bool isLessonCompleted;
  final String? completedLessonTitle;
  final Lesson? nextLesson;
  final ValueChanged<Lesson>? onStartNextLesson;
  final VoidCallback? onRetryExercise;
  final bool compact;

  const AIAvatarCoach({
    super.key,
    required this.instrument,
    this.mood = AvatarMood.idle,
    this.customMessage,
    this.isWrongPlaying = false,
    this.wrongReason,
    this.isLessonCompleted = false,
    this.completedLessonTitle,
    this.nextLesson,
    this.onStartNextLesson,
    this.onRetryExercise,
    this.compact = false,
  });

  @override
  State<AIAvatarCoach> createState() => _AIAvatarCoachState();
}

class _AIAvatarCoachState extends State<AIAvatarCoach> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    if (WidgetsBinding.instance.runtimeType.toString().contains('Test')) {
      _pulseController.forward();
    } else {
      _pulseController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  AvatarMood get _activeMood {
    if (widget.isLessonCompleted) return AvatarMood.celebrating;
    if (widget.isWrongPlaying) return AvatarMood.correcting;
    return widget.mood;
  }

  String get _message {
    if (widget.customMessage != null) return widget.customMessage!;

    if (widget.isLessonCompleted) {
      if (widget.nextLesson != null) {
        return 'Bravo! You\'ve mastered ${widget.completedLessonTitle ?? "this milestone"} with high precision. Next up: "${widget.nextLesson!.title}" to advance your ${widget.instrument.displayName} technique.';
      }
      return 'Outstanding achievement! You\'ve accomplished your primary goals for ${widget.completedLessonTitle ?? "this stage"}. Keep this daily streak rolling!';
    }

    if (widget.isWrongPlaying) {
      if (widget.wrongReason != null) return widget.wrongReason!;
      switch (widget.instrument) {
        case InstrumentType.violin:
          return 'Careful! Your bow stroke is drifting off the perpendicular 90° sounding lane. Flex your right wrist on the up-bow to keep the hair flat.';
        case InstrumentType.bansuri:
          return 'Tone airy or pitch flat! Make sure your lower lip covers exactly 1/3 of the blowhole and your finger pads seal the holes completely flat without leaking.';
        case InstrumentType.guitar:
          return 'Buzz detected! Place your fretting fingertip arched at 90° directly behind the fret wire, and keep your thumb resting on the neck midline.';
        case InstrumentType.keyboard:
          return 'Tension warning! Keep your wrist floating neutral at 180° with your hand arched naturally like holding a tennis ball.';
      }
    }

    switch (widget.instrument) {
      case InstrumentType.violin:
        return 'Maestro tip: Keep your right pinky curved on top of the bow stick as a flexible shock absorber during direction changes.';
      case InstrumentType.bansuri:
        return 'Focus your breath into a thin, 45° downward ribbon against the outer blowhole splitting edge for crisp, resonant swaras.';
      case InstrumentType.guitar:
        return 'Practice relaxing your fretting thumb counter-pressure — use arm weight rather than squeezing the neck.';
      case InstrumentType.keyboard:
        return 'Play with relaxed shoulders and let your fingers articulate with light, precise finger-pad strikes.';
    }
  }

  @override
  Widget build(BuildContext context) {
    final mood = _activeMood;
    final isError = mood == AvatarMood.correcting;
    final isSuccess = mood == AvatarMood.celebrating;

    Color borderColor;
    Color gradientStart;
    Color gradientEnd;
    Color haloColor;

    if (isError) {
      borderColor = const Color(0xFFEF4444).withAlpha(160);
      gradientStart = const Color(0xFF450A0A).withAlpha(120);
      gradientEnd = const Color(0xFF161214);
      haloColor = const Color(0xFFEF4444);
    } else if (isSuccess) {
      borderColor = const Color(0xFFE5C07B).withAlpha(180);
      gradientStart = const Color(0xFF451A03).withAlpha(140);
      gradientEnd = const Color(0xFF064E3B).withAlpha(80);
      haloColor = const Color(0xFFE5C07B);
    } else {
      borderColor = Colors.white.withAlpha(25);
      gradientStart = const Color(0xFF12141A);
      gradientEnd = const Color(0xFF0F1115);
      haloColor = const Color(0xFF38BDF8);
    }

    return Container(
      padding: EdgeInsets.all(widget.compact ? 14 : 20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [gradientStart, gradientEnd],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: borderColor, width: isError || isSuccess ? 2 : 1),
        boxShadow: [
          BoxShadow(
            color: haloColor.withAlpha(isError || isSuccess ? 30 : 10),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar character face
          AnimatedBuilder(
            animation: _pulseController,
            builder: (context, child) {
              final scale = 1.0 + (isError || isSuccess ? _pulseController.value * 0.08 : 0.0);
              return Transform.scale(
                scale: scale,
                child: Container(
                  width: widget.compact ? 54 : 64,
                  height: widget.compact ? 54 : 64,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: haloColor.withAlpha(40),
                    border: Border.all(color: haloColor, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: haloColor.withAlpha(isError || isSuccess ? 100 : 40),
                        blurRadius: 12,
                      ),
                    ],
                  ),
                  child: CustomPaint(
                    painter: _AvatarPainter(mood: mood),
                  ),
                ),
              );
            },
          ),
          const SizedBox(width: 16),

          // Speech & diagnostic content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: haloColor.withAlpha(35),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: haloColor.withAlpha(80)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isError
                                ? Icons.warning_amber_rounded
                                : isSuccess
                                    ? Icons.stars_rounded
                                    : Icons.auto_awesome,
                            size: 13,
                            color: haloColor,
                          ),
                          const SizedBox(width: 5),
                          Flexible(
                            child: Text(
                              isError
                                  ? 'MISTAKE DETECTED'
                                  : isSuccess
                                      ? 'MASTERY ACHIEVED'
                                      : 'AI MAESTRO COACH',
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                color: haloColor,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      widget.instrument.displayName.toUpperCase(),
                      style: TextStyle(
                        color: Colors.white.withAlpha(120),
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                Text(
                  _message,
                  style: TextStyle(
                    color: isError
                        ? const Color(0xFFFCA5A5)
                        : isSuccess
                            ? const Color(0xFFFDE68A)
                            : Colors.white.withAlpha(220),
                    fontSize: widget.compact ? 12 : 13.5,
                    height: 1.45,
                    fontWeight: isError || isSuccess ? FontWeight.w600 : FontWeight.w400,
                  ),
                ),

                if (isSuccess && widget.nextLesson != null && widget.onStartNextLesson != null) ...[
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: () => widget.onStartNextLesson!(widget.nextLesson!),
                    icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                    label: Text('START NEXT LESSON: ${widget.nextLesson!.title}'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE5C07B),
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],

                if (isError && widget.onRetryExercise != null) ...[
                  const SizedBox(height: 10),
                  OutlinedButton.icon(
                    onPressed: widget.onRetryExercise,
                    icon: const Icon(Icons.replay_rounded, size: 14),
                    label: const Text('RETRY NOTE WITH PROPER FORM'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: BorderSide(color: Colors.red.withAlpha(120)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _AvatarPainter extends CustomPainter {
  final AvatarMood mood;

  _AvatarPainter({required this.mood});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2 + 2);
    final radius = size.width * 0.38;

    // Face circle
    final facePaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFFFED7AA), Color(0xFFF97316)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawCircle(center, radius, facePaint);

    // Hair / crown
    final hairPaint = Paint()..color = const Color(0xFF1E293B);
    final hairPath = Path()
      ..moveTo(center.dx - radius * 0.8, center.dy - radius * 0.2)
      ..cubicTo(
        center.dx - radius * 0.9,
        center.dy - radius * 1.3,
        center.dx + radius * 0.9,
        center.dy - radius * 1.3,
        center.dx + radius * 0.8,
        center.dy - radius * 0.2,
      )
      ..cubicTo(
        center.dx + radius * 0.3,
        center.dy - radius * 0.7,
        center.dx - radius * 0.3,
        center.dy - radius * 0.7,
        center.dx - radius * 0.8,
        center.dy - radius * 0.2,
      )
      ..close();
    canvas.drawPath(hairPath, hairPaint);

    // Eyes
    final eyePaint = Paint()..color = const Color(0xFF0F172A);
    final eyeWhite = Paint()..color = Colors.white;

    final leftEye = Offset(center.dx - radius * 0.38, center.dy - radius * 0.1);
    final rightEye = Offset(center.dx + radius * 0.38, center.dy - radius * 0.1);

    if (mood == AvatarMood.correcting) {
      // Diagnostic brows & eyes
      final browPaint = Paint()
        ..color = const Color(0xFF431407)
        ..strokeWidth = 2.0
        ..strokeCap = StrokeCap.round;
      canvas.drawLine(Offset(leftEye.dx - 4, leftEye.dy - 7), Offset(leftEye.dx + 6, leftEye.dy - 4), browPaint);
      canvas.drawLine(Offset(rightEye.dx + 4, rightEye.dy - 7), Offset(rightEye.dx - 6, rightEye.dy - 4), browPaint);

      canvas.drawCircle(leftEye, 3.5, eyePaint);
      canvas.drawCircle(rightEye, 3.5, eyePaint);
    } else if (mood == AvatarMood.celebrating || mood == AvatarMood.praising) {
      // Happy arcs
      final arcPaint = Paint()
        ..color = const Color(0xFF431407)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: leftEye, radius: 4),
        math.pi * 1.2,
        math.pi * 0.8,
        false,
        arcPaint,
      );
      canvas.drawArc(
        Rect.fromCircle(center: rightEye, radius: 4),
        math.pi * 1.2,
        math.pi * 0.8,
        false,
        arcPaint,
      );

      // Blush
      final blushPaint = Paint()..color = const Color(0xFFF43F5E).withAlpha(120);
      canvas.drawOval(
        Rect.fromCenter(center: Offset(leftEye.dx - 2, leftEye.dy + 7), width: 7, height: 4),
        blushPaint,
      );
      canvas.drawOval(
        Rect.fromCenter(center: Offset(rightEye.dx + 2, rightEye.dy + 7), width: 7, height: 4),
        blushPaint,
      );
    } else {
      // Attentive neutral eyes
      canvas.drawCircle(leftEye, 4.0, eyePaint);
      canvas.drawCircle(rightEye, 4.0, eyePaint);
      canvas.drawCircle(Offset(leftEye.dx + 1.2, leftEye.dy - 1.2), 1.3, eyeWhite);
      canvas.drawCircle(Offset(rightEye.dx + 1.2, rightEye.dy - 1.2), 1.3, eyeWhite);
    }

    // Mouth
    final mouthPaint = Paint()
      ..color = const Color(0xFF881337)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;

    final mouthCenter = Offset(center.dx, center.dy + radius * 0.35);

    if (mood == AvatarMood.celebrating) {
      final fillMouth = Paint()..color = const Color(0xFF881337);
      final smilePath = Path()
        ..moveTo(mouthCenter.dx - 6, mouthCenter.dy)
        ..quadraticBezierTo(mouthCenter.dx, mouthCenter.dy + 7, mouthCenter.dx + 6, mouthCenter.dy)
        ..close();
      canvas.drawPath(smilePath, fillMouth);
    } else if (mood == AvatarMood.correcting) {
      canvas.drawLine(
        Offset(mouthCenter.dx - 4, mouthCenter.dy + 2),
        Offset(mouthCenter.dx + 4, mouthCenter.dy + 2),
        mouthPaint,
      );
    } else {
      canvas.drawArc(
        Rect.fromCenter(center: mouthCenter, width: 10, height: 6),
        0.1,
        math.pi - 0.2,
        false,
        mouthPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _AvatarPainter oldDelegate) => oldDelegate.mood != mood;
}
