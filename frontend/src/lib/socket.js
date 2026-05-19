import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000', { autoConnect: true, reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 2000 });
    socket.on('connect', () => console.log('[WS] Connected'));
    socket.on('disconnect', () => console.log('[WS] Disconnected'));
  }
  return socket;
}

export function subscribeTicker(ticker) { getSocket().emit('subscribe:ticker', ticker); }
export function unsubscribeTicker(ticker) { getSocket().emit('unsubscribe:ticker', ticker); }
export function subscribePortfolio(userId) { getSocket().emit('subscribe:portfolio', userId); }

// ─── Candle subscription helpers (for live chart updates) ─────────────
export function subscribeCandles(symbol, interval) {
  getSocket().emit('subscribe:candles', { symbol, interval });
}

export function unsubscribeCandles(symbol, interval) {
  getSocket().emit('unsubscribe:candles', { symbol, interval });
}

export function onCandleUpdate(callback) {
  getSocket().on('candle:update', callback);
  return () => getSocket().off('candle:update', callback);
}
