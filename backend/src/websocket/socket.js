const { Server } = require('socket.io');
const WebSocket = require('ws');
const { isCryptoSymbol, toBinanceSymbol } = require('../services/marketData.service');

let io;

// Track active Binance WebSocket connections per room
const activeBinanceStreams = new Map(); // key: `${symbol}:${interval}`, value: { ws, subscribers: Set }

function initializeSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] } });

  io.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);

    // ─── Existing ticker subscriptions ──────────────────────────
    socket.on('subscribe:ticker', (ticker) => { socket.join(`ticker:${ticker}`); });
    socket.on('unsubscribe:ticker', (ticker) => { socket.leave(`ticker:${ticker}`); });
    socket.on('subscribe:portfolio', (userId) => { socket.join(`portfolio:${userId}`); });

    // ─── New: Live candle subscriptions via Binance WebSocket ───
    socket.on('subscribe:candles', ({ symbol, interval }) => {
      const roomKey = `candles:${symbol}:${interval}`;
      socket.join(roomKey);
      console.log(`[WS] ${socket.id} subscribed to ${roomKey}`);

      if (isCryptoSymbol(symbol)) {
        openBinanceCandleStream(symbol, interval);
      }
    });

    socket.on('unsubscribe:candles', ({ symbol, interval }) => {
      const roomKey = `candles:${symbol}:${interval}`;
      socket.leave(roomKey);
      console.log(`[WS] ${socket.id} unsubscribed from ${roomKey}`);

      // Clean up Binance stream if no more subscribers
      setTimeout(() => {
        const room = io.sockets.adapter.rooms.get(roomKey);
        if (!room || room.size === 0) {
          closeBinanceCandleStream(symbol, interval);
        }
      }, 2000);
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Disconnected: ${socket.id}`);
    });
  });

  // ─── Existing price ticker simulation ───────────────────────────
  setInterval(() => {
    [
      { symbol: 'AAPL', base: 178.72 }, { symbol: 'MSFT', base: 415.56 }, { symbol: 'NVDA', base: 878.35 },
      { symbol: 'TSLA', base: 175.22 }, { symbol: 'BTC/USD', base: 67245.32 }, { symbol: 'ETH/USD', base: 3456.78 },
    ].forEach(({ symbol, base }) => {
      const change = (Math.random() - 0.5) * base * 0.002;
      io.to(`ticker:${symbol}`).emit('price:update', {
        symbol, price: +(base + change).toFixed(2), change: +change.toFixed(4),
        changePercent: +((change / base) * 100).toFixed(2), volume: Math.floor(Math.random() * 1_000_000), timestamp: Date.now(),
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

  ws.on('open', () => {
    console.log(`[Binance WS] Connected: ${streamKey}`);
  });

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.e === 'kline' && data.k) {
        const k = data.k;
        const candle = {
          time: Math.floor(k.t / 1000),
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
          isClosed: k.x, // true when candle is finalized
        };
        const roomKey = `candles:${symbol}:${interval}`;
        io.to(roomKey).emit('candle:update', { symbol, interval, candle });
      }
    } catch (err) {
      console.error(`[Binance WS] Parse error:`, err.message);
    }
  });

  ws.on('close', () => {
    console.log(`[Binance WS] Closed: ${streamKey}`);
    activeBinanceStreams.delete(streamKey);
  });

  ws.on('error', (err) => {
    console.error(`[Binance WS] Error on ${streamKey}:`, err.message);
    ws.close();
  });

  // Respond to pings from Binance to keep connection alive
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

function emitTradeExecuted(userId, data) { if (io) io.to(`portfolio:${userId}`).emit('trade:executed', data); }
function emitStrategySignal(userId, data) { if (io) io.to(`portfolio:${userId}`).emit('strategy:signal', data); }
function emitPortfolioUpdate(userId, data) { if (io) io.to(`portfolio:${userId}`).emit('portfolio:update', data); }

module.exports = { initializeSocket, emitTradeExecuted, emitStrategySignal, emitPortfolioUpdate };
