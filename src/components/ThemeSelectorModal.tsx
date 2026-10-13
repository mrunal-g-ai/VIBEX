import React from 'react';
import { ThemeMode } from '../types';
import { Palette, Check, Sparkles, Sun, Moon, Zap, Music2, Eye, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  paletteColors: string[];
  bgPreview: string;
  borderPreview: string;
  textColor: string;
  accentBg: string;
  accentText: string;
  bestFor: string;
  uxPerks: string[];
}

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: 'obsidian',
    name: 'Concert Hall & Obsidian Studio',
    badge: '🏆 Recommended DAW Default',
    tagline: 'Dark acoustic warmth, burnished gold, and zero eye fatigue',
    description:
      'Immersive studio atmosphere crafted with deep carbon obsidian, warm amber accents (#E5C07B), and realistic woodgrains for bamboo, rosewood, and spruce instruments.',
    paletteColors: ['#0A0B0D', '#0F1115', '#E5C07B', '#B8914B', '#272A30'],
    bgPreview: 'from-[#0A0B0D] via-[#0F1115] to-[#1A1D23]',
    borderPreview: 'border-amber-500/40',
    textColor: 'text-amber-300',
    accentBg: 'bg-[#E5C07B]',
    accentText: 'text-black',
    bestFor: 'Daily practice, low-light sessions, audio waveform tracking, & multi-instrument authenticity',
    uxPerks: [
      'Low eye fatigue during long practice sessions',
      'High-contrast glowing note heads in the falling arena',
      'Organic woodgrain aesthetics for flute, violin, and guitar',
    ],
  },
  {
    id: 'zen',
    name: 'Warm Zen Conservatory',
    badge: '📜 Classical & Notation Clarity',
    tagline: 'Refined warm parchment, sandalwood ink, and serif elegance',
    description:
      'Inspired by timeless classical sheet music, Indian Raga treatises, and meditation ashrams. Crisp daylight legibility with ivory paper, rich espresso ink, and saffron highlights.',
    paletteColors: ['#FAF7F2', '#F3EDE2', '#C26715', '#1C1917', '#E5DAC6'],
    bgPreview: 'from-[#FAF7F2] via-[#F3EDE2] to-[#EBE3D3]',
    borderPreview: 'border-amber-800/40',
    textColor: 'text-amber-900',
    accentBg: 'bg-[#C26715]',
    accentText: 'text-white',
    bestFor: 'Reading lyrics, swara notation sheets, raga scales, and bright daylight study',
    uxPerks: [
      'Maximum optical legibility for Swara and Western staff notation',
      'Serene, meditative aesthetic ideal for devotional Bhajans & Classical Ragas',
      'Crisp high-contrast print-publishing quality layout',
    ],
  },
  {
    id: 'arcade',
    name: 'Neo-Arcade Rhythm Flow',
    badge: '⚡ High Energy & Gamified Practice',
    tagline: 'Cyber midnight navy, electric emerald, and animated visual feedback',
    description:
      'Fast-paced, gamified experience built for instant streak motivation, rapid reflex timing drills, dynamic accuracy hits, and vibrant feedback cascades.',
    paletteColors: ['#070A14', '#0F172A', '#10B981', '#06B6D4', '#FBBF24'],
    bgPreview: 'from-[#070A14] via-[#0F172A] to-[#1E293B]',
    borderPreview: 'border-emerald-500/50',
    textColor: 'text-emerald-400',
    accentBg: 'bg-[#10B981]',
    accentText: 'text-black',
    bestFor: 'Timing precision, high-speed scales, beginner gamification, and arcade score-chasing',
    uxPerks: [
      'Instant chromatic feedback: Green = Perfect, Gold = Great, Red = Miss',
      'High-energy streak multipliers and illuminated finger tracks',
      'Exciting visual momentum for children and beginner learners',
    ],
  },
  {
    id: 'nordic',
    name: 'Nordic Precision Slate',
    badge: '🎛️ Minimalist Acoustic Hardware',
    tagline: 'Architectural slate, ice cobalt, and clean telemetry dials',
    description:
      'Inspired by Scandinavian acoustic hardware and modern audio engineering consoles. Focused on sharp pitch intonation meters, frequency counters, and uncluttered ergonomics.',
    paletteColors: ['#0B1120', '#111827', '#38BDF8', '#2563EB', '#334155'],
    bgPreview: 'from-[#0B1120] via-[#111827] to-[#1E293B]',
    borderPreview: 'border-sky-500/40',
    textColor: 'text-sky-300',
    accentBg: 'bg-[#38BDF8]',
    accentText: 'text-slate-950',
    bestFor: 'Intonation pitch tuning, audio engineers, and distraction-free technique focus',
    uxPerks: [
      'Micro-tuned frequency (Hz) and cent deviation readability',
      'Modern, flat UI with ultra-clean technical geometry',
      'Zero visual clutter with streamlined ergonomic spacing',
    ],
  },
];

export const ThemeSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#0F1115] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow Accent Header Background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                UI / UX Design Studio Themes
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold border border-amber-500/30">
                  4 Curated Styles
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Choose the visual style and ergonomics that best suit your environment and practice mode.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Theme Cards Grid */}
        <div className="relative flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {THEMES_LIST.map((theme) => {
              const isSelected = currentTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => onSelectTheme(theme.id)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between group ${
                    isSelected
                      ? `border-amber-400 bg-gradient-to-br ${theme.bgPreview} shadow-xl shadow-amber-500/10 scale-[1.01]`
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]'
                  }`}
                >
                  {/* Selected Indicator Badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-[11px] flex items-center gap-1 shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ACTIVE THEME
                    </div>
                  )}

                  <div>
                    {/* Badge & Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/90 border border-white/10">
                        {theme.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-amber-200 transition flex items-center gap-2">
                      {theme.name}
                    </h3>
                    <p className="text-xs text-amber-200/80 font-medium mt-0.5">
                      {theme.tagline}
                    </p>

                    <p className="text-xs text-white/60 mt-2 leading-relaxed">
                      {theme.description}
                    </p>

                    {/* Color Swatches Palette */}
                    <div className="flex items-center gap-2 my-3 p-2 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
                        Palette:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {theme.paletteColors.map((color, idx) => (
                          <span
                            key={idx}
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* UX Perks List */}
                    <div className="space-y-1 mt-2">
                      {theme.uxPerks.map((perk, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-1.5 text-[11px] text-white/70">
                          <span className="text-amber-400 text-xs">✓</span>
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Apply Action */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-white/50 italic">
                      Best for: {theme.bestFor}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTheme(theme.id);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        isSelected
                          ? `${theme.accentBg} ${theme.accentText} shadow-md`
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Apply Theme'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="relative pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>All 4 themes preserve full pitch detection, animations, and sound engine performance.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#E5C07B] text-black font-bold hover:bg-[#d4b06a] transition shadow-lg shadow-[#E5C07B]/20 ml-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectorModal;
