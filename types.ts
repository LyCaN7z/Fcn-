
export type TransactionType = 'income' | 'expense';

export enum Category {
  ScrimPrize = 'Scrim Prize',
  ScrimFee = 'Scrim Fee',
  Founder = 'Founder Deposit',
  Donation = 'Donation',
  Tournament = 'Tournament prize',
  Other = 'Other'
}

export type Squad = 'Alpha' | 'Bravo' | 'Charlie' | 'Delta' | 'General';

export interface Transaction {
  id: string;
  date: string;
  category: Category;
  amount: number;
  note: string;
  type: TransactionType;
  squad: Squad;
}

export interface Quest {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline?: string;
}

export interface Member {
  id: string;
  ign: string;
  role: string;
  squad: Squad;
  hasPaidMonthly: boolean;
}

export interface TacticalNote {
  id: string;
  title: string;
  content: string;
}

export interface TournamentOp {
  id: string;
  name: string;
  date: string;
  time: string;
  entryFee: number;
  prizePool: string;
  status: 'Upcoming' | 'Finished' | 'Cancelled';
}

export interface SplitResult {
  total: number;
  clanShare: number;
  playerPool: number;
  perPlayer: number;
}
