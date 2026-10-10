import React, { useEffect } from 'react';
import { formatBRL } from '../constants';
import { Sparkles, X, Heart, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationSound } from '../utils/sound';

export interface MilestoneInfo {
  percent: number;
  amount: number;
  title: string;
  message: string;
}

interface MilestoneToastProps {
  milestone: MilestoneInfo | null;
  onDismiss: () => void;
}

export const MilestoneToast: React.FC<MilestoneToastProps> = ({ milestone, onDismiss }) => {
  useEffect(() => {
    if (!milestone) return;

    // Trigger gentle, aesthetic celebration confetti
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#8B263E', '#C45A45', '#DF7A60', '#FFD700', '#F2ECE1'],
      disableForReducedMotion: true,
    });

    playCelebrationSound();

    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [milestone, onDismiss]);

  if (!milestone) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 px-4 pointer-events-none flex justify-center">
      <div className="max-w-md w-full pointer-events-auto bg-gradient-to-r from-[#FAF0E6] via-[#FFF8F0] to-[#FAF0E6] dark:from-[#2A1D23] dark:via-[#36222C] dark:to-[#2A1D23] border border-[#E8DFC8] dark:border-[#523340] rounded-2xl p-3.5 shadow-xl text-[#2C221E] dark:text-[#F5EBE6] animate-slide-down flex items-start justify-between gap-3 backdrop-blur-md">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B263E] to-[#C45A45] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-[#8B263E]/10 dark:bg-[#C23E5D]/20 text-[#8B263E] dark:text-[#E8738B]">
                Marco de {milestone.percent}%
              </span>
              <span className="text-xs font-bold text-[#2C221E] dark:text-white truncate">
                {milestone.title}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#8B263E] dark:text-[#E8738B] mt-0.5">
              {formatBRL(milestone.amount)} conquistados pelo casal!
            </p>
            <p className="text-[11px] text-[#6B5A50] dark:text-[#B8A6A0] mt-0.5 line-clamp-1 italic">
              "{milestone.message}"
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-lg text-[#7A6A60] dark:text-[#9A8780] hover:text-[#2C221E] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
