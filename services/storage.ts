
import { Transaction, Quest, TournamentOp, Member, TacticalNote } from '../types';

const TRANSACTIONS_KEY = 'pubg_clan_v5_transactions';
const QUESTS_KEY = 'pubg_clan_v5_quests';
const TOURNAMENTS_KEY = 'pubg_clan_v5_tournaments';
const MEMBERS_KEY = 'pubg_clan_v5_members';
const NOTES_KEY = 'pubg_clan_v5_notes';
const LOGO_KEY = 'pubg_clan_v5_logo';

export const storage = {
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (data: Transaction[]) => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data));
  },
  getQuests: (): Quest[] => {
    const data = localStorage.getItem(QUESTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveQuests: (data: Quest[]) => {
    localStorage.setItem(QUESTS_KEY, JSON.stringify(data));
  },
  getTournaments: (): TournamentOp[] => {
    const data = localStorage.getItem(TOURNAMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveTournaments: (data: TournamentOp[]) => {
    localStorage.setItem(TOURNAMENTS_KEY, JSON.stringify(data));
  },
  getMembers: (): Member[] => {
    const data = localStorage.getItem(MEMBERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveMembers: (data: Member[]) => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(data));
  },
  getNotes: (): TacticalNote[] => {
    const data = localStorage.getItem(NOTES_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveNotes: (data: TacticalNote[]) => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(data));
  },
  getLogo: (): string | null => {
    return localStorage.getItem(LOGO_KEY);
  },
  saveLogo: (base64: string) => {
    localStorage.setItem(LOGO_KEY, base64);
  },
  clearAll: () => {
    localStorage.clear();
  }
};
