const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function executeStrategy(strategy) {
  console.log(`[Strategy] Executing ${strategy.name} (${strategy.type}) on ${strategy.ticker}`);
}

async function getActiveStrategies(userId) {
  return prisma.strategy.findMany({ where: { userId, status: 'ACTIVE' } });
}

async function deactivateStrategy(strategyId) {
  await prisma.strategy.update({ where: { id: strategyId }, data: { status: 'INACTIVE' } });
}

module.exports = { executeStrategy, getActiveStrategies, deactivateStrategy };
