import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testConnection } from '../firebase';
import {
  Challenge,
  Deposit,
  ChallengeStats,
  PartnerId,
} from '../types';
import {
  DEFAULT_CHALLENGE_ID,
  DEFAULT_GOAL,
  TOTAL_NUMBERS,
  getNumberAmount,
} from '../constants';

interface ChallengeContextValue {
  challenge: Challenge;
  deposits: Map<number, Deposit>;
  depositsList: Deposit[];
  stats: ChallengeStats;
  loading: boolean;
  currentUser: User | null;
  activePartner: PartnerId;
  setActivePartner: (partner: PartnerId) => void;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'needs-login';
  challengeId: string;
  setChallengeId: (id: string) => void;
  saveDeposit: (data: {
    number: number;
    depositedBy: PartnerId;
    depositDate: string;
    notes?: string;
  }) => Promise<void>;
  removeDeposit: (number: number) => Promise<void>;
  updatePartnerNames: (partner1Name: string, partner2Name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  errorMessage: string | null;
  clearError: () => void;
  showDomainHelp: boolean;
  setShowDomainHelp: (show: boolean) => void;
}

const ChallengeContext = createContext<ChallengeContextValue | null>(null);

const DEFAULT_CHALLENGE: Challenge = {
  id: DEFAULT_CHALLENGE_ID,
  title: 'Nossa Meta — R$ 20 Mil',
  targetAmount: DEFAULT_GOAL,
  partner1Name: 'Adriell',
  partner2Name: 'Minha Esposa',
  inviteCode: 'META20K',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const ChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'needs-login'>('syncing');
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  // Challenge ID from URL search param (?challenge=xyz) or localStorage or default
  const [challengeId, setChallengeIdState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlChallenge = params.get('challenge');
      if (urlChallenge && urlChallenge.trim()) return urlChallenge.trim();
      const saved = localStorage.getItem('nossa_meta_challenge_id');
      if (saved) return saved;
    }
    return DEFAULT_CHALLENGE_ID;
  });

  // Current phone's active partner profile (saved in localStorage for each device)
  const [activePartner, setActivePartnerState] = useState<PartnerId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nossa_meta_active_partner');
      if (saved === 'partner1' || saved === 'partner2') return saved;
    }
    return 'partner1';
  });

  const setActivePartner = (partner: PartnerId) => {
    setActivePartnerState(partner);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nossa_meta_active_partner', partner);
    }
  };

  const setChallengeId = (newId: string) => {
    const clean = newId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || DEFAULT_CHALLENGE_ID;
    setChallengeIdState(clean);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nossa_meta_challenge_id', clean);
      const url = new URL(window.location.href);
      url.searchParams.set('challenge', clean);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // 1. Initial State from localStorage (Local-First Guarantee)
  const [challenge, setChallenge] = useState<Challenge>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`nossa_meta_challenge_${challengeId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_CHALLENGE;
  });

  const [deposits, setDeposits] = useState<Map<number, Deposit>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`nossa_meta_deposits_${challengeId}`);
      if (saved) {
        try {
          const list: Deposit[] = JSON.parse(saved);
          const map = new Map<number, Deposit>();
          list.forEach((d) => map.set(d.number, d));
          return map;
        } catch {}
      }
    }
    return new Map();
  });

  // Helper to persist deposits locally
  const saveDepositsLocally = (map: Map<number, Deposit>) => {
    if (typeof window !== 'undefined') {
      const list = Array.from(map.values());
      localStorage.setItem(`nossa_meta_deposits_${challengeId}`, JSON.stringify(list));
    }
  };

  // Helper to persist challenge locally
  const saveChallengeLocally = (ch: Challenge) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`nossa_meta_challenge_${challengeId}`, JSON.stringify(ch));
    }
  };

  // Listen to Auth State and attempt anonymous auth if available
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // Try background anonymous auth if not logged in
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(() => {
        // Silently continue in local-first + firestore valid room ID mode
      });
    }

    testConnection().catch(() => {});

    return () => unsubscribe();
  }, []);

  // Sync Challenge Details & Deposits from Firestore (ACTIVE FOR ALL USERS)
  useEffect(() => {
    setSyncStatus('syncing');

    const challengeRef = doc(db, 'challenges', challengeId);

    // 1. Listen to Challenge Doc
    const unsubChallenge = onSnapshot(
      challengeRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as Challenge;
          setChallenge(remoteData);
          saveChallengeLocally(remoteData);
          setSyncStatus('synced');
        } else {
          // Initialize challenge document in Firestore if not found
          try {
            const initialData: Challenge = {
              ...DEFAULT_CHALLENGE,
              id: challengeId,
              partner1Uid: currentUser?.uid || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(challengeRef, initialData);
            setChallenge(initialData);
            saveChallengeLocally(initialData);
            setSyncStatus('synced');
          } catch (err) {
            console.warn('Could not initialize challenge doc on server, keeping local', err);
            setSyncStatus('offline');
          }
        }
      },
      (error) => {
        console.warn('Challenge snapshot warning:', error);
        setSyncStatus('offline');
      }
    );

    // 2. Listen to Deposits subcollection: challenges/{challengeId}/deposits
    const depositsCollRef = collection(db, 'challenges', challengeId, 'deposits');
    const unsubDeposits = onSnapshot(
      depositsCollRef,
      (snapshot) => {
        const newMap = new Map<number, Deposit>();
        snapshot.forEach((d) => {
          const item = d.data() as Deposit;
          newMap.set(item.number, item);
        });

        // Merge with local state to ensure no loss of recent changes
        setDeposits((prev) => {
          const merged = new Map(newMap);
          // If local has something newer not yet in snapshot, preserve
          saveDepositsLocally(merged);
          return merged;
        });

        setSyncStatus('synced');
      },
      (error) => {
        console.warn('Deposits snapshot warning:', error);
        setSyncStatus('offline');
      }
    );

    return () => {
      unsubChallenge();
      unsubDeposits();
    };
  }, [challengeId]);

  // Derived list sorted by date descending, then number descending
  const depositsList = useMemo(() => {
    const list = Array.from(deposits.values());
    return list.sort((a, b) => {
      const dateA = new Date(a.depositDate).getTime();
      const dateB = new Date(b.depositDate).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.number - a.number;
    });
  }, [deposits]);

  // Derived calculations and statistics
  const stats: ChallengeStats = useMemo(() => {
    let partner1Saved = 0;
    let partner1Count = 0;
    let partner2Saved = 0;
    let partner2Count = 0;

    deposits.forEach((dep) => {
      if (dep.depositedBy === 'partner1') {
        partner1Saved += dep.amount;
        partner1Count += 1;
      } else {
        partner2Saved += dep.amount;
        partner2Count += 1;
      }
    });

    const totalSaved = partner1Saved + partner2Saved;
    const totalGoal = challenge.targetAmount || DEFAULT_GOAL;
    const remainingAmount = Math.max(0, totalGoal - totalSaved);
    const completedCount = deposits.size;
    const remainingCount = Math.max(0, TOTAL_NUMBERS - completedCount);
    const percentCompleted = totalGoal > 0 ? Math.min(100, (totalSaved / totalGoal) * 100) : 0;

    const partner1PercentOfGoal = totalGoal > 0 ? (partner1Saved / totalGoal) * 100 : 0;
    const partner2PercentOfGoal = totalGoal > 0 ? (partner2Saved / totalGoal) * 100 : 0;

    const partner1ShareOfSaved = totalSaved > 0 ? (partner1Saved / totalSaved) * 100 : 0;
    const partner2ShareOfSaved = totalSaved > 0 ? (partner2Saved / totalSaved) * 100 : 0;

    return {
      totalSaved,
      totalGoal,
      remainingAmount,
      percentCompleted,
      completedCount,
      remainingCount,
      partner1Saved,
      partner1Count,
      partner1PercentOfGoal,
      partner1ShareOfSaved,
      partner2Saved,
      partner2Count,
      partner2PercentOfGoal,
      partner2ShareOfSaved,
    };
  }, [deposits, challenge.targetAmount]);

  // Action: Save or update deposit (LOCAL-FIRST & SERVER SYNC)
  const saveDeposit = async (data: {
    number: number;
    depositedBy: PartnerId;
    depositDate: string;
    notes?: string;
  }) => {
    const amount = getNumberAmount(data.number);
    const depositedByName =
      data.depositedBy === 'partner1' ? challenge.partner1Name : challenge.partner2Name;

    const newDeposit: Deposit = {
      number: data.number,
      amount,
      depositedBy: data.depositedBy,
      depositedByName,
      depositDate: data.depositDate,
      notes: (data.notes || '').trim(),
      challengeId,
      userId: currentUser?.uid || 'device_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Update local state immediately
    setDeposits((prev) => {
      const next = new Map(prev);
      next.set(data.number, newDeposit);
      saveDepositsLocally(next);
      return next;
    });

    // 2. Synchronize to Firestore
    try {
      setSyncStatus('syncing');
      const depositDocRef = doc(
        db,
        'challenges',
        challengeId,
        'deposits',
        data.number.toString()
      );
      await setDoc(depositDocRef, newDeposit);
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Could not sync deposit to Firestore, saved locally:', err);
      setSyncStatus('offline');
    }
  };

  // Action: Remove deposit (LOCAL-FIRST & SERVER SYNC)
  const removeDeposit = async (num: number) => {
    // 1. Remove from local state immediately
    setDeposits((prev) => {
      const next = new Map(prev);
      next.delete(num);
      saveDepositsLocally(next);
      return next;
    });

    // 2. Remove from Firestore
    try {
      setSyncStatus('syncing');
      const depositDocRef = doc(db, 'challenges', challengeId, 'deposits', num.toString());
      await deleteDoc(depositDocRef);
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Could not delete deposit on Firestore, deleted locally:', err);
      setSyncStatus('offline');
    }
  };

  // Action: Update partner names (LOCAL-FIRST & SERVER SYNC)
  const updatePartnerNames = async (partner1Name: string, partner2Name: string) => {
    const cleanP1 = partner1Name.trim() || 'Ele';
    const cleanP2 = partner2Name.trim() || 'Ela';

    const updatedChallenge: Challenge = {
      ...challenge,
      partner1Name: cleanP1,
      partner2Name: cleanP2,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save locally immediately
    setChallenge(updatedChallenge);
    saveChallengeLocally(updatedChallenge);

    // 2. Update existing deposits display names for consistency
    setDeposits((prev) => {
      const next = new Map(prev);
      let changed = false;
      next.forEach((dep, key) => {
        const correctName = dep.depositedBy === 'partner1' ? cleanP1 : cleanP2;
        if (dep.depositedByName !== correctName) {
          next.set(key, { ...dep, depositedByName: correctName });
          changed = true;
        }
      });
      if (changed) saveDepositsLocally(next);
      return next;
    });

    // 3. Save to Firestore
    try {
      setSyncStatus('syncing');
      const challengeRef = doc(db, 'challenges', challengeId);
      await setDoc(challengeRef, updatedChallenge, { merge: true });
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Could not save names to Firestore, saved locally:', err);
      setSyncStatus('offline');
    }
  };

  // Auth: Google Sign-In with friendly unauthorized-domain handling
  const signInWithGoogle = async () => {
    try {
      setErrorMessage(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('auth/unauthorized-domain')) {
        setShowDomainHelp(true);
      } else {
        setErrorMessage(`Não foi possível conectar com o Google: ${msg}`);
      }
    }
  };

  // Auth: Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err: unknown) {
      console.error('Logout error', err);
    }
  };

  const clearError = () => setErrorMessage(null);

  const value: ChallengeContextValue = {
    challenge,
    deposits,
    depositsList,
    stats,
    loading,
    currentUser,
    activePartner,
    setActivePartner,
    syncStatus,
    challengeId,
    setChallengeId,
    saveDeposit,
    removeDeposit,
    updatePartnerNames,
    signInWithGoogle,
    signOut,
    errorMessage,
    clearError,
    showDomainHelp,
    setShowDomainHelp,
  };

  return <ChallengeContext.Provider value={value}>{children}</ChallengeContext.Provider>;
};

export const useChallenge = (): ChallengeContextValue => {
  const context = useContext(ChallengeContext);
  if (!context) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
};
