import React, { useState } from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { formatBRL, formatDateBR } from '../constants';
import { Deposit } from '../types';
import { Clock, Edit3 } from 'lucide-react';

interface HistoryScreenProps {
  onEditDeposit: (num: number) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onEditDeposit }) => {
  const { challenge, depositsList, stats } = useChallenge();
  const [filterPartner, setFilterPartner] = useState<'all' | 'partner1' | 'partner2'>('all');

  const filteredList = depositsList.filter((dep) => {
    if (filterPartner === 'partner1') return dep.depositedBy === 'partner1';
    if (filterPartner === 'partner2') return dep.depositedBy === 'partner2';
    return true;
  });

  return (
    <div className="space-y-4 pb-24 animate-pop">
      {/* Top Accumulated Summary Card */}
      <div className="bg-white dark:bg-[#1C151B] border border-[#E8DFC8] dark:border-[#33222B] rounded-3xl p-4 shadow-sm space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7A6A60] dark:text-[#A89890]">
            Resumo dos Depósitos
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF0E6] dark:bg-[#2C1820] text-[#8B263E] dark:text-[#E8738B]">
            {stats.completedCount} depósitos registrados
          </span>
        </div>

        {/* Totals by Partner */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Partner 1 Mini Box */}
          <div className="p-3 rounded-2xl bg-[#FAF0E6]/70 dark:bg-[#2A1820] border border-[#E8DFC8] dark:border-[#402430] space-y-1 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-[#9E382A] dark:text-[#FFA08B] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C45A45] dark:bg-[#E06A53]" />
              <span className="truncate">{challenge.partner1Name}</span>
            </div>
            <p className="text-base font-extrabold text-[#2C221E] dark:text-[#F5EBE6]">
              {formatBRL(stats.partner1Saved)}
            </p>
            <p className="text-[11px] text-[#7A6A60] dark:text-[#A89890]">
              {stats.partner1Count} depósitos ({stats.partner1PercentOfGoal.toFixed(1).replace('.', ',')}%)
            </p>
          </div>

          {/* Partner 2 Mini Box */}
          <div className="p-3 rounded-2xl bg-[#F9ECEF]/70 dark:bg-[#2D1623] border border-[#E8DFC8] dark:border-[#442032] space-y-1 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-[#8B263E] dark:text-[#E8738B] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B263E] dark:bg-[#E8738B]" />
              <span className="truncate">{challenge.partner2Name}</span>
            </div>
            <p className="text-base font-extrabold text-[#2C221E] dark:text-[#F5EBE6]">
              {formatBRL(stats.partner2Saved)}
            </p>
            <p className="text-[11px] text-[#7A6A60] dark:text-[#A89890]">
              {stats.partner2Count} depósitos ({stats.partner2PercentOfGoal.toFixed(1).replace('.', ',')}%)
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center p-1 bg-[#EFE8DC] dark:bg-[#251B21] rounded-xl text-xs font-semibold text-[#5A4940] dark:text-[#C8B8B0] gap-0.5 transition-colors">
        <button
          onClick={() => setFilterPartner('all')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center ${
            filterPartner === 'all'
              ? 'bg-white dark:bg-[#34242E] text-[#2C221E] dark:text-white shadow-sm font-bold'
              : 'hover:text-[#2C221E] dark:hover:text-white'
          }`}
        >
          Todos ({depositsList.length})
        </button>
        <button
          onClick={() => setFilterPartner('partner1')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center truncate ${
            filterPartner === 'partner1'
              ? 'bg-white dark:bg-[#34242E] text-[#9E382A] dark:text-[#FFA08B] shadow-sm font-bold'
              : 'hover:text-[#2C221E] dark:hover:text-white'
          }`}
        >
          {challenge.partner1Name} ({stats.partner1Count})
        </button>
        <button
          onClick={() => setFilterPartner('partner2')}
          className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center truncate ${
            filterPartner === 'partner2'
              ? 'bg-white dark:bg-[#34242E] text-[#8B263E] dark:text-[#E8738B] shadow-sm font-bold'
              : 'hover:text-[#2C221E] dark:hover:text-white'
          }`}
        >
          {challenge.partner2Name} ({stats.partner2Count})
        </button>
      </div>

      {/* Chronological List of Deposits */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-[#1C151B] border border-[#E8DFC8] dark:border-[#33222B] rounded-3xl p-8 text-center text-xs text-[#7A6A60] dark:text-[#A89890] space-y-2 transition-colors">
          <Clock className="w-8 h-8 text-[#C45A45]/40 dark:text-[#E06A53]/40 mx-auto" />
          <p className="font-bold text-sm text-[#2C221E] dark:text-[#F5EBE6]">Nenhum depósito neste filtro</p>
          <p>
            {depositsList.length === 0
              ? 'Abra a tela do Desafio e toque em qualquer número para começar!'
              : 'Não há depósitos encontrados para este participante.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredList.map((dep: Deposit) => {
            const isPartner1 = dep.depositedBy === 'partner1';

            return (
              <div
                key={dep.number}
                className="bg-white dark:bg-[#1E171D] border border-[#E8DFC8] dark:border-[#33232C] rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 hover:border-[#D5C6B0] dark:hover:border-[#4B3441] transition-all"
              >
                {/* Left: Number badge */}
                <div
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center text-white shrink-0 shadow-xs ${
                    isPartner1
                      ? 'bg-gradient-to-br from-[#D96B54] to-[#C45A45] dark:from-[#E06A53] dark:to-[#B8422E]'
                      : 'bg-gradient-to-br from-[#9E2B47] to-[#8B263E] dark:from-[#B83452] dark:to-[#7E1E34]'
                  }`}
                >
                  <span className="text-[10px] font-semibold leading-none opacity-80">Nº</span>
                  <span className="text-sm font-black leading-tight">{dep.number}</span>
                </div>

                {/* Center: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-extrabold text-[#2C221E] dark:text-[#F5EBE6]">
                      {formatBRL(dep.amount)}
                    </span>
                    {dep.number === 200 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#8B263E]/10 dark:bg-[#C23E5D]/20 text-[#8B263E] dark:text-[#E8738B]">
                        Ajuste Meta
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#7A6A60] dark:text-[#A89890] mt-0.5">
                    <span className={`font-semibold ${isPartner1 ? 'text-[#9E382A] dark:text-[#FFA08B]' : 'text-[#8B263E] dark:text-[#E8738B]'}`}>
                      {dep.depositedByName}
                    </span>
                    <span>·</span>
                    <span>{formatDateBR(dep.depositDate)}</span>
                  </div>

                  {dep.notes && (
                    <p className="text-[11px] text-[#524138] dark:text-[#D5C6BF] italic mt-1 line-clamp-1 bg-[#FAF7F2] dark:bg-[#291D25] px-2 py-0.5 rounded-md inline-block">
                      "{dep.notes}"
                    </p>
                  )}
                </div>

                {/* Right: Action button */}
                <button
                  onClick={() => onEditDeposit(dep.number)}
                  className="p-2 rounded-xl text-[#7A6A60] dark:text-[#A89890] hover:text-[#2C221E] dark:hover:text-white hover:bg-[#FAF7F2] dark:hover:bg-[#281C23] transition-colors"
                  title="Editar ou excluir depósito"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
