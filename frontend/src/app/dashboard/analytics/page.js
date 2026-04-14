'use client';
import { useState } from 'react';

const systems = [
  { name: 'NVDA Momentum Alpha', type: 'Trend', totalProfit: 12456.78, drawdown: 4.8, sharpe: 1.85, winRate: 62.4, trades: 47, avgTrade: 265.04, status: 'ACTIVE' },
  { name: 'BTC Volatility Catcher', type: 'Volatility', totalProfit: 28934.56, drawdown: 8.2, sharpe: 2.12, winRate: 58.1, trades: 89, avgTrade: 325.11, status: 'ACTIVE' },
  { name: 'EUR/USD Mean Rev', type: 'Mean Reversion', totalProfit: -1234.12, drawdown: 12.3, sharpe: 0.67, winRate: 41.2, trades: 34, avgTrade: -36.30, status: 'INACTIVE' },
  { name: 'AAPL Grid Bot', type: 'Grid', totalProfit: 8765.43, drawdown: 3.1, sharpe: 1.56, winRate: 71.8, trades: 156, avgTrade: 56.19, status: 'ACTIVE' },
  { name: 'ETH-SOL Arbitrage', type: 'Arbitrage', totalProfit: 5432.10, drawdown: 2.4, sharpe: 2.45, winRate: 78.9, trades: 234, avgTrade: 23.21, status: 'ACTIVE' },
  { name: 'SOL Trend Rider', type: 'Trend', totalProfit: 6789.23, drawdown: 6.7, sharpe: 1.34, winRate: 55.6, trades: 67, avgTrade: 101.33, status: 'ACTIVE' },
];
const timeframes = ['1W','1M','3M','6M','1Y','All Time'];

export default function AnalyticsPage() {
  const [tf, setTf] = useState('3M');
  const [sortBy, setSortBy] = useState('totalProfit');
  const [sortDir, setSortDir] = useState('desc');
  const sorted = [...systems].sort((a, b) => sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]);
  const handleSort = (f) => { if (sortBy === f) setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); else { setSortBy(f); setSortDir('desc'); } };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold text-text-primary">Live Systems Dashboard</h1><div className="flex items-center gap-2">{timeframes.map(t => <button key={t} onClick={() => setTf(t)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${tf === t ? 'bg-accent/20 text-accent border border-accent/30' : 'text-text-muted border border-transparent'}`}>{t}</button>)}</div></div>
      <div className="grid grid-cols-4 gap-4">
        {[{l:'Max Profit System',v:'BTC Vol. Catcher',d:'+$28,934.56',c:'text-positive'},{l:'Min Drawdown',v:'ETH-SOL Arb',d:'2.4%',c:'text-accent'},{l:'Highest Win Rate',v:'ETH-SOL Arb',d:'78.9%',c:'text-positive'},{l:'Best Sharpe',v:'ETH-SOL Arb',d:'2.45',c:'text-accent'}].map(c => <div key={c.l} className="glass-card-hover p-4"><div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{c.l}</div><div className="text-sm font-semibold text-text-primary mb-0.5">{c.v}</div><div className={`font-mono text-lg font-bold ${c.c}`}>{c.d}</div></div>)}
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead><tr className="text-[11px] uppercase tracking-wider text-text-muted border-b border-border">
            {[{k:'name',l:'System',a:'left'},{k:'totalProfit',l:'Profit',a:'right'},{k:'drawdown',l:'Drawdown',a:'right'},{k:'sharpe',l:'Sharpe',a:'right'},{k:'winRate',l:'Win Rate',a:'right'},{k:'trades',l:'Trades',a:'right'},{k:'status',l:'Status',a:'center'}].map(c => <th key={c.k} onClick={() => handleSort(c.k)} className={`px-4 py-3 font-medium cursor-pointer hover:text-text-primary ${c.a === 'right' ? 'text-right' : c.a === 'center' ? 'text-center' : 'text-left'}`}>{c.l} {sortBy === c.k && <span className="text-accent">{sortDir === 'desc' ? '↓' : '↑'}</span>}</th>)}
          </tr></thead>
          <tbody>{sorted.map(s => (
            <tr key={s.name} className="border-b border-border/50 hover:bg-surface-light/30 cursor-pointer transition-colors">
              <td className="px-4 py-3.5"><div className="text-sm font-medium text-text-primary">{s.name}</div><div className="text-[10px] text-text-muted">{s.type}</div></td>
              <td className={`px-4 py-3.5 text-right data-cell font-semibold ${s.totalProfit >= 0 ? 'price-up' : 'price-down'}`}>{s.totalProfit >= 0 ? '+' : ''}${Math.abs(s.totalProfit).toLocaleString(undefined,{minimumFractionDigits:2})}</td>
              <td className={`px-4 py-3.5 text-right data-cell ${s.drawdown > 5 ? 'text-warning' : 'text-text-secondary'}`}>{s.drawdown}%</td>
              <td className={`px-4 py-3.5 text-right data-cell ${s.sharpe >= 1.5 ? 'text-positive' : s.sharpe < 1 ? 'text-negative' : 'text-text-secondary'}`}>{s.sharpe.toFixed(2)}</td>
              <td className={`px-4 py-3.5 text-right data-cell ${s.winRate >= 55 ? 'text-positive' : s.winRate < 45 ? 'text-negative' : 'text-text-secondary'}`}>{s.winRate}%</td>
              <td className="px-4 py-3.5 text-right data-cell text-text-secondary">{s.trades}</td>
              <td className="px-4 py-3.5 text-center"><span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${s.status === 'ACTIVE' ? 'bg-positive/10 text-positive' : 'bg-text-muted/10 text-text-muted'}`}>{s.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse"></span>}{s.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {['Profit Curve','Equity Curve'].map(t => (
          <div key={t} className="glass-card p-5"><h3 className="text-sm font-semibold text-text-primary mb-3">{t}</h3>
            <svg className="w-full h-48" viewBox="0 0 500 200" preserveAspectRatio="none">
              <defs><linearGradient id={`${t.replace(' ','')}G`} x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={t==='Profit Curve'?'#22c55e':'#3b82f6'} stopOpacity="0.2" /><stop offset="100%" stopColor={t==='Profit Curve'?'#22c55e':'#3b82f6'} stopOpacity="0" /></linearGradient></defs>
              <path d={t==='Profit Curve' ? 'M0,180 C50,170 100,155 150,145 C200,130 250,120 300,115 C350,100 400,85 450,55 C475,42 500,30 500,30' : 'M0,170 C50,160 100,150 150,140 C200,130 250,118 300,108 C350,95 400,80 450,60 C475,50 500,40 500,40'} fill="none" stroke={t==='Profit Curve'?'#22c55e':'#3b82f6'} strokeWidth="2" />
              <path d={`${t==='Profit Curve' ? 'M0,180 C50,170 100,155 150,145 C200,130 250,120 300,115 C350,100 400,85 450,55 C475,42 500,30 500,30' : 'M0,170 C50,160 100,150 150,140 C200,130 250,118 300,108 C350,95 400,80 450,60 C475,50 500,40 500,40'} L500,200 L0,200 Z`} fill={`url(#${t.replace(' ','')}G)`} />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
