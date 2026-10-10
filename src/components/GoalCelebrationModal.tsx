import React, { useEffect } from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { formatBRL } from '../constants';
import confetti from 'canvas-confetti';
import { playCelebrationSound } from '../utils/sound';
import { Trophy, Heart, Sparkles, X } from 'lucide-react';

interface GoalCelebrationModalProps {
  onClose: () => void;
}

export const GoalCelebrationModal: React.FC<GoalCelebrationModalProps> = ({ onClose }) => {
  const { challenge, stats } = useChallenge();

  useEffect(() => {
    // Play celebratory chord
    playCelebrationSound();

    // Fireworks celebration confetti bursts
    const end = Date.now() + 3.5 * 1000;
    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 35,
        spread: 360,
        ticks: 70,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#8B263E', '#C45A45', '#DF7A60', '#FFD700', '#F2ECE1', '#E8738B'],
        disableForReducedMotion: true,
      });
    }, 280);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-pop">
      <div className="w-full max-w-sm bg-[#FAF7F2] dark:bg-[#1A1318] rounded-3xl p-6 shadow-2xl border border-[#E8DFC8] dark:border-[#382630] text-center space-y-4 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#C45A45] via-[#8B263E] to-[#C45A45]" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#7A6A60] dark:text-[#A89890] hover:bg-[#EBE2D4] dark:hover:bg-[#2A1D25] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy icon with glow animation */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B263E] to-[#C45A45] text-white flex items-center justify-center mx-auto shadow-lg animate-glow">
          <Trophy className="w-8 h-8 text-amber-300 drop-shadow-sm" />
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold text-[#8B263E] dark:text-[#E8738B]">
            Parabéns, Casal!
          </span>
          <h2 className="text-2xl font-black text-[#2C221E] dark:text-[#F5EBE6] mt-1 tracking-tight">
            Meta de R$ 20.000 Conquistada!
          </h2>
          <p className="text-xs text-[#6B5A50] dark:text-[#B8A6A0] mt-2 leading-relaxed">
            Vocês completaram todos os 200 depósitos com dedicação, amor e cumplicidade.
            O sonho de vocês está cada vez mais perto da realidade!
          </p>
        </div>

        {/* Couple Contributions Summary */}
        <div className="bg-white dark:bg-[#22181F] border border-[#E8DFC8] dark:border-[#382833] rounded-2xl p-3.5 space-y-2 text-xs transition-colors">
          <div className="flex justify-between items-center py-1 border-b border-[#F2ECE1] dark:border-[#2D1F27]">
            <span className="font-semibold text-[#9E382A] dark:text-[#FFA08B] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C45A45] dark:bg-[#E06A53]" />
              {challenge.partner1Name}
            </span>
            <span className="font-extrabold text-[#2C221E] dark:text-[#F5EBE6]">
              {formatBRL(stats.partner1Saved)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-[#8B263E] dark:text-[#E8738B] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B263E] dark:bg-[#E8738B]" />
              {challenge.partner2Name}
            </span>
            <span className="font-extrabold text-[#2C221E] dark:text-[#F5EBE6]">
              {formatBRL(stats.partner2Saved)}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#8B263E] to-[#C45A45] dark:from-[#C23E5D] dark:to-[#E06A53] text-white font-bold text-sm shadow-md hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Heart className="w-4 h-4 fill-white" />
          Celebrar Nossa Conquista
        </button>
      </div>
    </div>
  );
};
