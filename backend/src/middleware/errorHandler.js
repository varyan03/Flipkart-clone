/**
 * Global error handling middleware.
 * Intercepts all errors thrown in routes and sends a standardized JSON response.
 * 
 * @param {Error|AppError} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
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
