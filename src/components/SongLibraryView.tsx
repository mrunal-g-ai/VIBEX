import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Song, InstrumentType, TargetNote } from '../types';
import { SONGS_DATA } from '../data/songs';
import { audioEngine } from '../services/audioEngine';
import {
  Music,
  Play,
  Pause,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Radio,
} from 'lucide-react';

interface Props {
  instrument: InstrumentType;
  onSelectSong: (song: Song) => void;
}

export const SongLibraryView: React.FC<Props> = ({ instrument, onSelectSong }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [previewingSongId, setPreviewingSongId] = useState<string | null>(null);
  const previewTimersRef = useRef<NodeJS.Timeout[]>([]);

  const stopAudioPreview = () => {
    previewTimersRef.current.forEach((t) => clearTimeout(t));
    previewTimersRef.current = [];
    setPreviewingSongId(null);
  };

  useEffect(() => {
    return () => {
      stopAudioPreview();
    };
  }, []);

  const songs = SONGS_DATA[instrument] || [];

  // Extract unique genres for this instrument
  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    songs.forEach((s) => {
      if (s.genre.includes('Bhajan')) genreSet.add('Bhajan');
      else if (s.genre.includes('Indian Classical')) genreSet.add('Indian Classical');
      else if (s.genre.includes('Hindi') || s.genre.includes('Bollywood')) genreSet.add('Hindi / Bollywood');
      else if (s.genre.includes('Western Classical') || s.genre.includes('Classical')) genreSet.add('Classical');
      else if (s.genre.includes('Rock') || s.genre.includes('Pop') || s.genre.includes('Folk')) genreSet.add('Rock / Folk');
      else genreSet.add(s.genre);
    });
    return ['all', ...Array.from(genreSet)];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      // Difficulty filter
      if (filterDifficulty !== 'all' && song.difficulty.toLowerCase() !== filterDifficulty.toLowerCase()) {
        return false;
      }
      // Genre filter
      if (filterGenre !== 'all') {
        if (!song.genre.toLowerCase().includes(filterGenre.toLowerCase())) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = song.title.toLowerCase().includes(q);
        const matchesDesc = song.description.toLowerCase().includes(q);
        const matchesGenre = song.genre.toLowerCase().includes(q);
        const matchesKey = song.key.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesGenre && !matchesKey) {
          return false;
        }
      }
      return true;
    });
  }, [songs, filterDifficulty, filterGenre, searchQuery]);

  const handleToggleAudioPreview = (song: Song) => {
    if (previewingSongId === song.id) {
      stopAudioPreview();
      return;
    }

    stopAudioPreview();
    setPreviewingSongId(song.id);

    // Collect all notes across all sections for full song playback
    const allNotes: TargetNote[] = [];
    song.sections.forEach((sec) => {
      sec.notes.forEach((n) => allNotes.push(n));
    });

    let currentBeat = 0;
    const beatDurationMs = (60 / song.tempo) * 1000;

    allNotes.forEach((target, index) => {
      const timer = setTimeout(() => {
        audioEngine.playNote(target.note, song.instrument, (target.duration * beatDurationMs) / 1000);
        if (index === allNotes.length - 1) {
          const finalTimer = setTimeout(() => {
            setPreviewingSongId(null);
          }, target.duration * beatDurationMs);
          previewTimersRef.current.push(finalTimer);
        }
      }, currentBeat * beatDurationMs);
      previewTimersRef.current.push(timer);
      currentBeat += target.duration;
    });
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'elementary':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'intermediate':
        return 'text-[#E5C07B] bg-[#E5C07B]/10 border-[#E5C07B]/30';
      default:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#0F1115] border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5C07B]/10 border border-[#E5C07B]/30 text-[#E5C07B] text-xs font-semibold tracking-wider uppercase">
                <Music className="w-3.5 h-3.5" />
                <span>Interactive Repertoire Library</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                <span>Backend Live & AI Active</span>
              </div>
            </div>
            <h2 className="text-3xl lg:text-4xl font-light font-serif-italic text-white">
              Song Library & Master Pieces
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Explore 40+ authentic pieces including iconic Hindi & Bollywood songs, Indian Classical Ragas, sacred Bhajans, and timeless Classical standards.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 shrink-0">
            <div className="text-center px-2">
              <span className="text-2xl font-bold text-[#E5C07B] block">{songs.length}</span>
              <span className="text-[10px] text-white/50 uppercase tracking-widest">Available Songs</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center px-2">
              <span className="text-2xl font-bold text-emerald-400 block">4</span>
              <span className="text-[10px] text-white/50 uppercase tracking-widest">Instruments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3 bg-[#0F1115]/80 p-5 rounded-2xl border border-white/10">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by song title, raga, bhajan, artist, genre or key (e.g. Yaman, Krishna, Tum Hi Ho)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:border-[#E5C07B]/60 transition"
          />
        </div>

        {/* Filter Rows */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
          {/* Genre Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs uppercase tracking-wider text-white/40 font-bold mr-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E5C07B]" />
              Genre:
            </span>
            {availableGenres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => setFilterGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize tracking-wider transition ${
                  filterGenre === genre
                    ? 'bg-[#E5C07B] text-black font-bold shadow-md shadow-[#E5C07B]/20'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Difficulty Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs uppercase tracking-wider text-white/40 font-bold mr-1 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Level:
            </span>
            {['all', 'beginner', 'elementary', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFilterDifficulty(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
                  filterDifficulty === lvl
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Showing count */}
        <div className="text-xs text-white/50 pt-1">
          Showing <strong className="text-white">{filteredSongs.length}</strong> of {songs.length} songs for {instrument.toUpperCase()}
        </div>
      </div>

      {/* Song Cards Grid */}
      {filteredSongs.length === 0 ? (
        <div className="text-center py-16 bg-[#0F1115] border border-white/10 rounded-3xl p-8 space-y-3">
          <Music className="w-12 h-12 text-white/20 mx-auto" />
          <h3 className="text-lg font-medium text-white">No songs match your search criteria</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto">
            Try adjusting your search keywords or switching difficulty/genre filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilterDifficulty('all');
              setFilterGenre('all');
            }}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSongs.map((song) => {
            const isPlaying = previewingSongId === song.id;
            const totalNotes = song.sections.reduce((acc, sec) => acc + sec.notes.length, 0);

            return (
              <div
                key={song.id}
                className="bg-[#0F1115] border border-white/10 rounded-3xl p-6 hover:border-[#E5C07B]/50 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:shadow-[#E5C07B]/5"
              >
                <div className="space-y-4">
                  {/* Card Top: Difficulty & Genre */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(
                        song.difficulty
                      )}`}
                    >
                      {song.difficulty}
                    </span>
                    <span className="text-[11px] text-[#E5C07B]/80 font-medium truncate max-w-[160px]">
                      {song.genre}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xl font-light font-serif-italic text-white group-hover:text-[#E5C07B] transition">
                      {song.title}
                    </h3>
                    <p className="text-xs text-white/60 mt-1.5 line-clamp-2 leading-relaxed">
                      {song.description}
                    </p>
                  </div>

                  {/* Metrics Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-center">
                    <div className="bg-white/5 p-2 rounded-xl">
                      <span className="text-[10px] uppercase text-white/40 block">Tempo</span>
                      <span className="text-xs font-bold text-white/90">{song.tempo} BPM</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl">
                      <span className="text-[10px] uppercase text-white/40 block">Key / Raag</span>
                      <span className="text-xs font-bold text-white/90 truncate block">{song.key}</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl">
                      <span className="text-[10px] uppercase text-white/40 block">Length</span>
                      <span className="text-xs font-bold text-white/90">{song.durationSec}s</span>
                    </div>
                  </div>

                  {/* Target Notes Preview Strip */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">
                      Melody Sequence ({totalNotes} notes):
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {song.sections[0]?.notes?.slice(0, 7).map((n, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-[#E5C07B]"
                        >
                          {n.displayName || n.note}
                        </span>
                      ))}
                      {song.sections[0]?.notes?.length > 7 && (
                        <span className="text-[10px] text-white/40 self-center">
                          +{song.sections[0].notes.length - 7} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  {/* Audio Preview Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleAudioPreview(song)}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-2 border transition ${
                      isPlaying
                        ? 'bg-amber-500/20 text-[#E5C07B] border-[#E5C07B]'
                        : 'bg-white/5 text-white/70 hover:text-white border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#E5C07B]" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>

                  {/* Launch Practice Button */}
                  <button
                    type="button"
                    onClick={() => onSelectSong(song)}
                    className="flex-1 px-4 py-2 rounded-full bg-[#E5C07B] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-[#E5C07B]/10 hover:scale-105 transition-all"
                  >
                    <span>Practice Song</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SongLibraryView;

