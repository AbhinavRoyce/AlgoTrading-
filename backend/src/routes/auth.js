const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { res.status(409).json({ error: 'Email already registered' }); return; }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_SECRET || 'dev_refresh', { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, accessToken });
  } catch (err) { res.status(500).json({ error: 'Registration failed' }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) { res.status(401).json({ error: 'Invalid credentials' }); return; }
    const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, process.env.REFRESH_SECRET || 'dev_refresh', { expiresIn: '7d' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user.id, email: user.email, name: user.name, subscriptionTier: user.subscriptionTier }, accessToken, requires2FA: !!user.twoFaSecret });
  } catch (err) { res.status(500).json({ error: 'Login failed' }); }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) { res.status(401).json({ error: 'No refresh token' }); return; }
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET || 'dev_refresh');
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '15m' });
    res.json({ accessToken });
  } catch { res.status(401).json({ error: 'Invalid refresh token' }); }
});

// 2FA Setup
router.post('/2fa/setup', authMiddleware, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `AlgoTrading:${req.userId}` });
    await prisma.user.update({ where: { id: req.userId }, data: { twoFaSecret: secret.base32 } });
    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');
    res.json({ secret: secret.base32, qrCode });
  } catch { res.status(500).json({ error: '2FA setup failed' }); }
});

// 2FA Verify
router.post('/2fa/verify', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.twoFaSecret) { res.status(400).json({ error: '2FA not configured' }); return; }
    const isValid = speakeasy.totp.verify({ secret: user.twoFaSecret, encoding: 'base32', token });
    res.json({ valid: isValid });
  } catch { res.status(500).json({ error: '2FA verification failed' }); }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { id: true, email: true, name: true, avatarUrl: true, subscriptionTier: true, createdAt: true } });
    res.json(user);
  } catch { res.status(500).json({ error: 'Failed to fetch user' }); }
});

module.exports = router;
