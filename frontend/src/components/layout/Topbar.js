'use client';

export default function Topbar() {
  return (
    <header className="h-14 bg-surface/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="relative w-80">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input type="text" placeholder="Search tickers, strategies..." className="input-field pl-10 py-1.5 text-sm bg-background/60" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/60 border border-border"><div className="pulse-dot"></div><span className="text-xs font-medium text-positive">Markets Open</span></div>
        <button className="btn-primary text-xs px-3 py-1.5"><span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>New Strategy</span></button>
      </div>
    </header>
  );
}
