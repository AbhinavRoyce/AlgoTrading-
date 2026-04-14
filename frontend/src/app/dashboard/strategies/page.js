'use client';
import { useState } from 'react';

const strategyTypes = [
  { id: 'TREND_FOLLOWING', label: 'Trend Following', icon: '📈' },
  { id: 'VOLATILITY_BREAKOUT', label: 'Volatility', icon: '⚡' },
  { id: 'MEAN_REVERSION', label: 'Mean Reversion', icon: '🔄' },
  { id: 'ARBITRAGE', label: 'Arbitrage', icon: '⚖️' },
  { id: 'GRID_TRADING', label: 'Grid Trading', icon: '📊' },
];
const strategies = [
  { id: '1', name: 'NVDA Momentum Alpha', type: 'TREND_FOLLOWING', status: 'ACTIVE', ticker: 'NVDA', pnl: 2341.56, trades: 24 },
  { id: '2', name: 'BTC Volatility Catcher', type: 'VOLATILITY_BREAKOUT', status: 'ACTIVE', ticker: 'BTC/USD', pnl: 5678.90, trades: 47 },
  { id: '3', name: 'EUR/USD Mean Rev', type: 'MEAN_REVERSION', status: 'INACTIVE', ticker: 'EUR/USD', pnl: -234.12, trades: 12 },
  { id: '4', name: 'AAPL Grid Bot', type: 'GRID_TRADING', status: 'ACTIVE', ticker: 'AAPL', pnl: 1456.78, trades: 89 },
  { id: '5', name: 'ETH-SOL Arb', type: 'ARBITRAGE', status: 'BACKTEST', ticker: 'ETH/USD', pnl: 0, trades: 0 },
];
const typeColors = { TREND_FOLLOWING: 'border-l-accent', VOLATILITY_BREAKOUT: 'border-l-warning', MEAN_REVERSION: 'border-l-cyan-500', ARBITRAGE: 'border-l-purple-500', GRID_TRADING: 'border-l-positive' };

export default function StrategiesPage() {
  const [selectedType, setSelectedType] = useState('TREND_FOLLOWING');
  const [params, setParams] = useState({ maShort: 10, maLong: 30, stopLoss: 5, takeProfit: 10 });
  const [signal, setSignal] = useState('Golden/Death Cross');
  const [backtestDays, setBacktestDays] = useState(120);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-text-primary">Strategy Builder</h1><span className="text-sm text-text-muted">{strategies.filter(s => s.status === 'ACTIVE').length} active</span></div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <div className="glass-card p-5"><h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Strategy Type</h3><div className="grid grid-cols-5 gap-3">{strategyTypes.map(type => <button key={type.id} onClick={() => setSelectedType(type.id)} className={`p-3 rounded-xl border text-center transition-all ${selectedType === type.id ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10' : 'border-border bg-background/40 hover:border-border-light'}`}><div className="text-2xl mb-1">{type.icon}</div><div className="text-xs font-medium text-text-primary">{type.label}</div></button>)}</div></div>
          <div className="glass-card p-5"><h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Parameters</h3><div className="grid grid-cols-2 gap-6">
            <div className="col-span-2"><label className="text-xs text-text-muted mb-1.5 block">Ticker / Asset</label><div className="flex gap-3"><select className="input-field flex-1"><option>Stocks</option><option>Crypto</option><option>Forex</option></select><input type="text" placeholder="e.g. NVDA" className="input-field flex-[2]" defaultValue="NVDA" /></div></div>
            {[{l:'MA (Short)',k:'maShort',min:5,max:50},{l:'MA (Long)',k:'maLong',min:10,max:200},{l:'Stop-Loss %',k:'stopLoss',min:1,max:20,c:'text-negative'},{l:'Take-Profit %',k:'takeProfit',min:2,max:50,c:'text-positive'}].map(s => (
              <div key={s.k}><div className="flex justify-between mb-1.5"><label className="text-xs text-text-muted">{s.l}</label><span className={`font-mono text-xs ${s.c || 'text-accent'}`}>{params[s.k]}{s.k.includes('Loss') || s.k.includes('Profit') ? '%' : ''}</span></div><input type="range" min={s.min} max={s.max} value={params[s.k]} onChange={e => setParams({...params, [s.k]: +e.target.value})} className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent" /></div>
            ))}
            <div className="col-span-2"><label className="text-xs text-text-muted mb-2 block">Signal Logic</label><div className="flex gap-2 flex-wrap">{['Golden/Death Cross','RSI','MACD','Bollinger Bands','VWAP'].map(s => <button key={s} onClick={() => setSignal(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${signal === s ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted'}`}>{s}</button>)}</div></div>
          </div></div>
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Backtesting</h3><span className="text-xs text-text-muted">{backtestDays} days</span></div>
            <input type="range" min={30} max={365} value={backtestDays} onChange={e => setBacktestDays(+e.target.value)} className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent mb-4" />
            <div className="grid grid-cols-5 gap-3 p-4 rounded-xl bg-background/40 border border-border/50 mb-4">
              {[{l:'Total Return',v:'+$12,456.78',c:'text-positive'},{l:'Max Drawdown',v:'4.8%',c:'text-warning'},{l:'Sharpe Ratio',v:'1.85',c:'text-accent'},{l:'Win Rate',v:'62.4%',c:'text-positive'},{l:'Total Trades',v:'47',c:'text-text-primary'}].map(m => <div key={m.l} className="text-center"><div className={`font-mono text-base font-bold ${m.c}`}>{m.v}</div><div className="text-[10px] text-text-muted mt-1">{m.l}</div></div>)}
            </div>
            <div className="p-4 rounded-xl bg-background/40 border border-border/50 mb-4"><div className="text-xs text-text-muted mb-2">Equity Curve</div><svg className="w-full h-32" viewBox="0 0 600 130" preserveAspectRatio="none"><defs><linearGradient id="eqGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" /><stop offset="100%" stopColor="#22c55e" stopOpacity="0" /></linearGradient></defs><path d="M0,120 C50,110 100,100 150,95 C200,88 250,85 300,78 C350,65 400,62 450,50 C500,42 550,28 600,10" fill="none" stroke="#22c55e" strokeWidth="2" /><path d="M0,120 C50,110 100,100 150,95 C200,88 250,85 300,78 C350,65 400,62 450,50 C500,42 550,28 600,10 L600,130 L0,130 Z" fill="url(#eqGrad)" /></svg></div>
            <div className="flex gap-3"><button className="btn-primary flex-1">Run Backtest</button><button className="btn-secondary flex-1">Deploy Strategy</button></div>
          </div>
        </div>
        <div className="col-span-4 space-y-3">
          <div className="glass-card p-4"><h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Your Strategies</h3><div className="space-y-2">{strategies.map(s => (
            <div key={s.id} className={`p-3 rounded-lg bg-background/40 border border-border/50 border-l-2 ${typeColors[s.type]} hover:bg-surface-light/30 cursor-pointer transition-all`}>
              <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium text-text-primary">{s.name}</span><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.status === 'ACTIVE' ? 'bg-positive/10 text-positive border border-positive/20' : s.status === 'BACKTEST' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-text-muted/10 text-text-muted border border-text-muted/20'}`}>{s.status}</span></div>
              <div className="flex items-center justify-between text-[11px]"><span className="text-text-muted font-mono">{s.ticker}</span><span className={`font-mono font-medium ${s.pnl >= 0 ? 'price-up' : 'price-down'}`}>{s.pnl >= 0 ? '+' : ''}${s.pnl.toLocaleString()}</span></div>
              <div className="text-[10px] text-text-muted mt-1">{s.trades} trades</div>
            </div>
          ))}</div></div>
        </div>
      </div>
    </div>
  );
}
