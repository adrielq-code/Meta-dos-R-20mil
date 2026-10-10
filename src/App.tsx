/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChallengeProvider, useChallenge } from './context/ChallengeContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { ChallengeScreen } from './components/ChallengeScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { DepositModal } from './components/DepositModal';
import { CoupleSettingsModal } from './components/CoupleSettingsModal';
import { GoalCelebrationModal } from './components/GoalCelebrationModal';
import { MilestoneToast, MilestoneInfo } from './components/MilestoneToast';
import { ActiveTab } from './types';
import { AlertCircle, X } from 'lucide-react';

function MainApp() {
  const { deposits, stats, errorMessage, clearError } = useChallenge();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [hasCelebratedGoal, setHasCelebratedGoal] = useState(false);

  // Intermediate Milestones Tracking
  const [activeMilestone, setActiveMilestone] = useState<MilestoneInfo | null>(null);
  const celebratedMilestonesRef = useRef<Set<number>>(new Set());

  // Load previously celebrated milestones from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nossa_meta_celebrated_milestones');
      if (saved) {
        const arr = JSON.parse(saved);
        celebratedMilestonesRef.current = new Set(arr);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Monitor progress for intermediate milestones (25%, 50%, 75%, 90%) and final 100%
  useEffect(() => {
    const percent = stats.percentCompleted;

    // Check intermediate milestones
    const milestonesToCheck = [
      {
        threshold: 25,
        title: 'Primeiro Quarto da Meta!',
        message: 'A constância de vocês é linda. 25% da meta já é realidade!',
        amount: 5000,
      },
      {
        threshold: 50,
        title: 'Metade do Desafio Conquistada!',
        message: 'R$ 10.000 guardados! O casal está imparável na economia.',
        amount: 10000,
      },
      {
        threshold: 75,
        title: 'Reta Final dos R$ 20 Mil!',
        message: '3/4 do caminho percorrido. Falta muito pouco para o grande sonho!',
        amount: 15000,
      },
      {
        threshold: 90,
        title: 'Quase Lá! 90% da Meta!',
        message: 'R$ 18.000 acumulados! Contagem regressiva para a celebração total.',
        amount: 18000,
      },
    ];

    if (percent >= 100 && !hasCelebratedGoal) {
      setIsCelebrationOpen(true);
      setHasCelebratedGoal(true);
      return;
    }

    for (const m of milestonesToCheck) {
      if (percent >= m.threshold && !celebratedMilestonesRef.current.has(m.threshold)) {
        celebratedMilestonesRef.current.add(m.threshold);
        try {
          localStorage.setItem(
            'nossa_meta_celebrated_milestones',
            JSON.stringify(Array.from(celebratedMilestonesRef.current))
          );
        } catch {
          // Ignore storage quota
        }

        setActiveMilestone({
          percent: m.threshold,
          amount: m.amount,
          title: m.title,
          message: m.message,
        });
        break;
      }
    }
  }, [stats.percentCompleted, hasCelebratedGoal]);

  // Quick action from home: find lowest available number or switch tab
  const handleOpenNextDeposit = () => {
    for (let i = 1; i <= 200; i++) {
      if (!deposits.has(i)) {
        setSelectedNumber(i);
        return;
      }
    }
    setActiveTab('challenge');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#141013] text-[#2C221E] dark:text-[#F5EBE6] flex flex-col font-sans selection:bg-[#E8C5B8] selection:text-[#501A24] dark:selection:bg-[#C23E5D]/30 dark:selection:text-[#FFA08B] transition-colors">
      {/* Header with Dark Mode Toggle */}
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Intermediate Milestone Celebratory Banner */}
      <MilestoneToast
        milestone={activeMilestone}
        onDismiss={() => setActiveMilestone(null)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-8">
        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-center justify-between text-xs text-red-800 dark:text-red-300 shadow-sm animate-pop">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={clearError}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg text-red-600 dark:text-red-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'home' && (
          <HomeScreen
            onGoToChallenge={() => setActiveTab('challenge')}
            onOpenDepositModal={handleOpenNextDeposit}
          />
        )}

        {activeTab === 'challenge' && (
          <ChallengeScreen onSelectNumber={(num) => setSelectedNumber(num)} />
        )}

        {activeTab === 'history' && (
          <HistoryScreen onEditDeposit={(num) => setSelectedNumber(num)} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Modals */}
      <DepositModal
        number={selectedNumber}
        onClose={() => setSelectedNumber(null)}
      />

      {isSettingsOpen && (
        <CoupleSettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {isCelebrationOpen && (
        <GoalCelebrationModal onClose={() => setIsCelebrationOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ChallengeProvider>
        <MainApp />
      </ChallengeProvider>
    </ThemeProvider>
  );
}
