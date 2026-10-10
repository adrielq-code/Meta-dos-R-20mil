import React from 'react';
import { ActiveTab } from '../types';
import { Home, LayoutGrid, History } from 'lucide-react';
import { useChallenge } from '../context/ChallengeContext';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { stats } = useChallenge();

  const navItems = [
    {
      id: 'home' as ActiveTab,
      label: 'Início',
      icon: Home,
    },
    {
      id: 'challenge' as ActiveTab,
      label: 'Desafio',
      icon: LayoutGrid,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Histórico',
      icon: History,
      count: stats.completedCount > 0 ? stats.completedCount : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF7F2]/95 dark:bg-[#141013]/95 backdrop-blur-md border-t border-[#E8DFC8]/70 dark:border-[#2D2028] pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.06)] transition-colors">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all group relative active:scale-95 ${
                isActive
                  ? 'text-[#8B263E] dark:text-[#E8738B]'
                  : 'text-[#85746A] dark:text-[#9A8780] hover:text-[#524138] dark:hover:text-[#E8DCD5]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#8B263E] dark:bg-[#C23E5D] text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 transition-all ${
                  isActive
                    ? 'font-bold text-[#8B263E] dark:text-[#E8738B]'
                    : 'font-medium'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 rounded-full bg-[#8B263E] dark:bg-[#E8738B]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
