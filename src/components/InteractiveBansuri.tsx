import React, { useCallback, useState, useEffect } from 'react';
import { audioEngine } from '../services/audioEngine';
import { TargetNote } from '../types';
import { Play, RotateCcw, Volume2, Sparkles } from 'lucide-react';

interface Props {
  activeNotes?: string[];
  targetNotes?: TargetNote[];
  onNotePlayed?: (note: string, swara: string, holes: number[]) => void;
  disabled?: boolean;
}

// 7 Indian Swaras in the intuitive user-friendly progressive finger order:
// Sequence 1: 1st hole half closed -> Ma (F5)
// Sequence 2: 1 hole closed -> Ga (E5)
// Sequence 3: 2 holes closed -> Re (D5)
// Sequence 4: 3 holes closed -> Sa (C5 Tonic)
// Sequence 5: 4 holes closed -> Ni (B4)
// Sequence 6: 5 holes closed -> Dha (A4)
// Sequence 7: 6 holes closed -> Pa (G4)
// Hole values: 0 = Open, 0.5 = Half-Closed (½), 1 = Full Closed
export const BANSURI_SWARA_SEQUENCE = [
  {
    step: 1,
    swara: 'Ma',
    note: 'F5',
    freq: '698 Hz',
    label: 'Ma (F5)',
    sublabel: '1st Hole Half Closed',
    fingerDetail: 'LH 1 (½ Half Pad)',
    holes: [0.5, 0, 0, 0, 0, 0],
    desc: 'Hole 1 half-closed (LH 1), all other holes open (Shuddha/Teevra Ma)',
  },
  {
    step: 2,
    swara: 'Ga',
    note: 'E5',
    freq: '659 Hz',
    label: 'Ga (E5)',
    sublabel: '1 Hole Closed',
    fingerDetail: 'LH 1 Sealed',
    holes: [1, 0, 0, 0, 0, 0],
    desc: '1st hole fully sealed with Left Index (LH 1), lower 5 holes open',
  },
  {
    step: 3,
    swara: 'Re',
    note: 'D5',
    freq: '587 Hz',
    label: 'Re (D5)',
    sublabel: '2 Holes Closed',
    fingerDetail: 'LH 1 & 2 Sealed',
    holes: [1, 1, 0, 0, 0, 0],
    desc: 'Holes 1 & 2 sealed (LH 1-2 Index & Middle), lower 4 holes open',
  },
  {
    step: 4,
    swara: 'Sa',
    note: 'C5',
    freq: '523 Hz',
    label: 'Sa (C5)',
    sublabel: '3 Holes Closed (Tonic)',
    fingerDetail: 'LH 1-2-3 (Top 3 Sealed)',
    holes: [1, 1, 1, 0, 0, 0],
    desc: 'Tonic Home Sa: Top 3 holes sealed with Left Hand (LH 1-2-3)',
  },
  {
    step: 5,
    swara: 'Ni',
    note: 'B4',
    freq: '493 Hz',
    label: 'Ni (B4)',
    sublabel: '4 Holes Closed',
    fingerDetail: 'LH 1-2-3 + RH 1',
    holes: [1, 1, 1, 1, 0, 0],
    desc: 'Holes 1-4 sealed (Left Hand 1-2-3 + Right Index RH 1)',
  },
  {
    step: 6,
    swara: 'Dha',
    note: 'A4',
    freq: '440 Hz',
    label: 'Dha (A4)',
    sublabel: '5 Holes Closed',
    fingerDetail: 'LH 1-2-3 + RH 1-2',
    holes: [1, 1, 1, 1, 1, 0],
    desc: 'Holes 1-5 sealed (LH 1-2-3 + RH 1-2 Middle), Hole 6 open',
  },
  {
    step: 7,
    swara: 'Pa',
    note: 'G4',
    freq: '392 Hz',
    label: 'Pa (G4)',
    sublabel: 'All 6 Holes Closed',
    fingerDetail: 'All 6 Sealed (LH + RH)',
    holes: [1, 1, 1, 1, 1, 1],
    desc: 'All 6 tone holes fully sealed (LH 1-2-3 + RH 1-2-3) for Mandra Pa',
  },
];

export const InteractiveBansuri: React.FC<Props> = ({
  activeNotes = [],
  targetNotes = [],
  onNotePlayed,
  disabled = false,
}) => {
  // Current active hole coverage state [H1, H2, H3, H4, H5, H6] (0 = open, 0.5 = half, 1 = closed)
  const [holePattern, setHolePattern] = useState<number[]>([0.5, 0, 0, 0, 0, 0]); // Starts on sequence #1 (Ma)
  const [currentSwara, setCurrentSwara] = useState<string>('Ma');
  const [isSequencePlaying, setIsSequencePlaying] = useState<boolean>(false);

  const playSwara = useCallback(
    (item: typeof BANSURI_SWARA_SEQUENCE[0]) => {
      if (disabled) return;
      setHolePattern(item.holes);
      setCurrentSwara(item.swara);
      audioEngine.playNote(item.note, 'bansuri', 1.2);
      if (onNotePlayed) {
        onNotePlayed(item.note, item.swara, item.holes);
      }
    },
    [disabled, onNotePlayed]
  );

  const toggleHole = useCallback(
    (index: number) => {
      if (disabled) return;
      const newPattern = [...holePattern];
      // For Hole 1 (H1), cycle between Open (0) -> Half (0.5) -> Closed (1)
      if (index === 0) {
        if (newPattern[0] === 0) newPattern[0] = 0.5;
        else if (newPattern[0] === 0.5) newPattern[0] = 1;
        else newPattern[0] = 0;
      } else {
        newPattern[index] = newPattern[index] >= 1 ? 0 : 1;
      }
      setHolePattern(newPattern);

      // Match closest swara in sequence
      const match = BANSURI_SWARA_SEQUENCE.find((s) =>
        s.holes.every((h, i) => Math.abs(h - newPattern[i]) < 0.25)
      );

      if (match) {
        setCurrentSwara(match.swara);
        audioEngine.playNote(match.note, 'bansuri', 1.0);
        if (onNotePlayed) onNotePlayed(match.note, match.swara, newPattern);
      } else {
        audioEngine.playNote('C5', 'bansuri', 0.8);
      }
    },
    [disabled, holePattern, onNotePlayed]
  );

  // Play full sequential training audio walkthrough
  const playSequentialWalkthrough = useCallback(() => {
    if (disabled || isSequencePlaying) return;
    setIsSequencePlaying(true);

    BANSURI_SWARA_SEQUENCE.forEach((item, index) => {
      setTimeout(() => {
        setHolePattern(item.holes);
        setCurrentSwara(item.swara);
        audioEngine.playNote(item.note, 'bansuri', 0.9);
        if (onNotePlayed) onNotePlayed(item.note, item.swara, item.holes);

        if (index === BANSURI_SWARA_SEQUENCE.length - 1) {
          setTimeout(() => setIsSequencePlaying(false), 800);
        }
      }, index * 900);
    });
  }, [disabled, isSequencePlaying, onNotePlayed]);

  // Keyboard shortcut listener (Keys 1 through 7 for instant Swara triggering)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 7) {
        const item = BANSURI_SWARA_SEQUENCE[keyNum - 1];
        if (item) {
          playSwara(item);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, playSwara]);

  const currentSwaraItem =
    BANSURI_SWARA_SEQUENCE.find((s) => s.swara === currentSwara) || BANSURI_SWARA_SEQUENCE[0];

  return (
    <div className="w-full flex flex-col items-center select-none space-y-4">
      {/* Sequence Guide Top Banner for Maximum Accessibility */}
      <div className="w-full max-w-4xl bg-stone-900/90 border border-amber-500/30 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-300">
              Requested Progressive Training Sequence:
            </div>
            <div className="text-xs sm:text-sm text-zinc-300 font-medium mt-0.5">
              <span className="text-amber-200 font-bold">1st Hole Half-Closed (Ma)</span> ➔{' '}
              <span className="text-white font-bold">Ga</span> ➔{' '}
              <span className="text-white font-bold">Re</span> ➔{' '}
              <span className="text-[#E5C07B] font-bold">Sa (Tonic)</span> ➔{' '}
              <span className="text-white font-bold">Ni</span> ➔{' '}
              <span className="text-white font-bold">Dha</span> ➔{' '}
              <span className="text-white font-bold">Pa (All 6 Sealed)</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={playSequentialWalkthrough}
          disabled={isSequencePlaying}
          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition shrink-0 disabled:opacity-50"
        >
          {isSequencePlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Playing Sequence...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Auto-Play Sequence (1-7)</span>
            </>
          )}
        </button>
      </div>

      {/* Bamboo Flute Visual Body */}
      <div className="relative w-full max-w-4xl bg-stone-950 border-2 border-amber-900/60 rounded-3xl p-5 shadow-2xl overflow-x-auto">
        {/* Flute Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-2 border-b border-stone-800/80 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-400">Active Swara:</span>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm font-bold font-mono">
                Step {currentSwaraItem.step}: {currentSwara} ({currentSwaraItem.note} – {currentSwaraItem.freq})
              </span>
              <span className="text-xs text-amber-200/80 font-medium hidden sm:inline">
                • {currentSwaraItem.sublabel} ({currentSwaraItem.fingerDetail})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span className="px-2.5 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-amber-200 font-bold">
              Key: C Medium Bansuri
            </span>
            <span className="text-zinc-500 hidden sm:inline">• Hindustani 6-Hole</span>
          </div>
        </div>

        {/* Realistic Bamboo Flute Graphic Container */}
        <div className="relative h-28 my-4 flex items-center justify-between bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-full px-6 shadow-2xl border-y-4 border-amber-900 overflow-hidden">
          {/* Thread Bindings (Traditional Red Thread Wrapping) */}
          <div className="absolute left-8 top-0 bottom-0 w-3.5 bg-red-900 border-x border-amber-950 shadow" />
          <div className="absolute left-24 top-0 bottom-0 w-3.5 bg-red-900 border-x border-amber-950 shadow" />
          <div className="absolute right-8 top-0 bottom-0 w-3.5 bg-red-900 border-x border-amber-950 shadow" />
          <div className="absolute right-24 top-0 bottom-0 w-2.5 bg-red-900 border-x border-amber-950 shadow" />

          {/* Natural Bamboo Grain Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30 pointer-events-none" />

          {/* Blowing Hole (Embouchure / Phook Chhidra) */}
          <div className="relative flex flex-col items-center ml-2 z-10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-stone-950 to-stone-900 border-2 border-amber-950 shadow-inner flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-cyan-400/40 animate-ping" />
            </div>
            <span className="text-[10px] font-bold text-amber-200 mt-1 drop-shadow">Blow Hole</span>
          </div>

          {/* Spacer */}
          <div className="w-6" />

          {/* Left Hand Triplet (Holes 1, 2, 3) */}
          <div className="flex items-center gap-6 z-10">
            {[0, 1, 2].map((idx) => {
              const val = holePattern[idx];
              const isHalf = val === 0.5;
              const isClosed = val >= 1;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleHole(idx)}
                  className="flex flex-col items-center group transition focus:outline-none"
                  title={idx === 0 ? 'Click to cycle: Open ➔ Half Closed ➔ Full Closed' : 'Click to Open/Close'}
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-amber-950 shadow-inner transition-all transform flex items-center justify-center relative overflow-hidden ${
                      isClosed
                        ? 'bg-stone-950 scale-95 ring-2 ring-amber-400'
                        : isHalf
                        ? 'bg-amber-400/40 ring-2 ring-cyan-300'
                        : 'bg-amber-400/30 border-dashed hover:scale-105'
                    }`}
                  >
                    {isHalf && (
                      <div className="absolute inset-0 w-1/2 bg-stone-950 border-r border-cyan-400" />
                    )}
                    {isClosed && <span className="w-3 h-3 rounded-full bg-amber-400" />}
                    {!isClosed && !isHalf && <span className="w-1.5 h-1.5 rounded-full bg-amber-950/60" />}
                  </div>
                  <span className="text-[10px] font-mono text-amber-100 mt-1 font-bold">
                    H{idx + 1} (LH {idx + 1})
                  </span>
                  {idx === 0 && (
                    <span className="text-[8px] text-cyan-300 font-extrabold">
                      {isHalf ? '½ Half (Ma)' : isClosed ? 'Closed (Ga)' : 'Open'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Hand Triplet (Holes 4, 5, 6) */}
          <div className="flex items-center gap-6 z-10 mr-4">
            {[3, 4, 5].map((idx) => {
              const isClosed = holePattern[idx] >= 1;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleHole(idx)}
                  className="flex flex-col items-center group transition focus:outline-none"
                  title="Click to Open/Close"
                >
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-amber-950 shadow-inner transition-all transform flex items-center justify-center ${
                      isClosed
                        ? 'bg-stone-950 scale-95 ring-2 ring-amber-400'
                        : 'bg-amber-400/30 border-dashed hover:scale-105'
                    }`}
                  >
                    {isClosed ? (
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-950/60" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-amber-100 mt-1 font-bold">
                    H{idx + 1} (RH {idx - 2})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Swara Buttons Bar in Requested Progressive Sequence:
            1st Hole Half Closed Ma -> Ga -> Re -> Sa -> Ni -> Dha -> Pa */}
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between px-1 gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/90 flex items-center gap-1.5">
              <span>🎵</span> Swara Training Sequence (Top Hole Half-Closed Downwards):
            </span>
            <span className="text-[10px] text-zinc-400">
              Press keys <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-amber-200 font-mono">1</kbd> to <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-amber-200 font-mono">7</kbd> or click below
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
            {BANSURI_SWARA_SEQUENCE.map((item) => {
              const isSelected = currentSwara === item.swara;
              const isTarget = targetNotes.some(
                (t) => t.note === item.note || t.displayName?.includes(item.swara)
              );

              return (
                <button
                  key={item.swara}
                  type="button"
                  onClick={() => playSwara(item)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-between text-center transition-all border relative overflow-hidden focus:outline-none ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold shadow-xl shadow-amber-400/25 scale-[1.03] ring-2 ring-amber-300'
                      : isTarget
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 ring-2 ring-emerald-400 animate-pulse'
                      : 'bg-stone-900/95 text-zinc-200 border-stone-800 hover:bg-stone-850 hover:border-stone-700'
                  }`}
                >
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-black text-amber-300'
                          : 'bg-stone-800 text-zinc-400 border border-stone-700'
                      }`}
                    >
                      #{item.step}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold ${
                        isSelected ? 'text-stone-900' : 'text-amber-300/80'
                      }`}
                    >
                      {item.freq}
                    </span>
                  </div>

                  {/* Swara Name & Note */}
                  <div className="flex items-center justify-center gap-1 my-0.5">
                    <span className="text-lg font-black">{item.swara}</span>
                    <span className="text-xs opacity-80 font-mono">({item.note})</span>
                  </div>

                  {/* 6 Miniature Hole Dots Diagram */}
                  <div className="flex items-center gap-1 my-1.5">
                    {item.holes.map((h, hIdx) => (
                      <span
                        key={hIdx}
                        className={`w-2 h-2 rounded-full border ${
                          h === 1
                            ? isSelected
                              ? 'bg-stone-950 border-stone-950'
                              : 'bg-amber-400 border-amber-400'
                            : h === 0.5
                            ? isSelected
                              ? 'bg-cyan-900 border-stone-950'
                              : 'bg-cyan-400 border-cyan-400'
                            : isSelected
                            ? 'bg-transparent border-stone-950/40'
                            : 'bg-transparent border-zinc-600'
                        }`}
                        title={`Hole ${hIdx + 1}: ${h === 1 ? 'Closed' : h === 0.5 ? 'Half' : 'Open'}`}
                      />
                    ))}
                  </div>

                  {/* Physical Action Subtitle */}
                  <span
                    className={`text-[10px] font-semibold leading-tight text-center ${
                      isSelected ? 'text-stone-950 font-black' : 'text-amber-200/80'
                    }`}
                  >
                    {item.sublabel}
                  </span>

                  <span
                    className={`text-[9px] mt-0.5 ${
                      isSelected ? 'text-stone-800' : 'text-zinc-400'
                    }`}
                  >
                    {item.fingerDetail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend & Technique Advice */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between text-xs text-zinc-400 px-2 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="text-zinc-300">Closed Hole (●)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span className="text-zinc-300">Half Closed (◐ Ma)</span>
          </span>
          <span className="text-zinc-500">• LH (H1-H3) | RH (H4-H6)</span>
        </div>
        <span className="text-amber-200/90 font-medium">
          💡 Flat finger pads seal edge leaks for crystal clear intonation
        </span>
      </div>
    </div>
  );
};

export default InteractiveBansuri;
