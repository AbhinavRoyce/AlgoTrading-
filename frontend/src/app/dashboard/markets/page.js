'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import IndicatorPanel from '@/components/charts/IndicatorPanel';
import IntervalSelector from '@/components/charts/IntervalSelector';
import { subscribeCandles, unsubscribeCandles, onCandleUpdate } from '@/lib/socket';

// Dynamic import to avoid SSR issues with lightweight-charts
const TradingChart = dynamic(() => import('@/components/charts/TradingChart'), { ssr: false });

const assetClasses = ['Stocks', 'Crypto', 'Forex', 'Options', 'Commodities'];
const mockTickers = {
  Stocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.34, changePercent: 1.33, volume: '54.8M', high: 179.63, low: 176.21 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.56, change: -1.23, changePercent: -0.30, volume: '22.1M', high: 418.12, low: 413.89 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 155.89, change: 3.67, changePercent: 2.41, volume: '29.0M', high: 156.42, low: 152.01 },
    { symbol: 'AMZN', name: 'Amazon.com', price: 182.41, change: 1.15, changePercent: 0.63, volume: '41.2M', high: 183.52, low: 180.88 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 878.35, change: 12.45, changePercent: 1.44, volume: '38.5M', high: 882.19, low: 864.50 },
    { symbol: 'META', name: 'Meta Platforms', price: 505.83, change: -3.21, changePercent: -0.63, volume: '15.7M', high: 510.45, low: 503.12 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.22, change: -4.56, changePercent: -2.54, volume: '72.1M', high: 180.34, low: 174.01 },
    { symbol: 'JPM', name: 'JPMorgan Chase', price: 198.45, change: 0.87, changePercent: 0.44, volume: '8.9M', high: 199.12, low: 197.23 },
  ],
  Crypto: [
    { symbol: 'BTC/USD', name: 'Bitcoin', price: 67245.32, change: 1234.56, changePercent: 1.87, volume: '28.5B', high: 67892.45, low: 65123.78 },
    { symbol: 'ETH/USD', name: 'Ethereum', price: 3456.78, change: -45.23, changePercent: -1.29, volume: '15.2B', high: 3512.34, low: 3401.56 },
    { symbol: 'SOL/USD', name: 'Solana', price: 145.67, change: 8.34, changePercent: 6.07, volume: '3.5B', high: 148.92, low: 136.45 },
  ],
  Forex: [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0876, change: 0.0023, changePercent: 0.21, volume: '-', high: 1.0892, low: 1.0845 },
    { symbol: 'GBP/USD', name: 'British Pound', price: 1.2678, change: -0.0045, changePercent: -0.35, volume: '-', high: 1.2712, low: 1.2656 },
  ],
  Options: [{ symbol: 'SPY 520C', name: 'SPY Mar 520 Call', price: 4.56, change: 0.34, changePercent: 8.06, volume: '125K', high: 4.78, low: 4.12 }],
  Commodities: [{ symbol: 'GC=F', name: 'Gold Futures', price: 2178.40, change: 12.30, changePercent: 0.57, volume: '186K', high: 2185.60, low: 2164.20 }],
};
const mockNews = [
  { id: 1, title: 'Fed Holds Interest Rates Steady, Signals Patience on Cuts', source: 'Reuters', time: '2h ago', tickers: ['SPY'] },
  { id: 2, title: 'NVIDIA Reports Record Q4 Revenue, Beats Expectations', source: 'Bloomberg', time: '3h ago', tickers: ['NVDA'] },
  { id: 3, title: 'Bitcoin ETF Inflows Surge to $1.2B in Single Day', source: 'CoinDesk', time: '4h ago', tickers: ['BTC/USD'] },
  { id: 4, title: 'Apple Vision Pro Sales Exceed Wall Street Forecasts', source: 'CNBC', time: '5h ago', tickers: ['AAPL'] },
];
const openPositions = [
  { ticker: 'NVDA', side: 'LONG', qty: 8, pnl: 89.20, pnlPct: 1.29 },
  { ticker: 'BTC/USD', side: 'SHORT', qty: 0.3, pnl: 256.40, pnlPct: 1.25 },
  { ticker: 'AAPL', side: 'LONG', qty: 15, pnl: 50.70, pnlPct: 1.93 },
];

// Crypto symbols that support live Binance data
const CRYPTO_SYMBOLS = new Set(['BTC/USD', 'ETH/USD', 'SOL/USD']);

export default function MarketsPage() {
  const [activeTab, setActiveTab] = useState('Stocks');
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [interval, setInterval] = useState('1h');
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState([
    { id: 'volume' },
    { id: 'sma', period: 20, color: '#f59e0b' },
  ]);
  const chartRef = useRef(null);
  const prevSubRef = useRef(null);
  const tickers = mockTickers[activeTab] || [];

  const isCrypto = CRYPTO_SYMBOLS.has(selectedTicker);

  // ─── Fetch historical candles ─────────────────────────────────
  const fetchCandles = useCallback(async (symbol, intv) => {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${API_URL}/markets/candles/${encodeURIComponent(symbol)}?interval=${intv}&limit=500`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setCandles(data.candles || []);
    } catch (err) {
      console.error('[Markets] Failed to fetch candles:', err);
      // Generate client-side fallback data
      setCandles(generateFallbackCandles(symbol));
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Subscribe to live updates for crypto ─────────────────────
  useEffect(() => {
    // Unsubscribe from previous
    if (prevSubRef.current) {
      unsubscribeCandles(prevSubRef.current.symbol, prevSubRef.current.interval);
    }

    fetchCandles(selectedTicker, interval);

    if (isCrypto) {
      subscribeCandles(selectedTicker, interval);
      prevSubRef.current = { symbol: selectedTicker, interval };

      const cleanup = onCandleUpdate((data) => {
        if (data.symbol === selectedTicker && data.interval === interval) {
          // Update the latest candle or append
          setCandles((prev) => {
            if (!prev.length) return prev;
            const last = prev[prev.length - 1];
            if (data.candle.time === last.time) {
              // Update in-place
              return [...prev.slice(0, -1), data.candle];
            } else if (data.candle.time > last.time) {
              // New candle
              return [...prev, data.candle];
            }
            return prev;
          });
        }
      });

      return cleanup;
    } else {
      prevSubRef.current = null;
    }
  }, [selectedTicker, interval, isCrypto, fetchCandles]);

  // ─── Indicator management ─────────────────────────────────────
  const handleToggleIndicator = useCallback((config) => {
    setActiveIndicators((prev) => {
      const exists = prev.find((i) => i.id === config.id);
      if (exists) return prev.filter((i) => i.id !== config.id);
      return [...prev, config];
    });
  }, []);

  const handleUpdateParams = useCallback((id, params) => {
    setActiveIndicators((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...params } : i))
    );
  }, []);

  return (
    <div className="space-y-6 animate-fade-in" id="markets-page">
      {/* ─── Asset class tabs ──────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-border pb-0">
        {assetClasses.map(tab => <button key={tab} onClick={() => { setActiveTab(tab); const first = (mockTickers[tab] || [])[0]; if (first) setSelectedTicker(first.symbol); }} className={activeTab === tab ? 'tab-btn-active' : 'tab-btn'}>{tab}</button>)}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ─── Main content (9 cols) ─────────────────────────── */}
        <div className="col-span-9 space-y-6">
          {/* Chart card */}
          <div className="glass-card p-0 overflow-hidden" id="chart-container">
            {/* Chart header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-4">
                <h2 className="font-semibold text-text-primary" id="selected-symbol">{selectedTicker}</h2>
                {tickers.filter(t => t.symbol === selectedTicker).map(t => (
                  <div key={t.symbol} className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold">${t.price > 1000 ? t.price.toLocaleString() : t.price}</span>
                    <span className={`font-mono text-sm ${t.change >= 0 ? 'price-up' : 'price-down'}`}>{t.change >= 0 ? '+' : ''}{t.change} ({t.changePercent >= 0 ? '+' : ''}{t.changePercent}%)</span>
                  </div>
                ))}
                {isCrypto && (
                  <div className="flex items-center gap-1.5">
                    <span className="pulse-dot" />
                    <span className="text-[10px] text-positive font-medium uppercase tracking-wider">Live</span>
                  </div>
                )}
              </div>
              <IntervalSelector activeInterval={interval} onChange={setInterval} />
            </div>

            {/* Indicator panel */}
            <div className="px-4 py-2 border-b border-border/50 bg-background/30">
              <IndicatorPanel
                activeIndicators={activeIndicators}
                onToggle={handleToggleIndicator}
                onUpdateParams={handleUpdateParams}
              />
            </div>

            {/* Chart */}
            <div className="bg-background/40 relative" ref={chartRef}>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-text-muted">Loading chart data...</span>
                  </div>
                </div>
              )}
              <TradingChart candles={candles} indicators={activeIndicators} height={440} />
            </div>
          </div>

          {/* Market Watch table */}
          <div className="glass-card overflow-hidden" id="market-watch">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between"><h3 className="section-title text-sm">Market Watch</h3><span className="text-xs text-text-muted">{tickers.length} instruments</span></div>
            <table className="w-full">
              <thead><tr className="text-[11px] uppercase tracking-wider text-text-muted border-b border-border"><th className="text-left px-4 py-2.5 font-medium">Symbol</th><th className="text-left px-4 py-2.5 font-medium">Name</th><th className="text-right px-4 py-2.5 font-medium">Price</th><th className="text-right px-4 py-2.5 font-medium">Change</th><th className="text-right px-4 py-2.5 font-medium">% Change</th><th className="text-right px-4 py-2.5 font-medium">Volume</th></tr></thead>
              <tbody>{tickers.map(ticker => (
                <tr key={ticker.symbol} onClick={() => setSelectedTicker(ticker.symbol)} className={`border-b border-border/50 hover:bg-surface-light/30 cursor-pointer transition-colors ${selectedTicker === ticker.symbol ? 'bg-accent/5' : ''}`}>
                  <td className="px-4 py-3"><span className="font-mono font-semibold text-sm text-accent">{ticker.symbol}</span></td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{ticker.name}</td>
                  <td className="px-4 py-3 text-right data-cell font-semibold">${ticker.price > 1000 ? ticker.price.toLocaleString(undefined,{minimumFractionDigits:2}) : ticker.price}</td>
                  <td className={`px-4 py-3 text-right data-cell ${ticker.change >= 0 ? 'price-up' : 'price-down'}`}>{ticker.change >= 0 ? '+' : ''}{ticker.change}</td>
                  <td className={`px-4 py-3 text-right data-cell ${ticker.changePercent >= 0 ? 'price-up' : 'price-down'}`}><span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${ticker.changePercent >= 0 ? 'bg-positive/10' : 'bg-negative/10'}`}>{ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent}%</span></td>
                  <td className="px-4 py-3 text-right data-cell text-text-muted">{ticker.volume}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        {/* ─── Sidebar (3 cols) ──────────────────────────────── */}
        <div className="col-span-3 space-y-4">
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Account Overview</h3>
            <div className="space-y-2">
              {[{l:'Balance',v:'$125,432.56'},{l:'Equity',v:'$132,891.23',c:'text-positive'},{l:'Available',v:'$45,678.90'},{l:'P&L Today',v:'+$2,341.56',c:'price-up'}].map(i => <div key={i.l} className="flex justify-between items-center"><span className="text-xs text-text-muted">{i.l}</span><span className={`font-mono text-sm font-semibold ${i.c || 'text-text-primary'}`}>{i.v}</span></div>)}
            </div>
          </div>
          <div className="glass-card p-4 space-y-3">
            <div className="flex justify-between items-center"><h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Open Positions</h3><span className="text-[10px] text-accent font-medium">{openPositions.length} active</span></div>
            {openPositions.map(pos => (
              <div key={pos.ticker} className="p-2.5 rounded-lg bg-background/40 border border-border/50 space-y-1">
                <div className="flex items-center justify-between"><span className="font-mono text-xs font-semibold text-accent">{pos.ticker}</span><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${pos.side === 'LONG' ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>{pos.side}</span></div>
                <div className="flex items-center justify-between text-[11px]"><span className="text-text-muted">Qty: {pos.qty}</span><span className="font-mono price-up font-medium">+${pos.pnl.toFixed(2)} ({pos.pnlPct}%)</span></div>
              </div>
            ))}
          </div>
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Market News</h3>
            {mockNews.map(news => (
              <div key={news.id} className="space-y-1 pb-2.5 border-b border-border/30 last:border-0 last:pb-0">
                <p className="text-xs text-text-primary leading-relaxed line-clamp-2">{news.title}</p>
                <div className="flex items-center gap-2"><span className="text-[10px] text-text-muted">{news.source} • {news.time}</span>{news.tickers.map(t => <span key={t} className="text-[9px] font-mono text-accent bg-accent/10 px-1 py-0.5 rounded">{t}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Fallback candle generator (when backend is unavailable) ──────────
function generateFallbackCandles(symbol) {
  const bars = [];
  const now = Date.now();
  const base = symbol.includes('BTC') ? 65000 : symbol.includes('ETH') ? 3400 : symbol.includes('SOL') ? 145 : 175;
  for (let i = 300; i >= 0; i--) {
    const time = now - i * 3600000;
    const v = base * 0.015;
    const open = base + (Math.random() - 0.5) * v * 2 + (300 - i) * (base * 0.0003);
    const close = open + (Math.random() - 0.48) * v;
    bars.push({ time: Math.floor(time / 1000), open: +open.toFixed(2), high: +(Math.max(open, close) + Math.random() * v * 0.5).toFixed(2), low: +(Math.min(open, close) - Math.random() * v * 0.5).toFixed(2), close: +close.toFixed(2), volume: Math.floor(Math.random() * 50000000) + 10000000 });
  }
  return bars;
}
