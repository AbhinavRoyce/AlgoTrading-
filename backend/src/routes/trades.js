const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const where = { userId: req.userId };
    if (req.query.status) where.status = req.query.status;
    if (req.query.strategyId) where.strategyId = req.query.strategyId;
    const trades = await prisma.trade.findMany({ where, include: { strategy: { select: { name: true, type: true } } }, orderBy: { openedAt: 'desc' }, take: 50 });
    res.json(trades);
  } catch { res.status(500).json({ error: 'Failed to fetch trades' }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const trade = await prisma.trade.findFirst({ where: { id: req.params.id, userId: req.userId }, include: { strategy: { select: { name: true, type: true } } } });
    if (!trade) { res.status(404).json({ error: 'Trade not found' }); return; }
    res.json(trade);
  } catch { res.status(500).json({ error: 'Failed to fetch trade' }); }
});

module.exports = router;
