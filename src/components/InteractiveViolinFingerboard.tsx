import React, { useCallback, useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { TargetNote } from '../types';

interface Props {
  activeNotes?: string[];
  targetNotes?: TargetNote[];
  onNotePlayed?: (note: string, stringNum: number, finger: number) => void;
  disabled?: boolean;
}

// 4 Violin Strings: G3 (IV), D4 (III), A4 (II), E5 (I)
const VIOLIN_STRINGS = [
  { stringNum: 1, name: 'E5 (I)', openNote: 'E5', openMidi: 76, color: '#38bdf8' },
  { stringNum: 2, name: 'A4 (II)', openNote: 'A4', openMidi: 69, color: '#34d399' },
  { stringNum: 3, name: 'D4 (III)', openNote: 'D4', openMidi: 62, color: '#fbbf24' },
  { stringNum: 4, name: 'G3 (IV)', openNote: 'G3', openMidi: 55, color: '#f87171' },
];

// 1st Position Finger positions
const FINGER_POSITIONS = [
  { finger: 0, label: 'Open', semitones: 0 },
  { finger: 1, label: '1st Finger (Whole step)', semitones: 2 },
  { finger: 2, label: '2nd Finger (High)', semitones: 4 },
  { finger: 3, label: '3rd Finger (Ring)', semitones: 5 },
  { finger: 4, label: '4th Finger (Pinky)', semitones: 7 },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function getViolinNote(openMidi: number, semitones: number): string {
  const midi = openMidi + semitones;
  const name = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

export const InteractiveViolinFingerboard: React.FC<Props> = ({
  activeNotes = [],
  targetNotes = [],
  onNotePlayed,
  disabled = false,
}) => {
  const [bowDirection, setBowDirection] = useState<'down' | 'up'>('down');

  const handleFingerTap = useCallback(
    (stringNum: number, finger: number, note: string) => {
      if (disabled) return;
      // Toggle bow direction for realistic bowing feel
      setBowDirection((prev) => (prev === 'down' ? 'up' : 'down'));
      audioEngine.playNote(note, 'violin', 1.2);
      if (onNotePlayed) {
        onNotePlayed(note, stringNum, finger);
      }
    },
    [disabled, onNotePlayed]
  );

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Violin Ebony Fingerboard & Bow Simulator */}
      <div className="relative w-full max-w-4xl bg-zinc-950 border-2 border-stone-800 rounded-2xl p-4 shadow-2xl overflow-x-auto">
        {/* Header: Bow Stroke Widget & Intonation Guide */}
        <div className="flex items-center justify-between mb-3 px-2 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-400">Bow Stroke:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-mono text-amber-300 flex items-center gap-1.5">
              {bowDirection === 'down' ? (
                <>
                  <span className="font-bold text-sm">⊓</span> Down-Bow (Frog → Tip)
                </>
              ) : (
                <>
                  <span className="font-bold text-sm">∨</span> Up-Bow (Tip → Frog)
                </>
              )}
            </span>
          </div>

          <span className="text-xs text-zinc-400 font-mono">
            Strings: <strong className="text-zinc-200">G - D - A - E</strong> (5ths)
          </span>
        </div>

        {/* Fingerboard Surface (Tapered Ebony) */}
        <div className="relative flex flex-col gap-3 p-3 bg-gradient-to-r from-stone-950 via-zinc-900 to-stone-950 rounded-xl border border-zinc-800">
          {/* Finger Tape Reference lines */}
          <div className="absolute top-0 bottom-0 left-[28%] w-0.5 bg-amber-500/30 pointer-events-none" title="1st Finger Tape" />
          <div className="absolute top-0 bottom-0 left-[52%] w-0.5 bg-emerald-500/30 pointer-events-none" title="2nd Finger Tape" />
          <div className="absolute top-0 bottom-0 left-[66%] w-0.5 bg-sky-500/30 pointer-events-none" title="3rd Finger Tape" />
          <div className="absolute top-0 bottom-0 left-[86%] w-0.5 bg-purple-500/30 pointer-events-none" title="4th Finger Tape" />

          {VIOLIN_STRINGS.map((str) => (
            <div key={str.stringNum} className="relative flex items-center justify-between h-9">
              {/* String Core Line */}
              <div
                className="absolute left-24 right-4 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-400 shadow pointer-events-none z-0"
                style={{ height: `${5 - str.stringNum * 0.8}px` }}
              />

              {/* Open String Pill */}
              {(() => {
                const note = str.openNote;
                const isActive = activeNotes.includes(note);
                const target = targetNotes.find(
                  (t) => (t.string === str.stringNum && t.fingerNumber === 0) || t.note === note
                );

                return (
                  <button
                    type="button"
                    onClick={() => handleFingerTap(str.stringNum, 0, note)}
                    className={`w-20 h-8 rounded-lg flex items-center justify-between px-2 text-xs font-mono font-bold z-10 transition-all border ${
                      isActive
                        ? 'bg-amber-400 text-zinc-950 border-amber-300 scale-105'
                        : target
                        ? 'bg-amber-500/30 text-amber-200 border-amber-400 animate-pulse'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
                    }`}
                  >
                    <span>{str.name.split(' ')[0]}</span>
                    <span className="text-[10px] text-amber-400">{note}</span>
                  </button>
                );
              })()}

              {/* 1st, 2nd, 3rd, 4th Finger Placement Nodes */}
              <div className="flex-1 flex justify-around pl-4">
                {FINGER_POSITIONS.slice(1).map((pos) => {
                  const note = getViolinNote(str.openMidi, pos.semitones);
                  const isActive = activeNotes.includes(note);
                  const target = targetNotes.find(
                    (t) =>
                      (t.string === str.stringNum && t.fingerNumber === pos.finger) ||
                      (!t.string && t.note === note)
                  );

                  return (
                    <button
                      key={pos.finger}
                      type="button"
                      onClick={() => handleFingerTap(str.stringNum, pos.finger, note)}
                      className={`relative z-10 w-8 h-8 rounded-full flex flex-col items-center justify-center text-xs font-mono transition-all transform ${
                        isActive
                          ? 'bg-amber-400 text-zinc-950 font-bold shadow-lg scale-110'
                          : target
                          ? 'bg-emerald-500 text-zinc-950 font-bold ring-2 ring-emerald-300 shadow-md animate-bounce'
                          : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:scale-105'
                      }`}
                      title={`${str.name} Finger ${pos.finger}: ${note}`}
                    >
                      <span className="font-bold text-[11px]">{pos.finger}</span>
                      <span className="text-[8px] opacity-75">{note.replace(/\d/, '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Tapes Position Header */}
        <div className="flex justify-between pl-28 pr-6 mt-2 text-[10px] font-mono text-zinc-500">
          <span>Tape 1 (Whole Step)</span>
          <span>Tape 2 (High 2nd)</span>
          <span>Tape 3 (Ring Finger)</span>
          <span>4th (Pinky)</span>
        </div>
      </div>
    </div>
  );
};
