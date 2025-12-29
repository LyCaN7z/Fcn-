
import React, { useRef, useState } from 'react';
import { Transaction } from '../types';
import { X, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Props {
  transactions: Transaction[];
  onClose: () => void;
  clanLogo: string | null;
}

const SummaryReport: React.FC<Props> = ({ transactions, onClose, clanLogo }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const incomes = transactions
    .filter(t => t.type === 'income')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const now = new Date();
  const timestamp = `${now.toLocaleDateString()}, ${now.toLocaleTimeString()}`;

  const handleSaveAsImage = async () => {
    if (!reportRef.current) return;
    
    try {
      setIsExporting(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = image;
      link.download = `PUBG_Tactical_Ledger_${now.getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to save image.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center p-4 overflow-y-auto font-inter">
      <div className="w-full max-w-2xl flex justify-between gap-2 mb-4 sticky top-0 bg-slate-950/80 backdrop-blur py-2 z-10">
        <button 
          onClick={onClose}
          className="p-2 bg-slate-900 rounded-full text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex gap-2">
          <button 
            disabled={isExporting}
            onClick={handleSaveAsImage}
            className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl flex items-center gap-2 font-orbitron text-xs disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            SAVE AS IMAGE
          </button>
          
          <button 
            disabled={isExporting}
            onClick={() => window.print()}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-2 font-orbitron text-xs"
          >
            <Download className="w-4 h-4" /> PRINT
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white p-2 shadow-2xl rounded-lg">
        <div 
          ref={reportRef} 
          className="bg-white text-slate-900 p-10 font-mono-report border border-slate-200 min-h-[900px]"
        >
          <div className="flex flex-col items-center text-center mb-10">
            {clanLogo && (
              <img src={clanLogo} alt="Clan Logo" className="w-20 h-20 object-cover rounded-xl mb-4 border-2 border-slate-950" />
            )}
            <h1 className="text-3xl font-bold tracking-[0.2em] mb-2 uppercase">Tactical Deployment Report</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{timestamp}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t-2 border-slate-950 pt-6">
            <div>
              <p className="font-bold text-xs mb-2 uppercase border-b-2 border-slate-900 pb-1">Incoming Loot</p>
              <div className="space-y-4">
                {incomes.map(t => (
                  <div key={t.id} className="text-[10px] border-b border-slate-100 pb-2">
                    <div className="flex justify-between font-bold mb-1">
                      <span>{t.date}</span>
                      <span>{t.amount.toLocaleString()}</span>
                    </div>
                    <div className="uppercase opacity-70">{t.note} ({t.squad})</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-l border-slate-200 pl-8">
              <p className="font-bold text-xs mb-2 uppercase border-b-2 border-slate-900 pb-1">Outbound Ops</p>
              <div className="space-y-4">
                {expenses.map(t => (
                  <div key={t.id} className="text-[10px] border-b border-slate-100 pb-2">
                    <div className="flex justify-between font-bold mb-1">
                      <span>{t.date}</span>
                      <span>{t.amount.toLocaleString()}</span>
                    </div>
                    <div className="uppercase opacity-70">{t.note} ({t.squad})</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t-4 border-slate-950">
            <div className="grid grid-cols-2 gap-10 text-center">
              <div>
                <p className="text-[9px] font-bold uppercase mb-1">Total Loot</p>
                <p className="text-3xl font-bold">{totalIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase mb-1">Total Expenses</p>
                <p className="text-3xl font-bold">{totalExpense.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-16 text-center border-y py-4 border-slate-100">
               <p className="text-sm font-bold uppercase">Net Treasury: {(totalIncome - totalExpense).toLocaleString()} MMK</p>
            </div>
            
            <div className="mt-24 text-center opacity-30">
              <p className="text-[8px] italic font-bold uppercase tracking-widest">End of Intelligence Report</p>
            </div>
          </div>
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default SummaryReport;
