export type PartnerId = 'partner1' | 'partner2';

export interface Challenge {
  id: string;
  title: string;
  targetAmount: number;
  partner1Name: string;
  partner2Name: string;
  partner1Uid?: string;
  partner2Uid?: string;
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deposit {
  number: number;
  amount: number;
  depositedBy: PartnerId;
  depositedByName: string;
  depositDate: string; // YYYY-MM-DD
  notes?: string;
  challengeId: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChallengeStats {
  totalSaved: number;
  totalGoal: number;
  remainingAmount: number;
  percentCompleted: number;
  completedCount: number;
  remainingCount: number;
  partner1Saved: number;
  partner1Count: number;
  partner1PercentOfGoal: number;
  partner1ShareOfSaved: number;
  partner2Saved: number;
  partner2Count: number;
  partner2PercentOfGoal: number;
  partner2ShareOfSaved: number;
}

export type ActiveTab = 'home' | 'challenge' | 'history';

export type FilterType = 'all' | 'available' | 'partner1' | 'partner2';
