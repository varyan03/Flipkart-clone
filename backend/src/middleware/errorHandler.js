function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${status}] ${req.method} ${req.path} — ${message}`);
    if (status === 500) console.error(err.stack);
  }

  res.status(status).json({ success: false, error: message });
}

module.exports = { errorHandler };
