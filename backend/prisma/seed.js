const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');
  const passwordHash = await bcrypt.hash('demo123456', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@algotradehub.com' }, update: {},
    create: { email: 'demo@algotradehub.com', passwordHash, name: 'Alex Trading', subscriptionTier: 'PRO' },
  });

  const strategies = await Promise.all([
    prisma.strategy.create({ data: { userId: user.id, name: 'NVDA Momentum Alpha', type: 'TREND_FOLLOWING', status: 'ACTIVE', parameters: { shortPeriod: 10, longPeriod: 30, stopLoss: 3, takeProfit: 8 }, assetClass: 'stocks', ticker: 'NVDA' } }),
    prisma.strategy.create({ data: { userId: user.id, name: 'BTC Volatility Catcher', type: 'VOLATILITY_BREAKOUT', status: 'ACTIVE', parameters: { bollingerPeriod: 20, bollingerStdDev: 2, stopLoss: 5, takeProfit: 12 }, assetClass: 'crypto', ticker: 'BTC/USD' } }),
    prisma.strategy.create({ data: { userId: user.id, name: 'EUR/USD Mean Rev', type: 'MEAN_REVERSION', status: 'INACTIVE', parameters: { rsiPeriod: 14, oversold: 30, overbought: 70 }, assetClass: 'forex', ticker: 'EUR/USD' } }),
    prisma.strategy.create({ data: { userId: user.id, name: 'AAPL Grid Bot', type: 'GRID_TRADING', status: 'ACTIVE', parameters: { gridLevels: 10, gridSpacing: 2 }, assetClass: 'stocks', ticker: 'AAPL' } }),
    prisma.strategy.create({ data: { userId: user.id, name: 'ETH-SOL Arb', type: 'ARBITRAGE', status: 'BACKTEST', parameters: { spreadThreshold: 0.5 }, assetClass: 'crypto', ticker: 'ETH/USD' } }),
  ]);

  for (const t of [
    { strategyId: strategies[0].id, userId: user.id, ticker: 'NVDA', side: 'LONG', entryPrice: 845.50, exitPrice: 878.35, qty: 12, pnl: 394.20, status: 'CLOSED', closedAt: new Date() },
    { strategyId: strategies[0].id, userId: user.id, ticker: 'NVDA', side: 'LONG', entryPrice: 867.20, qty: 8, pnl: null, status: 'OPEN' },
    { strategyId: strategies[1].id, userId: user.id, ticker: 'BTC/USD', side: 'LONG', entryPrice: 64200, exitPrice: 67245.32, qty: 0.5, pnl: 1522.66, status: 'CLOSED', closedAt: new Date() },
    { strategyId: strategies[3].id, userId: user.id, ticker: 'AAPL', side: 'LONG', entryPrice: 172.45, exitPrice: 178.72, qty: 25, pnl: 156.75, status: 'CLOSED', closedAt: new Date() },
  ]) { await prisma.trade.create({ data: t }); }

  let balance = 100000;
  for (let i = 365; i >= 0; i--) {
    balance += (Math.random() - 0.45) * 300;
    await prisma.portfolioSnapshot.create({ data: { userId: user.id, balance: +balance.toFixed(2), equity: +(balance * (1 + Math.random() * 0.05)).toFixed(2), availableCash: +(balance * 0.35).toFixed(2), snapshotAt: new Date(Date.now() - i * 86400000) } });
  }

  for (const a of [
    { userId: user.id, type: 'ORDER_EXEC', amount: 394.20, description: 'NVDA LONG closed +$394.20' },
    { userId: user.id, type: 'ORDER_EXEC', amount: 1522.66, description: 'BTC/USD LONG closed +$1,522.66' },
    { userId: user.id, type: 'DEPOSIT', amount: 25000, description: 'Wire transfer deposit' },
    { userId: user.id, type: 'SUB_RENEW', amount: -49.99, description: 'PRO subscription renewed' },
  ]) { await prisma.accountActivity.create({ data: a }); }

  console.log('✅ Seed complete! demo@algotradehub.com / demo123456');
}

seed().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
