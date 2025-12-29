
import React, { useState } from 'react';
import { Users, Percent, Coins, Calculator, Copy, Check } from 'lucide-react';

const PrizeSplitter: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [players, setPlayers] = useState<number>(5);
  const [clanPct, setClanPct] = useState<number>(20);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const calculate = () => {
    if (amount <= 0 || players <= 0) return;
    const clanShare = Math.floor(amount * (clanPct / 100));
    const playerPool = amount - clanShare;
    const perPlayer = Math.floor(playerPool / players);
    setResult({ clanShare, playerPool, perPlayer });
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `🏆 PUBG PRIZE SPLIT 🏆\n--------------------\n💰 Total: ${amount.toLocaleString()} MMK\n🛡️ Clan Fund (${clanPct}%): ${result.clanShare.toLocaleString()} MMK\n👥 Player Pool: ${result.playerPool.toLocaleString()} MMK\n🔥 Per Player (${players}): ${result.perPlayer.toLocaleString()} MMK\n--------------------`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-8 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 bg-amber-500/10 rounded-xl">
          <Coins className="w-5 h-5 text-amber-500" />
        </div>
        <h3 className="font-orbitron font-bold text-lg text-white uppercase tracking-tighter">Prize Splitter</h3>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-[10px] text-slate-500 font-orbitron uppercase mb-2 block tracking-widest">Total Prize (MMK)</label>
          <input 
            type="number" 
            value={amount || ''} 
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-emerald-400 font-orbitron font-bold text-xl focus:outline-none focus:border-emerald-500 transition-all"
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-slate-500 font-orbitron uppercase mb-2 block flex items-center gap-1">
              <Users className="w-3 h-3" /> Players
            </label>
            <input 
              type="number" 
              value={players} 
              onChange={e => setPlayers(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 font-bold focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-orbitron uppercase mb-2 block flex items-center gap-1">
              <Percent className="w-3 h-3" /> Clan Fee
            </label>
            <input 
              type="number" 
              value={clanPct} 
              onChange={e => setClanPct(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 font-bold focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <button 
          onClick={calculate}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-5 rounded-3xl flex items-center justify-center gap-2 transition-all font-orbitron uppercase tracking-widest shadow-lg shadow-amber-500/10 active:scale-95"
        >
          <Calculator className="w-5 h-5" /> Run Calculation
        </button>

        {result && (
          <div className="mt-6 p-6 bg-slate-950 rounded-[2rem] border border-slate-800 animate-fade-in space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-900">
              <span className="text-xs text-slate-500 font-orbitron uppercase">Per Player</span>
              <span className="text-2xl text-emerald-400 font-orbitron font-bold">{result.perPlayer.toLocaleString()} <span className="text-[10px]">MMK</span></span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-orbitron uppercase">
                <span className="text-slate-500">Clan Treasury</span>
                <span className="text-purple-400">{result.clanShare.toLocaleString()} MMK</span>
              </div>
              <div className="flex justify-between text-[10px] font-orbitron uppercase">
                <span className="text-slate-500">Player Pool</span>
                <span className="text-slate-400">{result.playerPool.toLocaleString()} MMK</span>
              </div>
            </div>

            <button 
              onClick={copyToClipboard}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border text-[10px] font-orbitron font-bold uppercase transition-all ${
                copied ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {copied ? <><Check className="w-3 h-3" /> Copied Squad!</> : <><Copy className="w-3 h-3" /> Copy Summary</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrizeSplitter;
