import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/songs_data.dart';
import '../../data/providers/app_providers.dart';

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

  @override
  Widget build(BuildContext context) {
    final instrument = ref.watch(instrumentProvider);
    final allSongs = kSongsData.where((s) => s.instrument == instrument).toList();

    final filteredSongs = _selectedDifficulty == 'all'
        ? allSongs
        : allSongs.where((s) => s.difficulty.toLowerCase() == _selectedDifficulty.toLowerCase()).toList();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF231E17), Color(0xFF14110E)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF423528)),
          ),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFE5C07B).withAlpha(30),
                  border: Border.all(color: const Color(0xFFE5C07B)),
                ),
                child: const Center(
                  child: Icon(Icons.library_music, color: Color(0xFFE5C07B), size: 26),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'VIBEX SONG LIBRARY',
                      style: TextStyle(
                        color: Color(0xFFE5C07B),
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Repertoire for ${instrument.displayName}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Interactive backing tracks with real-time rhythm feedback',
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

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
                  selectedColor: const Color(0xFFE5C07B),
                  backgroundColor: const Color(0xFF161B26),
                  checkmarkColor: Colors.black,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.black : const Color(0xFF94A3B8),
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                  side: BorderSide(
                    color: isSelected ? const Color(0xFFE5C07B) : const Color(0xFF2E384D),
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
        const SizedBox(height: 18),

        // Songs list
        if (filteredSongs.isEmpty)
          Container(
            padding: const EdgeInsets.all(32),
            alignment: Alignment.center,
            child: Column(
              children: [
                const Icon(Icons.music_off, color: Color(0xFF64748B), size: 48),
                const SizedBox(height: 12),
                Text(
                  'No songs found for ${instrument.displayName} in this filter.',
                  style: const TextStyle(color: Color(0xFF94A3B8)),
                ),
              ],
            ),
          )
        else
          ...filteredSongs.map((song) => _buildSongCard(context, song)),
      ],
    );
  }

  Widget _buildSongCard(BuildContext context, Song song) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF11141D),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner top
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: const BoxDecoration(
              color: Color(0xFF161B26),
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
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
                      style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                    ),
                  ],
                ),
                Text(
                  'Key: ${song.key} • ${song.tempo} BPM',
                  style: const TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        song.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        song.description,
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '${song.sections.length} Sections • ${song.durationSec ~/ 60}:${(song.durationSec % 60).toString().padLeft(2, '0')} min',
                        style: const TextStyle(color: Color(0xFF64748B), fontSize: 11),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton(
                  onPressed: () => widget.onSelectSong(song),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFE5C07B),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Row(
                    children: const [
                      Icon(Icons.play_arrow, size: 18),
                      SizedBox(width: 4),
                      Text('ARENA', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
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
