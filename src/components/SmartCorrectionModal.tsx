import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, RotateCw, Lightbulb } from 'lucide-react';
import { InstrumentType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  explanation: string;
  suggestedFix: string;
  animationType?: string;
  instrument: InstrumentType;
  onTryAgain: () => void;
}

export const SmartCorrectionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  explanation,
  suggestedFix,
  animationType = 'generic',
  instrument,
  onTryAgain,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-lg bg-[#0F1115] border border-[#E5C07B]/40 rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5C07B]/20 border border-[#E5C07B]/40 flex items-center justify-center text-[#E5C07B]">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B]">
                  Smart AI Form Correction
                </span>
                <h3 className="text-xl font-light font-serif-italic text-white">{title}</h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Micro Animation / Visual Demonstration */}
          <div className="my-5 p-5 rounded-2xl bg-black/50 border border-white/5 flex flex-col items-center justify-center min-h-[120px]">
            <div className="text-center w-full">
              {animationType.includes('thumb') && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                    <span className="text-xs text-red-400 font-bold block mb-1">❌ Over Neck</span>
                    <span className="text-[10px] text-white/50">Thumb hooked too high</span>
                  </div>
                  <span className="text-xl text-[#E5C07B] font-bold">➔</span>
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                    <span className="text-xs text-green-400 font-bold block mb-1">✅ Behind Center</span>
                    <span className="text-[10px] text-white/50">Pad on back middle</span>
                  </div>
                </div>
              )}

              {animationType.includes('wrist') && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                    <span className="text-xs text-red-400 font-bold block mb-1">❌ Bent Inward</span>
                    <span className="text-[10px] text-white/50">Restricts finger reach</span>
                  </div>
                  <span className="text-xl text-[#E5C07B] font-bold">➔</span>
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                    <span className="text-xs text-green-400 font-bold block mb-1">✅ Straight Neutral</span>
                    <span className="text-[10px] text-white/50">Relaxed wrist & forearm</span>
                  </div>
                </div>
              )}

              {animationType.includes('bow') && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                    <span className="text-xs text-red-400 font-bold block mb-1">❌ Skewed Angle</span>
                    <span className="text-[10px] text-white/50">Raspy uneven sound</span>
                  </div>
                  <span className="text-xl text-[#E5C07B] font-bold">➔</span>
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                    <span className="text-xs text-green-400 font-bold block mb-1">✅ 90° Parallel</span>
                    <span className="text-[10px] text-white/50">Parallel to bridge</span>
                  </div>
                </div>
              )}

              {animationType.includes('hole') && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                    <span className="text-xs text-red-400 font-bold block mb-1">❌ Curved Tips</span>
                    <span className="text-[10px] text-white/50">Air leaks from edges</span>
                  </div>
                  <span className="text-xl text-[#E5C07B] font-bold">➔</span>
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                    <span className="text-xs text-green-400 font-bold block mb-1">✅ Flat Middle Pads</span>
                    <span className="text-[10px] text-white/50">Airtight bamboo seal</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-3 mb-6">
            <p className="text-xs text-white/80 leading-relaxed">{explanation}</p>
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-green-300">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-green-300 block mb-0.5 font-bold uppercase tracking-wider text-[10px]">Correction Drill:</strong>
                {suggestedFix}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/10 transition"
            >
              CLOSE
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onTryAgain();
              }}
              className="px-6 py-2.5 rounded-full bg-[#E5C07B] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#E5C07B]/20 hover:scale-105 transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>APPLY FIX & RETRY</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SmartCorrectionModal;
