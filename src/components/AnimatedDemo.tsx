import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InstrumentType } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Eye,
  Layers,
  ChevronRight,
  Maximize2,
  Volume2,
  Hand,
  Activity,
  Compass,
  ArrowRight,
  Info,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { AIAvatarCoach } from './AIAvatarCoach';
import { HandFingerNumberingFigure } from './HandFingerNumberingFigure';

export interface AnimatedDemoProps {
  animationType?: string;
  title: string;
  description?: string;
  keyPoints?: string[];
  mistakeToAvoid?: string;
  instrument: InstrumentType;
  currentStepIndex?: number;
  totalSteps?: number;
  onStepChange?: (step: number) => void;
}

export const AnimatedDemo: React.FC<AnimatedDemoProps> = ({
  animationType = 'default',
  title,
  description = 'Observe the animated motion, finger numbers, and posture guidelines carefully before playing.',
  keyPoints = [
    'Maintain relaxed joints without locking wrists or elbows',
    'Follow the alignment guidelines highlighted in the diagram',
    'Execute slow, controlled movements before increasing speed',
  ],
  mistakeToAvoid = 'Tension in shoulders and collapsing joints.',
  instrument,
  currentStepIndex = 0,
  totalSteps = 3,
  onStepChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [frame, setFrame] = useState(0);
  const [speed, setSpeed] = useState<0.5 | 1 | 1.5>(1);
  const [viewMode, setViewMode] = useState<'correct' | 'mistake'>('correct');
  const [demoFocus, setDemoFocus] = useState<'movement' | 'grip' | 'angles'>('movement');
  const [activeSubStep, setActiveSubStep] = useState(0);
  const [showAngles, setShowAngles] = useState(true);
  const [showHandFigure, setShowHandFigure] = useState(true);
  const [selectedBansuriSwara, setSelectedBansuriSwara] = useState<'Pa' | 'Dha' | 'Ni' | 'Sa' | 'Re' | 'Ga' | 'Ma'>('Sa');
  const [selectedGuitarFret, setSelectedGuitarFret] = useState<number>(1);
  const [selectedViolinFinger, setSelectedViolinFinger] = useState<number>(1);
  const [selectedViolinString, setSelectedViolinString] = useState<'G3' | 'D4' | 'A4' | 'E5'>('A4');
  const [selectedViolinGripFinger, setSelectedViolinGripFinger] = useState<'T' | '1' | '2' | '3' | '4'>('T');
  const [selectedKeyboardFinger, setSelectedKeyboardFinger] = useState<number>(1);

  // Normalize animation category
  const normalizedType = useMemo(() => {
    const raw = (animationType || '').toLowerCase();
    if (raw.includes('keyboard') || instrument === 'keyboard') return 'keyboard';
    if (raw.includes('guitar') || instrument === 'guitar') return 'guitar';
    if (raw.includes('violin') || instrument === 'violin') return 'violin';
    if (raw.includes('bansuri') || instrument === 'bansuri') return 'bansuri';
    return 'keyboard';
  }, [animationType, instrument]);

  // Animation cycle loop (0 to 100)
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(35 / speed);
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 100);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const t = frame / 100;

  // Bansuri Swara calculations based on exact user specifications:
  // - 1 hole half closed = Ma (half hole on Hole 1)
  // - 1 hole closed = Ga (Hole 1 closed)
  // - 2 holes closed = Re (Holes 1 & 2 closed)
  // - 3 holes closed = Sa (Holes 1, 2, 3 closed)
  // - 4 holes closed = Ni (Holes 1, 2, 3, 4 closed)
  // - 5 holes closed = Dha (Holes 1, 2, 3, 4, 5 closed)
  // - 6 holes closed = Pa (All 6 holes closed)
  const bansuriSwarasData = useMemo(
    () => ({
      Pa: { closedCount: 6, isHalfMa: false, note: 'G4', freq: '392 Hz', desc: 'All 6 Holes Sealed (LH 1-2-3 + RH 1-2-3)' },
      Dha: { closedCount: 5, isHalfMa: false, note: 'A4', freq: '440 Hz', desc: '5 Holes Sealed (LH 1-2-3 + RH 1-2)' },
      Ni: { closedCount: 4, isHalfMa: false, note: 'B4', freq: '493 Hz', desc: '4 Holes Sealed (LH 1-2-3 + RH 1)' },
      Sa: { closedCount: 3, isHalfMa: false, note: 'C5', freq: '523 Hz', desc: 'Tonic Sa: First 3 Holes Sealed (LH 1-2-3)' },
      Re: { closedCount: 2, isHalfMa: false, note: 'D5', freq: '587 Hz', desc: '2 Holes Sealed (LH 1-2)' },
      Ga: { closedCount: 1, isHalfMa: false, note: 'E5', freq: '659 Hz', desc: '1 Hole Sealed (LH 1)' },
      Ma: { closedCount: 0, isHalfMa: true, note: 'F5', freq: '698 Hz', desc: 'Hole 1 Half-Covered (Teevra/Shuddha Ma)' },
    }),
    []
  );

  // Dynamic automatic swara cycling during playback in progressive sequence:
  // 1st hole half closed Ma -> Ga (1 closed) -> Re (2 closed) -> Sa (3 closed) -> Ni (4 closed) -> Dha (5 closed) -> Pa (6 closed)
  const currentBansuriSwara = useMemo(() => {
    if (!isPlaying) return selectedBansuriSwara;
    const swaraList: ('Ma' | 'Ga' | 'Re' | 'Sa' | 'Ni' | 'Dha' | 'Pa')[] = ['Ma', 'Ga', 'Re', 'Sa', 'Ni', 'Dha', 'Pa'];
    const idx = Math.floor((t * swaraList.length) % swaraList.length);
    return swaraList[idx];
  }, [isPlaying, selectedBansuriSwara, t]);

  // =========================================================================
  // 1. KEYBOARD SVG SCENE
  // =========================================================================
  const renderKeyboardScene = () => {
    const isIncorrect = viewMode === 'mistake';
    const activeFingerIdx = isPlaying ? Math.floor((t * 5) % 5) : selectedKeyboardFinger - 1;
    const isThumbTuck = (isPlaying && t > 0.4 && t < 0.6) || activeSubStep === 2;

    // Wrist elevation & finger trajectory
    const wristY = isIncorrect ? 138 : 70;
    const handXOffset = isPlaying ? Math.sin(t * Math.PI * 2) * 18 : 0;
    const thumbX = isThumbTuck ? 165 : 125 + handXOffset;

    const fingers = [
      { num: 1, name: 'Thumb', x: thumbX, y: isIncorrect ? 152 : 144, active: activeFingerIdx === 0, desc: 'Pivot & Base Strike' },
      { num: 2, name: 'Index', x: 175 + handXOffset, y: 144, active: activeFingerIdx === 1, desc: 'Curved Tip Strike' },
      { num: 3, name: 'Middle', x: 215 + handXOffset, y: 140, active: activeFingerIdx === 2, desc: 'Central Arch Anchor' },
      { num: 4, name: 'Ring', x: 255 + handXOffset, y: 144, active: activeFingerIdx === 3, desc: 'Independent Lift' },
      { num: 5, name: 'Pinky', x: 295 + handXOffset, y: 150, active: activeFingerIdx === 4, desc: 'Upright Melodic Strike' },
    ];

    const activeFingerObj = fingers[activeFingerIdx] || fingers[0];

    return (
      <svg viewBox="0 0 540 270" className="w-full h-full select-none">
        <defs>
          <linearGradient id="kbWhiteKeyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="90%" stopColor="#e4e4e7" />
            <stop offset="100%" stopColor="#d4d4d8" />
          </linearGradient>
          <linearGradient id="kbActiveKeyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="kbHandGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <linearGradient id="kbSkinShadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350f" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#451a03" stopOpacity="0.9" />
          </linearGradient>
          <filter id="kbGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Piano Key Bed Background */}
        <rect x="20" y="142" width="500" height="110" rx="12" fill="#090a0f" stroke="#27272a" strokeWidth="2" />

        {/* 11 White Piano Keys */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
          const isKeyTarget = i === activeFingerIdx + 2;
          const noteNames = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5'];
          return (
            <g key={i}>
              <rect
                x={30 + i * 44}
                y={isKeyTarget && !isIncorrect ? 150 : 146}
                width="41"
                height={isKeyTarget && !isIncorrect ? 98 : 100}
                rx="6"
                fill={isKeyTarget && !isIncorrect ? 'url(#kbActiveKeyGrad)' : 'url(#kbWhiteKeyGrad)'}
                stroke="#52525b"
                strokeWidth="1.5"
              />
              <text
                x={50 + i * 44}
                y="236"
                fill={isKeyTarget && !isIncorrect ? '#000000' : '#71717a'}
                fontSize="11"
                fontWeight="900"
                textAnchor="middle"
              >
                {noteNames[i]}
              </text>
            </g>
          );
        })}

        {/* Black Piano Keys */}
        {[0, 1, 3, 4, 5, 7, 8, 10].map((i) => (
          <rect
            key={i}
            x={57 + i * 44}
            y="146"
            width="28"
            height="62"
            rx="4"
            fill="#18181b"
            stroke="#27272a"
            strokeWidth="1.5"
          />
        ))}

        {/* Dynamic Keybed Contact Ripple for Active Key */}
        {!isIncorrect && (
          <circle
            cx={50 + (activeFingerIdx + 2) * 44}
            cy="165"
            r="16"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2.5"
            opacity="0.85"
          >
            <animate attributeName="r" values="8;24;8" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Forearm & Wrist Vector Guide */}
        {!isIncorrect ? (
          <g>
            <path
              d={`M 15 65 Q 110 65 ${185 + handXOffset} ${wristY}`}
              stroke="#22c55e"
              strokeWidth="4"
              strokeDasharray="6 4"
              fill="none"
            />
            {showAngles && (
              <g>
                <circle cx={185 + handXOffset} cy={wristY} r="5" fill="#22c55e" />
                <rect x="25" y="32" width="165" height="24" rx="12" fill="#000000dd" stroke="#22c55e" strokeWidth="1" />
                <text x="107" y="48" fill="#22c55e" fontSize="10.5" fontWeight="bold" textAnchor="middle">
                  ✓ 180° Floating Wrist Stance
                </text>
              </g>
            )}
          </g>
        ) : (
          <g>
            <path
              d="M 15 65 Q 110 130 185 138"
              stroke="#ef4444"
              strokeWidth="4.5"
              strokeDasharray="5 3"
              fill="none"
            />
            <circle cx="185" cy="138" r="6" fill="#ef4444" />
            <rect x="25" y="98" width="165" height="24" rx="12" fill="#000000ee" stroke="#ef4444" strokeWidth="1" />
            <text x="107" y="114" fill="#ef4444" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              ✗ Collapsed Wrist on Keybed
            </text>
          </g>
        )}

        {/* Anatomical Hand Palm Dome Arch */}
        <path
          d={
            isIncorrect
              ? `M ${175 + handXOffset} 138 Q ${240 + handXOffset} 146 ${310 + handXOffset} 150 Q ${275 + handXOffset} 162 ${205 + handXOffset} 160 Z`
              : `M ${175 + handXOffset} ${wristY} Q ${235 + handXOffset} 40 ${315 + handXOffset} 142 Q ${290 + handXOffset} 152 ${235 + handXOffset} 148 Q ${175 + handXOffset} 110 ${175 + handXOffset} ${wristY}`
          }
          fill="url(#kbHandGrad)"
          opacity="0.95"
          stroke={isIncorrect ? '#ef4444' : '#fef08a'}
          strokeWidth="2.5"
        />

        {/* Knuckle Joint Nodes (MCP Joint Arch) */}
        {!isIncorrect && (
          <g>
            {[175, 210, 245, 280].map((kx, i) => (
              <circle
                key={i}
                cx={kx + handXOffset}
                cy={80 + (i === 1 ? -4 : i === 2 ? -2 : 4)}
                r="4.5"
                fill="#b45309"
                stroke="#fef08a"
                strokeWidth="1.2"
                opacity="0.8"
              />
            ))}
          </g>
        )}

        {/* Tennis Ball Hand Arch Guideline */}
        {!isIncorrect && showAngles && (
          <ellipse
            cx={245 + handXOffset}
            cy="92"
            rx="36"
            ry="26"
            fill="none"
            stroke="#E5C07B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
        )}

        {/* Articulated Fingers (1: Thumb, 2: Index, 3: Middle, 4: Ring, 5: Pinky) */}
        {fingers.map((f) => {
          const isActive = f.active && !isIncorrect;
          const fingerDownOffset = isActive ? 8 : 0;
          return (
            <g key={f.num}>
              {/* Phalanx Bone / Finger Shaft */}
              <line
                x1={235 + handXOffset + (f.num - 3) * 22}
                y1={isIncorrect ? 140 : 82 + (f.num === 3 ? -3 : Math.abs(f.num - 3) * 2)}
                x2={f.x}
                y2={f.y + fingerDownOffset}
                stroke={isActive ? '#15803d' : '#d97706'}
                strokeWidth={f.num === 1 ? 16 : 13}
                strokeLinecap="round"
              />

              {/* Fingertip Strike Dome Pad & Number */}
              <circle
                cx={f.x}
                cy={f.y + fingerDownOffset}
                r={isActive ? 15 : 12}
                fill={isActive ? '#22c55e' : isIncorrect ? '#ef4444' : '#fde047'}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter={isActive ? 'url(#kbGlow)' : undefined}
              />
              <text
                x={f.x}
                y={f.y + fingerDownOffset + 4.5}
                fill="#000000"
                fontSize="13"
                fontWeight="900"
                textAnchor="middle"
              >
                {f.num}
              </text>

              {/* Active Floating Finger Label */}
              {isActive && (
                <g>
                  <rect
                    x={f.x - 48}
                    y={f.y - 28}
                    width="96"
                    height="18"
                    rx="9"
                    fill="#000000dd"
                    stroke="#22c55e"
                    strokeWidth="1"
                  />
                  <text
                    x={f.x}
                    y={f.y - 16}
                    fill="#22c55e"
                    fontSize="9.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    Finger {f.num} ({f.name})
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Thumb Tuck Under Vector (when active) */}
        {isThumbTuck && !isIncorrect && (
          <g>
            <path
              d="M 125 145 Q 145 125 165 145"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="3 2"
              fill="none"
            />
            <text x="145" y="120" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
              Thumb 1 Tuck Under 3
            </text>
          </g>
        )}

        {/* MINI ACTIVE HAND HUD (Top-Right Blueprint Indicator) */}
        <g transform="translate(425, 12)">
          <rect x="0" y="0" width="102" height="68" rx="10" fill="#0c0d12ee" stroke="#ffffff20" strokeWidth="1" />
          <text x="51" y="14" fill="#a1a1aa" fontSize="8" fontWeight="bold" textAnchor="middle">
            ACTIVE FINGER HUD
          </text>
          {/* 5 mini finger nodes 1-5 */}
          {[
            { num: 1, x: 18, y: 44 },
            { num: 2, x: 33, y: 30 },
            { num: 3, x: 51, y: 26 },
            { num: 4, x: 69, y: 30 },
            { num: 5, x: 84, y: 40 },
          ].map((hf) => {
            const isHudActive = hf.num === (activeFingerIdx + 1);
            return (
              <g key={hf.num}>
                <circle
                  cx={hf.x}
                  cy={hf.y}
                  r={isHudActive ? 8 : 6}
                  fill={isHudActive ? '#22c55e' : '#27272a'}
                  stroke={isHudActive ? '#ffffff' : '#52525b'}
                  strokeWidth={isHudActive ? 2 : 1}
                />
                <text
                  x={hf.x}
                  y={hf.y + 3}
                  fill={isHudActive ? '#000000' : '#d4d4d8'}
                  fontSize="8"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {hf.num}
                </text>
              </g>
            );
          })}
          <text x="51" y="60" fill="#22c55e" fontSize="8.5" fontWeight="bold" textAnchor="middle">
            Active: #{activeFingerIdx + 1} ({activeFingerObj.name})
          </text>
        </g>
      </svg>
    );
  };

  // =========================================================================
  // 2. GUITAR SVG SCENE (Left Hand Fretting 1-2-3-4 + Right Hand Picking)
  // =========================================================================
  const renderGuitarScene = () => {
    const isIncorrect = viewMode === 'mistake';
    const activeFretIdx = isPlaying ? Math.floor((t * 4) % 4) + 1 : selectedGuitarFret;
    const isAlternateUp = Math.floor(t * 8) % 2 === 1;

    const fretsData = [
      { num: 1, name: 'Index (1)', fret: 1, x: 130, y: 128 },
      { num: 2, name: 'Middle (2)', fret: 2, x: 205, y: 128 },
      { num: 3, name: 'Ring (3)', fret: 3, x: 280, y: 128 },
      { num: 4, name: 'Pinky (4)', fret: 4, x: 355, y: 128 },
    ];

    const activeFretObj = fretsData[activeFretIdx - 1] || fretsData[0];

    return (
      <svg viewBox="0 0 540 270" className="w-full h-full select-none">
        <defs>
          <linearGradient id="gtrNeckWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b1810" />
            <stop offset="50%" stopColor="#3d2216" />
            <stop offset="100%" stopColor="#1c0f0a" />
          </linearGradient>
          <linearGradient id="gtrHandSkin" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <filter id="gtrGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="gtrArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
          </marker>
        </defs>

        {/* Fretboard Wooden Neck */}
        <rect x="25" y="85" width="490" height="100" rx="10" fill="url(#gtrNeckWood)" stroke="#523521" strokeWidth="2.5" />

        {/* Metal Frets (Frets 1 to 5) */}
        {[85, 160, 235, 310, 385, 455].map((fx, i) => (
          <g key={i}>
            <line x1={fx} y1="85" x2={fx} y2="185" stroke="#e4e4e7" strokeWidth="4" />
            <line x1={fx + 2} y1="85" x2={fx + 2} y2="185" stroke="#71717a" strokeWidth="1" />
            {i < 5 && (
              <text x={fx + 37} y="78" fill="#a1a1aa" fontSize="11" fontWeight="bold" textAnchor="middle">
                Fret {i + 1}
              </text>
            )}
          </g>
        ))}

        {/* Fret Markers (Dots on 3rd & 5th) */}
        <circle cx="272" cy="135" r="5" fill="#ffffff44" />
        <circle cx="420" cy="135" r="5" fill="#ffffff44" />

        {/* 6 Steel Guitar Strings (Low E6 to High E1) */}
        {[
          { name: '6th E', y: 100, w: 3.5 },
          { name: '5th A', y: 114, w: 3.0 },
          { name: '4th D', y: 128, w: 2.5 },
          { name: '3rd G', y: 142, w: 2.0 },
          { name: '2nd B', y: 156, w: 1.5 },
          { name: '1st E', y: 170, w: 1.2 },
        ].map((s, i) => {
          const isTargetString = i === 2; // 4th D string active
          return (
            <g key={i}>
              <line
                x1="25"
                y1={s.y}
                x2="515"
                y2={s.y}
                stroke={isTargetString ? '#fde047' : '#e4e4e7'}
                strokeWidth={s.w}
                opacity={isTargetString ? 1 : 0.7}
              />
              <text x="18" y={s.y + 3} fill="#a1a1aa" fontSize="8" fontWeight="bold" textAnchor="end">
                {s.name}
              </text>
            </g>
          );
        })}

        {/* Fretting Hand Palm Silhouette Beneath Neck */}
        {!isIncorrect ? (
          <path
            d="M 100 185 Q 240 215 390 185 Q 350 240 180 235 Z"
            fill="url(#gtrHandSkin)"
            opacity="0.9"
            stroke="#b45309"
            strokeWidth="2"
          />
        ) : (
          <path
            d="M 100 80 Q 240 60 390 80 Q 350 140 180 140 Z"
            fill="#ef444466"
            stroke="#ef4444"
            strokeWidth="2"
          />
        )}

        {/* Left Hand Thumb: Backing Behind Fret 2 at Neck Centerline */}
        {!isIncorrect ? (
          <g>
            <ellipse cx="200" cy="210" rx="26" ry="13" fill="#b45309" stroke="#22c55e" strokeWidth="2.5" />
            <text x="200" y="214" fill="#ffffff" fontSize="10" fontWeight="900" textAnchor="middle">
              Thumb (T)
            </text>
            {showAngles && (
              <text x="200" y="235" fill="#22c55e" fontSize="9" fontWeight="bold" textAnchor="middle">
                ✓ Midline Backing (No Neck Over-Wrap)
              </text>
            )}
          </g>
        ) : (
          <g>
            <ellipse cx="200" cy="72" rx="28" ry="14" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <text x="200" y="76" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              ✗ Thumb Over Neck
            </text>
            <text x="200" y="55" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">
              Chokes Palm &amp; Mutes Strings!
            </text>
          </g>
        )}

        {/* Fretting Hand Fingers 1-4: (1: Index, 2: Middle, 3: Ring, 4: Pinky) */}
        {fretsData.map((f) => {
          const isActive = f.num === activeFretIdx;
          if (isIncorrect) {
            if (isActive) {
              return (
                <g key={f.num}>
                  <path
                    d={`M ${f.x - 25} 45 Q ${f.x} 100 ${f.x + 10} 150`}
                    stroke="#ef4444"
                    strokeWidth="18"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                  <ellipse cx={f.x} cy="135" rx="14" ry="24" fill="#ef444466" stroke="#ef4444" strokeWidth="2" />
                  <text x={f.x} y="139" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle">
                    {f.num}
                  </text>
                  <text x={f.x + 40} y="155" fill="#ef4444" fontSize="10" fontWeight="bold">
                    ✗ Flat Collapsed Pad Muting Adjacent Strings
                  </text>
                </g>
              );
            }
            return null;
          }

          // Correct Form: 90° Perpendicular Arched Fingertip right behind the fret wire
          const contactY = isActive ? f.y : f.y - 20;
          return (
            <g key={f.num}>
              {/* Articulated Phalanx Finger Body Arc */}
              <path
                d={`M ${f.x - 18} 32 Q ${f.x + 2} 26 ${f.x + 10} ${contactY}`}
                stroke={isActive ? '#15803d' : '#d97706'}
                strokeWidth={isActive ? '17' : '12'}
                strokeLinecap="round"
                fill="none"
                opacity={isActive ? 1 : 0.45}
              />

              {/* Fingertip Contact Point & Number Badge 1-4 */}
              <circle
                cx={f.x + 10}
                cy={contactY}
                r={isActive ? 14 : 10}
                fill={isActive ? '#22c55e' : '#fde047'}
                stroke="#ffffff"
                strokeWidth="2.5"
                filter={isActive ? 'url(#gtrGlow)' : undefined}
              />
              <text
                x={f.x + 10}
                y={contactY + 4.5}
                fill="#000000"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
              >
                {f.num}
              </text>

              {/* String Contact Ripple on Press */}
              {isActive && (
                <circle
                  cx={f.x + 10}
                  cy={f.y}
                  r="14"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  opacity="0.8"
                >
                  <animate attributeName="r" values="6;20;6" dur="0.9s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.1;0.9" dur="0.9s" repeatCount="indefinite" />
                </circle>
              )}

              {/* 90° Perpendicular Callout */}
              {isActive && showAngles && (
                <g>
                  <rect x={f.x + 26} y={f.y - 22} width="11" height="11" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                  <circle cx={f.x + 31} cy={f.y - 17} r="1.5" fill="#22c55e" />
                  <text x={f.x + 42} y={f.y - 12} fill="#22c55e" fontSize="10.5" fontWeight="bold">
                    Finger {f.num} @ 90°
                  </text>
                  <text x={f.x + 42} y={f.y + 2} fill="#a1a1aa" fontSize="9">
                    Directly Behind Fret {f.fret}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Right Hand Picking Strumming Indicator */}
        <g>
          <polygon points="465,115 490,128 475,148" fill="#E5C07B" stroke="#ffffff" strokeWidth="2" />
          <line
            x1="480"
            y1={isAlternateUp ? 155 : 100}
            x2="480"
            y2={isAlternateUp ? 110 : 145}
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            markerEnd="url(#gtrArrow)"
          />
          <text x="480" y={isAlternateUp ? 172 : 92} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
            {isAlternateUp ? 'V Up-Stroke' : '⊓ Down-Stroke'}
          </text>
        </g>

        {/* MINI ACTIVE FRET HAND HUD (Top-Right Blueprint Indicator) */}
        <g transform="translate(425, 10)">
          <rect x="0" y="0" width="102" height="66" rx="10" fill="#0c0d12ee" stroke="#ffffff20" strokeWidth="1" />
          <text x="51" y="14" fill="#a1a1aa" fontSize="8" fontWeight="bold" textAnchor="middle">
            FRETTING DIGIT HUD
          </text>
          {/* 4 mini finger nodes 1-4 */}
          {[
            { num: 1, x: 22, y: 32 },
            { num: 2, x: 41, y: 28 },
            { num: 3, x: 61, y: 28 },
            { num: 4, x: 80, y: 34 },
          ].map((hf) => {
            const isHudActive = hf.num === activeFretIdx;
            return (
              <g key={hf.num}>
                <circle
                  cx={hf.x}
                  cy={hf.y}
                  r={isHudActive ? 8 : 6}
                  fill={isHudActive ? '#22c55e' : '#27272a'}
                  stroke={isHudActive ? '#ffffff' : '#52525b'}
                  strokeWidth={isHudActive ? 2 : 1}
                />
                <text
                  x={hf.x}
                  y={hf.y + 3}
                  fill={isHudActive ? '#000000' : '#d4d4d8'}
                  fontSize="8.5"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {hf.num}
                </text>
              </g>
            );
          })}
          <text x="51" y="56" fill="#22c55e" fontSize="8.5" fontWeight="bold" textAnchor="middle">
            Active: #{activeFretIdx} ({activeFretObj.name})
          </text>
        </g>
      </svg>
    );
  };

  // =========================================================================
  // 3. VIOLIN SVG SCENE (Longitudinal Bow Travel, Wrist Flex & Grip Alignment)
  // =========================================================================
  const renderViolinScene = () => {
    const isIncorrect = viewMode === 'mistake';
    const isGripMode = demoFocus === 'grip';

    // Violin String Positions & Active Bowing String
    const stringYMap: Record<string, { y: number; name: string; note: string; elbowAngle: number; desc: string }> = {
      G3: { y: 118, name: '4th G String', note: 'G3 (196 Hz)', elbowAngle: 42, desc: 'High Arm Plane' },
      D4: { y: 126, name: '3rd D String', note: 'D4 (293 Hz)', elbowAngle: 28, desc: 'Mid-High Plane' },
      A4: { y: 134, name: '2nd A String', note: 'A4 (440 Hz)', elbowAngle: 15, desc: 'Mid-Low Plane' },
      E5: { y: 142, name: '1st E String', note: 'E5 (659 Hz)', elbowAngle: 5, desc: 'Low Tucked Plane' },
    };

    const activeStringInfo = stringYMap[selectedViolinString] || stringYMap.A4;
    const contactY = activeStringInfo.y;

    // Longitudinal Bow Stroke Cycle (Down-bow vs Up-bow)
    // Down-bow (0.0 -> 0.5): Frog moves downward along stick length to Tip
    // Up-bow (0.5 -> 1.0): Tip pushes upward along stick length to Frog
    const isDownBow = t < 0.5;
    const strokeProgress = isDownBow ? t * 2 : (1 - t) * 2; // 0 (Frog) to 1 (Tip)

    // Longitudinal displacement of bow stick along its length
    // Contact point stays fixed on Soundpost Lane (X = 185, Y = contactY) while bow translates longitudinally
    const bowLongitudinalShift = (strokeProgress - 0.5) * 125; // -62.5 (Frog) to +62.5 (Tip)
    const bowX = 185 + (isIncorrect ? Math.sin(t * Math.PI * 4) * 28 : 0); // Wandering off sounding lane if incorrect
    const bowSlantAngle = isIncorrect ? Math.sin(t * Math.PI * 4) * 26 : 0; // Crooked angle in flaw mode

    // Dynamic Wrist Flexibility Calculation:
    // Up-Bow near frog: Wrist elevates into convex flexion (+20° to +26°) to cushion turnaround
    // Down-Bow near tip: Forearm extends, wrist flattens to 0° neutral extension
    const wristFlexAngle = isIncorrect
      ? 0 // Stiff locked wrist in flaw mode
      : (1 - strokeProgress) * 24; // +24° at frog down to 0° at tip
    const wristFlexLabel = isIncorrect
      ? '0° Stiff Locked Joint'
      : strokeProgress < 0.35
      ? `+${Math.round(wristFlexAngle)}° Convex Up-Bow Flex`
      : `+${Math.round(wristFlexAngle)}° Neutral Forearm Extension`;

    // Right Hand & Arm Coordinates synced to bow longitudinal movement
    const handY = contactY + bowLongitudinalShift + 88;
    const handX = bowX + 2;

    if (isGripMode) {
      // DEDICATED BOW HOLD GRIP ANATOMY VIEW FOR BEGINNERS
      const gripInfoMap: Record<string, { title: string; subtitle: string; checkpoint: string; mistake: string; tactile: string }> = {
        T: {
          title: 'Bent Right Thumb (T) – The Flexible Fulcrum',
          subtitle: 'Opposite Finger 2/3 at the frog notch & stick junction',
          checkpoint: 'The thumb tip forms a gentle rounded bump (never bent inward into a banana shape).',
          mistake: 'Locked straight "banana thumb" that freezes the entire wrist.',
          tactile: 'Imagine holding an eggshell gently against the frog notch without cracking it.',
        },
        '4': {
          title: 'Curved Pinky (4) – Counterbalance Dome',
          subtitle: 'Stands upright on its soft tip on top facet of stick',
          checkpoint: 'Curved like an arch. Counterbalances the heavy bow tip when playing near the frog.',
          mistake: 'Straight, locked pinky joint pushing through the top of the stick.',
          tactile: 'Touch the stick lightly like a ballerina balancing en pointe.',
        },
        '1': {
          title: 'Index Finger (1) – Arm Weight Pronator',
          subtitle: 'Resting on silver winding at second knuckle (45° angle)',
          checkpoint: 'Transfers natural forearm gravity into the string for deep, rich tone without squeezing.',
          mistake: 'Gripping or hooking tightly like a claw, suffocating stick vibrations.',
          tactile: 'Rest your second knuckle softly on the silver winding like leaning onto a railing.',
        },
        '2': {
          title: 'Middle Finger (2) – Primary Ring Pivot',
          subtitle: 'Draped over stick opposite the bent thumb tip',
          checkpoint: 'Together with the thumb, forms the "Bow Hold Ring" – the central axis of bow control.',
          mistake: 'Separating away from the thumb or gripping too high on the wood.',
          tactile: 'Hugs the stick gently opposite the thumb bump.',
        },
        '3': {
          title: 'Ring Finger (3) – Frog Hugger',
          subtitle: 'Pads rest gently across the ebony frog mother-of-pearl eye',
          checkpoint: 'Provides stability and cushions lateral bow tilt during string crosses.',
          mistake: 'Sticking out rigidly or resting on the horsehair ribbon.',
          tactile: 'Let the soft pad rest flush against the frog eye.',
        },
      };

      const currentGripInfo = gripInfoMap[selectedViolinGripFinger] || gripInfoMap.T;

      return (
        <svg viewBox="0 0 540 270" className="w-full h-full select-none">
          <defs>
            <linearGradient id="vlnBowStickGrip" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="35%" stopColor="#b45309" />
              <stop offset="70%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            <linearGradient id="vlnFrogGrip" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#27272a" />
              <stop offset="50%" stopColor="#18181b" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="vlnSilverWinding" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e4e4e7" />
              <stop offset="50%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#71717a" />
            </linearGradient>
            <linearGradient id="vlnLeather" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f2314" />
              <stop offset="100%" stopColor="#1c0f0a" />
            </linearGradient>
          </defs>

          {/* Background Card */}
          <rect x="15" y="15" width="510" height="240" rx="14" fill="#090a0f" stroke="#27272a" strokeWidth="1.5" />
          
          {/* Header Title */}
          <text x="270" y="38" fill="#E5C07B" fontSize="12" fontWeight="bold" textAnchor="middle">
            Beginner Violin Bow Grip Blueprint &amp; Finger Alignment
          </text>

          {/* Stick Octagonal Wood */}
          <line x1="45" y1="125" x2="495" y2="125" stroke="url(#vlnBowStickGrip)" strokeWidth="12" strokeLinecap="round" />
          
          {/* Silver Winding Wire & Leather Thumb Grip */}
          <rect x="210" y="119" width="45" height="12" fill="url(#vlnLeather)" stroke="#523521" strokeWidth="1" />
          <rect x="255" y="119" width="50" height="12" fill="url(#vlnSilverWinding)" stroke="#71717a" strokeWidth="1" />
          
          {/* White Horsehair Ribbon */}
          <line x1="45" y1="152" x2="495" y2="152" stroke="#fef08a" strokeWidth="7" opacity="0.9" />
          
          {/* Ebony Frog with Pearl Eye */}
          <rect x="110" y="125" width="90" height="42" rx="4" fill="url(#vlnFrogGrip)" stroke="#52525b" strokeWidth="1.5" />
          <circle cx="155" cy="146" r="6" fill="#e4e4e7" stroke="#3f3f46" strokeWidth="1.5" />
          <text x="155" y="180" fill="#a1a1aa" fontSize="9" textAnchor="middle">
            Ebony Frog &amp; Pearl Eye
          </text>

          {/* Ferrule (Metal Ring Holding Hair) */}
          <rect x="185" y="138" width="15" height="20" fill="#d4d4d8" stroke="#71717a" strokeWidth="1" />

          {/* 1. Bent Right Thumb (T) at Frog Notch */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedViolinGripFinger('T')}
          >
            <circle
              cx="110"
              cy="132"
              r={selectedViolinGripFinger === 'T' ? 16 : 13}
              fill={selectedViolinGripFinger === 'T' ? '#22c55e' : '#22c55e99'}
              stroke="#ffffff"
              strokeWidth={selectedViolinGripFinger === 'T' ? 3 : 1.5}
            />
            <text x="110" y="137" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              T
            </text>
            <path d="M 110 114 Q 95 95 65 95" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <rect x="18" y="80" width="92" height="28" rx="6" fill="#000000ee" stroke="#22c55e" strokeWidth="1" />
            <text x="64" y="93" fill="#22c55e" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              ✓ Bent Thumb
            </text>
            <text x="64" y="103" fill="#a1a1aa" fontSize="8" textAnchor="middle">
              In frog notch
            </text>
          </g>

          {/* 2. Curved Pinky (4) on Top of Stick */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedViolinGripFinger('4')}
          >
            <circle
              cx="95"
              cy="108"
              r={selectedViolinGripFinger === '4' ? 16 : 13}
              fill={selectedViolinGripFinger === '4' ? '#38bdf8' : '#38bdf899'}
              stroke="#ffffff"
              strokeWidth={selectedViolinGripFinger === '4' ? 3 : 1.5}
            />
            <text x="95" y="113" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">
              4
            </text>
            <path d="M 95 92 Q 95 65 140 65" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <rect x="135" y="50" width="105" height="28" rx="6" fill="#000000ee" stroke="#38bdf8" strokeWidth="1" />
            <text x="187" y="63" fill="#38bdf8" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              ✓ Curved Pinky (4)
            </text>
            <text x="187" y="73" fill="#a1a1aa" fontSize="8" textAnchor="middle">
              Curved on top stick
            </text>
          </g>

          {/* 3. Middle (2) & Ring (3) Fingers across Frog */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedViolinGripFinger('3')}
          >
            <circle
              cx="145"
              cy="110"
              r={selectedViolinGripFinger === '3' ? 15 : 12}
              fill={selectedViolinGripFinger === '3' ? '#fde047' : '#fde04799'}
              stroke="#ffffff"
              strokeWidth={selectedViolinGripFinger === '3' ? 3 : 1.5}
            />
            <text x="145" y="114" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">
              3
            </text>
          </g>

          <g
            className="cursor-pointer"
            onClick={() => setSelectedViolinGripFinger('2')}
          >
            <circle
              cx="178"
              cy="110"
              r={selectedViolinGripFinger === '2' ? 15 : 12}
              fill={selectedViolinGripFinger === '2' ? '#fde047' : '#fde04799'}
              stroke="#ffffff"
              strokeWidth={selectedViolinGripFinger === '2' ? 3 : 1.5}
            />
            <text x="178" y="114" fill="#000000" fontSize="11" fontWeight="900" textAnchor="middle">
              2
            </text>
          </g>

          {/* 4. Index Finger (1) on Silver Winding */}
          <g
            className="cursor-pointer"
            onClick={() => setSelectedViolinGripFinger('1')}
          >
            <circle
              cx="260"
              cy="112"
              r={selectedViolinGripFinger === '1' ? 16 : 13}
              fill={selectedViolinGripFinger === '1' ? '#a855f7' : '#a855f799'}
              stroke="#ffffff"
              strokeWidth={selectedViolinGripFinger === '1' ? 3 : 1.5}
            />
            <text x="260" y="117" fill="#ffffff" fontSize="12" fontWeight="900" textAnchor="middle">
              1
            </text>
            <path d="M 260 96 Q 275 75 320 75" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
            <rect x="315" y="60" width="130" height="28" rx="6" fill="#000000ee" stroke="#a855f7" strokeWidth="1" />
            <text x="380" y="73" fill="#a855f7" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              ✓ Index Finger 1 (Pronation)
            </text>
            <text x="380" y="83" fill="#a1a1aa" fontSize="8" textAnchor="middle">
              2nd knuckle on winding
            </text>
          </g>

          {/* Active Finger Pedagogical Information Banner */}
          <g transform="translate(30, 195)">
            <rect x="0" y="0" width="480" height="50" rx="10" fill="#000000ee" stroke="#E5C07B" strokeWidth="1.2" />
            <text x="15" y="17" fill="#E5C07B" fontSize="11" fontWeight="bold">
              {currentGripInfo.title}
            </text>
            <text x="15" y="31" fill="#e4e4e7" fontSize="9.5">
              • Rule: {currentGripInfo.checkpoint}
            </text>
            <text x="15" y="44" fill="#a1a1aa" fontSize="8.5">
              • Feel: {currentGripInfo.tactile}
            </text>
          </g>
        </svg>
      );
    }

    // STANDARD LONGITUDINAL BOW STROKE & SOUNDPOST LANE VIEW
    return (
      <svg viewBox="0 0 540 270" className="w-full h-full select-none">
        <defs>
          <linearGradient id="vlnBodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c2d12" />
            <stop offset="40%" stopColor="#c2410c" />
            <stop offset="80%" stopColor="#9a3412" />
            <stop offset="100%" stopColor="#431407" />
          </linearGradient>
          <linearGradient id="vlnEbony" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <marker id="vlnArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={isDownBow ? '#22c55e' : '#38bdf8'} />
          </marker>
        </defs>

        {/* Violin Body Silhouette (Instrument Top Plate) */}
        <path
          d="M 38 48 C 108 38 118 95 98 130 C 118 165 108 222 38 212 C 8 202 8 58 38 48 Z"
          fill="url(#vlnBodyGrad)"
          stroke="#431407"
          strokeWidth="3"
        />

        {/* Purfling Inlay Line */}
        <path
          d="M 40 55 C 102 46 110 95 92 130 C 110 165 102 214 40 205 C 16 196 16 64 40 55 Z"
          fill="none"
          stroke="#271106"
          strokeWidth="1.2"
        />

        {/* F-Holes */}
        <path d="M 58 85 Q 53 105 63 120" stroke="#000000" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M 58 140 Q 53 155 63 175" stroke="#000000" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Fingerboard & Neck (Extending to the Right) */}
        <polygon points="90,115 380,123 380,143 90,150" fill="url(#vlnEbony)" stroke="#52525b" strokeWidth="1.5" />

        {/* Wooden Bridge */}
        <rect x="135" y="105" width="8" height="55" rx="3" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
        <text x="139" y="96" fill="#fde68a" fontSize="10" fontWeight="bold" textAnchor="middle">
          Bridge
        </text>

        {/* 4 Violin Strings: G3 (196Hz), D4 (293Hz), A4 (440Hz), E5 (659Hz) */}
        {[
          { key: 'G3', name: 'G3 (4th)', y: 118, w: 3.2 },
          { key: 'D4', name: 'D4 (3rd)', y: 126, w: 2.6 },
          { key: 'A4', name: 'A4 (2nd)', y: 134, w: 2.0 },
          { key: 'E5', name: 'E5 (1st)', y: 142, w: 1.4 },
        ].map((s) => {
          const isTargetString = s.key === selectedViolinString;
          return (
            <g key={s.key}>
              <line
                x1="30"
                y1={s.y}
                x2="400"
                y2={s.y}
                stroke={isTargetString ? '#fde047' : '#e4e4e7'}
                strokeWidth={isTargetString ? s.w + 0.8 : s.w}
                opacity={isTargetString ? 1 : 0.7}
              />
              <text x="24" y={s.y + 3} fill={isTargetString ? '#fde047' : '#71717a'} fontSize="8" fontWeight="bold" textAnchor="end">
                {s.key}
              </text>
            </g>
          );
        })}

        {/* Left Hand Neck Support & Fingering Drops on Fingerboard: 1 (Index), 2 (Middle), 3 (Ring), 4 (Pinky) */}
        {/* Anatomical Left-Hand Palm Arch Wrapping Beneath Neck */}
        <path
          d="M 200 152 Q 295 195 390 152 Q 350 220 230 215 Z"
          fill="url(#kbHandGrad)"
          opacity="0.85"
          stroke="#b45309"
          strokeWidth="2"
        />

        {/* Left-Hand Thumb (T) Counter-Balancing on Back of Neck */}
        <ellipse cx="260" cy="180" rx="18" ry="10" fill="#92400e" stroke="#22c55e" strokeWidth="2" />
        <text x="260" y="184" fill="#ffffff" fontSize="9" fontWeight="900" textAnchor="middle">
          LH Thumb
        </text>

        {/* Left Hand Numbered Fingers Dropping onto Fingerboard (1, 2, 3, 4) */}
        {[
          { num: 1, note: '1st (B4)', name: 'Index (1)', x: 230, y: contactY },
          { num: 2, note: '2nd (C#5)', name: 'Middle (2)', x: 280, y: contactY },
          { num: 3, note: '3rd (D5)', name: 'Ring (3)', x: 325, y: contactY },
          { num: 4, note: '4th (E5)', name: 'Pinky (4)', x: 365, y: contactY },
        ].map((f) => {
          const isFingerActive = f.num === (isPlaying ? Math.floor((t * 4) % 4) + 1 : selectedViolinFinger);
          const fingerDown = isFingerActive ? f.y : f.y - 18;
          return (
            <g key={f.num}>
              {/* Articulated Finger Shaft Phalanx */}
              <line
                x1={240 + (f.num - 2.5) * 38}
                y1="55"
                x2={f.x}
                y2={fingerDown}
                stroke={isFingerActive ? '#15803d' : '#d97706'}
                strokeWidth={isFingerActive ? '14' : '10'}
                strokeLinecap="round"
                opacity={isFingerActive ? 1 : 0.45}
              />

              {/* Fingertip Contact Point & Number Badge 1-4 */}
              <circle
                cx={f.x}
                cy={fingerDown}
                r={isFingerActive ? 14 : 10}
                fill={isFingerActive ? '#22c55e' : '#fde047'}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <text
                x={f.x}
                y={fingerDown + 4.5}
                fill="#000000"
                fontSize="12"
                fontWeight="900"
                textAnchor="middle"
              >
                {f.num}
              </text>

              {/* String Contact Ripple on Active Press */}
              {isFingerActive && (
                <circle
                  cx={f.x}
                  cy={f.y}
                  r="14"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                  opacity="0.8"
                >
                  <animate attributeName="r" values="6;20;6" dur="0.9s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.1;0.9" dur="0.9s" repeatCount="indefinite" />
                </circle>
              )}

              {isFingerActive && (
                <g>
                  <rect
                    x={f.x - 38}
                    y={fingerDown - 26}
                    width="76"
                    height="18"
                    rx="9"
                    fill="#000000ee"
                    stroke="#22c55e"
                    strokeWidth="1"
                  />
                  <text x={f.x} y={fingerDown - 14} fill="#22c55e" fontSize="9.5" fontWeight="bold" textAnchor="middle">
                    {f.note}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Soundpost Lane Guideline (Optimal Sounding Point midway between Bridge & Fingerboard) */}
        <line x1="185" y1="80" x2="185" y2="185" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
        <text x="185" y="72" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">
          Optimal Sounding Lane (90° Point)
        </text>

        {/* Laser 90° Perpendicular Alignment Beam */}
        <line
          x1={bowX}
          y1="80"
          x2={bowX}
          y2="185"
          stroke={isIncorrect ? '#ef4444' : '#22c55e'}
          strokeWidth="1.5"
          strokeDasharray="2 2"
          opacity="0.85"
        />

        {/* MINI ACTIVE VIOLIN FINGER HUD (Top-Right Blueprint Indicator) */}
        <g transform="translate(425, 10)">
          <rect x="0" y="0" width="102" height="66" rx="10" fill="#0c0d12ee" stroke="#ffffff20" strokeWidth="1" />
          <text x="51" y="14" fill="#a1a1aa" fontSize="8" fontWeight="bold" textAnchor="middle">
            LEFT HAND HUD
          </text>
          {/* 4 mini finger nodes 1-4 */}
          {[
            { num: 1, name: '1st (B4)', x: 22, y: 32 },
            { num: 2, name: '2nd (C#5)', x: 41, y: 28 },
            { num: 3, name: '3rd (D5)', x: 61, y: 28 },
            { num: 4, name: '4th (E5)', x: 80, y: 34 },
          ].map((hf) => {
            const activeVln = isPlaying ? Math.floor((t * 4) % 4) + 1 : selectedViolinFinger;
            const isHudActive = hf.num === activeVln;
            return (
              <g key={hf.num}>
                <circle
                  cx={hf.x}
                  cy={hf.y}
                  r={isHudActive ? 8 : 6}
                  fill={isHudActive ? '#22c55e' : '#27272a'}
                  stroke={isHudActive ? '#ffffff' : '#52525b'}
                  strokeWidth={isHudActive ? 2 : 1}
                />
                <text
                  x={hf.x}
                  y={hf.y + 3}
                  fill={isHudActive ? '#000000' : '#d4d4d8'}
                  fontSize="8.5"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {hf.num}
                </text>
              </g>
            );
          })}
          {(() => {
            const activeNum = isPlaying ? Math.floor((t * 4) % 4) + 1 : selectedViolinFinger;
            const vlnNames: Record<number, string> = { 1: 'Index (B4)', 2: 'Middle (C#5)', 3: 'Ring (D5)', 4: 'Pinky (E5)' };
            return (
              <text x="51" y="56" fill="#22c55e" fontSize="8.5" fontWeight="bold" textAnchor="middle">
                Active: #{activeNum} ({vlnNames[activeNum] || 'Finger'})
              </text>
            );
          })()}
        </g>

        {/* ANIMATED VIOLIN BOW (True Longitudinal Travel Along Full Stick Length) */}
        <g
          transform={`translate(${bowX}, ${contactY + bowLongitudinalShift}) rotate(${bowSlantAngle})`}
          className="transition-transform duration-75"
        >
          {/* Vertical Wooden Bow Stick (Pernambuco Octagonal) */}
          <line x1="0" y1="-105" x2="0" y2="105" stroke="#92400e" strokeWidth="5.5" strokeLinecap="round" />
          
          {/* Bow Tip (Ivory Face at Top) */}
          <polygon points="-4,-105 4,-105 0,-115" fill="#f8fafc" stroke="#71717a" strokeWidth="1" />
          <text x="12" y="-103" fill="#ffffff" fontSize="8" fontWeight="bold">Tip</text>
          
          {/* White Horsehair Ribbon */}
          <line x1="5.5" y1="-100" x2="5.5" y2="100" stroke="#fef08a" strokeWidth="4.5" opacity="0.92" />
          
          {/* Ebony Frog with Mother-of-Pearl Eye (Bottom) */}
          <rect x="-6" y="70" width="18" height="30" rx="3" fill="#18181b" stroke="#71717a" strokeWidth="1" />
          <circle cx="3" cy="85" r="3" fill="#e4e4e7" />
          <text x="15" y="90" fill="#ffffff" fontSize="8" fontWeight="bold">Frog</text>
          
          {/* Silver Winding & Leather Grip */}
          <rect x="-4" y="52" width="10" height="15" fill="#a1a1aa" stroke="#71717a" strokeWidth="0.8" />
          <rect x="-4" y="40" width="10" height="12" fill="#3f2314" />

          {/* Grip Indicator Dots on Frog (Pinky & Thumb Fulcrum) */}
          <circle cx="3" cy="68" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.2" />
          <text x="3" y="71" fill="#000000" fontSize="7" fontWeight="bold" textAnchor="middle">
            4
          </text>
        </g>

        {/* RIGHT ARM, ELBOW & DYNAMIC WRIST FLEXIBILITY INDICATOR */}
        <g transform={`translate(${handX + 18}, ${handY})`}>
          {/* Dynamic Wrist Curve Arc (Shows Convex Up-Bow Flex vs Flat Extension) */}
          <path
            d={
              isIncorrect
                ? 'M 0 0 L 35 0'
                : `M 0 0 Q 18 ${-wristFlexAngle * 0.85} 40 ${-wristFlexAngle * 0.45}`
            }
            stroke={isIncorrect ? '#ef4444' : '#38bdf8'}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Wrist Joint Pivot Dot */}
          <circle
            cx="18"
            cy={isIncorrect ? 0 : -wristFlexAngle * 0.85}
            r="5"
            fill={isIncorrect ? '#ef4444' : '#38bdf8'}
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Right Arm Forearm & Elbow Plane Representation */}
          <line
            x1="40"
            y1={-wristFlexAngle * 0.45}
            x2="85"
            y2={-wristFlexAngle * 0.45 - (activeStringInfo.elbowAngle * 0.3)}
            stroke="#d97706"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="85"
            cy={-wristFlexAngle * 0.45 - (activeStringInfo.elbowAngle * 0.3)}
            r="6"
            fill="#d97706"
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <text
            x="85"
            y={-wristFlexAngle * 0.45 - (activeStringInfo.elbowAngle * 0.3) + 16}
            fill="#d97706"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
          >
            Elbow
          </text>

          {/* Wrist Flexibility HUD Callout */}
          <g transform="translate(45, -28)">
            <rect
              x="0"
              y="0"
              width="145"
              height="38"
              rx="8"
              fill="#0a0b0eee"
              stroke={isIncorrect ? '#ef4444' : '#38bdf8'}
              strokeWidth="1.2"
            />
            <text x="72" y="15" fill={isIncorrect ? '#ef4444' : '#38bdf8'} fontSize="9.5" fontWeight="bold" textAnchor="middle">
              {wristFlexLabel}
            </text>
            <text x="72" y="29" fill="#a1a1aa" fontSize="8" textAnchor="middle">
              {isIncorrect ? '✗ Stiff Locked Wrist' : '✓ Dynamic Wave Cushion'}
            </text>
          </g>
        </g>

        {/* Longitudinal Bow Stroke Direction Banner */}
        <g>
          <rect
            x="195"
            y="210"
            width="190"
            height="30"
            rx="15"
            fill="#000000ee"
            stroke={isDownBow ? '#22c55e' : '#38bdf8'}
            strokeWidth="1.5"
          />
          <text
            x="290"
            y="229"
            fill={isDownBow ? '#22c55e' : '#38bdf8'}
            fontSize="10.5"
            fontWeight="bold"
            textAnchor="middle"
          >
            {isDownBow ? '⊓ Down-Bow (Frog → Tip Glide)' : 'V Up-Bow (Tip → Frog Push)'}
          </text>
        </g>

        {/* 90° Perpendicular Alignment Angle Gauge / Mistake Alert */}
        {!isIncorrect ? (
          showAngles && (
            <g>
              <rect x="365" y="25" width="155" height="42" rx="10" fill="#000000ee" stroke="#22c55e" strokeWidth="1" />
              <text x="442" y="42" fill="#22c55e" fontSize="11" fontWeight="bold" textAnchor="middle">
                ✓ 90.0° Perpendicular
              </text>
              <text x="442" y="58" fill="#a1a1aa" fontSize="9" textAnchor="middle">
                Parallel to bridge • Pure tone
              </text>
            </g>
          )
        ) : (
          <g>
            <rect x="360" y="25" width="165" height="44" rx="10" fill="#ef444422" stroke="#ef4444" strokeWidth="1.5" />
            <text x="442" y="42" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle">
              ✗ Crooked / Slanted Bow
            </text>
            <text x="442" y="58" fill="#fca5a5" fontSize="9" textAnchor="middle">
              Causes rasping &amp; drifting off lane
            </text>
          </g>
        )}
      </svg>
    );
  };

  // =========================================================================
  // 4. BANSURI SVG SCENE (Exact 6-hole Hindustani mapping requested by user)
  // =========================================================================
  const renderBansuriScene = () => {
    const isIncorrect = viewMode === 'mistake';
    const swaraInfo = bansuriSwarasData[currentBansuriSwara];
    const breathOffset = Math.sin(t * Math.PI * 2) * 3;

    // The 6 Swara Tone Holes (from blowhole down):
    // Hole 1: LH Index (Finger 1)
    // Hole 2: LH Middle (Finger 2)
    // Hole 3: LH Ring (Finger 3)
    // Hole 4: RH Index (Finger 1)
    // Hole 5: RH Middle (Finger 2)
    // Hole 6: RH Ring (Finger 3)
    const holes = [
      { id: 1, hand: 'LH', fingerNum: 1, name: 'Index', x: 175 },
      { id: 2, hand: 'LH', fingerNum: 2, name: 'Middle', x: 220 },
      { id: 3, hand: 'LH', fingerNum: 3, name: 'Ring', x: 265 },
      { id: 4, hand: 'RH', fingerNum: 1, name: 'Index', x: 325 },
      { id: 5, hand: 'RH', fingerNum: 2, name: 'Middle', x: 370 },
      { id: 6, hand: 'RH', fingerNum: 3, name: 'Ring', x: 415 },
    ];

    return (
      <svg viewBox="0 0 540 270" className="w-full h-full select-none">
        <defs>
          <linearGradient id="bansuriBamboo" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="30%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="bansuriAirJet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Bamboo Flute Body */}
        <rect x="30" y="115" width="480" height="42" rx="10" fill="url(#bansuriBamboo)" stroke="#78350f" strokeWidth="3" />

        {/* Traditional Silk Thread Bindings */}
        {[50, 115, 295, 470].map((bx, i) => (
          <rect key={i} x={bx} y="115" width="14" height="42" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
        ))}

        {/* Blow Hole (Mukharandhra) */}
        <ellipse cx="95" cy="136" rx="12" ry="9" fill="#18181b" stroke="#78350f" strokeWidth="2" />
        <text x="95" y="178" fill="#e5c07b" fontSize="10" fontWeight="bold" textAnchor="middle">
          Blow Hole
        </text>

        {/* Lower Lip Embouchure Silhouette */}
        <ellipse cx="80" cy="115" rx="18" ry="11" fill="#f472b6" opacity="0.85" />
        <text x="45" y="85" fill="#f472b6" fontSize="9" fontWeight="bold">
          Lower Lip Covers 1/3
        </text>

        {/* 45° Air Ribbon Stream */}
        {!isIncorrect ? (
          <g>
            <path
              d={`M 80 100 Q 90 115 95 ${136 + breathOffset}`}
              stroke="url(#bansuriAirJet)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Splitting Edge Acoustic Ripple */}
            <circle cx="98" cy="136" r="12" fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.7">
              <animate attributeName="r" values="5;18;5" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.9;0.1;0.9" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </g>
        ) : (
          <g>
            <path d="M 80 100 Q 110 105 130 110" stroke="#ef4444" strokeWidth="8" strokeDasharray="4 3" fill="none" opacity="0.7" />
            <text x="160" y="85" fill="#ef4444" fontSize="10" fontWeight="bold">
              ✗ Air Blown Too High (No Split)
            </text>
          </g>
        )}

        {/* Anatomical Left Hand (LH) and Right Hand (RH) Palm & Support Silhouettes */}
        {/* LH Palm Structure */}
        <path
          d="M 155 90 Q 220 50 280 85 Q 260 115 170 115 Z"
          fill="url(#kbHandGrad)"
          opacity="0.8"
          stroke="#b45309"
          strokeWidth="1.5"
        />
        {/* LH Thumb Supporting Flute Underneath */}
        <ellipse cx="195" cy="165" rx="16" ry="9" fill="#92400e" stroke="#22c55e" strokeWidth="1.5" />
        <text x="195" y="168" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
          LH Thumb
        </text>

        {/* RH Palm Structure */}
        <path
          d="M 305 85 Q 370 50 435 90 Q 420 115 320 115 Z"
          fill="url(#kbHandGrad)"
          opacity="0.8"
          stroke="#b45309"
          strokeWidth="1.5"
        />
        {/* RH Thumb Supporting Flute Underneath */}
        <ellipse cx="345" cy="165" rx="16" ry="9" fill="#92400e" stroke="#22c55e" strokeWidth="1.5" />
        <text x="345" y="168" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
          RH Thumb
        </text>

        {/* Left Hand & Right Hand Grouping Labels */}
        <rect x="165" y="42" width="110" height="20" rx="10" fill="#000000bb" stroke="#E5C07B" strokeWidth="1" />
        <text x="220" y="56" fill="#E5C07B" fontSize="10" fontWeight="bold" textAnchor="middle">
          Left Hand (1, 2, 3)
        </text>

        <rect x="315" y="42" width="110" height="20" rx="10" fill="#000000bb" stroke="#38bdf8" strokeWidth="1" />
        <text x="370" y="56" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
          Right Hand (1, 2, 3)
        </text>

        {/* 6 Swara Tone Holes with Soft Flat Pad Sealing Mechanics */}
        {holes.map((hole) => {
          // Determine if hole is closed, half-closed (Ma), or open
          let isClosed = false;
          let isHalf = false;

          if (swaraInfo.isHalfMa && hole.id === 1) {
            isHalf = true;
          } else if (hole.id <= swaraInfo.closedCount) {
            isClosed = true;
          }

          const fingerY = isClosed ? 136 : isHalf ? 122 : 96;

          return (
            <g key={hole.id}>
              {/* Hole Opening on Bamboo Tube */}
              <circle
                cx={hole.x}
                cy="136"
                r="9"
                fill={isClosed ? '#22c55e' : '#18181b'}
                stroke="#451a03"
                strokeWidth="2"
              />

              {/* Half-hole visualization for Ma */}
              {isHalf && (
                <path
                  d={`M ${hole.x} 127 A 9 9 0 0 1 ${hole.x} 145 Z`}
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              )}

              {/* Tone Sound Wave Radiating from First Open Hole */}
              {!isClosed && !isHalf && (
                <circle cx={hole.x} cy="136" r="14" fill="none" stroke="#fde047" strokeWidth="1.5" opacity="0.6">
                  <animate attributeName="r" values="8;20;8" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Articulated Finger Shaft Phalanx */}
              <line
                x1={hole.hand === 'LH' ? 220 + (hole.fingerNum - 2) * 35 : 370 + (hole.fingerNum - 2) * 35}
                y1="75"
                x2={hole.x}
                y2={fingerY}
                stroke={isClosed ? '#15803d' : isHalf ? '#0284c7' : '#d97706'}
                strokeWidth="12"
                strokeLinecap="round"
                opacity={isClosed || isHalf ? 0.95 : 0.6}
              />

              {/* Hand & Numbered Finger Pad Badge */}
              <g transform={`translate(${hole.x}, ${fingerY})`}>
                <ellipse
                  cx="0"
                  cy="0"
                  rx="16"
                  ry="11"
                  fill={
                    isClosed
                      ? '#22c55e'
                      : isHalf
                      ? '#38bdf8'
                      : '#fde047'
                  }
                  stroke="#ffffff"
                  strokeWidth="2.2"
                  opacity="1"
                />
                <text x="0" y="4.5" fill="#000000" fontSize="10.5" fontWeight="900" textAnchor="middle">
                  {hole.hand} {hole.fingerNum}
                </text>
              </g>

              {/* Hole Number Label Below */}
              <text x={hole.x} y="184" fill="#a1a1aa" fontSize="10" fontWeight="bold" textAnchor="middle">
                Hole {hole.id}
              </text>
              <text x={hole.x} y="197" fill={isClosed ? '#22c55e' : isHalf ? '#38bdf8' : '#71717a'} fontSize="9" fontWeight="bold" textAnchor="middle">
                {isClosed ? '✓ Sealed' : isHalf ? '½ Half' : '○ Lifted'}
              </text>
            </g>
          );
        })}

        {/* Current Active Swara Banner */}
        <g>
          <rect x="120" y="215" width="300" height="42" rx="21" fill="#000000ee" stroke="#E5C07B" strokeWidth="1.5" />
          <text x="270" y="233" fill="#E5C07B" fontSize="13" fontWeight="bold" textAnchor="middle">
            Swara: {currentBansuriSwara} ({swaraInfo.note} – {swaraInfo.freq})
          </text>
          <text x="270" y="248" fill="#a1a1aa" fontSize="10" textAnchor="middle">
            {swaraInfo.desc}
          </text>
        </g>

        {/* MINI ACTIVE BANSURI FINGERING HUD (Top-Right Blueprint Indicator) */}
        <g transform="translate(425, 10)">
          <rect x="0" y="0" width="102" height="66" rx="10" fill="#0c0d12ee" stroke="#ffffff20" strokeWidth="1" />
          <text x="51" y="14" fill="#a1a1aa" fontSize="8" fontWeight="bold" textAnchor="middle">
            6-HOLE SEAL HUD
          </text>
          {/* 6 mini hole nodes */}
          {[1, 2, 3, 4, 5, 6].map((hid) => {
            const isHoleClosed = hid <= swaraInfo.closedCount;
            const isHalfMa = swaraInfo.isHalfMa && hid === 1;
            const hx = 18 + ((hid - 1) % 3) * 33;
            const hy = hid <= 3 ? 28 : 46;
            return (
              <g key={hid}>
                <circle
                  cx={hx}
                  cy={hy}
                  r="6"
                  fill={isHoleClosed ? '#22c55e' : isHalfMa ? '#38bdf8' : '#27272a'}
                  stroke={isHoleClosed || isHalfMa ? '#ffffff' : '#52525b'}
                  strokeWidth="1.2"
                />
                <text
                  x={hx}
                  y={hy + 2.5}
                  fill={isHoleClosed || isHalfMa ? '#000000' : '#a1a1aa'}
                  fontSize="7"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {hid}
                </text>
              </g>
            );
          })}
          <text x="51" y="60" fill="#E5C07B" fontSize="8" fontWeight="bold" textAnchor="middle">
            {swaraInfo.closedCount} Closed • {currentBansuriSwara}
          </text>
        </g>
      </svg>
    );
  };

  return (
    <div className="w-full bg-[#0F1115] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
      {/* Header Bar with Mode Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E5C07B]/15 border border-[#E5C07B]/30 text-[#E5C07B] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Dynamic Finger &amp; Technique Animation
            </span>
            <span className="text-[10px] text-white/40 font-mono">Step {activeSubStep + 1} of 3</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-light font-serif-italic text-white mt-1">
            {title}
          </h3>
        </div>

        {/* Focus Mode & Overlay Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Demonstration Mode Switcher */}
          <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setDemoFocus('movement')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                demoFocus === 'movement'
                  ? 'bg-[#E5C07B] text-black shadow-md shadow-[#E5C07B]/20'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Finger Motion</span>
            </button>
            <button
              type="button"
              onClick={() => setDemoFocus('grip')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                demoFocus === 'grip'
                  ? 'bg-sky-500 text-black shadow-md shadow-sky-500/20'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Grip Anatomy</span>
            </button>
          </div>

          {/* Correct vs Common Error Toggle */}
          <div className="flex items-center bg-white/5 p-1 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode('correct')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'correct'
                  ? 'bg-green-500 text-black'
                  : 'text-white/60 hover:text-white'
              }`}
              title="View Correct Form"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Correct</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('mistake')}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'mistake'
                  ? 'bg-red-500 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              title="View Common Mistake"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flaw</span>
            </button>
          </div>

          {/* Angle Vector Toggle */}
          <button
            type="button"
            onClick={() => setShowAngles(!showAngles)}
            className={`p-2 rounded-full border text-xs font-bold transition ${
              showAngles
                ? 'bg-[#E5C07B]/20 border-[#E5C07B] text-[#E5C07B]'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
            }`}
            title="Toggle Angle & Vector Guides"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Hand Finger Diagram Toggle */}
          <button
            type="button"
            onClick={() => setShowHandFigure(!showHandFigure)}
            className={`px-3 py-1 rounded-full border text-xs font-bold transition flex items-center gap-1.5 ${
              showHandFigure
                ? 'bg-[#E5C07B] text-black border-[#E5C07B] shadow-md shadow-[#E5C07B]/20'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
            title="Toggle Hand & Finger Numbering Diagram"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Finger Map</span>
          </button>

          {/* Speed Toggle (0.5x, 1x, 1.5x) */}
          <div className="flex items-center bg-white/5 px-1 py-0.5 rounded-full border border-white/10">
            {([0.5, 1, 1.5] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition ${
                  speed === s ? 'bg-[#E5C07B] text-black' : 'text-white/50 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reference Audio Player */}
          <button
            type="button"
            onClick={() => {
              audioEngine.playNote('C4', instrument, 0.7);
            }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#E5C07B] transition"
            title="Play Reference Tone"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Instrument Swara / Finger Selectors */}
      {normalizedType === 'bansuri' && (
        <div className="flex flex-col gap-1.5 pb-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E5C07B] shrink-0 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#E5C07B]" />
              Progressive Note Sequence (H1 Half ➔ Pa):
            </span>
            <span className="text-[10px] text-white/50">1st hole half-closed, then Ma, Ga, Re, Sa, Ni, Dha, Pa</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(['Ma', 'Ga', 'Re', 'Sa', 'Ni', 'Dha', 'Pa'] as const).map((swara, idx) => {
              const swData = bansuriSwarasData[swara];
              const isSelected = currentBansuriSwara === swara;
              return (
                <button
                  key={swara}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setSelectedBansuriSwara(swara);
                    audioEngine.playNote(swData.note, 'bansuri', 0.8);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#E5C07B] text-black border-[#E5C07B] shadow-md shadow-[#E5C07B]/20 font-black'
                      : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold ${
                    isSelected ? 'bg-black text-[#E5C07B]' : 'bg-white/10 text-white/60'
                  }`}>
                    {idx + 1}
                  </span>
                  <span>{swara}</span>
                  <span className="text-[10px] opacity-75 font-mono">({swData.note})</span>
                  <span className="text-[9px] opacity-70">
                    {swData.isHalfMa ? '½ Hole' : `${swData.closedCount} Cls`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {normalizedType === 'guitar' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-white/50 shrink-0">Test Fretting Finger:</span>
          {[1, 2, 3, 4].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setSelectedGuitarFret(f);
                audioEngine.playNote(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'][f], 'guitar', 0.8);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                selectedGuitarFret === f && !isPlaying
                  ? 'bg-[#E5C07B] text-black border-[#E5C07B]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              Finger {f} (Fret {f})
            </button>
          ))}
        </div>
      )}

      {normalizedType === 'violin' && (
        <div className="space-y-2">
          {demoFocus === 'movement' ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs font-bold text-[#E5C07B] shrink-0">Bowing String:</span>
                {(['G3', 'D4', 'A4', 'E5'] as const).map((strKey) => (
                  <button
                    key={strKey}
                    type="button"
                    onClick={() => {
                      setSelectedViolinString(strKey);
                      audioEngine.playNote(strKey, 'violin', 0.85);
                    }}
                    className={`px-3 py-1 rounded-xl border text-xs font-bold transition shrink-0 ${
                      selectedViolinString === strKey
                        ? 'bg-[#E5C07B] text-black border-[#E5C07B] shadow-md shadow-[#E5C07B]/20'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {strKey} {strKey === 'G3' ? '(Lowest)' : strKey === 'E5' ? '(Highest)' : ''}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-xs font-bold text-white/50 shrink-0">LH Finger:</span>
                {[1, 2, 3, 4].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setSelectedViolinFinger(f);
                      audioEngine.playNote(['B4', 'C#5', 'D5', 'E5'][f - 1], 'violin', 0.8);
                    }}
                    className={`px-2.5 py-1 rounded-xl border text-xs font-bold transition shrink-0 ${
                      selectedViolinFinger === f && !isPlaying
                        ? 'bg-sky-500 text-black border-sky-400'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    Finger {f} ({['B4', 'C#5', 'D5', 'E5'][f - 1]})
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-sky-400 shrink-0 flex items-center gap-1">
                <Hand className="w-3.5 h-3.5" />
                Select Bow Grip Finger:
              </span>
              {[
                { key: 'T', name: 'Thumb (T - Bent Fulcrum)' },
                { key: '4', name: 'Pinky (4 - Counterbalance Dome)' },
                { key: '1', name: 'Index (1 - Arm Weight Pronation)' },
                { key: '2', name: 'Middle (2 - Fulcrum Ring)' },
                { key: '3', name: 'Ring (3 - Frog Hugger)' },
              ].map((fg) => (
                <button
                  key={fg.key}
                  type="button"
                  onClick={() => setSelectedViolinGripFinger(fg.key as 'T' | '1' | '2' | '3' | '4')}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition shrink-0 ${
                    selectedViolinGripFinger === fg.key
                      ? 'bg-sky-500 text-black border-sky-400 shadow-md shadow-sky-500/20'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {fg.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {normalizedType === 'keyboard' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-white/50 shrink-0">Test Finger Number:</span>
          {[
            { num: 1, name: '1 (Thumb)' },
            { num: 2, name: '2 (Index)' },
            { num: 3, name: '3 (Middle)' },
            { num: 4, name: '4 (Ring)' },
            { num: 5, name: '5 (Pinky)' },
          ].map((f) => (
            <button
              key={f.num}
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setSelectedKeyboardFinger(f.num);
                audioEngine.playNote(['C4', 'D4', 'E4', 'F4', 'G4'][f.num - 1], 'keyboard', 0.8);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition ${
                selectedKeyboardFinger === f.num && !isPlaying
                  ? 'bg-[#E5C07B] text-black border-[#E5C07B]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Main SVG Animation Viewport */}
      <div className="relative w-full h-72 sm:h-80 bg-black/70 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-2 shadow-inner">
        {normalizedType === 'keyboard' && renderKeyboardScene()}
        {normalizedType === 'guitar' && renderGuitarScene()}
        {normalizedType === 'violin' && renderViolinScene()}
        {normalizedType === 'bansuri' && renderBansuriScene()}

        {/* Floating Play/Pause/Scrub Bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 px-4 py-2 rounded-full bg-[#0A0B0D]/90 backdrop-blur-md border border-white/15">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full bg-[#E5C07B] text-black hover:scale-105 transition"
            title={isPlaying ? 'Pause Animation' : 'Play Animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            type="button"
            onClick={() => setFrame(0)}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
            title="Restart to Frame 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Interactive Scrub Bar */}
          <input
            type="range"
            min="0"
            max="99"
            value={frame}
            onChange={(e) => {
              setIsPlaying(false);
              setFrame(parseInt(e.target.value, 10));
            }}
            className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E5C07B]"
          />

          <span className="text-[11px] font-mono text-white/60 w-9 text-right">{frame}%</span>
        </div>
      </div>

      {/* Hand & Finger Numbering Anatomical Guide Figure */}
      {showHandFigure && (
        <HandFingerNumberingFigure
          instrument={instrument}
          activeFinger={
            normalizedType === 'keyboard'
              ? isPlaying
                ? Math.floor((t * 5) % 5) + 1
                : selectedKeyboardFinger
              : normalizedType === 'guitar'
              ? isPlaying
                ? Math.floor((t * 4) % 4) + 1
                : selectedGuitarFret
              : normalizedType === 'violin'
              ? isPlaying
                ? Math.floor((t * 4) % 4) + 1
                : demoFocus === 'grip'
                ? selectedViolinGripFinger
                : selectedViolinFinger
              : normalizedType === 'bansuri'
              ? currentBansuriSwara === 'Pa'
                ? 6
                : currentBansuriSwara === 'Dha'
                ? 5
                : currentBansuriSwara === 'Ni'
                ? 4
                : currentBansuriSwara === 'Sa'
                ? 3
                : currentBansuriSwara === 'Re'
                ? 2
                : currentBansuriSwara === 'Ga'
                ? 1
                : 1
              : 1
          }
          onSelectFinger={(f) => {
            if (normalizedType === 'keyboard') {
              setIsPlaying(false);
              setSelectedKeyboardFinger(typeof f === 'number' ? f : 1);
            } else if (normalizedType === 'guitar') {
              setIsPlaying(false);
              setSelectedGuitarFret(typeof f === 'number' ? f : 1);
            } else if (normalizedType === 'violin') {
              setIsPlaying(false);
              if (typeof f === 'number') {
                setSelectedViolinFinger(f);
              } else {
                setSelectedViolinGripFinger(f);
              }
            }
          }}
        />
      )}

      {/* AI Maestro Avatar Live Feedback */}
      <AIAvatarCoach
        instrument={instrument}
        isWrongPlaying={viewMode === 'mistake'}
        wrongReason={
          viewMode === 'mistake'
            ? `${mistakeToAvoid} Notice how improper alignment distorts the tone and strains your hand.`
            : undefined
        }
        customMessage={
          viewMode === 'correct'
            ? normalizedType === 'violin'
              ? 'Notice the longitudinal bow glide! The stick remains perpendicular at 90° while the right wrist flexes on the up-bow to cushion the frog turnaround.'
              : normalizedType === 'bansuri'
              ? 'Observe the 6-hole Hindustani finger sealing! Keep the finger pads completely flat and use warm breath for low Pa and Sa.'
              : undefined
            : undefined
        }
        compact
      />

      {/* Golden Pedagogical Rules & Mistake Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Golden Rules */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finger Placement &amp; Technique Rules</span>
          </h4>
          <div className="space-y-2">
            {keyPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-white/80 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5C07B] shrink-0 mt-1.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fault Avoidance */}
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4 space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Biomechanics Flaw to Avoid</span>
          </h4>
          <p className="text-xs text-red-200 leading-relaxed">{mistakeToAvoid}</p>
          <div className="pt-2 border-t border-red-500/20 text-[11px] text-white/50">
            <span className="text-[#E5C07B] font-bold">Pro Tip:</span> Toggle to &ldquo;Flaw&rdquo; mode to observe the biomechanical distortion and note muting in real time.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedDemo;
