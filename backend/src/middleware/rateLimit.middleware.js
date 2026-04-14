const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true, legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, max: 100,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true, legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter };
