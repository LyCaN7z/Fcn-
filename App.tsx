
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, Category, TransactionType, Squad, Quest, TournamentOp, Member, TacticalNote } from './types';
import { storage } from './services/storage';
import { getFinancialInsights, scanScrimResult } from './services/geminiService';
import { 
  Plus, 
  LayoutDashboard, 
  Swords, 
  BrainCircuit,
  Wallet,
  Database,
  FileText,
  Target,
  Camera,
  Trophy,
  Users,
  Loader2,
  Trash2,
  CheckCircle2,
  Circle,
  StickyNote,
  ChevronRight,
  ShieldCheck,
  Download,
  Smartphone,
  UploadCloud,
  X
} from 'lucide-react';
import TransactionItem from './components/TransactionItem';
import Charts from './components/Charts';
import PrizeSplitter from './components/PrizeSplitter';
import SummaryReport from './components/SummaryReport';

const SQUADS: Squad[] = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'General'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'warroom' | 'personnel' | 'tools'>('ledger');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [tournaments, setTournaments] = useState<TournamentOp[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [notes, setNotes] = useState<TacticalNote[]>([]);
  const [clanLogo, setClanLogo] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  const [filterSquad, setFilterSquad] = useState<Squad | 'All'>('All');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // PWA Install Prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  
  const scannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [newType, setNewType] = useState<TransactionType>('expense');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  const [newCat, setNewCat] = useState<Category>(Category.ScrimFee);
  const [newSquad, setNewSquad] = useState<Squad>('General');

  useEffect(() => {
    setTransactions(storage.getTransactions());
    setQuests(storage.getQuests());
    setTournaments(storage.getTournaments());
    setMembers(storage.getMembers());
    setNotes(storage.getNotes());
    setClanLogo(storage.getLogo());

    // Listen for PWA install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const totals = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amt = Number(t.amount);
      if (t.type === 'income') acc.income += amt;
      else acc.expense += amt;
      acc.balance = acc.income - acc.expense;
      return acc;
    }, { income: 0, expense: 0, balance: 0 });
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => (filterSquad === 'All' || t.squad === filterSquad))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterSquad]);

  const fetchAiInsights = async () => {
    if (isLoadingAi || transactions.length === 0) return;
    setIsLoadingAi(true);
    try {
      const insights = await getFinancialInsights(transactions);
      setAiInsights(insights);
    } catch (err) {
      setAiInsights("Tactical intel sync failed.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await scanScrimResult(base64);
      if (result) {
        setNewAmount(result.estimatedPrize?.toString() || '');
        setNewNote(`${result.rank || 'Rank'} - ${result.kills || 0} Kills: ${result.note || ''}`);
        setNewType('income');
        setNewCat(Category.ScrimPrize);
        setIsScannerOpen(false);
        setIsModalOpen(true);
      }
    } catch (error) {
      alert("Intelligence scan failed.");
    } finally {
      setIsScanning(false);
      if (scannerInputRef.current) scannerInputRef.current.value = '';
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setClanLogo(base64);
      storage.saveLogo(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallBanner(false);
    }
  };

  const handleAddTransaction = () => {
    if (!newAmount || !newNote) return alert('Fill details squad!');
    const trans: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: Number(newAmount),
      note: newNote,
      category: newCat,
      type: newType,
      squad: newSquad
    };
    const updated = [trans, ...transactions];
    setTransactions(updated);
    storage.saveTransactions(updated);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewAmount(''); setNewNote(''); setNewType('expense'); setNewSquad('General');
  };

  const toggleMemberFee = (id: string) => {
    const updated = members.map(m => m.id === id ? { ...m, hasPaidMonthly: !m.hasPaidMonthly } : m);
    setMembers(updated);
    storage.saveMembers(updated);
  };

  const addMember = () => {
    const ign = prompt("Enter Member IGN:");
    if (!ign) return;
    const squad = prompt("Squad (Alpha/Bravo/Charlie/Delta):", "Alpha") as Squad;
    const newMember: Member = { id: Date.now().toString(), ign, role: 'Player', squad, hasPaidMonthly: false };
    const updated = [...members, newMember];
    setMembers(updated);
    storage.saveMembers(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-24 max-w-lg mx-auto border-x border-slate-900/50 shadow-2xl relative font-inter">
      {isSummaryOpen && <SummaryReport transactions={transactions} onClose={() => setIsSummaryOpen(false)} clanLogo={clanLogo} />}

      {/* PWA Install Banner - Prominent UI as requested */}
      {installPrompt && showInstallBanner && (
        <div className="sticky top-0 z-50 bg-amber-500 p-3 flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
             <Smartphone className="w-5 h-5 text-slate-900" />
             <p className="text-[10px] font-orbitron font-bold text-slate-950 uppercase">Install Tactical App for best experience</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleInstall} className="bg-slate-950 text-white px-4 py-1.5 rounded-full text-[9px] font-bold uppercase font-orbitron">Install</button>
            <button onClick={() => setShowInstallBanner(false)} className="text-slate-900"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`sticky ${installPrompt && showInstallBanner ? 'top-[44px]' : 'top-0'} z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center transition-all`}>
        <div className="flex items-center gap-2">
          {clanLogo ? (
            <img src={clanLogo} alt="Logo" className="w-10 h-10 rounded-lg object-cover border border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          ) : (
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]">P</div>
          )}
          <h1 className="text-xl font-orbitron font-bold text-amber-500 tracking-tighter uppercase">Tactical Ledger</h1>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setIsScannerOpen(true)} className="p-2 text-slate-400 hover:text-emerald-400 transition-colors">
            <Camera className="w-5 h-5" />
          </button>
          <button onClick={fetchAiInsights} className="p-2 text-slate-400 hover:text-amber-400 transition-colors">
            <BrainCircuit className={`w-5 h-5 ${isLoadingAi ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {activeTab === 'ledger' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 relative overflow-hidden shadow-xl">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-20 h-20" /></div>
               <p className="text-[10px] font-orbitron text-slate-500 uppercase tracking-widest">Clan Treasury</p>
               <h2 className="text-4xl font-orbitron font-bold text-white mt-1">{totals.balance.toLocaleString()} <span className="text-xs text-amber-500">MMK</span></h2>
               <div className="flex gap-3 mt-6">
                  <div className="flex-1 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                    <p className="text-[9px] text-emerald-500 font-bold uppercase mb-1">Total Loot</p>
                    <p className="font-orbitron text-white text-sm">+{totals.income.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                    <p className="text-[9px] text-rose-500 font-bold uppercase mb-1">Operations</p>
                    <p className="font-orbitron text-white text-sm">-{totals.expense.toLocaleString()}</p>
                  </div>
               </div>
            </div>

            {aiInsights && (
              <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-3xl text-sm text-amber-200/80 font-rajdhani italic leading-relaxed animate-fade-in">
                "{aiInsights}"
              </div>
            )}

            <Charts transactions={transactions} />

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-xs font-orbitron font-bold text-slate-500 uppercase tracking-widest">Operation Logs</h3>
                <div className="flex items-center gap-1 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
                  <Users className="w-3 h-3 text-slate-500" />
                  <select value={filterSquad} onChange={e => setFilterSquad(e.target.value as any)} className="bg-transparent text-[9px] font-bold focus:outline-none text-slate-300">
                    <option value="All">All Squads</option>
                    {SQUADS.map(s => <option key={s} value={s}>Squad {s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                {filteredTransactions.map(t => <TransactionItem key={t.id} transaction={t} onDelete={(id) => {
                  const updated = transactions.filter(x => x.id !== id);
                  setTransactions(updated);
                  storage.saveTransactions(updated);
                }} />)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'warroom' && (
          <div className="animate-fade-in space-y-6">
            <section className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                   <Target className="w-5 h-5 text-rose-500" />
                   <h3 className="font-orbitron font-bold text-sm text-white uppercase">Strategic Quests</h3>
                </div>
                <button onClick={() => {
                  const name = prompt("Quest Name:");
                  const target = Number(prompt("Target Amount:"));
                  if(name && target) {
                    const newQ = [...quests, { id: Date.now().toString(), name, target, current: 0 }];
                    setQuests(newQ); storage.saveQuests(newQ);
                  }
                }} className="text-emerald-500"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                {quests.map(q => {
                  const pct = Math.min(Math.round((totals.balance / q.target) * 100), 100);
                  return (
                    <div key={q.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                       <div className="flex justify-between text-[10px] font-orbitron font-bold uppercase mb-2">
                         <span className="text-slate-300">{q.name}</span>
                         <span className={pct === 100 ? 'text-emerald-500' : 'text-amber-500'}>{pct}%</span>
                       </div>
                       <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-1000 ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }}></div>
                       </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <PrizeSplitter />
          </div>
        )}

        {activeTab === 'personnel' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-widest">Roster & Dues</h3>
                  </div>
                  <button onClick={addMember} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-emerald-500"><Plus className="w-4 h-4" /></button>
               </div>
               <div className="space-y-3">
                 {members.map(m => (
                   <div key={m.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${m.hasPaidMonthly ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">{m.ign}</p>
                          <p className="text-[9px] font-orbitron text-slate-500 uppercase">Squad {m.squad}</p>
                        </div>
                     </div>
                     <button onClick={() => toggleMemberFee(m.id)} className={`px-3 py-1.5 rounded-full text-[9px] font-orbitron font-bold uppercase transition-all ${m.hasPaidMonthly ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                       {m.hasPaidMonthly ? 'Paid' : 'Due'}
                     </button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-emerald-500" />
                <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-widest">System Management</h3>
              </div>

              {/* Clan Logo Upload */}
              <div className="space-y-3">
                <label className="text-[10px] font-orbitron text-slate-500 uppercase tracking-widest block px-2">Clan Branding</label>
                <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                <button onClick={() => logoInputRef.current?.click()} className="w-full flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl hover:border-amber-500 transition-all group">
                   <div className="flex items-center gap-4">
                      {clanLogo ? (
                        <img src={clanLogo} className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center"><UploadCloud className="w-6 h-6 text-slate-500" /></div>
                      )}
                      <div className="text-left">
                         <p className="text-xs font-bold text-slate-200 uppercase">Update Clan Logo</p>
                         <p className="text-[9px] text-slate-500 font-orbitron">SYNC BRANDING ACROSS REPORTS</p>
                      </div>
                   </div>
                   <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>

              {/* Install Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-orbitron text-slate-500 uppercase tracking-widest block px-2">Mobile Access</label>
                <button 
                  onClick={installPrompt ? handleInstall : () => alert("App already installed or not supported by browser.")} 
                  className={`w-full flex items-center gap-4 p-5 rounded-3xl font-orbitron font-bold uppercase tracking-widest transition-all ${installPrompt ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'}`}
                >
                  <Smartphone className="w-6 h-6" />
                  <span>{installPrompt ? 'Install Tactical App' : 'App Installed'}</span>
                </button>
              </div>

              <button onClick={() => setIsSummaryOpen(true)} className="w-full flex items-center justify-center gap-3 p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-amber-500 transition-all group shadow-lg">
                <FileText className="w-6 h-6 text-amber-500" />
                <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-slate-300">Export Deployment Report</span>
              </button>
              
              <button onClick={() => { if(confirm("Purge all tactical data?")) { storage.clearAll(); window.location.reload(); }}} className="w-full p-4 text-[10px] font-orbitron text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500/10 transition-all uppercase">Danger: Reset System</button>
            </div>
          </div>
        )}
      </main>

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-900 flex justify-around p-4 z-40 max-w-lg mx-auto">
        <button onClick={() => setActiveTab('ledger')} className={`flex flex-col items-center gap-1 ${activeTab === 'ledger' ? 'text-amber-500' : 'text-slate-600'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[9px] font-bold font-orbitron tracking-widest uppercase">Ledger</span>
        </button>
        <button onClick={() => setActiveTab('warroom')} className={`flex flex-col items-center gap-1 ${activeTab === 'warroom' ? 'text-amber-500' : 'text-slate-600'}`}>
          <Swords className="w-6 h-6" />
          <span className="text-[9px] font-bold font-orbitron tracking-widest uppercase">War Room</span>
        </button>
        <button onClick={() => setActiveTab('personnel')} className={`flex flex-col items-center gap-1 ${activeTab === 'personnel' ? 'text-amber-500' : 'text-slate-600'}`}>
          <Users className="w-6 h-6" />
          <span className="text-[9px] font-bold font-orbitron tracking-widest uppercase">Squad</span>
        </button>
        <button onClick={() => setActiveTab('tools')} className={`flex flex-col items-center gap-1 ${activeTab === 'tools' ? 'text-amber-500' : 'text-slate-600'}`}>
          <Database className="w-6 h-6" />
          <span className="text-[9px] font-bold font-orbitron tracking-widest uppercase">System</span>
        </button>
      </nav>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-24 right-6 w-16 h-16 bg-amber-500 text-slate-950 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center z-50 border-4 border-slate-950 active:scale-90 transition-all"><Plus className="w-8 h-8" /></button>

      {/* Modals and Scanners continue... */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8">
           <Camera className="w-16 h-16 text-emerald-500 mb-6 animate-pulse" />
           <h2 className="text-2xl font-orbitron font-bold text-white mb-2 uppercase text-center">Tactical Scanner</h2>
           <input type="file" ref={scannerInputRef} onChange={handleScan} accept="image/*" className="hidden" />
           <button onClick={() => scannerInputRef.current?.click()} className="w-full max-w-xs bg-emerald-500 text-slate-950 py-5 rounded-3xl font-orbitron font-bold uppercase tracking-widest mb-4">
             {isScanning ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Deploy Analysis"}
           </button>
           <button onClick={() => setIsScannerOpen(false)} className="text-slate-500 uppercase font-orbitron text-[10px]">Abort</button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-end justify-center">
          <div className="bg-slate-900 w-full max-w-lg rounded-t-[3rem] p-8 border-t border-slate-800 animate-fade-in shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-orbitron font-bold text-white uppercase">New Deployment</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 text-2xl">&times;</button>
             </div>
             <div className="flex bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-800">
                <button onClick={() => setNewType('income')} className={`flex-1 py-3 rounded-xl font-orbitron text-[10px] font-bold ${newType === 'income' ? 'bg-emerald-500 text-slate-950' : 'text-slate-500'}`}>INCOME</button>
                <button onClick={() => setNewType('expense')} className={`flex-1 py-3 rounded-xl font-orbitron text-[10px] font-bold ${newType === 'expense' ? 'bg-rose-500 text-slate-950' : 'text-slate-500'}`}>EXPENSE</button>
             </div>
             <div className="space-y-4">
                <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0 MMK" className="w-full bg-transparent border-b border-slate-800 py-4 text-4xl font-orbitron font-bold text-white focus:outline-none focus:border-amber-500" />
                <div className="grid grid-cols-2 gap-4">
                  <select value={newSquad} onChange={e => setNewSquad(e.target.value as Squad)} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-slate-300 font-orbitron text-xs">
                    {SQUADS.map(s => <option key={s} value={s}>Squad {s}</option>)}
                  </select>
                  <select value={newCat} onChange={e => setNewCat(e.target.value as Category)} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-slate-300 font-orbitron text-xs">
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Tactical Note..." className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-slate-300 text-sm focus:outline-none" />
                <button onClick={handleAddTransaction} className="w-full bg-amber-500 text-slate-950 py-5 rounded-3xl font-orbitron font-bold uppercase tracking-widest">Execute Entry</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
