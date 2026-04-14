const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const strategies = await prisma.strategy.findMany({ where: { userId: req.userId }, include: { _count: { select: { trades: true } } }, orderBy: { updatedAt: 'desc' } });
    res.json(strategies);
  } catch { res.status(500).json({ error: 'Failed to fetch strategies' }); }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const strategy = await prisma.strategy.findFirst({ where: { id: req.params.id, userId: req.userId }, include: { trades: { orderBy: { openedAt: 'desc' }, take: 20 }, backtests: { orderBy: { createdAt: 'desc' }, take: 5 } } });
    if (!strategy) { res.status(404).json({ error: 'Strategy not found' }); return; }
    res.json(strategy);
  } catch { res.status(500).json({ error: 'Failed to fetch strategy' }); }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, type, parameters, assetClass, ticker } = req.body;
    const strategy = await prisma.strategy.create({ data: { userId: req.userId, name, type, parameters, assetClass, ticker } });
    res.status(201).json(strategy);
  } catch { res.status(500).json({ error: 'Failed to create strategy' }); }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, type, parameters, assetClass, ticker, status } = req.body;
    const strategy = await prisma.strategy.updateMany({ where: { id: req.params.id, userId: req.userId }, data: { name, type, parameters, assetClass, ticker, status } });
    res.json(strategy);
  } catch { res.status(500).json({ error: 'Failed to update strategy' }); }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.strategy.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete strategy' }); }
});

router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const strategy = await prisma.strategy.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!strategy) { res.status(404).json({ error: 'Strategy not found' }); return; }
    const updated = await prisma.strategy.update({ where: { id: strategy.id }, data: { status: strategy.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } });
    res.json(updated);
  } catch { res.status(500).json({ error: 'Failed to toggle strategy' }); }
});

module.exports = router;
