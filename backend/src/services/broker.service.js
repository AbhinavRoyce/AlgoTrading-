async function alpacaPlaceOrder(order) {
  console.log(`[Alpaca] ${order.side} ${order.quantity} ${order.ticker}`);
  return { orderId: `ALP-${Date.now()}`, status: 'FILLED', filledPrice: order.limitPrice || 0, filledQty: order.quantity, timestamp: new Date().toISOString() };
}

async function ibkrPlaceOrder(order) {
  console.log(`[IBKR] ${order.side} ${order.quantity} ${order.ticker}`);
  return { orderId: `IBKR-${Date.now()}`, status: 'FILLED', filledPrice: order.limitPrice || 0, filledQty: order.quantity, timestamp: new Date().toISOString() };
}

async function coinbasePlaceOrder(order) {
  console.log(`[Coinbase] ${order.side} ${order.quantity} ${order.ticker}`);
  return { orderId: `CB-${Date.now()}`, status: 'FILLED', filledPrice: order.limitPrice || 0, filledQty: order.quantity, timestamp: new Date().toISOString() };
}

async function alpacaGetAccount() {
  return { balance: 125_432.56, equity: 132_891.23, availableCash: 45_678.90, buyingPower: 91_357.80 };
}

module.exports = { alpacaPlaceOrder, ibkrPlaceOrder, coinbasePlaceOrder, alpacaGetAccount };
