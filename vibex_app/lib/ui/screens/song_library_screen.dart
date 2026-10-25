import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/songs_data.dart';
import '../../data/providers/app_providers.dart';
import '../../services/audio_engine.dart';

class SongLibraryScreen extends ConsumerStatefulWidget {
  final void Function(Song song) onSelectSong;

  const SongLibraryScreen({
    super.key,
    required this.onSelectSong,
  });

  @override
  ConsumerState<SongLibraryScreen> createState() => _SongLibraryScreenState();
}

class _SongLibraryScreenState extends ConsumerState<SongLibraryScreen> {
  String _selectedDifficulty = 'all';
  String _selectedGenre = 'all';
  String _searchQuery = '';
  String? _previewingSongId;
  Timer? _previewTimer;

  @override
  void dispose() {
    _previewTimer?.cancel();
    super.dispose();
  }

  void _stopPreview() {
    _previewTimer?.cancel();
    _previewTimer = null;
    setState(() {
      _previewingSongId = null;
    });
  }

  void _togglePreview(Song song) {
    if (_previewingSongId == song.id) {
      _stopPreview();
      return;
    }

    _stopPreview();
    setState(() {
      _previewingSongId = song.id;
    });

    final allNotes = <SongNote>[];
    for (final sec in song.sections) {
      allNotes.addAll(sec.notes);
    }

    if (allNotes.isEmpty) {
      _stopPreview();
      return;
    }

    int noteIndex = 0;
    final beatIntervalMs = (60000 / song.tempo * 0.75).round();

    _previewTimer = Timer.periodic(Duration(milliseconds: beatIntervalMs), (timer) {
      if (noteIndex >= allNotes.length || _previewingSongId != song.id) {
        _stopPreview();
        return;
      }

      final note = allNotes[noteIndex];
      audioEngine.playNote(note.note, instrument: song.instrument, duration: 0.4);
      noteIndex++;
    });
  }

  @override
  Widget build(BuildContext context) {
    final instrument = ref.watch(instrumentProvider);
    final currentTheme = ref.watch(themeProvider);
    final colors = currentTheme.colors;
    final allSongs = kSongsData.where((s) => s.instrument == instrument).toList();

    // Extract available genres
    final genreSet = {'all'};
    for (final s in allSongs) {
      if (s.genre.contains('Bhajan')) {
        genreSet.add('Bhajan');
      } else if (s.genre.contains('Classical')) {
        genreSet.add('Classical');
      } else if (s.genre.contains('Hindi') || s.genre.contains('Bollywood')) {
        genreSet.add('Bollywood');
      } else if (s.genre.contains('Rock') || s.genre.contains('Pop') || s.genre.contains('Folk')) {
        genreSet.add('Rock / Folk');
      } else {
        genreSet.add(s.genre);
      }
    }

    final filteredSongs = allSongs.where((song) {
      if (_selectedDifficulty != 'all' && song.difficulty.toLowerCase() != _selectedDifficulty.toLowerCase()) {
        return false;
      }
      if (_selectedGenre != 'all' && !song.genre.toLowerCase().contains(_selectedGenre.toLowerCase())) {
        return false;
      }
      if (_searchQuery.trim().isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchesTitle = song.title.toLowerCase().contains(q);
        final matchesDesc = song.description.toLowerCase().contains(q);
        final matchesGenre = song.genre.toLowerCase().contains(q);
        final matchesKey = song.key.toLowerCase().contains(q);
        if (!matchesTitle && !matchesDesc && !matchesGenre && !matchesKey) {
          return false;
        }
      }
      return true;
    }).toList();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [colors.bgCard, colors.bgCardElevated, colors.bgMain],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: colors.borderSubtle),
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: colors.accentPrimary.withAlpha(35),
                  border: Border.all(color: colors.accentPrimary),
                ),
                child: Center(
                  child: Icon(Icons.library_music, color: colors.accentPrimary, size: 26),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'VIBEX SONG LIBRARY',
                      style: TextStyle(
                        color: colors.accentPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Repertoire for ${instrument.displayName}',
                      style: TextStyle(
                        color: colors.textPrimary,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Interactive backing tracks with real-time rhythm feedback',
                      style: TextStyle(color: colors.textMuted, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Search Bar
        TextField(
          style: TextStyle(color: colors.textPrimary, fontSize: 13),
          decoration: InputDecoration(
            hintText: 'Search songs by title, genre, key (e.g. Bhajan, Yaman, C Major)...',
            hintStyle: TextStyle(color: colors.textMuted, fontSize: 12.5),
            prefixIcon: Icon(Icons.search_rounded, size: 20, color: colors.textMuted),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            filled: true,
            fillColor: colors.bgCardElevated,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(100),
              borderSide: BorderSide(color: colors.borderSubtle),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(100),
              borderSide: BorderSide(color: colors.borderSubtle),
            ),
          ),
          onChanged: (val) {
            setState(() {
              _searchQuery = val;
            });
          },
        ),
        const SizedBox(height: 14),

        // Difficulty filter chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: ['all', 'beginner', 'intermediate', 'advanced'].map((diff) {
              final isSelected = _selectedDifficulty == diff;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(diff.toUpperCase()),
                  selected: isSelected,
                  selectedColor: colors.accentPrimary,
                  backgroundColor: colors.bgCard,
                  checkmarkColor: Colors.black,
                  labelStyle: TextStyle(
                    color: isSelected
                        ? (currentTheme == VibexTheme.zen ? Colors.white : Colors.black)
                        : colors.textMuted,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                  side: BorderSide(
                    color: isSelected ? colors.accentPrimary : colors.borderSubtle,
                  ),
                  onSelected: (val) {
                    setState(() {
                      _selectedDifficulty = diff;
                    });
                  },
                ),
              );
            }).toList(),
          ),
        ),
        if (genreSet.length > 2) ...[
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: genreSet.map((genre) {
                final isSelected = _selectedGenre == genre;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: FilterChip(
                    label: Text(genre == 'all' ? 'ALL GENRES' : genre.toUpperCase()),
                    selected: isSelected,
                    selectedColor: colors.accentPrimary.withAlpha(200),
                    backgroundColor: colors.bgCardElevated,
                    checkmarkColor: Colors.black,
                    labelStyle: TextStyle(
                      color: isSelected
                          ? (currentTheme == VibexTheme.zen ? Colors.white : Colors.black)
                          : colors.textMuted,
                      fontWeight: FontWeight.w600,
                      fontSize: 10.5,
                    ),
                    side: BorderSide(
                      color: isSelected ? colors.accentPrimary : colors.borderSubtle,
                    ),
                    onSelected: (val) {
                      setState(() {
                        _selectedGenre = genre;
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        ],
        const SizedBox(height: 18),

        // Songs list
        if (filteredSongs.isEmpty)
          Container(
            padding: const EdgeInsets.all(32),
            alignment: Alignment.center,
            child: Column(
              children: [
                Icon(Icons.music_off, color: colors.textMuted, size: 48),
                const SizedBox(height: 12),
                Text(
                  'No songs found for ${instrument.displayName} matching this search.',
                  style: TextStyle(color: colors.textMuted),
                ),
              ],
            ),
          )
        else
          ...filteredSongs.map((song) => _buildSongCard(context, song, colors)),
      ],
    );
  }

  Widget _buildSongCard(BuildContext context, Song song, VibexColorScheme colors) {
    final isPreviewing = _previewingSongId == song.id;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: colors.bgCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isPreviewing ? colors.accentPrimary.withAlpha(120) : colors.borderSubtle,
          width: isPreviewing ? 1.5 : 1,
        ),
        boxShadow: isPreviewing
            ? [
                BoxShadow(
                  color: colors.accentPrimary.withAlpha(30),
                  blurRadius: 14,
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner top
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: colors.bgCardElevated,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            ),
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 8,
              runSpacing: 6,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: _getDifficultyColor(song.difficulty).withAlpha(30),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        song.difficulty.toUpperCase(),
                        style: TextStyle(
                          color: _getDifficultyColor(song.difficulty),
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      song.genre,
                      style: TextStyle(color: colors.textMuted, fontSize: 12),
                    ),
                  ],
                ),
                Text(
                  'Key: ${song.key} • ${song.tempo} BPM',
                  style: TextStyle(color: colors.textMuted, fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 12,
              runSpacing: 12,
              children: [
                ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        song.title,
                        style: TextStyle(
                          color: colors.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        song.description,
                        style: TextStyle(color: colors.textMuted, fontSize: 12),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '${song.sections.length} Sections • ${song.durationSec ~/ 60}:${(song.durationSec % 60).toString().padLeft(2, '0')} min',
                        style: TextStyle(color: colors.textMuted, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(
                      icon: Icon(
                        isPreviewing ? Icons.stop_circle_rounded : Icons.volume_up_rounded,
                        color: isPreviewing ? const Color(0xFFEF4444) : colors.accentPrimary,
                        size: 24,
                      ),
                      tooltip: isPreviewing ? 'Stop Preview' : 'Audio Preview',
                      style: IconButton.styleFrom(
                        backgroundColor: colors.bgCardElevated,
                        side: BorderSide(color: colors.borderSubtle),
                      ),
                      onPressed: () => _togglePreview(song),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton.icon(
                      onPressed: () {
                        _stopPreview();
                        widget.onSelectSong(song);
                      },
                      icon: const Icon(Icons.play_arrow_rounded, size: 18),
                      label: const Text('ARENA', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: colors.accentPrimary,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getDifficultyColor(String diff) {
    switch (diff.toLowerCase()) {
      case 'beginner':
        return const Color(0xFF10B981);
      case 'intermediate':
        return const Color(0xFFF59E0B);
      case 'advanced':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF38BDF8);
    }
  }
}
