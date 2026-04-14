const { Server } = require('socket.io');

let io;

function initializeSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', methods: ['GET', 'POST'] } });

  io.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);
    socket.on('subscribe:ticker', (ticker) => { socket.join(`ticker:${ticker}`); });
    socket.on('unsubscribe:ticker', (ticker) => { socket.leave(`ticker:${ticker}`); });
    socket.on('subscribe:portfolio', (userId) => { socket.join(`portfolio:${userId}`); });
    socket.on('disconnect', () => { console.log(`[WS] Disconnected: ${socket.id}`); });
  });

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

function emitTradeExecuted(userId, data) { if (io) io.to(`portfolio:${userId}`).emit('trade:executed', data); }
function emitStrategySignal(userId, data) { if (io) io.to(`portfolio:${userId}`).emit('strategy:signal', data); }
function emitPortfolioUpdate(userId, data) { if (io) io.to(`portfolio:${userId}`).emit('portfolio:update', data); }

module.exports = { initializeSocket, emitTradeExecuted, emitStrategySignal, emitPortfolioUpdate };
