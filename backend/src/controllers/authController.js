const authService = require('../services/authService');
const prisma = require('../lib/prisma');
const { sendSuccess } = require('../utils/response');
const { AppError } = require('../utils/response');

/**
 * Handler for user registration.
 * Expects name, email, and password in request body.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.signup({ name, email, password });
  authService.setAuthCookies(res, accessToken, refreshToken);
  sendSuccess(res, { user }, 'Account created successfully', 201);
};

/**
 * Handler for user login.
 * Validates credentials and merges optional guest cart.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  const guestCartId = req.cookies?.guestCartId || null;
  const { user, accessToken, refreshToken } = await authService.login({ email, password, guestCartId });
  authService.setAuthCookies(res, accessToken, refreshToken);
  sendSuccess(res, { user }, 'Logged in successfully');
};

/**
 * Handler for refreshing authentication tokens using the refresh token cookie.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refresh = async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) throw new AppError('No refresh token', 401);
  const { accessToken, refreshToken } = await authService.refreshTokens(rawRefreshToken);
  authService.setAuthCookies(res, accessToken, refreshToken);
  sendSuccess(res, {}, 'Token refreshed');
};

/**
 * Handler for logging out a user.
 * Clears cookies and invalidates the session in the DB.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  await authService.logout(req.cookies?.refreshToken, res);
  sendSuccess(res, {}, 'Logged out successfully');
};

/**
 * Handler for fetching the currently authenticated user's profile.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true }
  });
  sendSuccess(res, { user });
};

module.exports = { signup, login, refresh, logout, me };
