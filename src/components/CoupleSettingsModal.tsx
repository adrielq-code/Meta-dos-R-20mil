import React, { useState } from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Users,
  Share2,
  Copy,
  Check,
  Smartphone,
  Save,
  LogIn,
  LogOut,
  Heart,
  MessageCircle,
  Moon,
  Sun,
} from 'lucide-react';

interface CoupleSettingsModalProps {
  onClose: () => void;
}

export const CoupleSettingsModal: React.FC<CoupleSettingsModalProps> = ({ onClose }) => {
  const {
    challenge,
    activePartner,
    setActivePartner,
    challengeId,
    setChallengeId,
    updatePartnerNames,
    currentUser,
    signInWithGoogle,
    signOut,
  } = useChallenge();
  const { theme, setTheme } = useTheme();

  const [p1Name, setP1Name] = useState(challenge.partner1Name);
  const [p2Name, setP2Name] = useState(challenge.partner2Name);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  React.useEffect(() => {
    setP1Name(challenge.partner1Name);
    setP2Name(challenge.partner2Name);
  }, [challenge.partner1Name, challenge.partner2Name]);

  const handleSaveNames = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePartnerNames(p1Name, p2Name);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const getShareableUrl = () => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin + window.location.pathname;
    return `${base}?challenge=${challengeId}`;
  };

  const handleCopyLink = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    const url = getShareableUrl();
    const text = `Oi amor! Aqui está o nosso aplicativo "Nossa Meta — R$ 20 Mil" para acompanharmos o desafio dos 200 números juntos: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-pop">
      <div className="w-full max-w-md bg-[#FAF7F2] dark:bg-[#1A1419] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-[#E8DFC8] dark:border-[#382630] space-y-4 max-h-[92vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8] dark:border-[#33222B]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#8B263E]/10 dark:bg-[#C23E5D]/20 text-[#8B263E] dark:text-[#E8738B]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C221E] dark:text-[#F5EBE6]">Configurações do Casal</h3>
              <p className="text-xs text-[#7A6A60] dark:text-[#A89890]">Nomes, tema e conexão entre celulares</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#EBE2D4] dark:hover:bg-[#281C23] text-[#7A6A60] dark:text-[#A89890] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Preference Box (Light / Dark) */}
        <div className="bg-white dark:bg-[#20171E] border border-[#E8DFC8] dark:border-[#382833] rounded-2xl p-3.5 space-y-2 transition-colors">
          <label className="text-xs font-bold text-[#42352E] dark:text-[#E8DCD5] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              Tema do Aplicativo
            </span>
            <span className="text-[11px] font-medium text-[#7A6A60] dark:text-[#A89890]">
              {theme === 'dark' ? 'Modo Escuro Ativo' : 'Modo Claro Ativo'}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                theme === 'light'
                  ? 'bg-[#FAF0E6] border-[#C45A45] text-[#9E382A] ring-2 ring-[#C45A45]/20 shadow-xs'
                  : 'bg-[#FAF7F2] dark:bg-[#281D25] border-[#E8DFC8] dark:border-[#382833] text-[#7A6A60] dark:text-[#A89890]'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              Tema Claro
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-2.5 rounded-xl border text-center transition-all flex items-center justify-center gap-2 text-xs font-bold ${
                theme === 'dark'
                  ? 'bg-[#2E1D28] border-[#E8738B] text-[#FFA0B5] ring-2 ring-[#E8738B]/20 shadow-xs'
                  : 'bg-[#FAF7F2] dark:bg-[#281D25] border-[#E8DFC8] dark:border-[#382833] text-[#7A6A60] dark:text-[#A89890]'
              }`}
            >
              <Moon className="w-4 h-4 text-amber-300" />
              Tema Escuro
            </button>
          </div>
        </div>

        {/* Device Active Profile Switcher */}
        <div className="bg-white dark:bg-[#20171E] border border-[#E8DFC8] dark:border-[#382833] rounded-2xl p-3.5 space-y-2 transition-colors">
          <label className="text-xs font-bold text-[#42352E] dark:text-[#E8DCD5] flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#8B263E] dark:text-[#E8738B]" />
            Quem está usando este celular?
          </label>
          <p className="text-[11px] text-[#7A6A60] dark:text-[#A89890]">
            Selecione seu perfil para marcar depósitos com 1 toque.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActivePartner('partner1')}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                activePartner === 'partner1'
                  ? 'bg-[#FAF0E6] dark:bg-[#341B23] border-[#C45A45] dark:border-[#E06A53] shadow-xs ring-2 ring-[#C45A45]/30'
                  : 'bg-white dark:bg-[#281D25] border-[#E8DFC8] dark:border-[#382833] hover:bg-[#FAF7F2]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#C45A45] dark:bg-[#E06A53]" />
              <span className="text-xs font-bold text-[#2C221E] dark:text-[#F5EBE6] truncate">{challenge.partner1Name}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePartner('partner2')}
              className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                activePartner === 'partner2'
                  ? 'bg-[#F9ECEF] dark:bg-[#381827] border-[#8B263E] dark:border-[#C23E5D] shadow-xs ring-2 ring-[#8B263E]/30'
                  : 'bg-white dark:bg-[#281D25] border-[#E8DFC8] dark:border-[#382833] hover:bg-[#FAF7F2]'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B263E] dark:bg-[#E8738B]" />
              <span className="text-xs font-bold text-[#2C221E] dark:text-[#F5EBE6] truncate">{challenge.partner2Name}</span>
            </button>
          </div>
        </div>

        {/* Customize Names Form */}
        <form onSubmit={handleSaveNames} className="bg-white dark:bg-[#20171E] border border-[#E8DFC8] dark:border-[#382833] rounded-2xl p-3.5 space-y-3 transition-colors">
          <h4 className="text-xs font-bold text-[#2C221E] dark:text-[#F5EBE6] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#8B263E] dark:text-[#E8738B]" />
            Personalizar Nomes do Casal
          </h4>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] font-semibold text-[#7A6A60] dark:text-[#A89890] block mb-1">
                Nome do Parceiro 1 (Terracota)
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#281D25] border border-[#E8DFC8] dark:border-[#382833] rounded-xl text-xs text-[#2C221E] dark:text-[#F5EBE6] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#7A6A60] dark:text-[#A89890] block mb-1">
                Nome do Parceiro 2 (Vinho)
              </label>
              <input
                type="text"
                required
                maxLength={40}
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#281D25] border border-[#E8DFC8] dark:border-[#382833] rounded-xl text-xs text-[#2C221E] dark:text-[#F5EBE6] font-medium focus:outline-none focus:ring-2 focus:ring-[#8B263E]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-3 bg-[#8B263E] dark:bg-[#C23E5D] hover:bg-[#731E32] dark:hover:bg-[#A9334E] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Nomes salvos com sucesso!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Salvar Nomes
              </>
            )}
          </button>
        </form>

        {/* Share with Spouse / Real-time multi-device */}
        <div className="bg-white dark:bg-[#20171E] border border-[#E8DFC8] dark:border-[#382833] rounded-2xl p-3.5 space-y-2.5 transition-colors">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C221E] dark:text-[#F5EBE6]">
            <Share2 className="w-3.5 h-3.5 text-[#C45A45] dark:text-[#E06A53]" />
            Conectar o celular do cônjuge
          </div>
          <p className="text-[11px] text-[#6B5A50] dark:text-[#B8A6A0] leading-relaxed">
            Envie este link para sua esposa. Ela abrirá o aplicativo com os mesmos depósitos e
            sincronização em tempo real!
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 rounded-xl bg-[#FAF7F2] dark:bg-[#281D25] border border-[#E8DFC8] dark:border-[#382833] text-[#2C221E] dark:text-[#F5EBE6] font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#F2ECE1] dark:hover:bg-[#32232E] transition-all active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex-1 py-2 px-3 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#20bd5a] transition-all active:scale-95 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          </div>
        </div>

        {/* Firebase Authentication Account Box */}
        <div className="bg-[#F5EFE6] dark:bg-[#22171E] border border-[#E5DAC8] dark:border-[#3A2733] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs transition-colors">
          {currentUser ? (
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || ''}
                  className="w-8 h-8 rounded-full border border-[#D5C6B0] dark:border-[#4D3544] shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#8B263E] dark:bg-[#C23E5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-[#2C221E] dark:text-[#F5EBE6] truncate">
                  {currentUser.displayName || 'Conectado com Google'}
                </p>
                <p className="text-[10px] text-[#7A6A60] dark:text-[#A89890] truncate">{currentUser.email}</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="font-bold text-[#2C221E] dark:text-[#F5EBE6]">Conta Google</p>
              <p className="text-[11px] text-[#7A6A60] dark:text-[#A89890]">Não conectado</p>
            </div>
          )}

          {currentUser ? (
            <button
              type="button"
              onClick={signOut}
              className="px-2.5 py-1.5 rounded-lg border border-[#D5C6B0] dark:border-[#4A3442] text-[#7A6A60] dark:text-[#A89890] hover:text-[#9E382A] dark:hover:text-[#FFA08B] text-[11px] font-semibold transition-colors flex items-center gap-1 shrink-0"
            >
              <LogOut className="w-3 h-3" />
              Sair
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="px-3 py-1.5 rounded-lg bg-[#8B263E] dark:bg-[#C23E5D] text-white text-xs font-bold hover:bg-[#731E32] dark:hover:bg-[#A9334E] transition-colors flex items-center gap-1 shrink-0 shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
