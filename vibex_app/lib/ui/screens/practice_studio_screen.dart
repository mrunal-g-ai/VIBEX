import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/curriculum_data.dart';
import '../../data/providers/app_providers.dart';
import '../../data/services/api_service.dart';
import '../../services/audio_engine.dart';
import '../widgets/hand_finger_guide.dart';
import '../widgets/instruments/interactive_bansuri.dart';
import '../widgets/instruments/interactive_fretboard.dart';
import '../widgets/instruments/interactive_keyboard.dart';
import '../widgets/instruments/interactive_violin.dart';
import '../widgets/pitch_gauge.dart';
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
  bool _isMetronomeRunning = false;
  Timer? _metronomeTimer;
  int _bpm = 70;
  AudioDetectionData? _currentDetection;
  int _totalAttempts = 0;
  int _correctAttempts = 0;
  bool _isCameraActive = false;
  bool _exerciseCompleted = false;

  @override
  void initState() {
    super.initState();
    final rawBpm = widget.exercise.bpm ?? 70;
    _bpm = (rawBpm < 40 || rawBpm > 180) ? 70 : rawBpm;
    // Real pitch detection is null until actual audio/note input is received
  }

  @override
  void dispose() {
    _metronomeTimer?.cancel();
    super.dispose();
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
    final currentTarget = _getCurrentTargetNote();
    if (currentTarget == null) return;

    final targetName = currentTarget.note;
    final isMatch = playedNote.toUpperCase().replaceAll(RegExp(r'\s+'), '') ==
        targetName.toUpperCase().replaceAll(RegExp(r'\s+'), '');

    setState(() {
      _totalAttempts++;
      final freq = noteToFrequency(playedNote);
      _currentDetection = frequencyToNoteData(freq);

      if (isMatch) {
        _correctAttempts++;
        _score += 10 + (_streak * 2);
        _streak += 1;

        if (_currentNoteIndex < widget.exercise.targetNotes.length - 1) {
          _currentNoteIndex++;
        } else {
          _exerciseCompleted = true;
          _metronomeTimer?.cancel();
          _isMetronomeRunning = false;
        }
      } else {
        _streak = 0;
      }
    });

    if (_exerciseCompleted) {
      final instrument = ref.read(instrumentProvider);
      ref.read(userProgressProvider.notifier).completeExercise(widget.exercise.id, instrument);

      final accuracyPercent = _totalAttempts > 0 ? ((_correctAttempts / _totalAttempts) * 100).round() : 100;
      final api = ref.read(apiServiceProvider);
      api.submitPracticeSession(
        userId: 'user_local',
        instrument: instrument.name,
        durationSeconds: _totalAttempts * 3,
        notesPlayed: _totalAttempts,
        pitchAccuracy: accuracyPercent,
        rhythmAccuracy: 88,
        overallScore: accuracyPercent,
        isPassed: accuracyPercent >= widget.exercise.requiredPassingScore,
        exerciseId: widget.exercise.id,
      ).catchError((err) {
        debugPrint('Sync practice session note: $err');
        return <String, dynamic>{};
      });

      _showSuccessDialog();
    }
  }

  void _showSuccessDialog() {
    final accuracyPercent = _totalAttempts > 0 ? ((_correctAttempts / _totalAttempts) * 100).round() : 100;
    final xpEarned = (_score * 0.5).round();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF131722),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFF10B981), width: 2),
          ),
          title: Row(
            children: const [
              Icon(Icons.stars, color: Color(0xFFE5C07B), size: 28),
              SizedBox(width: 10),
              Text(
                'Exercise Complete!',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
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
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E2433),
                  borderRadius: BorderRadius.circular(12),
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
                'Exercise finished in $_totalAttempts attempts with $accuracyPercent% note accuracy.',
                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                setState(() {
                  _currentNoteIndex = 0;
                  _exerciseCompleted = false;
                  _score = 0;
                  _streak = 0;
                });
              },
              child: const Text('RETRY', style: TextStyle(color: Color(0xFF94A3B8))),
            ),
            ElevatedButton(
              onPressed: () {
                if (widget.lesson != null) {
                  final api = ref.read(apiServiceProvider);
                  api.completeLesson(
                    userId: 'user_local',
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
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.black,
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
        Text(value, style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final instrument = ref.watch(instrumentProvider);
    final currentTarget = _getCurrentTargetNote();
    final targetNoteName = currentTarget?.note ?? 'C4';

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      children: [
        // Header with Exercise Info and Back button
        Row(
          children: [
            if (widget.onBackToCurriculum != null)
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: widget.onBackToCurriculum,
              ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.lesson != null ? widget.lesson!.title.toUpperCase() : 'PRACTICE STUDIO',
                    style: const TextStyle(
                      color: Color(0xFFE5C07B),
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                  Text(
                    widget.exercise.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            // Score & Streak Badges
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF161B26),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.bolt, color: Color(0xFFE5C07B), size: 18),
                  Text('$_score pts', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(width: 8),
                  Text('🔥 $_streak', style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Metronome Control Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF0F1219),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF1E293B)),
          ),
          child: Row(
            children: [
              IconButton(
                icon: Icon(
                  _isMetronomeRunning ? Icons.stop_circle : Icons.play_circle,
                  color: _isMetronomeRunning ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                  size: 28,
                ),
                onPressed: _toggleMetronome,
              ),
              const SizedBox(width: 8),
              Text(
                '$_bpm BPM',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
              Expanded(
                child: Slider(
                  value: _bpm.toDouble(),
                  min: 40,
                  max: 180,
                  activeColor: const Color(0xFFE5C07B),
                  onChanged: (val) {
                    setState(() {
                      _bpm = val.round();
                    });
                    if (_isMetronomeRunning) {
                      _toggleMetronome();
                      _toggleMetronome();
                    }
                  },
                ),
              ),
              // Vision toggle button
              IconButton(
                icon: Icon(
                  _isCameraActive ? Icons.videocam : Icons.videocam_off,
                  color: _isCameraActive ? const Color(0xFF38BDF8) : const Color(0xFF64748B),
                ),
                tooltip: _isCameraActive ? 'Camera Active' : 'Camera Off',
                onPressed: () {
                  setState(() {
                    _isCameraActive = !_isCameraActive;
                  });
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Target Notes Stream / Progression
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFF131722),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF2E384D)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'TARGET NOTE SEQUENCE',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                  Text(
                    '${_currentNoteIndex + 1} / ${widget.exercise.targetNotes.length}',
                    style: const TextStyle(
                      color: Color(0xFFE5C07B),
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: widget.exercise.targetNotes.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final target = entry.value;
                    final isCurrent = idx == _currentNoteIndex;
                    final isPassed = idx < _currentNoteIndex;

                    return Container(
                      margin: const EdgeInsets.only(right: 10),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: isCurrent
                            ? const Color(0xFFE5C07B)
                            : isPassed
                                ? const Color(0xFF10B981).withAlpha(30)
                                : const Color(0xFF1E2433),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isCurrent
                              ? const Color(0xFFFBBF24)
                              : isPassed
                                  ? const Color(0xFF10B981)
                                  : const Color(0xFF334155),
                          width: isCurrent ? 2 : 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            target.note,
                            style: TextStyle(
                              color: isCurrent ? Colors.black : Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          if (target.fingerNumber != null)
                            Text(
                              'F${target.fingerNumber}',
                              style: TextStyle(
                                color: isCurrent ? Colors.black87 : const Color(0xFF94A3B8),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
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

        // Interactive Instrument view (Dynamic based on selected instrument)
        _buildInstrumentView(instrument, currentTarget),
        const SizedBox(height: 16),

        // Pitch Gauge Widget
        PitchGaugeWidget(
          detectionData: _currentDetection,
          targetNote: targetNoteName,
        ),
        const SizedBox(height: 16),

        // Hand Finger Guide & Technique Demo
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: HandFingerGuide(
                activeFinger: currentTarget?.fingerNumber ?? 1,
                label: '${instrument.displayName} Hand Posture',
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Technique demo
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
