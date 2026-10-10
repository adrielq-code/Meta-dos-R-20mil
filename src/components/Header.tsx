import React from 'react';
import { useChallenge } from '../context/ChallengeContext';
import { useTheme } from '../context/ThemeContext';
import { formatBRL } from '../constants';
import { Users, Settings, Cloud, CloudOff, RefreshCw, LogIn, Heart, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const {
    challenge,
    activePartner,
    setActivePartner,
    syncStatus,
    currentUser,
    signInWithGoogle,
  } = useChallenge();
  const { theme, toggleTheme } = useTheme();

  const activeName =
    activePartner === 'partner1' ? challenge.partner1Name : challenge.partner2Name;
  const otherPartner = activePartner === 'partner1' ? 'partner2' : 'partner1';
  const otherName =
    otherPartner === 'partner1' ? challenge.partner1Name : challenge.partner2Name;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 dark:bg-[#141013]/95 backdrop-blur-md border-b border-[#E8DFC8]/60 dark:border-[#2D2028] transition-colors">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Title & Couple Names */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#8B263E]/10 dark:bg-[#C23E5D]/20 flex items-center justify-center text-[#8B263E] dark:text-[#E8738B]">
            <Heart className="w-5 h-5 fill-[#8B263E] dark:fill-[#E8738B]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-[#2C221E] dark:text-[#F5EBE6]">
                Nossa Meta
              </h1>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-[#C45A45]/15 dark:bg-[#E06A53]/25 text-[#9E382A] dark:text-[#FFA08B]">
                R$ 20 Mil
              </span>
            </div>
            <p className="text-[11px] text-[#7A6A60] dark:text-[#A89890] font-medium truncate max-w-[160px]">
              {challenge.partner1Name} & {challenge.partner2Name}
            </p>
          </div>
        </div>

        {/* Right side: Switch profile, Theme toggle & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active Partner Fast Toggle */}
          <button
            onClick={() => setActivePartner(otherPartner)}
            title={`Alternar perfil para ${otherName}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#F2ECE1] dark:bg-[#251B21] hover:bg-[#EBE3D5] dark:hover:bg-[#32232C] text-[#42352E] dark:text-[#E8DCD5] text-xs font-medium border border-[#E3D8C6] dark:border-[#3B2B35] transition-all active:scale-95"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                activePartner === 'partner1'
                  ? 'bg-[#C45A45] dark:bg-[#E06A53]'
                  : 'bg-[#8B263E] dark:bg-[#E8738B]'
              }`}
            />
            <span className="max-w-[65px] truncate">{activeName}</span>
          </button>

          {/* Dark / Light Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            className="p-2 rounded-full hover:bg-[#F2ECE1] dark:hover:bg-[#251B21] text-[#5A4940] dark:text-[#C8B8B0] transition-colors active:scale-95"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-[#5A4940] transition-transform rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Sync / Login status indicator */}
          {!currentUser ? (
            <button
              onClick={signInWithGoogle}
              title="Entrar com Google para sincronizar"
              className="p-2 rounded-full bg-[#8B263E] dark:bg-[#C23E5D] text-white hover:bg-[#731E32] dark:hover:bg-[#A9334E] transition-colors shadow-sm active:scale-95"
            >
              <LogIn className="w-4 h-4" />
            </button>
          ) : (
            <div
              title={
                syncStatus === 'synced'
                  ? 'Sincronizado na nuvem em tempo real'
                  : syncStatus === 'syncing'
                  ? 'Sincronizando...'
                  : 'Modo offline'
              }
              className="p-1.5 text-[#7A6A60] dark:text-[#A89890]"
            >
              {syncStatus === 'syncing' && (
                <RefreshCw className="w-4 h-4 animate-spin text-[#C45A45] dark:text-[#E06A53]" />
              )}
              {syncStatus === 'synced' && <Cloud className="w-4 h-4 text-[#4A7C59] dark:text-[#68B682]" />}
              {syncStatus === 'offline' && <CloudOff className="w-4 h-4 text-[#A66E38] dark:text-[#D4985D]" />}
            </div>
          )}

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="Configurações do casal"
            className="p-2 rounded-full hover:bg-[#F2ECE1] dark:hover:bg-[#251B21] text-[#5A4940] dark:text-[#C8B8B0] transition-colors active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
