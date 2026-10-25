import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/curriculum_data.dart';
import '../../data/providers/app_providers.dart';
import '../../data/services/api_service.dart';
import '../../services/audio_engine.dart';
import '../widgets/ai_avatar_coach.dart';
import '../widgets/hand_finger_guide.dart';
import '../widgets/instruments/interactive_bansuri.dart';
import '../widgets/instruments/interactive_fretboard.dart';
import '../widgets/instruments/interactive_keyboard.dart';
import '../widgets/instruments/interactive_violin.dart';
import '../widgets/pitch_gauge.dart';
import '../widgets/smart_correction_dialog.dart';
import '../widgets/technique_demo.dart';

class PracticeStudioScreen extends ConsumerStatefulWidget {
  final Exercise exercise;
  final Lesson? lesson;
  final VoidCallback? onBackToCurriculum;

  const PracticeStudioScreen({
    super.key,
    required this.exercise,
    this.lesson,
    this.onBackToCurriculum,
  });

  @override
  ConsumerState<PracticeStudioScreen> createState() => _PracticeStudioScreenState();
}

class _PracticeStudioScreenState extends ConsumerState<PracticeStudioScreen> {
  int _currentNoteIndex = 0;
  int _score = 0;
  int _streak = 0;
  bool _isPlaying = false;
  bool _isMetronomeRunning = false;
  Timer? _metronomeTimer;
  int _bpm = 70;
  AudioDetectionData? _currentDetection;
  int _totalAttempts = 0;
  int _correctAttempts = 0;
  bool _exerciseCompleted = false;
  bool _isWrongActive = false;
  String? _lastMistakeReason;

  final List<Map<String, dynamic>> _evaluatedNotes = [];

  @override
  void initState() {
    super.initState();
    final rawBpm = widget.exercise.bpm ?? 70;
    _bpm = (rawBpm < 40 || rawBpm > 180) ? 70 : rawBpm;
  }

  @override
  void dispose() {
    _metronomeTimer?.cancel();
    super.dispose();
  }

  void _startSession() {
    setState(() {
      _isPlaying = true;
      _currentNoteIndex = 0;
      _score = 0;
      _streak = 0;
      _totalAttempts = 0;
      _correctAttempts = 0;
      _evaluatedNotes.clear();
      _exerciseCompleted = false;
      _isWrongActive = false;
      _lastMistakeReason = null;
    });
  }

  void _stopSession() {
    setState(() {
      _isPlaying = false;
      _metronomeTimer?.cancel();
      _isMetronomeRunning = false;
    });
  }

  void _toggleMetronome() {
    setState(() {
      _isMetronomeRunning = !_isMetronomeRunning;
    });

    if (_isMetronomeRunning) {
      final intervalMs = (60000 / _bpm).round();
      var tickCount = 0;
      _metronomeTimer = Timer.periodic(Duration(milliseconds: intervalMs), (timer) {
        audioEngine.playMetronomeTick(isAccent: (tickCount % 4 == 0));
        tickCount++;
      });
    } else {
      _metronomeTimer?.cancel();
    }
  }

  TargetNote? _getCurrentTargetNote() {
    if (widget.exercise.targetNotes.isEmpty) return null;
    return widget.exercise.targetNotes[_currentNoteIndex % widget.exercise.targetNotes.length];
  }

  void _handleNoteInput(String playedNote) {
    if (!_isPlaying && !_exerciseCompleted) {
      _isPlaying = true;
    }

    final currentTarget = _getCurrentTargetNote();
    if (currentTarget == null) return;

    final targetName = currentTarget.note;
    final cleanPlayed = playedNote.toUpperCase().replaceAll(RegExp(r'\s+'), '');
    final cleanTarget = targetName.toUpperCase().replaceAll(RegExp(r'\s+'), '');

    final isMatch = cleanPlayed == cleanTarget ||
        cleanPlayed.replaceAll(RegExp(r'\d'), '') == cleanTarget.replaceAll(RegExp(r'\d'), '');

    setState(() {
      _totalAttempts++;
      final freq = noteToFrequency(playedNote);
      _currentDetection = frequencyToNoteData(freq);

      _evaluatedNotes.add({
        'played': playedNote,
        'expected': targetName,
        'isCorrect': isMatch,
      });

      if (isMatch) {
        _correctAttempts++;
        _score += 10 + (_streak * 2);
        _streak += 1;
        _isWrongActive = false;
        _lastMistakeReason = null;

        if (_currentNoteIndex < widget.exercise.targetNotes.length - 1) {
          _currentNoteIndex++;
        } else {
          _finishSession();
        }
      } else {
        _streak = 0;
        _isWrongActive = true;
        _lastMistakeReason =
            'Pitch mismatch! Expected $targetName (${currentTarget.displayName ?? ""}), but detected $playedNote. Check finger placement.';
      }
    });
  }

  void _finishSession() {
    _exerciseCompleted = true;
    _isPlaying = false;
    _metronomeTimer?.cancel();
    _isMetronomeRunning = false;

    final instrument = ref.read(instrumentProvider);
    final accuracyPercent = _totalAttempts > 0 ? ((_correctAttempts / _totalAttempts) * 100).round() : 100;
    final isPassed = accuracyPercent >= widget.exercise.requiredPassingScore;

    if (isPassed) {
      ref.read(userProgressProvider.notifier).completeExercise(widget.exercise.id, instrument);
    }

    final api = ref.read(apiServiceProvider);
    api.submitPracticeSession(
      userId: 'student_1',
      instrument: instrument.name,
      durationSeconds: mathMax(10, _totalAttempts * 3),
      notesPlayed: _totalAttempts,
      pitchAccuracy: accuracyPercent,
      rhythmAccuracy: 88,
      overallScore: accuracyPercent,
      isPassed: isPassed,
      exerciseId: widget.exercise.id,
    ).catchError((err) {
      debugPrint('Sync practice session note: $err');
      return <String, dynamic>{};
    });

    _showSuccessDialog(accuracyPercent, isPassed);
  }

  int mathMax(int a, int b) => a > b ? a : b;

  void _showSuccessDialog(int accuracyPercent, bool isPassed) {
    final xpEarned = (_score * 0.5).round();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF131722),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: BorderSide(
              color: isPassed ? const Color(0xFF10B981) : const Color(0xFFE5C07B),
              width: 2,
            ),
          ),
          title: Row(
            children: [
              Icon(
                isPassed ? Icons.stars_rounded : Icons.replay_rounded,
                color: isPassed ? const Color(0xFF10B981) : const Color(0xFFE5C07B),
                size: 28,
              ),
              const SizedBox(width: 10),
              Text(
                isPassed ? '🎉 Standard Achieved!' : 'Keep Polishing Technique',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                widget.exercise.title,
                style: const TextStyle(
                  color: Color(0xFFE5C07B),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E2433),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildDialogMetric('Score', '$_score'),
                    _buildDialogMetric('Accuracy', '$accuracyPercent%'),
                    _buildDialogMetric('XP Earned', '+$xpEarned'),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Exercise finished in $_totalAttempts attempts with $accuracyPercent% note accuracy (Passing requirement: ${widget.exercise.requiredPassingScore}%).',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12.5),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _startSession();
              },
              child: const Text('PRACTICE AGAIN', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () {
                if (widget.lesson != null && isPassed) {
                  final api = ref.read(apiServiceProvider);
                  api.completeLesson(
                    userId: 'student_1',
                    lessonId: widget.lesson!.id,
                    score: accuracyPercent,
                  ).catchError((err) {
                    debugPrint('Sync lesson completion note: $err');
                    return <String, dynamic>{};
                  });
                }
                Navigator.of(context).pop();
                widget.onBackToCurriculum?.call();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: isPassed ? const Color(0xFF10B981) : const Color(0xFFE5C07B),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              ),
              child: const Text('CONTINUE', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildDialogMetric(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.w900)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
      ],
    );
  }

  void _openPostureCorrection() {
    final instrument = ref.read(instrumentProvider);
    String title = 'Straighten Fret-Hand Wrist';
    String explanation = 'Your wrist is slightly collapsed inward, which causes string muting and finger fatigue.';
    String suggestedFix = 'Lower your elbow slightly and bring your palm forward so your wrist remains in a neutral straight line.';

    if (instrument == InstrumentType.violin) {
      title = '90° Bow Alignment Plane';
      explanation = 'Your bow hair is drifting diagonal across the bridge, causing raspiness.';
      suggestedFix = 'Flex your right wrist on down-bow and draw parallel to the bridge line.';
    } else if (instrument == InstrumentType.bansuri) {
      title = 'Flat Finger-Pad Hole Seal';
      explanation = 'Finger tips are curling into holes, allowing air to escape and detuning Swaras.';
      suggestedFix = 'Flatten the fleshy middle pad of your fingers to cover each tone hole airtight.';
    } else if (instrument == InstrumentType.keyboard) {
      title = 'Curved Piano Dome Arch';
      explanation = 'Finger joints are collapsing flat against the white keys.';
      suggestedFix = 'Curve your hand naturally like holding an apple, striking keys with fingertip pads.';
    }

    showDialog(
      context: context,
      builder: (context) => SmartCorrectionDialog(
        title: title,
        explanation: explanation,
        suggestedFix: suggestedFix,
        animationType: '${instrument.name}_posture_fix',
        onDismiss: () => Navigator.of(context).pop(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final instrument = ref.watch(instrumentProvider);
    final currentTheme = ref.watch(themeProvider);
    final colors = currentTheme.colors;
    final currentTarget = _getCurrentTargetNote();
    final targetNoteName = currentTarget?.note ?? 'C4';

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      children: [
        // Navigation Top Bar matching React PracticeExerciseView.tsx
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: colors.bgCard,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 16,
            runSpacing: 12,
            children: [
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 350),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (widget.onBackToCurriculum != null) ...[
                      IconButton(
                        icon: const Icon(Icons.arrow_back_rounded, size: 20),
                        style: IconButton.styleFrom(
                          backgroundColor: colors.bgCardElevated,
                          side: BorderSide(color: colors.borderSubtle),
                        ),
                        onPressed: widget.onBackToCurriculum,
                      ),
                      const SizedBox(width: 12),
                    ],
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Wrap(
                            crossAxisAlignment: WrapCrossAlignment.center,
                            spacing: 4,
                            children: [
                              Text(
                                (widget.lesson?.title ?? 'INTERACTIVE PRACTICE').toUpperCase(),
                                style: TextStyle(
                                  color: colors.accentPrimary,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1.1,
                                ),
                              ),
                              Text('•', style: TextStyle(color: colors.borderSubtle)),
                              Text(
                                instrument.displayName.toUpperCase(),
                                style: TextStyle(color: colors.textMuted, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            widget.exercise.title,
                            style: GoogleFonts.instrumentSerif(
                              fontStyle: FontStyle.italic,
                              fontSize: 22,
                              color: colors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Metronome BPM Container
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withAlpha(70),
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: colors.borderSubtle),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: Icon(
                        _isMetronomeRunning ? Icons.volume_up : Icons.volume_off,
                        size: 16,
                        color: _isMetronomeRunning ? const Color(0xFF10B981) : colors.textMuted,
                      ),
                      onPressed: _toggleMetronome,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
                    ),
                    Text(
                      '$_bpm BPM',
                      style: TextStyle(
                        color: colors.accentPrimary,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                    SizedBox(
                      width: 100,
                      child: SliderTheme(
                        data: SliderThemeData(
                          trackHeight: 2,
                          thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                          overlayShape: const RoundSliderOverlayShape(overlayRadius: 10),
                          activeTrackColor: colors.accentPrimary,
                          thumbColor: colors.accentPrimary,
                        ),
                        child: Slider(
                          value: _bpm.toDouble(),
                          min: 40,
                          max: 180,
                          onChanged: (val) {
                            setState(() => _bpm = val.round());
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Score & Streak Telemetry
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: colors.bgCardElevated,
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: colors.borderSubtle),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.bolt, color: colors.accentPrimary, size: 14),
                    const SizedBox(width: 4),
                    Text('$_score pts', style: TextStyle(color: colors.textPrimary, fontWeight: FontWeight.bold, fontSize: 11)),
                    const SizedBox(width: 6),
                    Text('🔥 $_streak', style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 11)),
                  ],
                ),
              ),

              // Start / Stop Practice Button
              ElevatedButton.icon(
                onPressed: _isPlaying ? _stopSession : _startSession,
                icon: Icon(
                  _isPlaying ? Icons.stop_rounded : Icons.play_arrow_rounded,
                  size: 16,
                ),
                label: Text(
                  _isPlaying
                      ? 'STOP'
                      : (_exerciseCompleted ? 'PRACTICE AGAIN' : 'START EXERCISE'),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _isPlaying ? const Color(0xFFEF4444) : colors.accentPrimary,
                  foregroundColor: _isPlaying ? Colors.white : Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                  textStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Target Note Queue / Note Highway
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: colors.bgCard,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 8,
                runSpacing: 4,
                children: [
                  Text(
                    'TARGET NOTE QUEUE (${_currentNoteIndex + 1}/${widget.exercise.targetNotes.length})',
                    style: TextStyle(
                      color: colors.accentPrimary,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.1,
                    ),
                  ),
                  Text(
                    'PASSING TARGET: ${widget.exercise.requiredPassingScore}%',
                    style: TextStyle(
                      color: colors.textMuted,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: widget.exercise.targetNotes.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final target = entry.value;
                    final isCurrent = idx == _currentNoteIndex && _isPlaying;
                    final isPast = idx < _currentNoteIndex;
                    final evalResult = idx < _evaluatedNotes.length ? _evaluatedNotes[idx] : null;
                    final isCorrect = evalResult?['isCorrect'] == true;

                    Color cardBg;
                    Color cardBorder;
                    Color textColor;

                    if (isCurrent) {
                      cardBg = colors.accentPrimary;
                      cardBorder = colors.accentPrimary;
                      textColor = Colors.black;
                    } else if (isPast) {
                      if (isCorrect) {
                        cardBg = const Color(0xFF10B981).withAlpha(40);
                        cardBorder = const Color(0xFF10B981);
                        textColor = const Color(0xFF10B981);
                      } else {
                        cardBg = const Color(0xFFEF4444).withAlpha(40);
                        cardBorder = const Color(0xFFEF4444);
                        textColor = const Color(0xFFEF4444);
                      }
                    } else {
                      cardBg = colors.bgCardElevated;
                      cardBorder = colors.borderSubtle;
                      textColor = colors.textMuted;
                    }

                    return AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      margin: const EdgeInsets.only(right: 10),
                      width: 68,
                      height: 84,
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: cardBorder, width: isCurrent ? 2 : 1),
                        boxShadow: isCurrent
                            ? [
                                BoxShadow(
                                  color: colors.accentPrimary.withAlpha(80),
                                  blurRadius: 10,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      padding: const EdgeInsets.all(8),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '#${idx + 1}',
                            style: TextStyle(
                              color: textColor.withAlpha(180),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            target.displayName ?? target.note,
                            style: TextStyle(
                              color: textColor,
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          Text(
                            target.fingerNumber != null
                                ? 'F${target.fingerNumber}'
                                : (target.string != null ? 'S${target.string}' : '1 beat'),
                            style: TextStyle(
                              color: textColor.withAlpha(200),
                              fontSize: 9.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // AI Avatar Diagnostic Coach
        AIAvatarCoach(
          instrument: instrument,
          isWrongPlaying: _isWrongActive,
          wrongReason: _lastMistakeReason,
          isLessonCompleted: _exerciseCompleted && _score >= widget.exercise.requiredPassingScore,
          completedLessonTitle: widget.lesson?.title ?? widget.exercise.title,
          nextLesson: null,
          onRetryExercise: _startSession,
        ),

        const SizedBox(height: 16),

        // Interactive Instrument Interface
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: colors.bgCard,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Column(
            children: [
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 8,
                runSpacing: 4,
                children: [
                  Text(
                    'INTERACTIVE INSTRUMENT INTERFACE',
                    style: TextStyle(
                      color: colors.accentPrimary,
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.1,
                    ),
                  ),
                  Text(
                    'Click keys/frets or play real instrument',
                    style: TextStyle(color: colors.textMuted, fontSize: 11),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Instrument view
              _buildInstrumentView(instrument, currentTarget),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Realtime Audio & Vision Monitor
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: colors.bgCard,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 8,
                runSpacing: 8,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.mic_rounded, color: colors.accentPrimary, size: 16),
                      const SizedBox(width: 8),
                      Text(
                        'REAL-TIME AUDIO & VISION MONITOR',
                        style: TextStyle(
                          color: colors.accentPrimary,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ],
                  ),
                  OutlinedButton.icon(
                    onPressed: _openPostureCorrection,
                    icon: const Icon(Icons.accessibility_new_rounded, size: 14),
                    label: const Text('CHECK POSTURE FIX'),
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: colors.accentPrimary.withAlpha(80)),
                      foregroundColor: colors.accentPrimary,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      textStyle: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              PitchGaugeWidget(
                detectionData: _currentDetection,
                targetNote: targetNoteName,
              ),

              const SizedBox(height: 12),

              HandFingerGuide(
                activeFinger: currentTarget?.fingerNumber ?? 1,
                label: '${instrument.displayName} Kinetic Finger Placement',
              ),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // Technique demo card
        TechniqueDemonstrationWidget(
          instrument: instrument,
          title: widget.exercise.title,
          tip: widget.exercise.correctiveTip ??
              'Maintain relaxed shoulder alignment and arch finger joints perpendicular to the instrument surface.',
        ),
      ],
    );
  }

  Widget _buildInstrumentView(InstrumentType instrument, TargetNote? currentTarget) {
    switch (instrument) {
      case InstrumentType.keyboard:
        return InteractiveKeyboard(
          targetNotes: currentTarget != null ? [currentTarget.note] : [],
          activeNote: _currentDetection?.noteName,
          onNotePressed: _handleNoteInput,
        );

      case InstrumentType.guitar:
        return InteractiveFretboard(
          targetNotes: currentTarget != null && currentTarget.fret != null && currentTarget.string != null
              ? [
                  TargetFretNote(
                    string: currentTarget.string!,
                    fret: currentTarget.fret!,
                    note: currentTarget.note,
                    finger: currentTarget.fingerNumber,
                  )
                ]
              : [],
          activeNote: _currentDetection?.noteName,
          onNotePressed: _handleNoteInput,
        );

      case InstrumentType.violin:
        return InteractiveViolinFingerboard(
          targetNotes: currentTarget != null ? [currentTarget.note] : [],
          activeNote: _currentDetection?.noteName,
          onNotePressed: _handleNoteInput,
        );

      case InstrumentType.bansuri:
        return InteractiveBansuri(
          targetHolePattern: currentTarget?.holePattern,
          activeNote: _currentDetection?.noteName,
          onNotePressed: _handleNoteInput,
        );
    }
  }
}
