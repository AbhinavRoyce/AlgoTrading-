const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');
const { runBacktest } = require('../services/backtest.service');

const router = Router();
const prisma = new PrismaClient();

router.post('/run', authMiddleware, async (req, res) => {
  try {
    const { strategyId, startDate, endDate } = req.body;
    const strategy = await prisma.strategy.findFirst({ where: { id: strategyId, userId: req.userId } });
    if (!strategy) { res.status(404).json({ error: 'Strategy not found' }); return; }
    const result = await runBacktest({ type: strategy.type, parameters: strategy.parameters, ticker: strategy.ticker }, new Date(startDate), new Date(endDate));
    const saved = await prisma.backtestResult.create({
      data: { strategyId, startDate: new Date(startDate), endDate: new Date(endDate), totalProfit: result.totalProfit, drawdownPct: result.drawdownPct, sharpeRatio: result.sharpeRatio, winRate: result.winRate, totalTrades: result.totalTrades, equityCurve: result.equityCurve },
    });
    res.json(saved);
  } catch { res.status(500).json({ error: 'Backtest failed' }); }
});

router.get('/results/:strategyId', authMiddleware, async (req, res) => {
  try {
    const strategy = await prisma.strategy.findFirst({ where: { id: req.params.strategyId, userId: req.userId } });
    if (!strategy) { res.status(404).json({ error: 'Strategy not found' }); return; }
    const results = await prisma.backtestResult.findMany({ where: { strategyId: req.params.strategyId }, orderBy: { createdAt: 'desc' } });
    res.json(results);
  } catch { res.status(500).json({ error: 'Failed to fetch results' }); }
});

module.exports = router;
