const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { getMarketData, getOHLCVData, getMarketNews, getCandleData } = require('../services/marketData.service');

const router = Router();

router.get('/tickers', authMiddleware, async (req, res) => {
  try {
    const assetClass = req.query.assetClass || 'stocks';
    const data = await getMarketData(assetClass);
    res.json(data);
  } catch { res.status(500).json({ error: 'Failed to fetch tickers' }); }
});

router.get('/ohlcv/:ticker', authMiddleware, async (req, res) => {
  try {
    const { ticker } = req.params;
    const interval = req.query.interval || '1d';
    const data = await getOHLCVData(ticker, interval);
    res.json(data);
  } catch { res.status(500).json({ error: 'Failed to fetch OHLCV data' }); }
});

// ─── New: Dedicated candles endpoint with metadata ───────────────────
router.get('/candles/:symbol', authMiddleware, async (req, res) => {
  try {
    const { symbol } = req.params;
    const interval = req.query.interval || '1h';
    const limit = req.query.limit || 500;
    const data = await getCandleData(symbol, interval, limit);
    res.json(data);
  } catch (err) {
    console.error('[Markets] Candle fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch candle data' });
  }
});

router.get('/news', authMiddleware, async (_req, res) => {
  try {
    const news = await getMarketNews();
    res.json(news);
  } catch { res.status(500).json({ error: 'Failed to fetch news' }); }
});

module.exports = router;
