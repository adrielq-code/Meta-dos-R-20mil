import React, { useState, useEffect } from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { formatBRL, getNumberAmount, isAdjustedNumber, getTodayDateString } from '../constants';
import { PartnerId } from '../types';
import confetti from 'canvas-confetti';
import { playDepositSound } from '../utils/sound';
import {
  X,
  Calendar,
  User,
  Heart,
  Trash2,
  Check,
  AlertTriangle,
  Sparkles,
  FileText,
} from 'lucide-react';

interface DepositModalProps {
  number: number | null;
  onClose: () => void;
  onDepositSaved?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  number,
  onClose,
  onDepositSaved,
}) => {
  const {
    challenge,
    deposits,
    activePartner,
    saveDeposit,
    removeDeposit,
    currentUser,
    signInWithGoogle,
  } = useChallenge();

  const [selectedPartner, setSelectedPartner] = useState<PartnerId>(activePartner);
  const [depositDate, setDepositDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // If number exists in deposits, we are in "Edit/View" mode
  const existingDeposit = number ? deposits.get(number) : null;
  const isEditing = !!existingDeposit;

  useEffect(() => {
    if (number) {
      if (existingDeposit) {
        setSelectedPartner(existingDeposit.depositedBy);
        setDepositDate(existingDeposit.depositDate);
        setNotes(existingDeposit.notes || '');
      } else {
        setSelectedPartner(activePartner);
        setDepositDate(getTodayDateString());
        setNotes('');
      }
      setShowConfirmDelete(false);
    }
  }, [number, existingDeposit, activePartner]);

  if (number === null) return null;

  const amount = getNumberAmount(number);
  const isSpecial200 = isAdjustedNumber(number);
  const isHighValue = amount >= 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveDeposit({
        number,
        depositedBy: selectedPartner,
        depositDate,
        notes,
      });

      // Play soft harmonic audio feedback
      playDepositSound(isHighValue);

      // Celebration confetti for positive reinforcement
      confetti({
        particleCount: isHighValue ? 65 : 45,
        spread: isHighValue ? 75 : 55,
        origin: { y: 0.7 },
        colors: ['#8B263E', '#C45A45', '#DF7A60', '#F2ECE1', '#E8738B'],
        disableForReducedMotion: true,
      });

      if (onDepositSaved) onDepositSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await removeDeposit(number);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-pop">
      <div className="w-full max-w-md bg-[#FAF7F2] dark:bg-[#1A1318] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] dark:border-[#382630] space-y-4 max-h-[92vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8] dark:border-[#33222B]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B263E] to-[#C45A45] dark:from-[#C23E5D] dark:to-[#E06A53] text-white flex items-center justify-center font-black text-lg shadow-sm">
              #{number}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C221E] dark:text-[#F5EBE6]">
                {isEditing ? 'Detalhes do Depósito' : 'Registrar Depósito'}
              </h3>
              <p className="text-xs text-[#7A6A60] dark:text-[#A89890]">
                Valor correspondente:{' '}
                <strong className="text-[#8B263E] dark:text-[#E8738B]">
                  {formatBRL(amount)}
                </strong>
                {isHighValue && (
                  <span className="ml-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    ★ Valor especial
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#EBE2D4] dark:hover:bg-[#281C23] text-[#7A6A60] dark:text-[#A89890] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Special Notice for 200 */}
        {isSpecial200 && (
          <div className="bg-[#FAF0E6] dark:bg-[#251820] border border-[#E8DFC8] dark:border-[#402633] rounded-xl p-3 flex items-start gap-2 text-xs text-[#635248] dark:text-[#D5C6BF] transition-colors">
            <Sparkles className="w-4 h-4 text-[#C45A45] dark:text-[#E06A53] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#2C221E] dark:text-[#F5EBE6]">
                Ajuste Oficial da Meta (R$ 20.000)
              </p>
              <p className="text-[#6B5A50] dark:text-[#A89890] mt-0.5">
                Para fechar o total em exatamente R$ 20.000,00, este número 200 tem valor de{' '}
                <strong className="text-[#8B263E] dark:text-[#E8738B]">R$ 100,00</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Who Deposited: 2 Big Selectable Cards */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#42352E] dark:text-[#E8DCD5] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8B263E] dark:text-[#E8738B]" />
              Quem guardou esse valor?
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Partner 1 Button */}
              <button
                type="button"
                onClick={() => setSelectedPartner('partner1')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 active:scale-95 ${
                  selectedPartner === 'partner1'
                    ? 'bg-[#FAF0E6] dark:bg-[#321C22] border-[#C45A45] dark:border-[#E06A53] shadow-xs ring-2 ring-[#C45A45]/30'
                    : 'bg-white dark:bg-[#22181F] border-[#E8DFC8] dark:border-[#382833] hover:bg-[#FAF7F2] dark:hover:bg-[#2B1F27]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                    selectedPartner === 'partner1' ? 'bg-[#C45A45] dark:bg-[#E06A53]' : 'bg-[#C45A45]/50 dark:bg-[#E06A53]/50'
                  }`}
                >
                  {challenge.partner1Name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2C221E] dark:text-[#F5EBE6] truncate">
                    {challenge.partner1Name}
                  </p>
                  <p className="text-[10px] text-[#7A6A60] dark:text-[#A89890]">Parceiro 1</p>
                </div>
              </button>

              {/* Partner 2 Button */}
              <button
                type="button"
                onClick={() => setSelectedPartner('partner2')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 active:scale-95 ${
                  selectedPartner === 'partner2'
                    ? 'bg-[#F9ECEF] dark:bg-[#341926] border-[#8B263E] dark:border-[#C23E5D] shadow-xs ring-2 ring-[#8B263E]/30'
                    : 'bg-white dark:bg-[#22181F] border-[#E8DFC8] dark:border-[#382833] hover:bg-[#FAF7F2] dark:hover:bg-[#2B1F27]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 ${
                    selectedPartner === 'partner2' ? 'bg-[#8B263E] dark:bg-[#C23E5D]' : 'bg-[#8B263E]/50 dark:bg-[#C23E5D]/50'
                  }`}
                >
                  {challenge.partner2Name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#2C221E] dark:text-[#F5EBE6] truncate">
                    {challenge.partner2Name}
                  </p>
                  <p className="text-[10px] text-[#7A6A60] dark:text-[#A89890]">Parceiro 2</p>
                </div>
              </button>
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#42352E] dark:text-[#E8DCD5] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#8B263E] dark:text-[#E8738B]" />
              Data do depósito
            </label>
            <input
              type="date"
              value={depositDate}
              onChange={(e) => setDepositDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-white dark:bg-[#22181F] border border-[#E8DFC8] dark:border-[#382833] rounded-xl text-xs text-[#2C221E] dark:text-[#F5EBE6] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E] transition-colors"
            />
          </div>

          {/* Optional Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#42352E] dark:text-[#E8DCD5] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#7A6A60] dark:text-[#A89890]" />
              Observação (opcional)
            </label>
            <input
              type="text"
              maxLength={120}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Sobra do supermercado, freela, cafezinho..."
              className="w-full px-3 py-2 bg-white dark:bg-[#22181F] border border-[#E8DFC8] dark:border-[#382833] rounded-xl text-xs text-[#2C221E] dark:text-[#F5EBE6] placeholder-[#9C8C80] dark:placeholder-[#75645C] focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20 focus:border-[#8B263E] transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#8B263E] to-[#A23B2B] dark:from-[#C23E5D] dark:to-[#E06A53] hover:opacity-95 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            {isEditing ? 'Atualizar depósito' : `Confirmar depósito de ${formatBRL(amount)}`}
          </button>
        </form>

        {/* Delete Confirmation or Button (if editing) */}
        {isEditing && (
          <div className="pt-2 border-t border-[#E8DFC8]/60 dark:border-[#33222B]">
            {!showConfirmDelete ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="w-full py-2.5 px-3 rounded-xl text-[#9E382A] dark:text-[#FFA08B] hover:bg-[#FAF0E6] dark:hover:bg-[#2B181E] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Desfazer / remover este depósito
              </button>
            ) : (
              <div className="bg-[#FAF0E6] dark:bg-[#2B181E] border border-[#E8DFC8] dark:border-[#42222B] rounded-xl p-3 space-y-2 text-xs transition-colors">
                <div className="flex items-center gap-1.5 text-[#9E382A] dark:text-[#FFA08B] font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Tem certeza que deseja desmarcar o nº {number}?</span>
                </div>
                <p className="text-[#6B5A50] dark:text-[#B8A6A0] text-[11px]">
                  O valor de {formatBRL(amount)} será deduzido da meta do casal.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting}
                    className="flex-1 py-2 px-3 bg-[#9E382A] dark:bg-[#C45A45] text-white font-bold rounded-lg hover:bg-[#832B1E] transition-colors"
                  >
                    Sim, desmarcar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 py-2 px-3 bg-white dark:bg-[#22181F] border border-[#E8DFC8] dark:border-[#382833] text-[#42352E] dark:text-[#E8DCD5] font-semibold rounded-lg hover:bg-[#F2ECE1] dark:hover:bg-[#2B1F27] transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
