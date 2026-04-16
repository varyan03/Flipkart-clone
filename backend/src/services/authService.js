const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { AppError } = require('../utils/response');

const SALT_ROUNDS = 12;
const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generates a short-lived JWT access token for a user.
 * 
 * @param {number} userId - The unique ID of the user
 * @returns {string} Signed JWT access token
 */
function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY });
}

/**
 * Creates a new refresh token, hashes it for database storage, and returns the raw version.
 * 
 * @param {number} userId - The unique ID of the user
 * @returns {Promise<string>} The raw (unhashed) refresh token
 */
async function createRefreshToken(userId) {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  await prisma.refreshToken.create({
    data: { token: hash, userId, expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS) }
  });
  return raw;
}

/**
 * Configures and sets httpOnly authentication cookies on the response object.
 * 
 * @param {Object} res - Express response object
 * @param {string} accessToken - The JWT access token
 * @param {string} refreshToken - The raw refresh token
 */
function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  
  // Note: sameSite: 'none' requires secure: true. 
  // This allows cookies to be sent across different domains (Vercel -> Render).
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', // Use 'none' for cross-domain production
    maxAge: 15 * 60 * 1000
  };

  res.cookie('accessToken', accessToken, cookieOptions);
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_EXPIRY_MS
  });
}

/**
 * Registers a new user, hashes their password, and generates their initial tokens.
 * 
 * @param {Object} payload - User registration data
 * @param {string} payload.name - User's full name
 * @param {string} payload.email - User's email address
 * @param {string} payload.password - User's plain-text password
 * @returns {Promise<Object>} Object containing safe user data and tokens
 * @throws {AppError} 409 if email is already in use
 */
async function signup({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true }
  });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await createRefreshToken(user.id);
  return { user, accessToken, refreshToken };
}

/**
 * Authenticates a user, verifies their password, and optionally merges a guest cart.
 * 
 * @param {Object} payload - Login credentials and optional guest data
 * @param {string} payload.email - User's email address
 * @param {string} payload.password - User's plain-text password
 * @param {string} [payload.guestCartId] - Optional cart ID to merge into the user's account
 * @returns {Promise<Object>} Object containing safe user data and new tokens
 * @throws {AppError} 401 if credentials are invalid
 */
async function login({ email, password, guestCartId }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const isValid = user && await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new AppError('Invalid email or password', 401);

  if (guestCartId) {
    await mergeGuestCart(guestCartId, user.id);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await createRefreshToken(user.id);
  const safeUser = { id: user.id, name: user.name, email: user.email };
  return { user: safeUser, accessToken, refreshToken };
}

/**
 * Refreshes an authentication session using a valid refresh token.
 * 
 * @param {string} rawRefreshToken - The raw refresh token from cookies
 * @returns {Promise<Object>} Object containing new access and refresh tokens
 * @throws {AppError} 401 if token is invalid or expired
 */
async function refreshTokens(rawRefreshToken) {
  const hash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const stored = await prisma.refreshToken.findUnique({ where: { token: hash } });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new AppError('Invalid or expired refresh token', 401);
  }

  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const accessToken = generateAccessToken(stored.userId);
  const refreshToken = await createRefreshToken(stored.userId);
  return { accessToken, refreshToken };
}

/**
 * Logs out a user by deleting their refresh token from the DB and clearing cookies.
 * 
 * @param {string} rawRefreshToken - The raw refresh token to invalidate
 * @param {Object} res - Express response object to clear cookies from
 * @returns {Promise<void>}
 */
async function logout(rawRefreshToken, res) {
  if (rawRefreshToken) {
    const hash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    await prisma.refreshToken.deleteMany({ where: { token: hash } });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

/**
 * Merges products from a guest cart into a user's persistent cart upon login.
 * 
 * @param {string} guestCartId - The UUID of the guest's cart
 * @param {number} userId - The unique ID of the authenticated user
 * @returns {Promise<void>}
 */
async function mergeGuestCart(guestCartId, userId) {
  const guestCart = await prisma.cart.findUnique({
    where: { id: guestCartId },
    include: { items: true }
  });
  if (!guestCart || guestCart.items.length === 0) return;

  let userCart = await prisma.cart.findUnique({ where: { userId } });
  if (!userCart) {
    const { randomUUID } = require('crypto');
    userCart = await prisma.cart.create({ data: { id: randomUUID(), userId } });
  }

  for (const item of guestCart.items) {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
      update: { quantity: { increment: item.quantity } },
      create: { cartId: userCart.id, productId: item.productId, quantity: item.quantity }
    });
  }

  await prisma.cart.delete({ where: { id: guestCartId } });
}

module.exports = { signup, login, refreshTokens, logout, setAuthCookies };
