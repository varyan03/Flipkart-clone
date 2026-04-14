const authService = require('../services/authService');
const prisma = require('../lib/prisma');
const { sendSuccess } = require('../utils/response');
const { AppError } = require('../utils/response');

const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.signup({ name, email, password });
  authService.setAuthCookies(res, accessToken, refreshToken);
  sendSuccess(res, { user }, 'Account created successfully', 201);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const guestCartId = req.cookies?.guestCartId || null;
  const { user, accessToken, refreshToken } = await authService.login({ email, password, guestCartId });
  authService.setAuthCookies(res, accessToken, refreshToken);
  sendSuccess(res, { user }, 'Logged in successfully');
};

const refresh = async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  if (!rawRefreshToken) throw new AppError('No refresh token', 401);
  const { accessToken, refreshToken } = await authService.refreshTokens(rawRefreshToken);
  authService.setAuthCookies(res, accessToken, refreshToken);
  sendSuccess(res, {}, 'Token refreshed');
};

const logout = async (req, res) => {
  await authService.logout(req.cookies?.refreshToken, res);
  sendSuccess(res, {}, 'Logged out successfully');
};

const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true }
  });
  sendSuccess(res, { user });
};

module.exports = { signup, login, refresh, logout, me };
