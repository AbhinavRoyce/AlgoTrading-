const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
require('dotenv').config();

const { initializeSocket } = require('./websocket/socket');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/markets');
const strategyRoutes = require('./routes/strategies');
const tradeRoutes = require('./routes/trades');
const backtestRoutes = require('./routes/backtest');
const accountRoutes = require('./routes/account');
const brokerRoutes = require('./routes/brokers');

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/markets', marketRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/backtest', backtestRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/brokers', brokerRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);
initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Algo Trading API running on port ${PORT}`);
});

module.exports = app;
