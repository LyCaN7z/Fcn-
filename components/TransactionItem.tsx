
import React from 'react';
import { Transaction, Category } from '../types';
import { TrendingUp, TrendingDown, Shield, Trophy, Gift, CreditCard, Trash2, Swords } from 'lucide-react';

interface Props {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const TransactionItem: React.FC<Props> = ({ transaction, onDelete }) => {
  const isIncome = transaction.type === 'income';
  const isFounder = transaction.category === Category.Founder;
  const isScrim = transaction.category === Category.ScrimPrize || transaction.category === Category.ScrimFee;

  const getIcon = () => {
    switch (transaction.category) {
      case Category.ScrimPrize:
      case Category.Tournament:
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case Category.ScrimFee:
        return <Swords className="w-5 h-5 text-rose-500" />;
      // Fix: Property 'Fee' does not exist on type 'typeof Category'. Changing to Category.Other.
      case Category.Other:
        return <CreditCard className="w-5 h-5 text-slate-400" />;
      case Category.Founder:
        return <Shield className="w-5 h-5 text-emerald-500" />;
      case Category.Donation:
        return <Gift className="w-5 h-5 text-purple-400" />;
      default:
        return isIncome ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-rose-500" />;
    }
  };

  // Format date to show Month/Day clearly
  const dateObj = new Date(transaction.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('default', { month: 'short' });

  return (
    <div className={`group relative flex items-center p-4 bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/50 transition-all duration-300 rounded-[1.5rem] mb-2 backdrop-blur-sm ${
      isFounder ? 'ring-1 ring-emerald-500/20 bg-emerald-500/5' : ''
    }`}>
      {/* Date Indicator */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-10 mr-3 border-r border-slate-800 pr-3">
        <span className="text-[10px] font-orbitron font-bold text-slate-500 uppercase">{month}</span>
        <span className="text-lg font-orbitron font-bold text-slate-200 leading-none">{day}</span>
      </div>

      <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-800 shadow-xl">
        {getIcon()}
      </div>
      
      <div className="ml-4 flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="truncate">
            <h4 className="font-bold text-slate-200 text-sm truncate uppercase tracking-tighter">
              {transaction.note}
            </h4>
            <div className="flex items-center gap-1.5">
               <span className={`text-[9px] font-orbitron font-bold px-1.5 py-0.5 rounded uppercase border ${
                 isIncome ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'
               }`}>
                {transaction.category}
              </span>
            </div>
          </div>
          <div className="text-right ml-2">
            <span className={`font-orbitron font-bold text-sm ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isIncome ? '+' : '-'}{transaction.amount.toLocaleString()}
            </span>
            <p className="text-[8px] text-slate-500 font-orbitron">MMK</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onDelete(transaction.id)}
        className="ml-3 p-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 transition-all rounded-xl"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TransactionItem;
