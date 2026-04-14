const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function calculatePortfolioMetrics(userId) {
  const trades = await prisma.trade.findMany({ where: { userId, status: 'CLOSED' }, select: { pnl: true } });
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = trades.filter(t => (t.pnl || 0) > 0).length;
  return { totalPnl, totalTrades: trades.length, winningTrades: wins, losingTrades: trades.length - wins, winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0 };
}

async function createPortfolioSnapshot(userId, balance, equity, availableCash) {
  return prisma.portfolioSnapshot.create({ data: { userId, balance, equity, availableCash } });
}

async function getPerformanceTimeSeries(userId, days = 365) {
  return prisma.portfolioSnapshot.findMany({ where: { userId, snapshotAt: { gte: new Date(Date.now() - days * 86400000) } }, orderBy: { snapshotAt: 'asc' } });
}

module.exports = { calculatePortfolioMetrics, createPortfolioSnapshot, getPerformanceTimeSeries };
