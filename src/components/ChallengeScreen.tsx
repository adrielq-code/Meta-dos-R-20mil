import React, { useState, useMemo } from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { formatBRL, getNumberAmount, isAdjustedNumber, TOTAL_NUMBERS } from '../constants';
import { FilterType } from '../types';
import { Check, Search, X, Sparkles } from 'lucide-react';

interface ChallengeScreenProps {
  onSelectNumber: (num: number) => void;
}

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ onSelectNumber }) => {
  const { challenge, deposits, stats } = useChallenge();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate array [1, 2, ..., 200]
  const allNumbers = useMemo(() => {
    return Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
  }, []);

  // Filtered numbers based on active tab and search query
  const filteredNumbers = useMemo(() => {
    return allNumbers.filter((num) => {
      const deposit = deposits.get(num);

      // Search filter
      if (searchQuery.trim()) {
        const queryNum = parseInt(searchQuery.trim(), 10);
        if (!isNaN(queryNum) && num !== queryNum && !num.toString().includes(searchQuery.trim())) {
          return false;
        }
      }

      // Category filter
      if (filter === 'available') {
        return !deposit;
      }
      if (filter === 'partner1') {
        return deposit?.depositedBy === 'partner1';
      }
      if (filter === 'partner2') {
        return deposit?.depositedBy === 'partner2';
      }
      return true;
    });
  }, [allNumbers, deposits, filter, searchQuery]);

  return (
    <div className="space-y-2.5 pb-24 animate-pop">
      {/* Legend & Summary Bar */}
      <div className="bg-white dark:bg-[#1C151B] border border-[#E8DFC8] dark:border-[#33222B] rounded-2xl p-2.5 sm:p-3 shadow-xs space-y-1.5 transition-colors">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#2C221E] dark:text-[#F5EBE6]">Legenda do Desafio</span>
          <span className="text-[#7A6A60] dark:text-[#A89890] font-medium text-[11px] sm:text-xs">
            {stats.completedCount} de 200 concluídos
          </span>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {/* Disponível */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FAF7F2] dark:bg-[#251B21] border border-[#E3D8C6] dark:border-[#3B2A34] text-[#6A584E] dark:text-[#C5B5AE]">
            <span className="w-2 h-2 rounded-full bg-[#E5DAC8] dark:bg-[#4A3843] border border-[#D5C6B0] dark:border-[#5A4552]" />
            <span>Livre</span>
          </div>

          {/* Partner 1 */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FAF0E6] dark:bg-[#2B181E] border border-[#E8DFC8] dark:border-[#42222B] text-[#9E382A] dark:text-[#FFA08B]">
            <span className="w-2 h-2 rounded-full bg-[#C45A45] dark:bg-[#E06A53]" />
            <span className="font-medium truncate max-w-[85px]">{challenge.partner1Name}</span>
            <span className="text-[10px] opacity-75">({stats.partner1Count})</span>
          </div>

          {/* Partner 2 */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#F9ECEF] dark:bg-[#2F1622] border border-[#E8DFC8] dark:border-[#461F32] text-[#8B263E] dark:text-[#E8738B]">
            <span className="w-2 h-2 rounded-full bg-[#8B263E] dark:bg-[#E8738B]" />
            <span className="font-medium truncate max-w-[85px]">{challenge.partner2Name}</span>
            <span className="text-[10px] opacity-75">({stats.partner2Count})</span>
          </div>
        </div>
      </div>

      {/* Filter Segmented Control & Search Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center p-1 bg-[#EFE8DC] dark:bg-[#251B21] rounded-xl text-xs font-semibold text-[#5A4940] dark:text-[#C8B8B0] gap-0.5 overflow-x-auto no-scrollbar transition-colors">
          <button
            onClick={() => setFilter('all')}
            className={`shrink-0 py-1.5 px-2.5 rounded-lg transition-all text-center ${
              filter === 'all'
                ? 'bg-white dark:bg-[#34242E] text-[#2C221E] dark:text-white shadow-xs font-bold'
                : 'hover:text-[#2C221E] dark:hover:text-white'
            }`}
          >
            Todos ({TOTAL_NUMBERS})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`shrink-0 py-1.5 px-2.5 rounded-lg transition-all text-center ${
              filter === 'available'
                ? 'bg-white dark:bg-[#34242E] text-[#2C221E] dark:text-white shadow-xs font-bold'
                : 'hover:text-[#2C221E] dark:hover:text-white'
            }`}
          >
            Livres ({stats.remainingCount})
          </button>
          <button
            onClick={() => setFilter('partner1')}
            className={`shrink-0 py-1.5 px-2.5 rounded-lg transition-all text-center truncate max-w-[120px] ${
              filter === 'partner1'
                ? 'bg-white dark:bg-[#34242E] text-[#9E382A] dark:text-[#FFA08B] shadow-xs font-bold'
                : 'hover:text-[#2C221E] dark:hover:text-white'
            }`}
          >
            {challenge.partner1Name} ({stats.partner1Count})
          </button>
          <button
            onClick={() => setFilter('partner2')}
            className={`shrink-0 py-1.5 px-2.5 rounded-lg transition-all text-center truncate max-w-[120px] ${
              filter === 'partner2'
                ? 'bg-white dark:bg-[#34242E] text-[#8B263E] dark:text-[#E8738B] shadow-xs font-bold'
                : 'hover:text-[#2C221E] dark:hover:text-white'
            }`}
          >
            {challenge.partner2Name} ({stats.partner2Count})
          </button>
        </div>

        {/* Search input to quickly locate a number */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#85746A] dark:text-[#9A8780] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="number"
            min="1"
            max="200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ir direto para número (1 a 200)..."
            className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-[#1C151B] border border-[#E8DFC8] dark:border-[#33222B] rounded-xl text-xs text-[#2C221E] dark:text-[#F5EBE6] placeholder-[#9C8C80] dark:placeholder-[#75645C] focus:outline-none focus:ring-1 focus:ring-[#8B263E] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#85746A] hover:text-[#2C221E] dark:text-[#9A8780] dark:hover:text-white p-1"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Regra Especial Callout Banner para Nº 200 */}
      <div className="bg-[#FAF3EA] dark:bg-[#22181E] border border-[#E5DAC8] dark:border-[#3B2834] rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] text-[#635248] dark:text-[#D5C6BF] transition-colors">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C45A45] dark:text-[#E06A53] shrink-0" />
          <span className="leading-tight">
            <strong>Ajuste da meta:</strong> O nº 200 vale <strong>R$ 100</strong> para fechar
            exatamente em <strong>R$ 20.000</strong>.
          </span>
        </div>
      </div>

      {/* Numbers Grid: 5 cols on mobile, 8 on larger screens */}
      {filteredNumbers.length === 0 ? (
        <div className="bg-white dark:bg-[#1C151B] border border-[#E8DFC8] dark:border-[#33222B] rounded-2xl p-6 text-center text-xs text-[#7A6A60] dark:text-[#A89890] space-y-1 transition-colors">
          <p className="font-bold text-sm text-[#2C221E] dark:text-[#F5EBE6]">Nenhum número encontrado</p>
          <p>Tente mudar o filtro ou limpar a busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-1 sm:gap-1.5">
          {filteredNumbers.map((num) => {
            const deposit = deposits.get(num);
            const isCompleted = !!deposit;
            const isPartner1 = deposit?.depositedBy === 'partner1';
            const isPartner2 = deposit?.depositedBy === 'partner2';
            const amount = getNumberAmount(num);
            const isSpecial200 = isAdjustedNumber(num);

            return (
              <button
                key={num}
                onClick={() => onSelectNumber(num)}
                title={
                  isCompleted
                    ? `Nº ${num} (${formatBRL(amount)}) — Depositado por ${deposit.depositedByName}`
                    : `Nº ${num} (${formatBRL(amount)}) — Toque para marcar`
                }
                className={`relative flex flex-col items-center justify-between py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-95 h-14 sm:h-16 text-center select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] border overflow-hidden ${
                  isCompleted
                    ? isPartner1
                      ? 'bg-gradient-to-br from-[#D96B54] to-[#C45A45] dark:from-[#E06A53] dark:to-[#B8422E] text-white border-[#B74C37] dark:border-[#9A3523] shadow-xs'
                      : 'bg-gradient-to-br from-[#9E2B47] to-[#8B263E] dark:from-[#B83452] dark:to-[#7E1E34] text-white border-[#751C31] dark:border-[#6B182C] shadow-xs'
                    : 'bg-white dark:bg-[#1E171D] hover:bg-[#FAF5ED] dark:hover:bg-[#281F26] text-[#2C221E] dark:text-[#F5EBE6] border-[#E8DFC8] dark:border-[#382833]'
                }`}
              >
                {/* Special 200 adjustment tag inside cell */}
                {isSpecial200 && (
                  <span
                    className={`absolute top-0.5 left-0.5 text-[7px] font-black px-1 rounded-xs uppercase leading-tight ${
                      isCompleted
                        ? 'bg-white/90 text-[#8B263E]'
                        : 'bg-[#8B263E] dark:bg-[#C23E5D] text-white'
                    }`}
                  >
                    R$100*
                  </span>
                )}

                {/* Check icon for completed */}
                {isCompleted && (
                  <div className="absolute top-1 right-1">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}

                {/* Number itself */}
                <span
                  className={`text-xs sm:text-sm font-extrabold leading-none mt-0.5 ${
                    isCompleted ? 'text-white' : 'text-[#2C221E] dark:text-[#F5EBE6]'
                  }`}
                >
                  {num}
                </span>

                {/* Amount in Reais */}
                <span
                  className={`text-[9px] sm:text-[10px] font-semibold leading-none truncate max-w-full ${
                    isCompleted ? 'text-white/95' : 'text-[#7A6A60] dark:text-[#A89890]'
                  }`}
                >
                  R$ {amount}
                </span>

                {/* Completed By Name / Indicator */}
                {isCompleted ? (
                  <span className="text-[8px] sm:text-[9px] font-medium truncate max-w-[92%] leading-none pb-0.5 opacity-90">
                    {deposit.depositedBy === 'partner1'
                      ? challenge.partner1Name.slice(0, 5)
                      : challenge.partner2Name.slice(0, 5)}
                  </span>
                ) : (
                  <span className="h-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
