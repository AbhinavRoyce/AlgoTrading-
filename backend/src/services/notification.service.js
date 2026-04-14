async function sendEmailAlert(to, subject, body) { console.log(`[Email] To: ${to}, Subject: ${subject}`); }
async function sendSMSAlert(phone, message) { console.log(`[SMS] To: ${phone}, Message: ${message}`); }
async function notifyPriceAlert(userId, ticker, price, condition) { console.log(`[Alert] ${userId}: ${ticker} ${condition} at $${price}`); }
async function notifyTradeExecution(userId, ticker, side, price, qty) { console.log(`[Trade] ${userId}: ${side} ${qty} ${ticker} @ $${price}`); }

module.exports = { sendEmailAlert, sendSMSAlert, notifyPriceAlert, notifyTradeExecution };
