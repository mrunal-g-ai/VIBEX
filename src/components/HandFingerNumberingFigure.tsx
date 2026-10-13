import React from 'react';
import { InstrumentType } from '../types';

interface Props {
  instrument: InstrumentType;
  activeFinger?: number | string; // e.g. 1, 2, 3, 4, 5 or 'T' or '0'
  compact?: boolean;
  highlightedFingers?: (number | string)[];
  onSelectFinger?: (finger: any) => void;
}

export const HandFingerNumberingFigure: React.FC<Props> = ({
  instrument,
  activeFinger,
  compact = false,
  highlightedFingers = [],
  onSelectFinger,
}) => {
  // 1. KEYBOARD: 5-FINGER HAND FIGURE (1: Thumb, 2: Index, 3: Middle, 4: Ring, 5: Pinky)
  if (instrument === 'keyboard') {
    const digits = [
      { id: 1, name: 'Thumb', role: 'Pivot & Scales (C)', x: 60, y: 110, fx: 40, fy: 130, r: 16 },
      { id: 2, name: 'Index', role: 'Pointer & Steps (D)', x: 105, y: 55, fx: 95, fy: 40, r: 15 },
      { id: 3, name: 'Middle', role: 'Center Arch (E)', x: 155, y: 38, fx: 150, fy: 20, r: 15 },
      { id: 4, name: 'Ring', role: 'Chord Extension (F)', x: 205, y: 50, fx: 205, fy: 35, r: 15 },
      { id: 5, name: 'Pinky', role: 'Bass / Melody Cap (G)', x: 250, y: 85, fx: 258, fy: 75, r: 14 },
    ];

    return (
      <div className={`w-full rounded-2xl bg-black/40 border border-white/10 p-3 sm:p-4 flex flex-col items-center select-none ${compact ? 'max-w-md' : ''}`}>
        <div className="flex items-center justify-between w-full mb-2">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#E5C07B] flex items-center gap-1.5">
            <span>🖐️</span> Piano Hand Anatomy &amp; Finger Numbering
          </span>
          <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            Standard 1-5 Notation
          </span>
        </div>

        <svg viewBox="0 0 310 200" className="w-full max-h-48">
          <defs>
            <linearGradient id="palmGradKb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <filter id="handGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Wrist Base & Forearm */}
          <path d="M 120 195 L 120 160 Q 155 155 190 160 L 190 195 Z" fill="#78350f" opacity="0.6" />
          <text x="155" y="185" fill="#a1a1aa" fontSize="9" fontWeight="bold" textAnchor="middle">Wrist (Relaxed Level)</text>

          {/* Palm Contour Body */}
          <path
            d="M 85 140 Q 60 120 70 95 Q 100 80 155 75 Q 215 80 240 100 Q 255 130 220 155 Q 155 160 85 140 Z"
            fill="url(#palmGradKb)"
            stroke="#fef08a"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* Ball Arch Center Indicator */}
          <ellipse cx="155" cy="115" rx="35" ry="22" fill="#00000044" stroke="#E5C07B" strokeWidth="1" strokeDasharray="3 3" />
          <text x="155" y="118" fill="#E5C07B" fontSize="8" fontWeight="bold" textAnchor="middle">Curved Palm Dome</text>

          {/* 5 Distinct Numbered Finger Digits */}
          {digits.map((d) => {
            const isActive = activeFinger === d.id || highlightedFingers.includes(d.id);
            return (
              <g
                key={d.id}
                onClick={() => onSelectFinger?.(d.id)}
                className={onSelectFinger ? 'cursor-pointer' : ''}
              >
                {/* Articulated Phalanx Bone Joint Line */}
                <line
                  x1={d.x}
                  y1={d.y}
                  x2={d.fx}
                  y2={d.fy}
                  stroke={isActive ? '#22c55e' : '#b45309'}
                  strokeWidth={d.id === 1 ? 16 : 14}
                  strokeLinecap="round"
                />

                {/* Fingertip Circular Pad */}
                <circle
                  cx={d.fx}
                  cy={d.fy}
                  r={d.r}
                  fill={isActive ? '#22c55e' : '#18181b'}
                  stroke={isActive ? '#ffffff' : '#E5C07B'}
                  strokeWidth="2.5"
                  filter={isActive ? 'url(#handGlow)' : undefined}
                />

                {/* Finger Number Numbering (1 to 5) */}
                <text
                  x={d.fx}
                  y={d.fy + 4.5}
                  fill={isActive ? '#000000' : '#ffffff'}
                  fontSize="13"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {d.id}
                </text>

                {/* Name Label */}
                <text
                  x={d.fx}
                  y={d.fy - (d.id === 3 ? 14 : 12)}
                  fill={isActive ? '#22c55e' : '#E5C07B'}
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {d.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Key */}
        <div className="grid grid-cols-5 gap-1.5 w-full mt-2 pt-2 border-t border-white/10 text-center">
          {digits.map((d) => (
            <div
              key={d.id}
              onClick={() => onSelectFinger?.(d.id)}
              className={`p-1.5 rounded-lg border transition text-center ${
                activeFinger === d.id
                  ? 'bg-green-500/20 border-green-400 text-green-300'
                  : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="text-xs font-black text-[#E5C07B]">Finger {d.id}</div>
              <div className="text-[10px] font-bold text-white">{d.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. GUITAR: LEFT-HAND FRETTING HAND (T: Thumb behind, 1: Index, 2: Middle, 3: Ring, 4: Pinky)
  if (instrument === 'guitar') {
    const digits = [
      { id: 'T', name: 'Thumb', role: 'Back Center Anchor (No Wrap)', x: 45, y: 120, fx: 40, fy: 125, r: 15, isThumb: true },
      { id: 1, name: 'Index (1)', role: 'Fret 1 / Barre Base', x: 95, y: 55, fx: 90, fy: 38, r: 15 },
      { id: 2, name: 'Middle (2)', role: 'Fret 2 / Minor Triad', x: 145, y: 40, fx: 145, fy: 22, r: 15 },
      { id: 3, name: 'Ring (3)', role: 'Fret 3 / Root Anchor', x: 195, y: 48, fx: 195, fy: 32, r: 15 },
      { id: 4, name: 'Pinky (4)', role: 'Fret 4 / High Extension', x: 240, y: 78, fx: 245, fy: 65, r: 14 },
    ];

    return (
      <div className={`w-full rounded-2xl bg-black/40 border border-white/10 p-3 sm:p-4 flex flex-col items-center select-none ${compact ? 'max-w-md' : ''}`}>
        <div className="flex items-center justify-between w-full mb-2">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#E5C07B] flex items-center gap-1.5">
            <span>🎸</span> Guitar Fretting Hand: 1 - 2 - 3 - 4 + Thumb (T)
          </span>
          <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            Fretboard Finger System
          </span>
        </div>

        <svg viewBox="0 0 310 190" className="w-full max-h-44">
          {/* Wooden Fretboard Cross Section Behind Hand */}
          <rect x="20" y="130" width="270" height="28" rx="6" fill="#2b1810" stroke="#523521" strokeWidth="2" />
          <line x1="20" y1="138" x2="290" y2="138" stroke="#e4e4e7" strokeWidth="2.5" />
          <line x1="20" y1="146" x2="290" y2="146" stroke="#e4e4e7" strokeWidth="1.5" />
          <text x="275" y="148" fill="#a1a1aa" fontSize="7" fontWeight="bold">Strings</text>

          {/* Palm Arch */}
          <path
            d="M 75 125 Q 60 100 80 80 Q 130 65 185 70 Q 235 85 240 115 Q 215 130 145 135 Z"
            fill="#92400e"
            stroke="#fef08a"
            strokeWidth="1.5"
            opacity="0.85"
          />

          {/* Thumb Position Guide Behind Neck */}
          <ellipse cx="40" cy="144" rx="20" ry="12" fill="#22c55e" opacity="0.3" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="40" y="165" fill="#22c55e" fontSize="7.5" fontWeight="bold" textAnchor="middle">✓ Thumb on Back Center</text>

          {/* 4 Fretting Fingers + Thumb */}
          {digits.map((d) => {
            const isActive = activeFinger === d.id || (typeof activeFinger === 'number' && d.id === activeFinger) || highlightedFingers.includes(d.id);
            return (
              <g
                key={d.id.toString()}
                onClick={() => onSelectFinger?.(d.id)}
                className={onSelectFinger ? 'cursor-pointer' : ''}
              >
                {/* Finger Phalanx Vector */}
                <line
                  x1={d.x}
                  y1={d.y}
                  x2={d.fx}
                  y2={d.fy}
                  stroke={isActive ? '#22c55e' : '#d97706'}
                  strokeWidth={d.isThumb ? 14 : 12}
                  strokeLinecap="round"
                />

                {/* Fingertip Ring */}
                <circle
                  cx={d.fx}
                  cy={d.fy}
                  r={d.r}
                  fill={isActive ? '#22c55e' : '#18181b'}
                  stroke={isActive ? '#ffffff' : '#E5C07B'}
                  strokeWidth="2.5"
                />

                {/* Finger Number Label (T, 1, 2, 3, 4) */}
                <text
                  x={d.fx}
                  y={d.fy + 4.5}
                  fill={isActive ? '#000000' : '#ffffff'}
                  fontSize="12.5"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {d.id}
                </text>

                {/* Finger Name & Tip Callout */}
                <text
                  x={d.fx}
                  y={d.fy - 12}
                  fill={isActive ? '#22c55e' : '#E5C07B'}
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {d.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-5 gap-1 w-full mt-1.5 pt-1.5 border-t border-white/10 text-center">
          {digits.map((d) => (
            <div
              key={d.id.toString()}
              onClick={() => onSelectFinger?.(d.id)}
              className={`p-1 rounded-md border text-center transition ${
                activeFinger === d.id
                  ? 'bg-green-500/20 border-green-400 text-green-300'
                  : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="text-[11px] font-black text-[#E5C07B]">Finger {d.id}</div>
              <div className="text-[9px] text-white/90 truncate">{d.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. VIOLIN: LEFT HAND (0: Open, 1: Index, 2: Middle, 3: Ring, 4: Pinky) & RIGHT HAND BOW GRIP (T, 1, 2, 3, 4)
  if (instrument === 'violin') {
    const leftHandDigits = [
      { id: 0, name: '0 (Open)', role: 'No Finger Pressed', x: 25, y: 45, r: 13 },
      { id: 1, name: '1st (Index)', role: 'Whole / Half Step from Nut', x: 75, y: 35, r: 14 },
      { id: 2, name: '2nd (Middle)', role: 'Major / Minor 3rd', x: 125, y: 25, r: 14 },
      { id: 3, name: '3rd (Ring)', role: 'Perfect 4th', x: 175, y: 32, r: 14 },
      { id: 4, name: '4th (Pinky)', role: 'Octave / Unison 5th', x: 220, y: 55, r: 13 },
    ];

    const bowGripFingers = [
      { id: 'T', name: 'Thumb (T)', role: 'Bent Tip on Frog Notch' },
      { id: '1', name: 'Index (1)', role: 'Arm Weight Pronation' },
      { id: '2', name: 'Middle (2)', role: 'Opposite Thumb Fulcrum' },
      { id: '3', name: 'Ring (3)', role: 'Hugs Frog Pearl Eye' },
      { id: '4', name: 'Pinky (4)', role: 'Curved on Stick Top' },
    ];

    return (
      <div className={`w-full rounded-2xl bg-black/40 border border-white/10 p-3 sm:p-4 flex flex-col items-center select-none ${compact ? 'max-w-md' : ''}`}>
        <div className="flex items-center justify-between w-full mb-2">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#E5C07B] flex items-center gap-1.5">
            <span>🎻</span> Violin Fingerboard (0-1-2-3-4) &amp; Bow Grip (T-1-2-3-4)
          </span>
          <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            Classical Violin System
          </span>
        </div>

        {/* Dual Mode Sub-View: Fingerboard Numbering */}
        <div className="w-full bg-white/5 rounded-xl p-2.5 border border-white/10">
          <div className="text-[10px] text-[#E5C07B] font-bold uppercase mb-1 flex items-center justify-between">
            <span>Left Hand Fingerboard Drops:</span>
            <span className="text-white/40">Nut ➔ Bridge</span>
          </div>

          <div className="flex items-center justify-between gap-1">
            {leftHandDigits.map((d) => {
              const isActive = activeFinger === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => onSelectFinger?.(d.id)}
                  className={`flex-1 p-2 rounded-lg border text-center transition cursor-pointer ${
                    isActive
                      ? 'bg-green-500/25 border-green-400 text-green-300 shadow-md'
                      : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-black text-xs mb-1 ${
                    isActive ? 'bg-green-400 text-black' : 'bg-[#E5C07B] text-black'
                  }`}>
                    {d.id}
                  </div>
                  <div className="text-[10px] font-bold text-white truncate">{d.name}</div>
                  <div className="text-[8.5px] text-white/50 truncate">{d.role}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bow Hold Finger Numbering Inset */}
        <div className="w-full grid grid-cols-5 gap-1 mt-2 pt-2 border-t border-white/10 text-center">
          {bowGripFingers.map((b) => (
            <div key={b.id} className="p-1 rounded-md bg-white/5 border border-white/5 text-center">
              <div className="text-[10px] font-extrabold text-sky-400">Bow {b.id}</div>
              <div className="text-[8.5px] text-white/70 truncate">{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. BANSURI: DUAL-HAND 6-HOLE FIGURE (Left Hand 1-2-3 + Right Hand 1-2-3 + Thumbs underneath)
  const leftHand = [
    { hole: 1, finger: 1, name: 'Index (1)', note: 'Ma (½) / Ga (●)', x: 60, y: 70 },
    { hole: 2, finger: 2, name: 'Middle (2)', note: 'Re (●)', x: 105, y: 65 },
    { hole: 3, finger: 3, name: 'Ring (3)', note: 'Sa Tonic (●)', x: 150, y: 70 },
  ];

  const rightHand = [
    { hole: 4, finger: 1, name: 'Index (1)', note: 'Ni (●)', x: 205, y: 70 },
    { hole: 5, finger: 2, name: 'Middle (2)', note: 'Dha (●)', x: 250, y: 65 },
    { hole: 6, finger: 3, name: 'Ring (3)', note: 'Pa (●)', x: 295, y: 70 },
  ];

  return (
    <div className={`w-full rounded-2xl bg-black/40 border border-white/10 p-3 sm:p-4 flex flex-col items-center select-none ${compact ? 'max-w-md' : ''}`}>
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#E5C07B] flex items-center gap-1.5">
          <span>🪈</span> Bansuri 2-Hand Figure: LH (1-2-3) &amp; RH (1-2-3)
        </span>
        <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
          6-Hole Pad Sealing
        </span>
      </div>

      <svg viewBox="0 0 350 140" className="w-full max-h-36">
        {/* Bamboo Flute Silhouette */}
        <rect x="15" y="55" width="320" height="30" rx="8" fill="#92400e" stroke="#78350f" strokeWidth="2" />
        {/* Blow hole */}
        <ellipse cx="35" cy="70" rx="7" ry="6" fill="#18181b" stroke="#78350f" strokeWidth="1.5" />
        <text x="35" y="98" fill="#a1a1aa" fontSize="7" textAnchor="middle">Blow</text>

        {/* Hand Zone Dividers */}
        <rect x="50" y="20" width="110" height="18" rx="9" fill="#000000bb" stroke="#E5C07B" strokeWidth="1" />
        <text x="105" y="32" fill="#E5C07B" fontSize="8.5" fontWeight="bold" textAnchor="middle">
          Left Hand (LH 1-2-3)
        </text>

        <rect x="195" y="20" width="110" height="18" rx="9" fill="#000000bb" stroke="#38bdf8" strokeWidth="1" />
        <text x="250" y="32" fill="#38bdf8" fontSize="8.5" fontWeight="bold" textAnchor="middle">
          Right Hand (RH 1-2-3)
        </text>

        {/* Left Hand Fingers (1, 2, 3) */}
        {leftHand.map((h) => {
          const isSelected = activeFinger === h.hole || activeFinger === `LH${h.finger}`;
          return (
            <g key={h.hole}>
              {/* Flute Hole */}
              <circle cx={h.x} cy={h.y} r="7" fill="#18181b" stroke="#451a03" strokeWidth="1.5" />
              {/* Numbered Finger Pad */}
              <circle
                cx={h.x}
                cy={h.y}
                r="10"
                fill={isSelected ? '#22c55e' : '#fde047'}
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.9"
              />
              <text x={h.x} y={h.y + 3.5} fill="#000000" fontSize="9" fontWeight="900" textAnchor="middle">
                {h.finger}
              </text>
              <text x={h.x} y="100" fill="#E5C07B" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                Hole {h.hole}
              </text>
              <text x={h.x} y="112" fill="#a1a1aa" fontSize="6.5" textAnchor="middle">
                LH {h.finger}
              </text>
            </g>
          );
        })}

        {/* Right Hand Fingers (1, 2, 3) */}
        {rightHand.map((h) => {
          const isSelected = activeFinger === h.hole || activeFinger === `RH${h.finger}`;
          return (
            <g key={h.hole}>
              {/* Flute Hole */}
              <circle cx={h.x} cy={h.y} r="7" fill="#18181b" stroke="#451a03" strokeWidth="1.5" />
              {/* Numbered Finger Pad */}
              <circle
                cx={h.x}
                cy={h.y}
                r="10"
                fill={isSelected ? '#22c55e' : '#38bdf8'}
                stroke="#ffffff"
                strokeWidth="1.5"
                opacity="0.9"
              />
              <text x={h.x} y={h.y + 3.5} fill="#000000" fontSize="9" fontWeight="900" textAnchor="middle">
                {h.finger}
              </text>
              <text x={h.x} y="100" fill="#38bdf8" fontSize="7.5" fontWeight="bold" textAnchor="middle">
                Hole {h.hole}
              </text>
              <text x={h.x} y="112" fill="#a1a1aa" fontSize="6.5" textAnchor="middle">
                RH {h.finger}
              </text>
            </g>
          );
        })}

        {/* Thumbs Support Underneath */}
        <text x="105" y="130" fill="#22c55e" fontSize="7" fontWeight="bold" textAnchor="middle">
          ✓ LH Thumb underneath (Support)
        </text>
        <text x="250" y="130" fill="#22c55e" fontSize="7" fontWeight="bold" textAnchor="middle">
          ✓ RH Thumb underneath (Support)
        </text>
      </svg>

      {/* Quick Swara Mapping Footer */}
      <div className="w-full mt-2 pt-2 border-t border-white/10 text-center text-[10px] text-white/80">
        <span className="text-[#E5C07B] font-extrabold uppercase">Progressive Swara Sequence:</span>{' '}
        <span className="text-cyan-300 font-bold">#1 Ma (1st Hole ½)</span> ➔{' '}
        <span className="text-white font-bold">#2 Ga (1 Closed)</span> ➔{' '}
        <span className="text-white font-bold">#3 Re (2 Closed)</span> ➔{' '}
        <span className="text-[#E5C07B] font-bold">#4 Sa (3 Closed - Tonic)</span> ➔{' '}
        <span className="text-white font-bold">#5 Ni (4 Closed)</span> ➔{' '}
        <span className="text-white font-bold">#6 Dha (5 Closed)</span> ➔{' '}
        <span className="text-white font-bold">#7 Pa (All 6 Closed)</span>
      </div>
    </div>
  );
};

export default HandFingerNumberingFigure;
