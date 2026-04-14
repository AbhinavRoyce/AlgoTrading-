'use client';
import { useState } from 'react';

const metrics = [{l:'Total P&L',v:'+$32,456.78',c:'+12.4%'},{l:'Win Rate',v:'64.2%',c:'+2.1%'},{l:'Sharpe Ratio',v:'1.78',c:'+0.15'},{l:'Max Drawdown',v:'8.2%',c:'-1.3%'}];
const perfPeriods = ['Daily','Weekly','Monthly','All-Time'];
const perfData = {
  Daily:{pnl:'+$845.23',trades:12,winRate:'66.7%',best:'+$425.00',worst:'-$112.45'},Weekly:{pnl:'+$3,456.78',trades:47,winRate:'63.8%',best:'+$1,230.00',worst:'-$456.78'},Monthly:{pnl:'+$12,345.67',trades:189,winRate:'64.2%',best:'+$4,567.89',worst:'-$1,234.56'},'All-Time':{pnl:'+$32,456.78',trades:672,winRate:'62.8%',best:'+$8,901.23',worst:'-$3,456.78'},
};
const activities = [
  {type:'ORDER_EXEC',desc:'NVDA LONG closed +$394.20',amount:394.20,time:'2h ago',icon:'📈'},
  {type:'ORDER_EXEC',desc:'BTC/USD LONG closed +$1,522.66',amount:1522.66,time:'4h ago',icon:'📈'},
  {type:'DEPOSIT',desc:'Wire transfer deposit',amount:25000,time:'6h ago',icon:'💰'},
  {type:'API_ROTATE',desc:'Alpaca API key rotated',amount:null,time:'12h ago',icon:'🔑'},
  {type:'SUB_RENEW',desc:'PRO subscription renewed',amount:-49.99,time:'1d ago',icon:'⭐'},
  {type:'WITHDRAWAL',desc:'Bank withdrawal to BoA ****4521',amount:-5000,time:'2d ago',icon:'🏦'},
];
const brokers = [
  {name:'Bank of America',status:'connected',icon:'🏦',account:'****4521',type:'Banking'},
  {name:'Coinbase Pro',status:'connected',icon:'🪙',account:'Trading API',type:'Crypto'},
  {name:'Interactive Brokers',status:'connected',icon:'📊',account:'U1234567',type:'Broker'},
  {name:'Polygon.io',status:'connected',icon:'📡',account:'Data Feed',type:'Data'},
  {name:'Alpaca Markets',status:'disconnected',icon:'🦙',account:'Not Connected',type:'Broker'},
  {name:'Alpha Vantage',status:'connected',icon:'📈',account:'Data Feed',type:'Data'},
];

export default function AccountPage() {
  const [perfPeriod, setPerfPeriod] = useState('Monthly');
  const perf = perfData[perfPeriod];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-cyan-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-accent/20">AT</div>
          <div><h1 className="text-2xl font-bold text-text-primary">Alex Trading</h1><div className="flex items-center gap-3 mt-1"><span className="text-xs text-text-muted">ATH-28491</span><span className="status-active text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse"></span>PRO Plan</span></div></div>
        </div>
        <div className="flex gap-2"><button className="btn-secondary text-xs">API Keys</button><button className="btn-primary text-xs">Upgrade</button></div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {metrics.map(m => <div key={m.l} className="glass-card-hover p-4"><div className="text-[10px] text-text-muted uppercase tracking-wider">{m.l}</div><div className="font-mono text-2xl font-bold mt-1 text-positive">{m.v}</div><div className="text-xs mt-1 text-positive">{m.c} vs last period</div></div>)}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <div className="glass-card p-5"><div className="flex items-center justify-between mb-4"><h3 className="section-title text-sm">Performance — YTD</h3></div>
            <svg className="w-full h-56" viewBox="0 0 700 220" preserveAspectRatio="none"><defs><linearGradient id="pG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></linearGradient></defs><path d="M0,180 C70,170 140,155 210,140 C280,125 350,115 420,98 C490,85 560,65 630,48 C665,38 700,30 700,30" fill="none" stroke="#22c55e" strokeWidth="2" /><path d="M0,180 C70,170 140,155 210,140 C280,125 350,115 420,98 C490,85 560,65 630,48 C665,38 700,30 700,30 L700,220 L0,220 Z" fill="url(#pG)" /></svg>
          </div>
          <div className="glass-card p-5">
            <div className="flex items-center gap-1 mb-4 border-b border-border pb-0">{perfPeriods.map(p => <button key={p} onClick={() => setPerfPeriod(p)} className={perfPeriod === p ? 'tab-btn-active' : 'tab-btn'}>{p}</button>)}</div>
            <div className="grid grid-cols-5 gap-4">
              {[{l:'P&L',v:perf.pnl,c:'text-positive'},{l:'Trades',v:perf.trades.toString(),c:'text-text-primary'},{l:'Win Rate',v:perf.winRate,c:'text-positive'},{l:'Best Trade',v:perf.best,c:'text-positive'},{l:'Worst Trade',v:perf.worst,c:'text-negative'}].map(s => <div key={s.l} className="text-center p-3 rounded-lg bg-background/40 border border-border/50"><div className={`font-mono text-lg font-bold ${s.c}`}>{s.v}</div><div className="text-[10px] text-text-muted mt-1">{s.l}</div></div>)}
            </div>
          </div>
          <div className="glass-card p-5"><h3 className="section-title text-sm mb-4">Linked Brokers &amp; Data Feeds</h3>
            <div className="grid grid-cols-3 gap-3">{brokers.map(b => <div key={b.name} className={`p-4 rounded-xl border transition-all hover:bg-surface-light/30 ${b.status === 'connected' ? 'border-border bg-background/40' : 'border-border/50 bg-background/20 opacity-60'}`}><div className="flex items-center justify-between mb-2"><span className="text-2xl">{b.icon}</span><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${b.status === 'connected' ? 'bg-positive/10 text-positive' : 'bg-text-muted/10 text-text-muted'}`}>{b.status === 'connected' ? '● Connected' : '○ Disconnected'}</span></div><div className="text-sm font-medium text-text-primary">{b.name}</div><div className="text-[10px] text-text-muted mt-0.5">{b.type} — {b.account}</div></div>)}</div>
          </div>
        </div>
        <div className="col-span-4 space-y-4">
          <div className="glass-card p-4 space-y-3"><h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Balance & Equity</h3>
            {[{l:'Balance',v:'$125,432.56'},{l:'Equity',v:'$132,891.23',c:'text-positive'},{l:'Available',v:'$45,678.90'},{l:'Buying Power',v:'$91,357.80',c:'text-accent'}].map(i => <div key={i.l} className="flex justify-between items-center"><span className="text-xs text-text-muted">{i.l}</span><span className={`font-mono text-sm font-semibold ${i.c || 'text-text-primary'}`}>{i.v}</span></div>)}
          </div>
          <div className="glass-card p-4 space-y-3"><div className="flex items-center justify-between"><h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Activity Feed</h3><span className="text-[10px] text-accent cursor-pointer hover:underline">View All</span></div>
            <div className="space-y-1 max-h-[400px] overflow-y-auto">{activities.map((a, i) => <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-border/30 last:border-0"><span className="text-base mt-0.5">{a.icon}</span><div className="flex-1 min-w-0"><p className="text-xs text-text-primary">{a.desc}</p><p className="text-[10px] text-text-muted mt-0.5">{a.time}</p></div>{a.amount !== null && <span className={`font-mono text-xs font-medium shrink-0 ${(a.amount || 0) >= 0 ? 'price-up' : 'price-down'}`}>{(a.amount || 0) >= 0 ? '+' : ''}${Math.abs(a.amount).toLocaleString(undefined,{minimumFractionDigits:2})}</span>}</div>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
