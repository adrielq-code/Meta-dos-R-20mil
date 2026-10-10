import React from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { formatBRL, getMotivationalMessage } from '../constants';
import {
  TrendingUp,
  Sparkles,
  Heart,
  ChevronRight,
  PlusCircle,
  LogIn,
  Info,
} from 'lucide-react';

interface HomeScreenProps {
  onGoToChallenge: () => void;
  onOpenDepositModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onGoToChallenge,
  onOpenDepositModal,
}) => {
  const {
    challenge,
    stats,
    activePartner,
    currentUser,
    signInWithGoogle,
  } = useChallenge();

  return (
    <div className="space-y-4 pb-20 animate-pop">
      {/* Login Prompt Banner if not logged in yet */}
      {!currentUser && (
        <div className="bg-[#FAF0E6] dark:bg-[#22171E] border border-[#E8DFC8] dark:border-[#3D2735] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-sm transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8B263E]/10 dark:bg-[#C23E5D]/20 rounded-xl text-[#8B263E] dark:text-[#E8738B] shrink-0">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-[#2C221E] dark:text-[#F5EBE6]">
                Sincronizar entre os dois celulares
              </p>
              <p className="text-[#7A6A60] dark:text-[#A89890]">
                Faça login para ver as alterações juntos em tempo real.
              </p>
            </div>
          </div>
          <button
            onClick={signInWithGoogle}
            className="px-3 py-1.5 rounded-xl bg-[#8B263E] dark:bg-[#C23E5D] text-white font-semibold hover:bg-[#731E32] dark:hover:bg-[#A9334E] transition-colors shrink-0 active:scale-95 shadow-sm"
          >
            Entrar
          </button>
        </div>
      )}

      {/* Main Goal Card: Nossa Meta Juntos */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4A1523] via-[#631B2D] to-[#8B263E] dark:from-[#380E1A] dark:via-[#4F1524] dark:to-[#6E1C30] text-white p-6 shadow-md border border-[#8B263E]/20">
        {/* Soft background decor circles */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-[#C45A45]/20 blur-xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-rose-200/90 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
              Nossa meta juntos
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-white backdrop-blur-sm">
              Meta: {formatBRL(stats.totalGoal)}
            </span>
          </div>

          {/* Current saved amount */}
          <div className="mb-4">
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {formatBRL(stats.totalSaved)}
            </p>
            <p className="text-xs text-rose-100/80 mt-1 flex items-center gap-1.5">
              <span>Falta guardar:</span>
              <span className="font-semibold text-white">
                {stats.remainingAmount > 0 ? formatBRL(stats.remainingAmount) : 'Meta alcançada! 🎉'}
              </span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs font-semibold text-rose-100">
              <span>{stats.percentCompleted.toFixed(1).replace('.', ',')}% concluído</span>
              <span>
                {stats.completedCount} de 200 depósitos ({stats.remainingCount} restantes)
              </span>
            </div>
            <div className="h-3 w-full bg-black/25 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-[#DF7A60] via-[#E8C5B8] to-white rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(0, stats.percentCompleted))}%` }}
              />
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="pt-2 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={onOpenDepositModal}
              className="flex-1 py-3 px-4 rounded-2xl bg-white text-[#631B2D] font-bold text-sm shadow-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-[#8B263E]" />
              Marcar novo depósito
            </button>
            <button
              onClick={onGoToChallenge}
              title="Ver tabela completa dos 200 números"
              className="py-3 px-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="bg-[#FAF7F2] dark:bg-[#1C151B] border border-[#E8DFC8] dark:border-[#33222B] rounded-2xl p-4 shadow-sm flex items-start gap-3 transition-colors">
        <div className="w-8 h-8 rounded-full bg-[#C45A45]/15 dark:bg-[#E06A53]/20 text-[#9E382A] dark:text-[#FFA08B] flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#8B263E] dark:text-[#E8738B] uppercase tracking-wide">
            Mensagem para o casal
          </p>
          <p className="text-sm text-[#42352E] dark:text-[#E2D4CD] font-medium italic mt-0.5">
            "{getMotivationalMessage(stats.percentCompleted)}"
          </p>
        </div>
      </div>

      {/* Individual Progress Cards */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#7A6A60] dark:text-[#A89890] px-1">
          Contribuição de Cada Um
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Meu Progresso / Parceiro 1 */}
          <div className="bg-white dark:bg-[#1C151B] border border-[#E8DFC8] dark:border-[#33222B] rounded-3xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#C45A45]/5 dark:bg-[#E06A53]/10 rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-[#C45A45] dark:bg-[#E06A53]" />
                <span className="text-xs font-semibold text-[#7A6A60] dark:text-[#A89890] truncate">
                  {challenge.partner1Name}
                </span>
                {activePartner === 'partner1' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#C45A45]/10 dark:bg-[#E06A53]/20 text-[#C45A45] dark:text-[#FFA08B] font-semibold">
                    Você
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-[#2C221E] dark:text-[#F5EBE6] tracking-tight">
                {formatBRL(stats.partner1Saved)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F2ECE1] dark:border-[#2D1F27] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#7A6A60] dark:text-[#A89890]">
                <span>Depósitos:</span>
                <span className="font-semibold text-[#2C221E] dark:text-[#F5EBE6]">
                  {stats.partner1Count}
                </span>
              </div>
              <div className="flex justify-between text-[#7A6A60] dark:text-[#A89890]">
                <span>Da meta (R$ 20k):</span>
                <span className="font-semibold text-[#9E382A] dark:text-[#FFA08B]">
                  {stats.partner1PercentOfGoal.toFixed(1).replace('.', ',')}%
                </span>
              </div>
              {stats.totalSaved > 0 && (
                <div className="flex justify-between text-[#7A6A60] dark:text-[#A89890]">
                  <span>Do guardado:</span>
                  <span className="font-medium text-[#42352E] dark:text-[#D5C6BF]">
                    {stats.partner1ShareOfSaved.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Progresso da Esposa / Parceiro 2 */}
          <div className="bg-white dark:bg-[#1C151B] border border-[#E8DFC8] dark:border-[#33222B] rounded-3xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#8B263E]/5 dark:bg-[#C23E5D]/10 rounded-bl-full pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-[#8B263E] dark:bg-[#E8738B]" />
                <span className="text-xs font-semibold text-[#7A6A60] dark:text-[#A89890] truncate">
                  {challenge.partner2Name}
                </span>
                {activePartner === 'partner2' && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#8B263E]/10 dark:bg-[#C23E5D]/20 text-[#8B263E] dark:text-[#E8738B] font-semibold">
                    Você
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-[#2C221E] dark:text-[#F5EBE6] tracking-tight">
                {formatBRL(stats.partner2Saved)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F2ECE1] dark:border-[#2D1F27] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#7A6A60] dark:text-[#A89890]">
                <span>Depósitos:</span>
                <span className="font-semibold text-[#2C221E] dark:text-[#F5EBE6]">
                  {stats.partner2Count}
                </span>
              </div>
              <div className="flex justify-between text-[#7A6A60] dark:text-[#A89890]">
                <span>Da meta (R$ 20k):</span>
                <span className="font-semibold text-[#8B263E] dark:text-[#E8738B]">
                  {stats.partner2PercentOfGoal.toFixed(1).replace('.', ',')}%
                </span>
              </div>
              {stats.totalSaved > 0 && (
                <div className="flex justify-between text-[#7A6A60] dark:text-[#A89890]">
                  <span>Do guardado:</span>
                  <span className="font-medium text-[#42352E] dark:text-[#D5C6BF]">
                    {stats.partner2ShareOfSaved.toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Regra Especial de Fechamento dos R$ 20.000 */}
      <div className="bg-[#F5EFE6] dark:bg-[#1E171C] border border-[#E5DAC8] dark:border-[#33222B] rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-[#5A4940] dark:text-[#D5C6BF] transition-colors">
        <Info className="w-4 h-4 text-[#C45A45] dark:text-[#E06A53] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#2C221E] dark:text-[#F5EBE6]">
            Como funciona a regra dos 200 números?
          </p>
          <p className="mt-0.5 text-[#6B5A50] dark:text-[#B8A6A0] leading-relaxed">
            Cada número de 1 a 200 equivale ao valor em reais (ex: nº 25 = R$ 25).
            Para totalizar <strong className="text-[#2C221E] dark:text-white">exatamente R$ 20.000</strong>, o{' '}
            <strong className="text-[#8B263E] dark:text-[#E8738B]">número 200 vale R$ 100</strong> (desconto de R$ 100
            sobre a soma natural de R$ 20.100).
          </p>
        </div>
      </div>

      {/* Quick link to Challenge Grid */}
      <button
        onClick={onGoToChallenge}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#EDE4D5] dark:bg-[#251B21] hover:bg-[#E5DAC8] dark:hover:bg-[#32232C] text-[#3D2F28] dark:text-[#E8DCD5] font-semibold text-sm transition-all flex items-center justify-between shadow-sm active:scale-95 border border-[#E0D4C0] dark:border-[#3B2B35]"
      >
        <span className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#8B263E] dark:text-[#E8738B]" />
          Ver grade interativa de 200 depósitos
        </span>
        <ChevronRight className="w-4 h-4 text-[#7A6A60] dark:text-[#A89890]" />
      </button>
    </div>
  );
};
