const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();
const prisma = new PrismaClient();

router.get('/keys', authMiddleware, async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({ where: { userId: req.userId }, select: { id: true, exchange: true, label: true, isActive: true, lastUsedAt: true, createdAt: true } });
    res.json(keys);
  } catch { res.status(500).json({ error: 'Failed to fetch API keys' }); }
});

router.post('/keys', authMiddleware, async (req, res) => {
  try {
    const { exchange, key, secret, label } = req.body;
    const apiKey = await prisma.apiKey.create({ data: { userId: req.userId, exchange, keyEncrypted: key, secretEncrypted: secret, label } });
    res.status(201).json({ id: apiKey.id, exchange: apiKey.exchange, label: apiKey.label });
  } catch { res.status(500).json({ error: 'Failed to add API key' }); }
});

router.patch('/keys/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const key = await prisma.apiKey.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!key) { res.status(404).json({ error: 'API key not found' }); return; }
    const updated = await prisma.apiKey.update({ where: { id: key.id }, data: { isActive: !key.isActive } });
    res.json({ id: updated.id, isActive: updated.isActive });
  } catch { res.status(500).json({ error: 'Failed to toggle API key' }); }
});

router.delete('/keys/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.apiKey.deleteMany({ where: { id: req.params.id, userId: req.userId } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete API key' }); }
});

router.get('/banks', authMiddleware, async (req, res) => {
  try {
    const banks = await prisma.linkedBank.findMany({ where: { userId: req.userId } });
    res.json(banks);
  } catch { res.status(500).json({ error: 'Failed to fetch banks' }); }
});

module.exports = router;
