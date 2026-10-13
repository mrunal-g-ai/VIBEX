import React, { useState, useEffect } from 'react';
import { InstrumentType } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, AlertTriangle, Hand } from 'lucide-react';
import { HandFingerNumberingFigure } from './HandFingerNumberingFigure';

interface Props {
  animationType: string;
  title: string;
  description: string;
  keyPoints: string[];
  mistakeToAvoid: string;
  instrument: InstrumentType;
}

export const AnimatedTechniqueDemonstration: React.FC<Props> = ({
  animationType,
  title,
  description,
  keyPoints,
  mistakeToAvoid,
  instrument,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [frame, setFrame] = useState(0);
  const [showHandFigure, setShowHandFigure] = useState(true);

  // Animation cycle loop (0 to 100)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const renderAnimationCanvas = () => {
    const t = frame / 100;

    // KEYBOARD ANIMATION: Hand Arch & Thumb Tuck with 1-2-3-4-5 Finger Numbers
    if (animationType.includes('keyboard') || instrument === 'keyboard') {
      const isThumbTuck = animationType.includes('thumb_tuck');
      const thumbX = isThumbTuck ? 120 + Math.sin(t * Math.PI * 2) * 25 : 120;
      const fingerCurveY = 90 - Math.sin(t * Math.PI * 2) * 8;
      const activeIdx = Math.floor((t * 5) % 5);

      return (
        <svg viewBox="0 0 400 220" className="w-full h-full">
          <defs>
            <linearGradient id="kbKeyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d4d4d8" />
            </linearGradient>
          </defs>

          {/* Background Piano Bed */}
          <rect x="40" y="140" width="320" height="60" rx="8" fill="#090a0d" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect
              key={i}
              x={50 + i * 38}
              y={142}
              width="36"
              height="54"
              rx="4"
              fill="url(#kbKeyGrad)"
              stroke="#71717a"
              strokeWidth="1"
            />
          ))}
          {/* Black keys */}
          {[0, 1, 3, 4, 5].map((i) => (
            <rect key={i} x={74 + i * 38} y={142} width="22" height="34" rx="3" fill="#18181b" />
          ))}

          {/* Forearm & Wrist Guideline (Straight Plane) */}
          <path
            d="M 30 70 Q 150 70 200 80"
            stroke="#22c55e"
            strokeWidth="3"
            strokeDasharray="4 4"
            fill="none"
          />
          <text x="50" y="55" fill="#22c55e" fontSize="11" fontWeight="bold">
            ✓ Neutral Wrist Level
          </text>

          {/* Hand Silhouette (Curved Dome Shape) */}
          <path
            d={`M 180 80 Q 240 ${fingerCurveY - 20} 270 ${fingerCurveY + 30} Q 250 140 220 140 Q 180 120 180 80`}
            fill="#d97706"
            opacity="0.85"
            stroke="#fef08a"
            strokeWidth="2"
          />

          {/* 5 Distinct Numbered Fingers */}
          {[
            { id: 1, name: 'Thumb', x: thumbX, y: 138, r: 10 },
            { id: 2, name: 'Index', x: 165, y: 138, r: 9 },
            { id: 3, name: 'Middle', x: 200, y: 138, r: 9 },
            { id: 4, name: 'Ring', x: 238, y: 138, r: 9 },
            { id: 5, name: 'Pinky', x: 272, y: 138, r: 9 },
          ].map((f, idx) => {
            const isActive = idx === activeIdx;
            return (
              <g key={f.id}>
                <circle
                  cx={f.x}
                  cy={f.y}
                  r={isActive ? f.r + 2 : f.r}
                  fill={isActive ? '#22c55e' : '#E5C07B'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={f.x}
                  y={f.y + 4}
                  fill="#000000"
                  fontSize="11"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {f.id}
                </text>
                <text
                  x={f.x}
                  y={f.y - 12}
                  fill={isActive ? '#22c55e' : '#E5C07B'}
                  fontSize="8.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {f.name}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }

    // GUITAR ANIMATION: Fret Hand Arch & Numbered Fretting Fingers (T, 1, 2, 3, 4)
    if (animationType.includes('guitar') || instrument === 'guitar') {
      const activeFret = Math.floor((t * 4) % 4) + 1;

      return (
        <svg viewBox="0 0 400 220" className="w-full h-full">
          {/* Guitar Neck Cross-Section / Profile */}
          <rect x="40" y="80" width="320" height="42" rx="8" fill="#292524" stroke="#57534e" strokeWidth="2" />
          {/* Frets 1 to 4 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line
                x1={80 + i * 65}
                y1="78"
                x2={80 + i * 65}
                y2="124"
                stroke="#e7e5e4"
                strokeWidth="3"
              />
              {i < 4 && (
                <text x={80 + i * 65 + 32} y="72" fill="#a1a1aa" fontSize="9" fontWeight="bold" textAnchor="middle">
                  Fret {i + 1}
                </text>
              )}
            </g>
          ))}
          {/* Strings */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="40"
              y1={86 + i * 9}
              x2="360"
              y2={86 + i * 9}
              stroke="#d6d3d1"
              strokeWidth={2.5 - i * 0.5}
            />
          ))}

          {/* Left Hand Thumb behind Neck (Back Middle) */}
          <ellipse cx="180" cy="144" rx="20" ry="12" fill="#E5C07B" stroke="#22c55e" strokeWidth="2" />
          <text x="180" y="148" fill="#000000" fontSize="10" fontWeight="900" textAnchor="middle">
            T
          </text>
          <text x="180" y="172" fill="#22c55e" fontSize="10" fontWeight="bold" textAnchor="middle">
            ✓ Thumb (T) on Back Center
          </text>

          {/* 4 Fretting Fingers with Numbering (1: Index, 2: Middle, 3: Ring, 4: Pinky) */}
          {[
            { num: 1, name: 'Index', x: 120, y: 86 },
            { num: 2, name: 'Middle', x: 185, y: 86 },
            { num: 3, name: 'Ring', x: 250, y: 86 },
            { num: 4, name: 'Pinky', x: 315, y: 86 },
          ].map((f) => {
            const isActive = f.num === activeFret;
            return (
              <g key={f.num}>
                {/* Finger body arch */}
                <path
                  d={`M ${f.x - 15} 35 Q ${f.x + 5} 30 ${f.x + 5} ${isActive ? f.y : f.y - 12}`}
                  stroke="#d97706"
                  strokeWidth={isActive ? '14' : '10'}
                  strokeLinecap="round"
                  fill="none"
                  opacity={isActive ? 1 : 0.5}
                />
                {/* Contact circle */}
                <circle
                  cx={f.x + 5}
                  cy={isActive ? f.y : f.y - 12}
                  r={isActive ? 11 : 8.5}
                  fill={isActive ? '#22c55e' : '#fde047'}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={f.x + 5}
                  y={(isActive ? f.y : f.y - 12) + 4}
                  fill="#000000"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {f.num}
                </text>
                <text
                  x={f.x + 5}
                  y={(isActive ? f.y : f.y - 12) - 13}
                  fill={isActive ? '#22c55e' : '#E5C07B'}
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  Finger {f.num}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }

    // VIOLIN ANIMATION: Bow Perpendicular Track + Numbered Left Hand Fingers (1, 2, 3, 4)
    if (animationType.includes('violin') || instrument === 'violin') {
      const bowY = 100 + Math.sin(t * Math.PI * 2) * 20;
      const activeFinger = Math.floor((t * 4) % 4) + 1;

      return (
        <svg viewBox="0 0 400 220" className="w-full h-full">
          {/* Violin Body Contour */}
          <path
            d="M 60 70 C 110 50 140 100 170 90 C 210 80 250 120 300 110"
            stroke="#78350f"
            strokeWidth="12"
            fill="none"
          />
          {/* Bridge */}
          <rect x="195" y="70" width="12" height="60" rx="2" fill="#ca8a04" stroke="#78350f" />
          <text x="180" y="60" fill="#E5C07B" fontSize="10" fontWeight="bold">
            Bridge
          </text>

          {/* 4 Strings */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="60"
              y1={92 + i * 6}
              x2="320"
              y2={92 + i * 6}
              stroke="#e2e8f0"
              strokeWidth={1.5}
            />
          ))}

          {/* Numbered Fingerboard Drops: 1 (Index), 2 (Middle), 3 (Ring), 4 (Pinky) */}
          {[
            { num: 1, name: '1st', x: 235, y: 104 },
            { num: 2, name: '2nd', x: 265, y: 104 },
            { num: 3, name: '3rd', x: 295, y: 104 },
            { num: 4, name: '4th', x: 325, y: 104 },
          ].map((f) => {
            const isActive = f.num === activeFinger;
            return (
              <g key={f.num}>
                <circle
                  cx={f.x}
                  cy={f.y}
                  r={isActive ? 9 : 7}
                  fill={isActive ? '#22c55e' : '#fde047'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={f.x}
                  y={f.y + 3.5}
                  fill="#000000"
                  fontSize="8.5"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {f.num}
                </text>
              </g>
            );
          })}

          {/* Bow Stick (Straight 90° line across strings) */}
          <line
            x1={150}
            y1={bowY - 50}
            x2={150}
            y2={bowY + 50}
            stroke="#38bdf8"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* 90° Perpendicular Indicator */}
          <path d="M 150 92 L 160 92 L 160 102" stroke="#22c55e" strokeWidth="2" fill="none" />
          <text x="135" y="35" fill="#22c55e" fontSize="11" fontWeight="bold">
            ✓ 90° Perpendicular
          </text>
        </svg>
      );
    }

    // BANSURI ANIMATION: Embouchure Angle & 6-Hole Numbered Fingers (Progressive sequence: Ma (½) -> Ga -> Re -> Sa -> Ni -> Dha -> Pa)
    const breathOffset = Math.sin(t * Math.PI * 2) * 5;
    const bansuriSequence = [
      { swara: 'Ma', name: 'Ma (½ Hole)', closedCount: 0, isHalfMa: true },
      { swara: 'Ga', name: 'Ga (1 Closed)', closedCount: 1, isHalfMa: false },
      { swara: 'Re', name: 'Re (2 Closed)', closedCount: 2, isHalfMa: false },
      { swara: 'Sa', name: 'Sa (3 Closed - Tonic)', closedCount: 3, isHalfMa: false },
      { swara: 'Ni', name: 'Ni (4 Closed)', closedCount: 4, isHalfMa: false },
      { swara: 'Dha', name: 'Dha (5 Closed)', closedCount: 5, isHalfMa: false },
      { swara: 'Pa', name: 'Pa (All 6 Closed)', closedCount: 6, isHalfMa: false },
    ];
    const activeStep = bansuriSequence[Math.floor((t * bansuriSequence.length) % bansuriSequence.length)];

    return (
      <svg viewBox="0 0 400 220" className="w-full h-full">
        {/* Bamboo Cylinder */}
        <rect x="40" y="90" width="320" height="40" rx="8" fill="#78350f" stroke="#b45309" strokeWidth="2" />
        {/* Blow Hole (Blow Hole / Embouchure) */}
        <ellipse cx="100" cy="110" rx="12" ry="9" fill="#090a0d" stroke="#d97706" strokeWidth="2" />

        {/* Current Active Swara Badge */}
        <rect x="120" y="16" width="160" height="22" rx="11" fill="#000000dd" stroke="#E5C07B" strokeWidth="1" />
        <text x="200" y="31" fill="#E5C07B" fontSize="9.5" fontWeight="bold" textAnchor="middle">
          {activeStep.swara}: {activeStep.name}
        </text>

        {/* 6 Numbered Finger Holes */}
        {[
          { id: 1, hand: 'LH', finger: 1, x: 155 },
          { id: 2, hand: 'LH', finger: 2, x: 190 },
          { id: 3, hand: 'LH', finger: 3, x: 225 },
          { id: 4, hand: 'RH', finger: 1, x: 265 },
          { id: 5, hand: 'RH', finger: 2, x: 300 },
          { id: 6, hand: 'RH', finger: 3, x: 335 },
        ].map((h) => {
          const isClosed = h.id <= activeStep.closedCount;
          const isHalf = activeStep.isHalfMa && h.id === 1;
          const fingerY = isClosed ? 110 : isHalf ? 96 : 76;

          return (
            <g key={h.id}>
              <circle
                cx={h.x}
                cy="110"
                r="7.5"
                fill={isClosed ? '#22c55e' : '#18181b'}
                stroke="#78350f"
                strokeWidth="1.5"
              />
              {isHalf && (
                <path
                  d={`M ${h.x} 102.5 A 7.5 7.5 0 0 1 ${h.x} 117.5 Z`}
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />
              )}
              {/* Numbered Finger Badge */}
              <circle
                cx={h.x}
                cy={fingerY}
                r="9.5"
                fill={isClosed ? '#22c55e' : isHalf ? '#38bdf8' : '#fde047'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <text x={h.x} y={fingerY + 3.5} fill="#000000" fontSize="9" fontWeight="900" textAnchor="middle">
                {h.finger}
              </text>
              <text x={h.x} y="142" fill={isClosed ? '#22c55e' : isHalf ? '#38bdf8' : '#a1a1aa'} fontSize="7.5" fontWeight="bold" textAnchor="middle">
                {h.hand} {h.finger}
              </text>
            </g>
          );
        })}

        {/* Lower Lip Embouchure (Covering 1/3 blow hole) */}
        <path
          d="M 80 95 Q 100 118 120 95"
          stroke="#f43f5e"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Focused Air Stream Angle (45° into blow hole) */}
        <path
          d={`M 95 98 L ${105 + breathOffset} 120`}
          stroke="#38bdf8"
          strokeWidth="4"
          strokeDasharray="4 2"
          fill="none"
        />
        <text x="35" y="75" fill="#38bdf8" fontSize="10" fontWeight="bold">
          45° Air Ribbon Stream
        </text>
      </svg>
    );
  };

  return (
    <div className="w-full bg-[#0F1115] border border-white/10 rounded-3xl p-5 md:p-7 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#E5C07B]">
            Animated Form &amp; Finger Numbers
          </span>
          <h3 className="text-xl font-light font-serif-italic text-white mt-0.5">{title}</h3>
        </div>

        {/* Play / Pause / Reset & Finger Figure Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHandFigure(!showHandFigure)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 border ${
              showHandFigure
                ? 'bg-[#E5C07B] text-black border-[#E5C07B]'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
            }`}
            title="Toggle Hand & Finger Numbering Figure"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Finger Diagram</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setFrame(0)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition"
            title="Restart Animation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Animation Viewport */}
      <div className="relative w-full h-56 bg-black/50 rounded-2xl my-2 flex items-center justify-center border border-white/5 overflow-hidden">
        {renderAnimationCanvas()}
      </div>

      {/* Hand & Finger Numbering Anatomical Figure Display */}
      {showHandFigure && (
        <HandFingerNumberingFigure instrument={instrument} compact={false} />
      )}

      {/* Description & Key Pedagogical Points */}
      <p className="text-xs text-white/80 leading-relaxed">{description}</p>

      <div className="space-y-2">
        {keyPoints.map((point, index) => (
          <div key={index} className="flex items-start gap-2.5 text-xs text-white/80">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            <span>{point}</span>
          </div>
        ))}
      </div>

      {/* Common Mistake Callout */}
      {mistakeToAvoid && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-red-300 block mb-0.5 font-bold uppercase tracking-wider text-[10px]">Technique Flaw to Avoid:</strong>
            {mistakeToAvoid}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedTechniqueDemonstration;
