function computeSMA(prices, period) {
  return prices.map((_, i) => i < period - 1 ? null : prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
}

async function runBacktest(strategy, startDate, endDate) {
  const bars = [];
  let current = new Date(startDate);
  let basePrice = 100 + Math.random() * 100;
  while (current <= endDate) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      const v = basePrice * 0.015;
      const close = basePrice + (Math.random() - 0.48) * v * 2;
      bars.push({ time: new Date(current), close });
      basePrice = close;
    }
    current = new Date(current.getTime() + 86400000);
  }

  const closes = bars.map(b => b.close);
  const params = typeof strategy.parameters === 'string' ? JSON.parse(strategy.parameters) : strategy.parameters;
  const shortPeriod = params.shortPeriod || 10, longPeriod = params.longPeriod || 30;
  const stopLoss = params.stopLoss || 5, takeProfit = params.takeProfit || 10;
  const shortSMA = computeSMA(closes, shortPeriod), longSMA = computeSMA(closes, longPeriod);

  let capital = 100000, position = 0, entryPrice = 0, trades = 0, wins = 0, maxCapital = capital, maxDrawdown = 0;
  const dailyReturns = [];
  const equityCurve = [];
  let prevCapital = capital;

  for (let i = longPeriod; i < bars.length; i++) {
    const price = closes[i], shortMA = shortSMA[i], longMA = longSMA[i];
    if (shortMA === null || longMA === null) continue;

    if (position > 0) {
      const pnlPct = ((price - entryPrice) / entryPrice) * 100;
      if (pnlPct <= -stopLoss || pnlPct >= takeProfit) {
        capital += position * (price - entryPrice);
        if (price > entryPrice) wins++;
        trades++; position = 0;
      }
    }
    if (position === 0 && shortMA > longMA && (shortSMA[i - 1] || 0) <= (longSMA[i - 1] || 0)) {
      position = Math.floor(capital * 0.95 / price); entryPrice = price; capital -= position * price;
    }
    if (position > 0 && shortMA < longMA && (shortSMA[i - 1] || 0) >= (longSMA[i - 1] || 0)) {
      capital += position * price; if (price > entryPrice) wins++; trades++; position = 0;
    }

    const totalEquity = capital + position * price;
    maxCapital = Math.max(maxCapital, totalEquity);
    maxDrawdown = Math.max(maxDrawdown, ((maxCapital - totalEquity) / maxCapital) * 100);
    dailyReturns.push((totalEquity - prevCapital) / prevCapital);
    prevCapital = totalEquity;
    equityCurve.push({ time: bars[i].time.toISOString().split('T')[0], equity: +totalEquity.toFixed(2), profit: +(totalEquity - 100000).toFixed(2) });
  }

  if (position > 0) { capital += position * closes[closes.length - 1]; if (closes[closes.length - 1] > entryPrice) wins++; trades++; }
  const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
  const stdDev = dailyReturns.length > 0 ? Math.sqrt(dailyReturns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / dailyReturns.length) : 1;

  return {
    totalProfit: +(capital - 100000).toFixed(2), drawdownPct: +maxDrawdown.toFixed(2),
    sharpeRatio: +(stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0).toFixed(2),
    winRate: trades > 0 ? +((wins / trades) * 100).toFixed(1) : 0, totalTrades: trades, equityCurve,
  };
}

module.exports = { runBacktest };
