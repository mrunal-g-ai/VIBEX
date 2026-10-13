import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song, InstrumentType, TargetNote } from '../types';
import { SONGS_DATA } from '../data/songs';
import { audioEngine } from '../services/audioEngine';
import { InteractiveKeyboard } from './InteractiveKeyboard';
import { InteractiveFretboard } from './InteractiveFretboard';
import { InteractiveViolinFingerboard } from './InteractiveViolinFingerboard';
import { InteractiveBansuri } from './InteractiveBansuri';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Sliders,
  Repeat,
  Music,
  Filter,
  Sparkles,
  Search,
} from 'lucide-react';

interface Props {
  instrument: InstrumentType;
}

export const SongPracticeView: React.FC<Props> = ({ instrument }) => {
  const songs = SONGS_DATA[instrument] || [];
  const [selectedSong, setSelectedSong] = useState<Song>(songs[0]);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    selectedSong?.sections[0]?.id || ''
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [bpm, setBpm] = useState<number>(selectedSong?.tempo || 80);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [songScore, setSongScore] = useState<number>(0);
  const [hitNotesCount, setHitNotesCount] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const availableGenres = useMemo(() => {
    const s = new Set<string>();
    songs.forEach((song) => {
      if (song.genre.includes('Bhajan')) s.add('Bhajan');
      else if (song.genre.includes('Indian Classical')) s.add('Indian Classical');
      else if (song.genre.includes('Hindi') || song.genre.includes('Bollywood')) s.add('Hindi / Bollywood');
      else if (song.genre.includes('Classical')) s.add('Classical');
      else s.add(song.genre);
    });
    return ['all', ...Array.from(s)];
  }, [songs]);

  const filteredSongList = useMemo(() => {
    return songs.filter((song) => {
      if (selectedGenre !== 'all' && !song.genre.toLowerCase().includes(selectedGenre.toLowerCase())) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        if (!song.title.toLowerCase().includes(q) && !song.genre.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [songs, selectedGenre, searchFilter]);

  const activeSection = useMemo(() => {
    if (!selectedSong) return null;
    if (activeSectionId === 'full_song') {
      let cumulativeBeat = 0;
      const combinedNotes: TargetNote[] = [];
      selectedSong.sections.forEach((sec) => {
        const secDuration = sec.endBeat - sec.startBeat;
        sec.notes.forEach((n) => {
          combinedNotes.push({
            ...n,
            startTime: cumulativeBeat + (n.startTime - sec.startBeat),
          });
        });
        cumulativeBeat += secDuration;
      });
      return {
        id: 'full_song',
        name: 'Full Song (Continuous)',
        startBeat: 0,
        endBeat: cumulativeBeat,
        notes: combinedNotes,
      };
    }
    return (
      selectedSong.sections.find((s) => s.id === activeSectionId) || selectedSong.sections[0]
    );
  }, [selectedSong, activeSectionId]);

  const sectionNotes = activeSection?.notes || [];

  // Playback timer ref
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update when instrument or song changes
  useEffect(() => {
    const list = SONGS_DATA[instrument] || [];
    if (list.length > 0) {
      setSelectedSong(list[0]);
      setActiveSectionId(list[0].sections[0]?.id || '');
      setBpm(list[0].tempo);
      setIsPlaying(false);
      setCurrentBeat(0);
      setHitNotesCount(0);
    }
  }, [instrument]);

  // Song playback loop
  useEffect(() => {
    if (!isPlaying || !activeSection) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      return;
    }

    const intervalMs = (60 / bpm) * 1000 * 0.25; // 16th note resolution

    playbackTimerRef.current = setInterval(() => {
      setCurrentBeat((prevBeat) => {
        const nextBeat = prevBeat + 0.25;

        // Check if any notes trigger on this beat
        const notesToPlay = sectionNotes.filter(
          (n) => Math.abs(n.startTime - nextBeat) < 0.15
        );
        notesToPlay.forEach((n) => {
          audioEngine.playNote(n.note, instrument, 0.9);
        });

        if (nextBeat > activeSection.endBeat) {
          if (isLooping) {
            return activeSection.startBeat;
          } else {
            setIsPlaying(false);
            confetti({ particleCount: 80, spread: 60 });
            return activeSection.startBeat;
          }
        }
        return nextBeat;
      });
    }, intervalMs);

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, bpm, isLooping, activeSection, sectionNotes, instrument]);

  const handleUserNotePlay = (note: string) => {
    // Check if played note matches target at current beat
    const target = sectionNotes.find((n) => Math.abs(n.startTime - currentBeat) <= 1.0);
    if (target && (target.note === note || target.displayName === note)) {
      setHitNotesCount((prev) => prev + 1);
      const newScore = Math.min(100, Math.round(((hitNotesCount + 1) / sectionNotes.length) * 100));
      setSongScore(newScore);
    }
  };

  const currentTargetNote = sectionNotes.find(
    (n) => Math.abs(n.startTime - currentBeat) <= 0.8
  );

  return (
    <div className="w-full space-y-6">
      {/* Song Selection Bar */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-[#E5C07B]" />
            <span className="text-xs uppercase tracking-wider text-white/70 font-bold">
              Select Song to Practice ({filteredSongList.length} of {songs.length}):
            </span>
          </div>

          {/* Genre Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {availableGenres.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize transition ${
                  selectedGenre === g
                    ? 'bg-[#E5C07B] text-black font-bold'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Scroll Carousel of Song Cards */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {filteredSongList.map((song) => {
            const isSelected = song.id === selectedSong?.id;

            return (
              <button
                key={song.id}
                type="button"
                onClick={() => {
                  setSelectedSong(song);
                  setActiveSectionId(song.sections[0]?.id || '');
                  setBpm(song.tempo);
                  setIsPlaying(false);
                  setCurrentBeat(0);
                  setHitNotesCount(0);
                  setSongScore(0);
                }}
                className={`px-4 py-3 rounded-2xl border text-left shrink-0 w-64 transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#16181D] border-[#E5C07B] shadow-lg shadow-[#E5C07B]/10 ring-1 ring-[#E5C07B]/40'
                    : 'bg-[#0F1115] border-white/10 hover:border-white/20 hover:bg-[#13151A]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-[#E5C07B] uppercase">{song.difficulty}</span>
                    <span className="text-white/40 font-mono">{song.tempo} BPM</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-1 truncate">{song.title}</h4>
                  <p className="text-[11px] text-white/50 truncate mt-0.5">{song.genre}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Song Performance Player */}
      {selectedSong && (
        <div className="bg-[#0F1115] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          {/* Song Player Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B]">
                Repertoire Arena • {selectedSong.genre}
              </span>
              <h3 className="text-3xl font-light font-serif-italic text-white mt-1">{selectedSong.title}</h3>
              <p className="text-xs text-white/50 mt-1">{selectedSong.description}</p>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Section Selectors */}
              <div className="flex bg-black/40 p-1.5 rounded-full border border-white/10 overflow-x-auto max-w-full">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSectionId('full_song');
                    setCurrentBeat(0);
                    setIsPlaying(false);
                  }}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeSectionId === 'full_song'
                      ? 'bg-[#E5C07B] text-black shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Full Song (All Sections)
                </button>
                {selectedSong.sections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      setActiveSectionId(sec.id);
                      setCurrentBeat(sec.startBeat);
                      setIsPlaying(false);
                    }}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      activeSectionId === sec.id
                        ? 'bg-[#E5C07B] text-black shadow'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>

              {/* Tempo Slider */}
              <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10 text-xs">
                <Sliders className="w-3.5 h-3.5 text-[#E5C07B]" />
                <input
                  type="range"
                  min="40"
                  max="140"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-16 accent-[#E5C07B]"
                />
                <span className="font-mono text-[#E5C07B] font-bold">{bpm} BPM</span>
              </div>

              {/* Loop Toggle */}
              <button
                type="button"
                onClick={() => setIsLooping(!isLooping)}
                className={`p-2 rounded-full border transition-all ${
                  isLooping
                    ? 'bg-[#E5C07B]/20 text-[#E5C07B] border-[#E5C07B]/40'
                    : 'bg-white/5 text-white/40 border-white/10'
                }`}
                title="Loop Section"
              >
                <Repeat className="w-4 h-4" />
              </button>

              {/* Play / Pause */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-6 py-2 rounded-full bg-[#E5C07B] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#E5C07B]/20 hover:scale-105 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY SONG'}</span>
              </button>
            </div>
          </div>

          {/* Note Highway Visualizer */}
          <div className="relative w-full h-24 bg-black/50 border border-white/10 rounded-2xl overflow-hidden p-3 flex items-center shadow-inner">
            {/* Playhead Vertical Line */}
            <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-[#E5C07B] z-20 shadow-[0_0_10px_#E5C07B]">
              <div className="absolute top-1 -left-3 text-[8px] font-mono text-[#E5C07B] font-bold uppercase tracking-wider">
                STRIKE
              </div>
            </div>

            {/* Note stream */}
            <div
              className="absolute left-1/4 flex items-center gap-6 transition-all duration-100 ease-linear"
              style={{
                transform: `translateX(-${(currentBeat - (activeSection?.startBeat || 0)) * 55}px)`,
              }}
            >
              {sectionNotes.map((n, i) => {
                const isCurrentHit = Math.abs(n.startTime - currentBeat) <= 0.4;

                return (
                  <div
                    key={i}
                    className={`w-14 h-16 rounded-2xl border flex flex-col items-center justify-center p-1 font-mono transition-all transform ${
                      isCurrentHit
                        ? 'bg-[#E5C07B] text-black border-[#E5C07B] scale-110 shadow-lg shadow-[#E5C07B]/30 font-bold'
                        : 'bg-white/5 border-white/10 text-white/80'
                    }`}
                  >
                    <span className="text-sm font-black">{n.displayName || n.note}</span>
                    <span className="text-[9px] opacity-75">
                      {n.fingerNumber ? `F${n.fingerNumber}` : n.string ? `S${n.string}` : '♩'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Instrument Render */}
          <div className="bg-black/30 p-6 rounded-2xl border border-white/5 flex flex-col items-center">
            {instrument === 'keyboard' && (
              <InteractiveKeyboard
                targetNotes={currentTargetNote ? [currentTargetNote] : []}
                onNotePlayed={handleUserNotePlay}
              />
            )}

            {instrument === 'guitar' && (
              <InteractiveFretboard
                targetNotes={currentTargetNote ? [currentTargetNote] : []}
                onNotePlayed={handleUserNotePlay}
              />
            )}

            {instrument === 'violin' && (
              <InteractiveViolinFingerboard
                targetNotes={currentTargetNote ? [currentTargetNote] : []}
                onNotePlayed={handleUserNotePlay}
              />
            )}

            {instrument === 'bansuri' && (
              <InteractiveBansuri
                targetNotes={currentTargetNote ? [currentTargetNote] : []}
                onNotePlayed={handleUserNotePlay}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SongPracticeView;
