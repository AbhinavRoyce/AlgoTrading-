class AppError extends Error {
  constructor(message, statusCode) { super(message); this.statusCode = statusCode; }
}

const errorHandler = (err, _req, res, _next) => {
  console.error('Error:', err.message);
  if (err instanceof AppError) { res.status(err.statusCode).json({ error: err.message }); return; }
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = { AppError, errorHandler };
