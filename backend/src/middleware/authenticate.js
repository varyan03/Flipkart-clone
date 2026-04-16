const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/response');

/**
 * Middleware that strictly verifies the JWT access token from the httpOnly cookie.
 * Attaches the authenticated user ID to req.user if valid.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {AppError} 401 if token is missing, expired, or invalid
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
 * Middleware for optional authentication. 
 * Attaches req.user if a valid cookie is present, but allows the request
 * to proceed for guests if no token exists.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function optionalAuth(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = { id: payload.userId };
  } catch {
    // Silently ignore invalid tokens — treat as guest
  }
  next();
}

module.exports = { authenticate, optionalAuth };
