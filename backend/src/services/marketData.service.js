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

async function getOHLCVData(ticker, _interval) {
  const bars = [];
  const now = Date.now();
  const basePrice = ticker.includes('BTC') ? 65000 : ticker.includes('ETH') ? 3400 : 175;
  for (let i = 200; i >= 0; i--) {
    const time = now - i * 86400000;
    const v = basePrice * 0.02;
    const open = basePrice + (Math.random() - 0.5) * v * 2 + (200 - i) * (basePrice * 0.0005);
    const close = open + (Math.random() - 0.48) * v;
    bars.push({ time: Math.floor(time / 1000), open: +open.toFixed(2), high: +(Math.max(open, close) + Math.random() * v * 0.5).toFixed(2), low: +(Math.min(open, close) - Math.random() * v * 0.5).toFixed(2), close: +close.toFixed(2), volume: Math.floor(Math.random() * 50_000_000) + 10_000_000 });
  }
  return bars;
}

async function getMarketNews() {
  return [
    { id: '1', title: 'Fed Holds Interest Rates Steady, Signals Patience on Cuts', source: 'Reuters', url: '#', publishedAt: new Date().toISOString(), tickers: ['SPY', 'QQQ'] },
    { id: '2', title: 'NVIDIA Reports Record Q4 Revenue, Beats Expectations', source: 'Bloomberg', url: '#', publishedAt: new Date(Date.now() - 3600000).toISOString(), tickers: ['NVDA'] },
    { id: '3', title: 'Bitcoin ETF Inflows Surge to $1.2B in Single Day', source: 'CoinDesk', url: '#', publishedAt: new Date(Date.now() - 7200000).toISOString(), tickers: ['BTC/USD'] },
    { id: '4', title: 'Apple Vision Pro Sales Exceed Wall Street Forecasts', source: 'CNBC', url: '#', publishedAt: new Date(Date.now() - 10800000).toISOString(), tickers: ['AAPL'] },
    { id: '5', title: 'European Markets Rally on ECB Policy Outlook', source: 'Financial Times', url: '#', publishedAt: new Date(Date.now() - 14400000).toISOString(), tickers: ['EUR/USD'] },
  ];
}

module.exports = { getMarketData, getOHLCVData, getMarketNews };
