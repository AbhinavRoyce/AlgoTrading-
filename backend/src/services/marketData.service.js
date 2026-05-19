const axios = require('axios');

// ─── Mock ticker data (stocks / crypto / forex) ───────────────────────
const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.34, changePercent: 1.33, volume: 54_832_100, high: 179.63, low: 176.21, marketCap: 2_780_000_000_000 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.56, change: -1.23, changePercent: -0.30, volume: 22_145_600, high: 418.12, low: 413.89, marketCap: 3_090_000_000_000 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 155.89, change: 3.67, changePercent: 2.41, volume: 28_991_200, high: 156.42, low: 152.01, marketCap: 1_950_000_000_000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.41, change: 1.15, changePercent: 0.63, volume: 41_234_500, high: 183.52, low: 180.88, marketCap: 1_890_000_000_000 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 878.35, change: 12.45, changePercent: 1.44, volume: 38_456_700, high: 882.19, low: 864.50, marketCap: 2_170_000_000_000 },
  { symbol: 'META', name: 'Meta Platforms', price: 505.83, change: -3.21, changePercent: -0.63, volume: 15_678_900, high: 510.45, low: 503.12, marketCap: 1_290_000_000_000 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.22, change: -4.56, changePercent: -2.54, volume: 72_134_500, high: 180.34, low: 174.01, marketCap: 558_000_000_000 },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 198.45, change: 0.87, changePercent: 0.44, volume: 8_934_200, high: 199.12, low: 197.23, marketCap: 571_000_000_000 },
];

const mockCrypto = [
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 67_245.32, change: 1_234.56, changePercent: 1.87, volume: 28_456_000_000, high: 67_892.45, low: 65_123.78 },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 3_456.78, change: -45.23, changePercent: -1.29, volume: 15_234_000_000, high: 3_512.34, low: 3_401.56 },
  { symbol: 'SOL/USD', name: 'Solana', price: 145.67, change: 8.34, changePercent: 6.07, volume: 3_456_000_000, high: 148.92, low: 136.45 },
];

const mockForex = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0876, change: 0.0023, changePercent: 0.21, volume: 0, high: 1.0892, low: 1.0845 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2678, change: -0.0045, changePercent: -0.35, volume: 0, high: 1.2712, low: 1.2656 },
];

async function getMarketData(assetClass) {
  switch (assetClass.toLowerCase()) {
    case 'crypto': return mockCrypto;
    case 'forex': return mockForex;
    default: return mockStocks;
  }
}

// ─── Binance REST kline helpers ───────────────────────────────────────

const BINANCE_REST = 'https://api.binance.com/api/v3';

// Map frontend symbol names to Binance trading pairs
const SYMBOL_MAP = {
  'BTC/USD': 'BTCUSDT',
  'ETH/USD': 'ETHUSDT',
  'SOL/USD': 'SOLUSDT',
  'BTCUSDT': 'BTCUSDT',
  'ETHUSDT': 'ETHUSDT',
  'SOLUSDT': 'SOLUSDT',
};

// Valid Binance kline intervals
const VALID_INTERVALS = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];

function isCryptoSymbol(symbol) {
  return !!SYMBOL_MAP[symbol] || symbol.endsWith('USDT');
}

function toBinanceSymbol(symbol) {
  return SYMBOL_MAP[symbol] || symbol.toUpperCase();
}

/**
 * Transform a single Binance kline array into a structured candle object.
 * Binance kline format: [openTime, open, high, low, close, volume, closeTime, ...]
 */
function mapBinanceKline(k) {
  return {
    time: Math.floor(k[0] / 1000), // UNIX seconds for lightweight-charts
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  };
}

/**
 * Fetch historical klines from Binance REST API.
 * No API key required for public market data.
 */
async function fetchBinanceKlines(symbol, interval = '1h', limit = 500) {
  const binanceSymbol = toBinanceSymbol(symbol);
  const safeInterval = VALID_INTERVALS.includes(interval) ? interval : '1h';
  const safeLimit = Math.min(Math.max(parseInt(limit) || 500, 10), 1000);

  const { data } = await axios.get(`${BINANCE_REST}/klines`, {
    params: { symbol: binanceSymbol, interval: safeInterval, limit: safeLimit },
    timeout: 10000,
  });

  return data.map(mapBinanceKline);
}

// ─── OHLCV data (unified interface) ──────────────────────────────────

/**
 * Generate mock OHLCV bars for non-crypto symbols.
 * Produces realistic-looking price action with trend and volatility.
 */
function generateMockOHLCV(ticker, interval) {
  const bars = [];
  const now = Date.now();
  const basePrice = ticker.includes('BTC') ? 65000 : ticker.includes('ETH') ? 3400 : 175;

  // Determine bar spacing in ms based on interval
  const spacingMap = { '1m': 60000, '5m': 300000, '15m': 900000, '1h': 3600000, '4h': 14400000, '1d': 86400000, '1w': 604800000 };
  const spacing = spacingMap[interval] || 86400000;
  const count = 500;

  for (let i = count; i >= 0; i--) {
    const time = now - i * spacing;
    const v = basePrice * 0.02;
    const open = basePrice + (Math.random() - 0.5) * v * 2 + (count - i) * (basePrice * 0.0005);
    const close = open + (Math.random() - 0.48) * v;
    bars.push({
      time: Math.floor(time / 1000),
      open: +open.toFixed(2),
      high: +(Math.max(open, close) + Math.random() * v * 0.5).toFixed(2),
      low: +(Math.min(open, close) - Math.random() * v * 0.5).toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(Math.random() * 50_000_000) + 10_000_000,
    });
  }
  return bars;
}

/**
 * Get OHLCV data — tries Binance for crypto, falls back to mock for stocks/forex.
 */
async function getOHLCVData(ticker, interval = '1d') {
  if (isCryptoSymbol(ticker)) {
    try {
      return await fetchBinanceKlines(ticker, interval);
    } catch (err) {
      console.error(`[MarketData] Binance fetch failed for ${ticker}: ${err.message}`);
      // Fall through to mock data
    }
  }
  return generateMockOHLCV(ticker, interval);
}

// ─── Candles endpoint (new, dedicated) ────────────────────────────────

/**
 * Fetch candle data with metadata. Used by the new /candles/:symbol route.
 */
async function getCandleData(symbol, interval = '1h', limit = 500) {
  const candles = await getOHLCVData(symbol, interval);
  return {
    symbol,
    interval,
    source: isCryptoSymbol(symbol) ? 'binance' : 'mock',
    count: candles.length,
    candles,
  };
}

// ─── News ─────────────────────────────────────────────────────────────

async function getMarketNews() {
  return [
    { id: '1', title: 'Fed Holds Interest Rates Steady, Signals Patience on Cuts', source: 'Reuters', url: '#', publishedAt: new Date().toISOString(), tickers: ['SPY', 'QQQ'] },
    { id: '2', title: 'NVIDIA Reports Record Q4 Revenue, Beats Expectations', source: 'Bloomberg', url: '#', publishedAt: new Date(Date.now() - 3600000).toISOString(), tickers: ['NVDA'] },
    { id: '3', title: 'Bitcoin ETF Inflows Surge to $1.2B in Single Day', source: 'CoinDesk', url: '#', publishedAt: new Date(Date.now() - 7200000).toISOString(), tickers: ['BTC/USD'] },
    { id: '4', title: 'Apple Vision Pro Sales Exceed Wall Street Forecasts', source: 'CNBC', url: '#', publishedAt: new Date(Date.now() - 10800000).toISOString(), tickers: ['AAPL'] },
    { id: '5', title: 'European Markets Rally on ECB Policy Outlook', source: 'Financial Times', url: '#', publishedAt: new Date(Date.now() - 14400000).toISOString(), tickers: ['EUR/USD'] },
  ];
}

module.exports = { getMarketData, getOHLCVData, getMarketNews, getCandleData, isCryptoSymbol, toBinanceSymbol, VALID_INTERVALS };
