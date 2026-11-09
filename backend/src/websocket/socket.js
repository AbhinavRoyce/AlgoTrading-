const { Server } = require('socket.io');
const WebSocket = require('ws');
const { isCryptoSymbol, toBinanceSymbol } = require('../services/marketData.service');

let io;

// Track active Binance WebSocket connections per room
const activeBinanceStreams = new Map(); // key: `${symbol}:${interval}`, value: { ws }

// ─── Simulated price state for non-crypto symbols ─────────────────────
const MOCK_TICKERS = [
  { symbol: 'AAPL',    base: 178.72 },
  { symbol: 'MSFT',    base: 415.56 },
  { symbol: 'GOOGL',   base: 155.89 },
  { symbol: 'AMZN',    base: 182.41 },
  { symbol: 'NVDA',    base: 878.35 },
  { symbol: 'META',    base: 505.83 },
  { symbol: 'TSLA',    base: 175.22 },
  { symbol: 'JPM',     base: 198.45 },
  { symbol: 'EUR/USD', base: 1.0876 },
  { symbol: 'GBP/USD', base: 1.2678 },
];

// Running price tracker: keeps prices continuous between ticks
const livePrice  = {};
const candleOpen = {};
const candleHigh = {};
const candleLow  = {};
const candleMinute = {}; // UNIX seconds of the minute this candle opened

MOCK_TICKERS.forEach(({ symbol, base }) => {
  livePrice[symbol]    = base;
  const minuteTs       = Math.floor(Date.now() / 60000) * 60;
  candleOpen[symbol]   = base;
  candleHigh[symbol]   = base;
  candleLow[symbol]    = base;
  candleMinute[symbol] = minuteTs;
});

function initializeSocket(httpServer) {
  // Fix: use env var so CORS matches wherever the frontend is running
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:3001', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);

    socket.on('subscribe:ticker',    (ticker)  => { socket.join(`ticker:${ticker}`); });
    socket.on('unsubscribe:ticker',  (ticker)  => { socket.leave(`ticker:${ticker}`); });
    socket.on('subscribe:portfolio', (userId)  => { socket.join(`portfolio:${userId}`); });

    // ─── Candle subscriptions ──────────────────────────────────
    socket.on('subscribe:candles', ({ symbol, interval }) => {
      const roomKey = `candles:${symbol}:${interval}`;
      socket.join(roomKey);
      console.log(`[WS] ${socket.id} subscribed to ${roomKey}`);
      // Crypto → real Binance stream; everything else → mock simulator below
      if (isCryptoSymbol(symbol)) openBinanceCandleStream(symbol, interval);
    });

    socket.on('unsubscribe:candles', ({ symbol, interval }) => {
      const roomKey = `candles:${symbol}:${interval}`;
      socket.leave(roomKey);
      console.log(`[WS] ${socket.id} unsubscribed from ${roomKey}`);
      setTimeout(() => {
        const room = io.sockets.adapter.rooms.get(roomKey);
        if (!room || room.size === 0) closeBinanceCandleStream(symbol, interval);
      }, 2000);
    });

    socket.on('disconnect', () => { console.log(`[WS] Disconnected: ${socket.id}`); });
  });

  // ─── Tick every 2 s: update prices + emit ticker + update live candle ──
  setInterval(() => {
    MOCK_TICKERS.forEach(({ symbol, base }) => {
      // Random walk — small % change each tick
      const drift  = (Math.random() - 0.5) * base * 0.0015;
      livePrice[symbol] = +(livePrice[symbol] + drift).toFixed(symbol.includes('/') && !symbol.includes('USD/') ? 4 : 2);
      const price  = livePrice[symbol];

      // Maintain running candle OHLC
      const nowMinute = Math.floor(Date.now() / 60000) * 60;

      if (nowMinute !== candleMinute[symbol]) {
        // New minute — close old candle, start fresh
        candleMinute[symbol] = nowMinute;
        candleOpen[symbol]   = price;
        candleHigh[symbol]   = price;
        candleLow[symbol]    = price;
      } else {
        if (price > candleHigh[symbol]) candleHigh[symbol] = price;
        if (price < candleLow[symbol])  candleLow[symbol]  = price;
      }

      // Emit sidebar ticker update
      io.to(`ticker:${symbol}`).emit('price:update', {
        symbol, price,
        change: +drift.toFixed(4),
        changePercent: +((drift / base) * 100).toFixed(2),
        volume: Math.floor(Math.random() * 1_000_000),
        timestamp: Date.now(),
      });

      // Emit live candle update for this symbol (all subscribed intervals)
      // We emit on "1m" room — works perfectly for 1-minute chart.
      // For higher intervals the frontend coalesces updates correctly via setData.
      const candle = {
        time:  candleMinute[symbol],
        open:  candleOpen[symbol],
        high:  candleHigh[symbol],
        low:   candleLow[symbol],
        close: price,
        volume: Math.floor(Math.random() * 50_000_000) + 1_000_000,
        isClosed: false,
      };
      // Broadcast to all subscribed interval rooms for this symbol
      ['1m', '5m', '15m', '1h', '4h', '1d'].forEach((intv) => {
        io.to(`candles:${symbol}:${intv}`).emit('candle:update', { symbol, interval: intv, candle });
      });
    });
  }, 2000);
}

// ─── Binance WebSocket stream management ──────────────────────────────

function openBinanceCandleStream(symbol, interval) {
  const streamKey = `${symbol}:${interval}`;
  if (activeBinanceStreams.has(streamKey)) return; // Already streaming

  const binanceSymbol = toBinanceSymbol(symbol).toLowerCase();
  const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}@kline_${interval}`;

  console.log(`[Binance WS] Opening stream: ${wsUrl}`);

  const ws = new WebSocket(wsUrl);
  activeBinanceStreams.set(streamKey, { ws, retries: 0 });

  ws.on('open', () => { console.log(`[Binance WS] Connected: ${streamKey}`); });

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.e === 'kline' && data.k) {
        const k = data.k;
        const candle = {
          time:     Math.floor(k.t / 1000),
          open:     parseFloat(k.o),
          high:     parseFloat(k.h),
          low:      parseFloat(k.l),
          close:    parseFloat(k.c),
          volume:   parseFloat(k.v),
          isClosed: k.x,
        };
        const roomKey = `candles:${symbol}:${interval}`;
        io.to(roomKey).emit('candle:update', { symbol, interval, candle });
      }
    } catch (err) {
      console.error(`[Binance WS] Parse error:`, err.message);
    }
  });

  ws.on('close', () => { console.log(`[Binance WS] Closed: ${streamKey}`); activeBinanceStreams.delete(streamKey); });
  ws.on('error', (err) => { console.error(`[Binance WS] Error on ${streamKey}:`, err.message); ws.close(); });
  ws.on('ping', () => { ws.pong(); });
}

function closeBinanceCandleStream(symbol, interval) {
  const streamKey = `${symbol}:${interval}`;
  const entry = activeBinanceStreams.get(streamKey);
  if (entry) {
    console.log(`[Binance WS] Closing stream: ${streamKey}`);
    entry.ws.close();
    activeBinanceStreams.delete(streamKey);
  }
}

function emitTradeExecuted(userId, data)   { if (io) io.to(`portfolio:${userId}`).emit('trade:executed',    data); }
function emitStrategySignal(userId, data)  { if (io) io.to(`portfolio:${userId}`).emit('strategy:signal',   data); }
function emitPortfolioUpdate(userId, data) { if (io) io.to(`portfolio:${userId}`).emit('portfolio:update',  data); }

module.exports = { initializeSocket, emitTradeExecuted, emitStrategySignal, emitPortfolioUpdate };
