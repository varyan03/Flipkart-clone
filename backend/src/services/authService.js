const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { AppError } = require('../utils/response');

const SALT_ROUNDS = 12;
const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY });
}

async function createRefreshToken(userId) {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  await prisma.refreshToken.create({
    data: { token: hash, userId, expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS) }
  });
  return raw;
}

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 15 * 60 * 1000
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: REFRESH_EXPIRY_MS
  });
}

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

async function logout(rawRefreshToken, res) {
  if (rawRefreshToken) {
    const hash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    await prisma.refreshToken.deleteMany({ where: { token: hash } });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
}

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
