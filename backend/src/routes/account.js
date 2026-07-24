const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();
const prisma = new PrismaClient();

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, email: true, name: true, avatarUrl: true, subscriptionTier: true, createdAt: true } });
    res.json(user);
  } catch { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const activities = await prisma.accountActivity.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, take: 50 });
    res.json(activities);
  } catch { res.status(500).json({ : 'Failed to fetch activities' }); }
});

router.get('/snapshots', authMiddleware, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 365;
    const since = new Date(Date.now() - days * 86400000);
    const snapshots = await prisma.portfolioSnapshot.findMany({ where: { userId: req.userId, snapshotAt: { gte: since } }, orderBy: { snapshotAt: 'asc' } });
    res.json(snapshots);
  } catch { res.status(500).json({ error: 'Failed to fetch snapshots' }); }
});

router.get('/performance', authMiddleware, async (req, res) => {
  try {
    const trades = await prisma.trade.findMany({ where: { userId: req.userId, status: 'CLOSED' }, select: { pnl: true } });
    const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const wins = trades.filter(t => (t.pnl || 0) > 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
    const latestSnapshot = await prisma.portfolioSnapshot.findFirst({ where: { userId: req.userId }, orderBy: { snapshotAt: 'desc' } });
    res.json({ totalPnl, totalTrades: trades.length, winRate, balance: latestSnapshot?.balance || 0, equity: latestSnapshot?.equity || 0, availableCash: latestSnapshot?.availableCash || 0 });
  } catch { res.status(500).json({ error: 'Failed to fetch performance' }); }
});

module.exports = router;
