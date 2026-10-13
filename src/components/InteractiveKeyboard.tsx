import React, { useEffect, useCallback } from 'react';
import { audioEngine } from '../services/audioEngine';
import { TargetNote } from '../types';

interface Props {
  activeNotes?: string[];
  targetNotes?: TargetNote[];
  onNotePlayed?: (note: string) => void;
  disabled?: boolean;
}

// 2.5 Octaves: C3 to G5
const WHITE_KEYS = [
  'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4',
  'C5', 'D5', 'E5', 'F5', 'G5'
];

const BLACK_KEYS: { note: string; leftOffset: number }[] = [
  // C3 to B3
  { note: 'C#3', leftOffset: 5.2 },
  { note: 'D#3', leftOffset: 10.5 },
  { note: 'F#3', leftOffset: 21.0 },
  { note: 'G#3', leftOffset: 26.3 },
  { note: 'A#3', leftOffset: 31.6 },
  // C4 to B4 (Middle Octave)
  { note: 'C#4', leftOffset: 42.1 },
  { note: 'D#4', leftOffset: 47.4 },
  { note: 'F#4', leftOffset: 57.9 },
  { note: 'G#4', leftOffset: 63.2 },
  { note: 'A#4', leftOffset: 68.5 },
  // C5 to G5
  { note: 'C#5', leftOffset: 79.0 },
  { note: 'D#5', leftOffset: 84.3 },
  { note: 'F#5', leftOffset: 94.8 },
];

// Computer keyboard mapping for quick testing
const KEY_MAP: Record<string, string> = {
  'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4',
  't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4', 'k': 'C5'
};

export const InteractiveKeyboard: React.FC<Props> = ({
  activeNotes = [],
  targetNotes = [],
  onNotePlayed,
  disabled = false,
}) => {
  const handleKeyClick = useCallback((note: string) => {
    if (disabled) return;
    audioEngine.playNote(note, 'keyboard', 0.8);
    if (onNotePlayed) {
      onNotePlayed(note);
    }
  }, [disabled, onNotePlayed]);

  // Handle physical computer keyboard keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const note = KEY_MAP[e.key.toLowerCase()];
      if (note) {
        handleKeyClick(note);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, handleKeyClick]);

  return (
    <div className="w-full select-none flex flex-col items-center">
      {/* Keyboard Bed Container */}
      <div className="relative w-full max-w-4xl h-44 bg-zinc-950 p-3 rounded-2xl shadow-2xl border border-zinc-800 flex overflow-hidden">
        {/* Felt Red Rail at key back */}
        <div className="absolute top-3 left-3 right-3 h-2 bg-red-800/80 rounded-t z-10 pointer-events-none" />

        {/* White Keys */}
        <div className="relative flex w-full h-full">
          {WHITE_KEYS.map((note) => {
            const isMiddleC = note === 'C4';
            const isActive = activeNotes.includes(note);
            const target = targetNotes.find((t) => t.note === note);
            const isTarget = !!target;

            return (
              <button
                key={note}
                id={`key-${note}`}
                type="button"
                onClick={() => handleKeyClick(note)}
                className={`relative flex-1 h-full rounded-b-md transition-all duration-75 border-r border-zinc-300 active:bg-amber-100 flex flex-col justify-end items-center pb-2 ${
                  isActive
                    ? 'bg-amber-200 shadow-inner translate-y-1'
                    : isTarget
                    ? 'bg-amber-50 border-amber-400'
                    : 'bg-white hover:bg-zinc-50'
                }`}
              >
                {/* Target Guide Ring / Finger Badge */}
                {isTarget && (
                  <div className="absolute top-12 z-20 flex flex-col items-center animate-pulse">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center shadow-md">
                      {target.fingerNumber || '★'}
                    </span>
                    <span className="text-[9px] font-semibold text-amber-900 mt-0.5">
                      {target.fingerNumber ? `F${target.fingerNumber}` : 'Hit'}
                    </span>
                  </div>
                )}

                {/* Middle C Marker Indicator */}
                {isMiddleC && (
                  <div className="absolute bottom-9 w-2 h-2 rounded-full bg-red-600 shadow" title="Middle C" />
                )}

                {/* Note Label */}
                <span className={`text-[11px] font-semibold tracking-tight ${
                  isMiddleC ? 'text-red-700 font-bold' : isTarget ? 'text-amber-800' : 'text-zinc-500'
                }`}>
                  {note}
                </span>
              </button>
            );
          })}
        </div>

        {/* Black Keys */}
        {BLACK_KEYS.map(({ note, leftOffset }) => {
          const isActive = activeNotes.includes(note);
          const target = targetNotes.find((t) => t.note === note);
          const isTarget = !!target;

          return (
            <button
              key={note}
              id={`black-key-${note}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleKeyClick(note);
              }}
              style={{ left: `${leftOffset}%` }}
              className={`absolute top-3 w-[3.5%] h-[60%] z-20 rounded-b-md transition-all duration-75 shadow-lg flex flex-col justify-end items-center pb-1 ${
                isActive
                  ? 'bg-amber-500 translate-y-0.5'
                  : isTarget
                  ? 'bg-amber-700 border border-amber-300'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-x border-b border-black'
              }`}
            >
              {isTarget && (
                <div className="mb-2">
                  <span className="w-4 h-4 rounded-full bg-amber-300 text-zinc-950 font-bold text-[9px] flex items-center justify-center shadow">
                    {target.fingerNumber || '★'}
                  </span>
                </div>
              )}
              <span className="text-[8px] font-mono text-zinc-400">
                {note.replace(/#\d/, '#')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Keyboard Shortcuts Helper & Middle C legend */}
      <div className="w-full max-w-4xl flex items-center justify-between mt-2 text-xs text-zinc-400 px-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
            <strong className="text-zinc-200">Middle C (C4)</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center">1</span>
            <span>Finger 1 (Thumb)</span>
          </span>
        </div>
        <span className="text-zinc-500 hidden sm:inline">
          ⌨️ PC Keys: <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">A-S-D-F-G-H-J-K</code>
        </span>
      </div>
    </div>
  );
};
