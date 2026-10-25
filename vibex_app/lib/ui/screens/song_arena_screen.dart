import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/songs_data.dart';
import '../../data/providers/app_providers.dart';
import '../../services/audio_engine.dart';
import '../widgets/instruments/interactive_bansuri.dart';
import '../widgets/instruments/interactive_fretboard.dart';
import '../widgets/instruments/interactive_keyboard.dart';
import '../widgets/instruments/interactive_violin.dart';

class SongArenaScreen extends ConsumerStatefulWidget {
  final Song song;
  final VoidCallback? onBackToLibrary;

  const SongArenaScreen({
    super.key,
    required this.song,
    this.onBackToLibrary,
  });

  @override
  ConsumerState<SongArenaScreen> createState() => _SongArenaScreenState();
}

class _SongArenaScreenState extends ConsumerState<SongArenaScreen> {
  int _currentSectionIndex = 0;
  bool _isPlaying = false;
  Timer? _playbackTimer;
  double _currentBeat = 0.0;
  int _score = 0;
  int _combo = 0;
  String _lastFeedback = 'GET READY';
  Color _feedbackColor = const Color(0xFFE5C07B);

  @override
  void dispose() {
    _playbackTimer?.cancel();
    super.dispose();
  }

  void _togglePlayback() {
    setState(() {
      _isPlaying = !_isPlaying;
    });

    if (_isPlaying) {
      final msPerBeat = (60000 / widget.song.tempo).round();
      final interval = msPerBeat ~/ 4; // 16th note resolution

      _playbackTimer = Timer.periodic(Duration(milliseconds: interval), (timer) {
        setState(() {
          _currentBeat += 0.25;

          // Check if song note is triggered on integer beat
          final section = _getCurrentSection();
          final matchingNote = section.notes.firstWhere(
            (n) => (n.startTime ?? 0).toDouble() == _currentBeat.floorToDouble() && _currentBeat % 1.0 == 0.0,
            orElse: () => const SongNote(note: ''),
          );

          if (matchingNote.note.isNotEmpty) {
            audioEngine.playNote(
              matchingNote.note,
              instrument: widget.song.instrument,
              duration: matchingNote.duration,
            );
          }

          if (_currentBeat > section.endBeat) {
            _currentBeat = section.startBeat.toDouble();
          }
        });
      });
    } else {
      _playbackTimer?.cancel();
    }
  }

  SongSection _getCurrentSection() {
    if (widget.song.sections.isEmpty) {
      return const SongSection(id: 's1', name: 'Intro', startBeat: 0, endBeat: 16, notes: []);
    }
    return widget.song.sections[_currentSectionIndex % widget.song.sections.length];
  }

  void _handleNoteHit(String note) {
    final section = _getCurrentSection();
    // Check if any note in the current beat window matches
    final currentBeatInt = _currentBeat.round();
    final match = section.notes.any((n) =>
        (n.startTime ?? 0) >= (currentBeatInt - 1) &&
        (n.startTime ?? 0) <= (currentBeatInt + 1) &&
        n.note.toUpperCase() == note.toUpperCase());

    setState(() {
      if (match) {
        _combo += 1;
        _score += 100 * (_combo > 10 ? 3 : (_combo > 5 ? 2 : 1));
        _lastFeedback = 'PERFECT!';
        _feedbackColor = const Color(0xFF10B981);
      } else {
        _combo = 0;
        _lastFeedback = 'GOOD TRY';
        _feedbackColor = const Color(0xFFF59E0B);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final currentTheme = ref.watch(themeProvider);
    final colors = currentTheme.colors;
    final section = _getCurrentSection();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      children: [
        // Top Arena Header
        Row(
          children: [
            if (widget.onBackToLibrary != null)
              IconButton(
                icon: Icon(Icons.arrow_back, color: colors.textPrimary),
                onPressed: widget.onBackToLibrary,
              ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'PERFORMANCE ARENA',
                    style: TextStyle(
                      color: colors.accentPrimary,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                  Text(
                    widget.song.title,
                    style: TextStyle(
                      color: colors.textPrimary,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            // Transport Play Button
            ElevatedButton.icon(
              onPressed: _togglePlayback,
              style: ElevatedButton.styleFrom(
                backgroundColor: _isPlaying ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                foregroundColor: Colors.black,
              ),
              icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
              label: Text(_isPlaying ? 'PAUSE' : 'PLAY TRACK'),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Section Tabs
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: widget.song.sections.asMap().entries.map((entry) {
              final idx = entry.key;
              final sec = entry.value;
              final isSelected = idx == _currentSectionIndex;

              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(sec.name),
                  selected: isSelected,
                  selectedColor: colors.accentPrimary,
                  backgroundColor: colors.bgCardElevated,
                  labelStyle: TextStyle(
                    color: isSelected
                        ? (currentTheme == VibexTheme.zen ? Colors.white : Colors.black)
                        : colors.textMuted,
                    fontWeight: FontWeight.bold,
                  ),
                  onSelected: (val) {
                    setState(() {
                      _currentSectionIndex = idx;
                      _currentBeat = sec.startBeat.toDouble();
                    });
                  },
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 16),

        // Rhythm Timeline Canvas & Hit Line
        Container(
          height: 140,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: colors.bgMain,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Stack(
            children: [
              // Target Hit Marker Line
              Positioned(
                left: 120,
                top: 0,
                bottom: 0,
                child: Container(
                  width: 3,
                  decoration: BoxDecoration(
                    color: colors.accentPrimary,
                    boxShadow: [
                      BoxShadow(
                        color: colors.accentPrimary.withAlpha(150),
                        blurRadius: 8,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                ),
              ),

              // Feedback Banner
              Positioned(
                right: 12,
                top: 6,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      _lastFeedback,
                      style: TextStyle(
                        color: _feedbackColor,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    Text(
                      'COMBO: ${_combo}x • SCORE: $_score',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),

              // Notes stream moving left as beat advances
              ...section.notes.map((songNote) {
                final noteBeat = (songNote.startTime ?? 0).toDouble();
                final deltaBeat = noteBeat - _currentBeat;
                final xPos = 120 + (deltaBeat * 70.0);

                if (xPos < -60 || xPos > 800) return const SizedBox.shrink();

                return Positioned(
                  left: xPos,
                  top: 40,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFE5C07B), Color(0xFFB8914B)],
                      ),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFE5C07B).withAlpha(100),
                          blurRadius: 6,
                        ),
                      ],
                    ),
                    child: Text(
                      songNote.note,
                      style: const TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                      ),
                    ),
                  ),
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Live Instrument reference
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: colors.bgCard,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'PLAY ALONG: ${widget.song.instrument.displayName.toUpperCase()}',
                    style: TextStyle(
                      color: colors.textMuted,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                  Text(
                    'Tap to trigger note hit',
                    style: TextStyle(color: colors.accentPrimary, fontSize: 11),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              _buildArenaInstrument(widget.song.instrument),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildArenaInstrument(InstrumentType inst) {
    switch (inst) {
      case InstrumentType.keyboard:
        return InteractiveKeyboard(
          onNotePressed: _handleNoteHit,
        );
      case InstrumentType.guitar:
        return InteractiveFretboard(
          onNotePressed: _handleNoteHit,
        );
      case InstrumentType.violin:
        return InteractiveViolinFingerboard(
          onNotePressed: _handleNoteHit,
        );
      case InstrumentType.bansuri:
        return InteractiveBansuri(
          onNotePressed: _handleNoteHit,
        );
    }
  }
}
