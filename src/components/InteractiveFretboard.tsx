import React, { useCallback } from 'react';
import { audioEngine, noteToFrequency } from '../services/audioEngine';
import { TargetNote } from '../types';

interface Props {
  activeNotes?: string[];
  targetNotes?: TargetNote[];
  onNotePlayed?: (note: string, stringNum: number, fret: number) => void;
  disabled?: boolean;
}

// 6 Strings: Standard Tuning (E4, B3, G3, D3, A2, E2)
const STRINGS = [
  { stringNum: 1, name: '1 (E4)', openNote: 'E4', openMidi: 64, thickness: 1.2 },
  { stringNum: 2, name: '2 (B3)', openNote: 'B3', openMidi: 59, thickness: 1.6 },
  { stringNum: 3, name: '3 (G3)', openNote: 'G3', openMidi: 55, thickness: 2.0 },
  { stringNum: 4, name: '4 (D3)', openNote: 'D3', openMidi: 50, thickness: 2.6 },
  { stringNum: 5, name: '5 (A2)', openNote: 'A2', openMidi: 45, thickness: 3.2 },
  { stringNum: 6, name: '6 (E2)', openNote: 'E2', openMidi: 40, thickness: 3.8 },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getNoteAtFret(openMidi: number, fret: number): string {
  const midi = openMidi + fret;
  const noteName = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${noteName}${octave}`;
}

const FRETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const FRET_MARKERS = [3, 5, 7, 9, 12];

export const InteractiveFretboard: React.FC<Props> = ({
  activeNotes = [],
  targetNotes = [],
  onNotePlayed,
  disabled = false,
}) => {
  const handleFretClick = useCallback(
    (stringNum: number, fret: number, note: string) => {
      if (disabled) return;
      audioEngine.playNote(note, 'guitar', 1.0);
      if (onNotePlayed) {
        onNotePlayed(note, stringNum, fret);
      }
    },
    [disabled, onNotePlayed]
  );

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Fretboard Wood Container */}
      <div className="relative w-full max-w-4xl bg-stone-900 border-2 border-stone-800 rounded-xl p-3 shadow-2xl overflow-x-auto">
        {/* Fret Numbers Header */}
        <div className="grid grid-cols-[60px_repeat(12,1fr)] mb-1 text-center text-xs font-mono text-zinc-400">
          <div className="text-zinc-500 font-semibold">Nut / Open</div>
          {FRETS.slice(1).map((fret) => (
            <div key={fret} className="relative">
              <span>{fret}</span>
              {FRET_MARKERS.includes(fret) && fret !== 12 && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/70 mx-auto mt-0.5" />
              )}
              {fret === 12 && (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/90" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400/90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fretboard Grid */}
        <div className="relative flex flex-col gap-2 py-1 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 rounded-lg p-2 border border-stone-800">
          {STRINGS.map((str) => (
            <div
              key={str.stringNum}
              className="relative grid grid-cols-[60px_repeat(12,1fr)] items-center h-8"
            >
              {/* Metal String Line running through row */}
              <div
                className="absolute left-[60px] right-0 bg-gradient-to-r from-zinc-300 via-amber-100 to-zinc-400 shadow-sm pointer-events-none z-0"
                style={{ height: `${str.thickness}px` }}
              />

              {/* Fret 0 / Open String Button */}
              {(() => {
                const note = getNoteAtFret(str.openMidi, 0);
                const isActive = activeNotes.includes(note);
                const target = targetNotes.find(
                  (t) =>
                    (t.string === str.stringNum && (t.fret === 0 || t.fret === undefined)) ||
                    (!t.string && t.note === note)
                );

                return (
                  <button
                    type="button"
                    onClick={() => handleFretClick(str.stringNum, 0, note)}
                    className={`h-7 px-1.5 rounded flex items-center justify-between border text-[11px] font-mono z-10 transition-all ${
                      isActive
                        ? 'bg-amber-400 text-zinc-950 font-bold border-amber-300 scale-105'
                        : target
                        ? 'bg-amber-500/30 text-amber-200 border-amber-400 animate-pulse'
                        : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    <span>{str.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-bold text-amber-300">{note}</span>
                  </button>
                );
              })()}

              {/* Frets 1 to 12 */}
              {FRETS.slice(1).map((fret) => {
                const note = getNoteAtFret(str.openMidi, fret);
                const isActive = activeNotes.includes(note);
                const target = targetNotes.find(
                  (t) =>
                    (t.string === str.stringNum && t.fret === fret) ||
                    (!t.string && t.note === note)
                );

                return (
                  <div
                    key={fret}
                    className="relative h-full border-r border-zinc-500/40 flex items-center justify-center"
                  >
                    <button
                      type="button"
                      onClick={() => handleFretClick(str.stringNum, fret, note)}
                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono transition-all transform ${
                        isActive
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg scale-110'
                          : target
                          ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md ring-2 ring-emerald-300 animate-bounce'
                          : 'opacity-0 hover:opacity-100 bg-zinc-800 text-zinc-300 hover:scale-105 border border-zinc-600'
                      }`}
                      title={`${str.name} Fret ${fret}: ${note}`}
                    >
                      {target?.fingerNumber ? (
                        <span className="font-bold text-[10px]">{target.fingerNumber}</span>
                      ) : (
                        <span>{note.replace(/\d/, '')}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Guitar Legend & Technique cue */}
      <div className="w-full max-w-4xl flex items-center justify-between mt-2 text-xs text-zinc-400 px-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center">1</span>
            <span>Target Finger Placement</span>
          </span>
          <span className="text-zinc-500">Standard Tuning: E-A-D-G-B-E</span>
        </div>
        <span className="text-zinc-400">💡 Press directly behind fret wire</span>
      </div>
    </div>
  );
};
