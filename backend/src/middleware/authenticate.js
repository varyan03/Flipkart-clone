const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/response');

/**
 * Middleware that verifies the JWT access token from the httpOnly cookie.
 * Attaches req.user = { id } if valid.
 */
function authenticate(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) throw new AppError('Not authenticated', 401);

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.userId };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('Token expired', 401);
    throw new AppError('Invalid token', 401);
  }
}

/**
 * Optional auth — attaches req.user if cookie present, doesn't block if not.
 */
function optionalAuth(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.userId };
  } catch {
    // Silently ignore — guest user
  }
  next();
}

module.exports = { authenticate, optionalAuth };
