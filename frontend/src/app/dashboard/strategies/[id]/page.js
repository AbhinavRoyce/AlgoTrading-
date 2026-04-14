'use client';

export default function StrategyDetailPage({ params }) {
  const trades = [
    { date: 'Mar 20, 2026', side: 'LONG', entry: 867.20, exit: null, qty: 8, pnl: 89.20, status: 'OPEN' },
    { date: 'Mar 18, 2026', side: 'LONG', entry: 845.50, exit: 878.35, qty: 12, pnl: 394.20, status: 'CLOSED' },
    { date: 'Mar 15, 2026', side: 'SHORT', entry: 892.10, exit: 878.35, qty: 5, pnl: 68.75, status: 'CLOSED' },
    { date: 'Mar 12, 2026', side: 'LONG', entry: 834.00, exit: 856.20, qty: 10, pnl: 222.00, status: 'CLOSED' },
    { date: 'Mar 08, 2026', side: 'LONG', entry: 850.75, exit: 842.30, qty: 8, pnl: -67.60, status: 'CLOSED' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/dashboard/strategies" className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-muted hover:text-text-primary"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></a>
          <div><h1 className="text-xl font-bold text-text-primary">NVDA Momentum Alpha</h1><div className="flex items-center gap-3 mt-0.5"><span className="text-xs text-text-muted">ID: {params.id}</span><span className="status-active text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse"></span> ACTIVE</span></div></div>
        </div>
        <div className="flex gap-2"><button className="btn-secondary text-xs">Edit</button><button className="btn-primary text-xs flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>Live Trading</button></div>
      </div>
      <div className="grid grid-cols-6 gap-3">
        {[{l:'Total P&L',v:'+$2,341.56',c:'text-positive'},{l:'Win Rate',v:'62.4%',c:'text-positive'},{l:'Sharpe',v:'1.85',c:'text-accent'},{l:'Drawdown',v:'4.8%',c:'text-warning'},{l:'Trades',v:'47',c:'text-text-primary'},{l:'Avg Trade',v:'+$265.04',c:'text-positive'}].map(m => <div key={m.l} className="glass-card p-3 text-center"><div className={`font-mono text-lg font-bold ${m.c}`}>{m.v}</div><div className="text-[10px] text-text-muted mt-0.5">{m.l}</div></div>)}
      </div>
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border"><div className="flex items-center gap-4"><span className="font-mono font-semibold text-accent">NVDA</span><span className="font-mono text-lg font-bold">$878.35</span><span className="font-mono text-sm price-up">+12.45 (+1.44%)</span></div></div>
        <div className="h-[420px] bg-background/40 relative">
          <svg className="w-full h-full" viewBox="0 0 900 420" preserveAspectRatio="none">
            <defs><linearGradient id="dG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
            <path d="M0,350 C60,330 120,310 180,290 C240,280 300,260 360,240 C420,230 480,210 540,185 C600,175 660,155 720,130 C780,105 840,75 900,50" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <path d="M0,350 C60,330 120,310 180,290 C240,280 300,260 360,240 C420,230 480,210 540,185 C600,175 660,155 720,130 C780,105 840,75 900,50 L900,420 L0,420 Z" fill="url(#dG)" />
            <circle cx="180" cy="290" r="6" fill="#22c55e" stroke="#0a0d14" strokeWidth="2" /><text x="180" y="282" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold">BUY</text>
            <circle cx="420" cy="230" r="6" fill="#ef4444" stroke="#0a0d14" strokeWidth="2" /><text x="420" y="222" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">SELL</text>
            <circle cx="600" cy="175" r="6" fill="#22c55e" stroke="#0a0d14" strokeWidth="2" /><text x="600" y="167" textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="bold">BUY</text>
          </svg>
        </div>
      </div>
      <div className="glass-card overflow-hidden"><div className="px-4 py-3 border-b border-border"><h3 className="section-title text-sm">Recent Trades</h3></div>
        <table className="w-full"><thead><tr className="text-[11px] uppercase tracking-wider text-text-muted border-b border-border"><th className="text-left px-4 py-2.5 font-medium">Date</th><th className="text-left px-4 py-2.5 font-medium">Side</th><th className="text-right px-4 py-2.5 font-medium">Entry</th><th className="text-right px-4 py-2.5 font-medium">Exit</th><th className="text-right px-4 py-2.5 font-medium">Qty</th><th className="text-right px-4 py-2.5 font-medium">P&L</th><th className="text-center px-4 py-2.5 font-medium">Status</th></tr></thead>
        <tbody>{trades.map((t, i) => <tr key={i} className="border-b border-border/50 hover:bg-surface-light/30 transition-colors">
          <td className="px-4 py-3 text-xs text-text-secondary">{t.date}</td><td className="px-4 py-3"><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${t.side === 'LONG' ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>{t.side}</span></td>
          <td className="px-4 py-3 text-right data-cell">${t.entry.toFixed(2)}</td><td className="px-4 py-3 text-right data-cell">{t.exit ? `$${t.exit.toFixed(2)}` : '—'}</td><td className="px-4 py-3 text-right data-cell text-text-secondary">{t.qty}</td>
          <td className={`px-4 py-3 text-right data-cell font-semibold ${t.pnl >= 0 ? 'price-up' : 'price-down'}`}>{t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}</td>
          <td className="px-4 py-3 text-center"><span className={`text-[10px] font-medium px-2 py-0.5 rounded ${t.status === 'OPEN' ? 'bg-accent/10 text-accent' : 'bg-text-muted/10 text-text-muted'}`}>{t.status}</span></td>
        </tr>)}</tbody></table>
      </div>
    </div>
  );
}
