/**
 * Technical Indicators Library
 * Pure JS implementations for use with lightweight-charts.
 * All functions accept an array of candle objects { time, open, high, low, close, volume }
 * and return arrays of { time, value } (or multi-value objects for complex indicators).
 */

// ─── Simple Moving Average ───────────────────────────────────────────

export function calcSMA(candles, period = 20) {
  const result = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    result.push({ time: candles[i].time, value: +(sum / period).toFixed(6) });
  }
  return result;
}

// ─── Exponential Moving Average ──────────────────────────────────────

export function calcEMA(candles, period = 20) {
  if (candles.length < period) return [];

  const multiplier = 2 / (period + 1);
  const result = [];

  // Seed with SMA of the first `period` values
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let ema = sum / period;
  result.push({ time: candles[period - 1].time, value: +ema.toFixed(6) });

  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
    result.push({ time: candles[i].time, value: +ema.toFixed(6) });
  }
  return result;
}

// ─── Relative Strength Index ─────────────────────────────────────────

export function calcRSI(candles, period = 14) {
  if (candles.length < period + 1) return [];

  const result = [];
  const gains = [];
  const losses = [];

  // Calculate price changes
  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);
  }

  // Initial average gain/loss (SMA)
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // First RSI value
  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push({ time: candles[period].time, value: +(100 - 100 / (1 + rs0)).toFixed(2) });

  // Subsequent values using Wilder's smoothing
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push({ time: candles[i + 1].time, value: +(100 - 100 / (1 + rs)).toFixed(2) });
  }

  return result;
}

// ─── MACD (Moving Average Convergence Divergence) ────────────────────

export function calcMACD(candles, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  const fastEMA = calcEMA(candles, fastPeriod);
  const slowEMA = calcEMA(candles, slowPeriod);

  if (slowEMA.length === 0) return { macdLine: [], signalLine: [], histogram: [] };

  // Align fast EMA to slow EMA timeline
  const fastMap = new Map(fastEMA.map((d) => [d.time, d.value]));
  const macdLine = [];
  for (const point of slowEMA) {
    const fastVal = fastMap.get(point.time);
    if (fastVal !== undefined) {
      macdLine.push({ time: point.time, value: +(fastVal - point.value).toFixed(6) });
    }
  }

  // Signal line = EMA of MACD line
  const signalLine = [];
  if (macdLine.length >= signalPeriod) {
    const multiplier = 2 / (signalPeriod + 1);
    let sum = 0;
    for (let i = 0; i < signalPeriod; i++) sum += macdLine[i].value;
    let ema = sum / signalPeriod;
    signalLine.push({ time: macdLine[signalPeriod - 1].time, value: +ema.toFixed(6) });

    for (let i = signalPeriod; i < macdLine.length; i++) {
      ema = (macdLine[i].value - ema) * multiplier + ema;
      signalLine.push({ time: macdLine[i].time, value: +ema.toFixed(6) });
    }
  }

  // Histogram = MACD - Signal
  const signalMap = new Map(signalLine.map((d) => [d.time, d.value]));
  const histogram = [];
  for (const point of macdLine) {
    const sigVal = signalMap.get(point.time);
    if (sigVal !== undefined) {
      const val = +(point.value - sigVal).toFixed(6);
      histogram.push({
        time: point.time,
        value: val,
        color: val >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)',
      });
    }
  }

  return { macdLine, signalLine, histogram };
}

// ─── Bollinger Bands ─────────────────────────────────────────────────

export function calcBollingerBands(candles, period = 20, stdDevMultiplier = 2) {
  const upper = [];
  const middle = [];
  const lower = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const mean = sum / period;

    let sqDiffSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sqDiffSum += Math.pow(candles[j].close - mean, 2);
    }
    const stdDev = Math.sqrt(sqDiffSum / period);

    const t = candles[i].time;
    middle.push({ time: t, value: +mean.toFixed(6) });
    upper.push({ time: t, value: +(mean + stdDev * stdDevMultiplier).toFixed(6) });
    lower.push({ time: t, value: +(mean - stdDev * stdDevMultiplier).toFixed(6) });
  }

  return { upper, middle, lower };
}

// ─── Volume (formatted for histogram series) ─────────────────────────

export function formatVolume(candles) {
  return candles.map((c) => ({
    time: c.time,
    value: c.volume,
    color: c.close >= c.open ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)',
  }));
}

// ─── Indicator metadata (for the panel UI) ───────────────────────────

export const INDICATOR_DEFS = [
  { id: 'sma', name: 'SMA', fullName: 'Simple Moving Average', category: 'Trend', overlay: true, defaults: { period: 20 }, color: '#f59e0b' },
  { id: 'ema', name: 'EMA', fullName: 'Exponential Moving Average', category: 'Trend', overlay: true, defaults: { period: 20 }, color: '#8b5cf6' },
  { id: 'rsi', name: 'RSI', fullName: 'Relative Strength Index', category: 'Momentum', overlay: false, defaults: { period: 14 }, color: '#06b6d4' },
  { id: 'macd', name: 'MACD', fullName: 'Moving Avg Convergence Divergence', category: 'Momentum', overlay: false, defaults: { fast: 12, slow: 26, signal: 9 }, color: '#3b82f6' },
  { id: 'bb', name: 'BB', fullName: 'Bollinger Bands', category: 'Volatility', overlay: true, defaults: { period: 20, stdDev: 2 }, color: '#ec4899' },
  { id: 'volume', name: 'VOL', fullName: 'Volume', category: 'Volume', overlay: false, defaults: {}, color: '#6b7280' },
];
