import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
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
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'needs-login'>('syncing');

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

  const [challenge, setChallenge] = useState<Challenge>(DEFAULT_CHALLENGE);
  const [deposits, setDeposits] = useState<Map<number, Deposit>>(new Map());

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setSyncStatus('needs-login');
      }
    });

    testConnection().catch(() => {
      console.warn('Initial server connection test failed');
    });

    return () => unsubscribe();
  }, []);

  // Sync Challenge Details & Deposits from Firestore
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setSyncStatus('needs-login');
      return;
    }

    setSyncStatus('syncing');
    setLoading(true);

    const challengeRef = doc(db, 'challenges', challengeId);

    // 1. Listen to Challenge Doc
    const unsubChallenge = onSnapshot(
      challengeRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          setChallenge(snapshot.data() as Challenge);
        } else {
          // Initialize challenge document if not found
          try {
            const initialData: Challenge = {
              ...DEFAULT_CHALLENGE,
              id: challengeId,
              partner1Uid: currentUser.uid,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(challengeRef, initialData);
            setChallenge(initialData);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `challenges/${challengeId}`);
          }
        }
      },
      (error) => {
        console.error('Challenge snapshot error', error);
        setSyncStatus('offline');
        handleFirestoreError(error, OperationType.GET, `challenges/${challengeId}`);
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
        setDeposits(newMap);
        setSyncStatus('synced');
        setLoading(false);
      },
      (error) => {
        console.error('Deposits snapshot error', error);
        setSyncStatus('offline');
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, `challenges/${challengeId}/deposits`);
      }
    );

    return () => {
      unsubChallenge();
      unsubDeposits();
    };
  }, [challengeId, currentUser]);

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

  // Action: Save or update deposit
  const saveDeposit = async (data: {
    number: number;
    depositedBy: PartnerId;
    depositDate: string;
    notes?: string;
  }) => {
    if (!currentUser) {
      setErrorMessage('Por favor, faça login com sua conta Google para sincronizar os depósitos.');
      return;
    }

    try {
      setSyncStatus('syncing');
      const amount = getNumberAmount(data.number);
      const depositedByName =
        data.depositedBy === 'partner1' ? challenge.partner1Name : challenge.partner2Name;

      const depositDocRef = doc(
        db,
        'challenges',
        challengeId,
        'deposits',
        data.number.toString()
      );

      const existingSnap = await getDoc(depositDocRef);
      const createdAt = existingSnap.exists()
        ? (existingSnap.data() as Deposit).createdAt
        : new Date().toISOString();

      const newDeposit: Deposit = {
        number: data.number,
        amount,
        depositedBy: data.depositedBy,
        depositedByName,
        depositDate: data.depositDate,
        notes: (data.notes || '').trim(),
        challengeId,
        userId: currentUser.uid,
        createdAt,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(depositDocRef, newDeposit);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error saving deposit:', err);
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `challenges/${challengeId}/deposits/${data.number}`
      );
    }
  };

  // Action: Remove deposit
  const removeDeposit = async (num: number) => {
    if (!currentUser) {
      setErrorMessage('Por favor, faça login com sua conta Google para remover depósitos.');
      return;
    }

    try {
      setSyncStatus('syncing');
      const depositDocRef = doc(db, 'challenges', challengeId, 'deposits', num.toString());
      await deleteDoc(depositDocRef);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Error removing deposit:', err);
      handleFirestoreError(
        err,
        OperationType.DELETE,
        `challenges/${challengeId}/deposits/${num}`
      );
    }
  };

  // Action: Update partner names and challenge settings
  const updatePartnerNames = async (partner1Name: string, partner2Name: string) => {
    if (!currentUser) {
      setErrorMessage('Faça login para salvar as configurações.');
      return;
    }

    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      const updatedData: Partial<Challenge> = {
        partner1Name: partner1Name.trim() || 'Ele',
        partner2Name: partner2Name.trim() || 'Ela',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(challengeRef, updatedData, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `challenges/${challengeId}`);
    }
  };

  // Auth: Google Sign-In
  const signInWithGoogle = async () => {
    try {
      setErrorMessage(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      console.error('Login error', err);
      const msg = err instanceof Error ? err.message : 'Falha no login com Google';
      setErrorMessage(`Erro ao conectar com Google: ${msg}`);
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
