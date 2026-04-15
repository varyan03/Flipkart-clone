# Flipkart Clone — Bonus Features Implementation Plan

> Builds on top of the existing core implementation.  
> Auth: JWT with httpOnly cookies (access + refresh tokens)  
> Wishlist: DB-persisted, tied to logged-in user  
> Responsive: Polish pass on existing layout  

---

## Table of Contents

1. [What Changes in the Existing Codebase](#1-what-changes-in-the-existing-codebase)
2. [Database Schema Additions](#2-database-schema-additions)
3. [Feature A — User Authentication (Login / Signup)](#3-feature-a--user-authentication-login--signup)
4. [Feature B — Wishlist](#4-feature-b--wishlist)
5. [Feature C — Order History](#5-feature-c--order-history)
6. [Feature D — Responsive Design Polish](#6-feature-d--responsive-design-polish)
7. [Security Checklist](#7-security-checklist)
8. [Execution Timeline](#8-execution-timeline)
9. [Interview Prep — Bonus Questions](#9-interview-prep--bonus-questions)

---

## 1. What Changes in the Existing Codebase

Before building anything new, here is a clear list of what needs to be modified in the existing code — so there are no surprises.

### Backend Changes
`
| File | Change |
|---|---|
| `prisma/schema.prisma` | Add `User`, `Wishlist` models; link `Order` and `Cart` to `User` |
| `server.js` | Add `cookie-parser` middleware; mount new `authRoutes`, `wishlistRoutes` |
| `routes/orderRoutes.js` | Add `GET /orders` (order history) route, protect with `authenticate` middleware |
| `routes/cartRoutes.js` | Cart creation now links to `userId` if logged in |
| `middleware/` | Add `authenticate.js` — verifies access token from cookie |
| New files | `routes/authRoutes.js`, `controllers/authController.js`, `services/authService.js` |
| New files | `routes/wishlistRoutes.js`, `controllers/wishlistController.js`, `services/wishlistService.js` |

### Frontend Changes

| File | Change |
|---|---|
| `store/` | Add `authStore.js` (user state, login/logout) |
| `App.jsx` | Add `ProtectedRoute` wrapper; call `authStore.checkSession()` on mount |
| `api/apiClient.js` | Add `withCredentials: true` to Axios config (sends cookies automatically) |
| `Navbar.jsx` | Replace static "Login" link with dynamic user menu (show name, dropdown with Wishlist / Orders / Logout) |
| New pages | `LoginPage.jsx`, `SignupPage.jsx`, `WishlistPage.jsx`, `OrderHistoryPage.jsx` |
| New components | `WishlistButton.jsx` (heart icon on ProductCard + DetailPage) |

### Key Architectural Decision — Cart Migration on Login

When a guest user (no account) adds items to cart and then logs in, their cart must be **merged** with any existing server cart for that user. This is handled in `authService.login()`.

---

## 2. Database Schema Additions

Add these models to `prisma/schema.prisma`. Everything else stays as-is.

```prisma
// ── NEW: User model ──────────────────────────────────────────────
model User {
  id           Int        @id @default(autoincrement())
  email        String     @unique
  name         String
  passwordHash String                         // bcrypt hash, NEVER store plain text
  cart         Cart?                          // One active cart per user
  orders       Order[]                        // Order history
  wishlist     Wishlist[]
  refreshTokens RefreshToken[]
  createdAt    DateTime   @default(now())
}

// ── NEW: RefreshToken model ───────────────────────────────────────
// Stored in DB so we can invalidate all sessions on logout
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique               // The raw refresh token (hashed before storing)
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
}

// ── NEW: Wishlist model ───────────────────────────────────────────
model Wishlist {
  id        Int      @id @default(autoincrement())
  userId    Int
  productId Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])            // A product can only appear once per user's wishlist
  @@index([userId])
}

// ── MODIFIED: Cart — add optional userId ─────────────────────────
model Cart {
  id        String   @id @default(uuid())
  userId    Int?     @unique               // null = guest cart; unique = one cart per logged-in user
  user      User?    @relation(fields: [userId], references: [id])
  items     CartItem[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ── MODIFIED: Order — add userId ─────────────────────────────────
model Order {
  id             String      @id @default(uuid())
  userId         Int?                              // null = guest order (pre-auth orders)
  user           User?       @relation(fields: [userId], references: [id])
  status         OrderStatus @default(PLACED)
  subtotal       Decimal     @db.Decimal(10, 2)
  discount       Decimal     @db.Decimal(10, 2) @default(0)
  deliveryCharge Decimal     @db.Decimal(10, 2) @default(0)
  total          Decimal     @db.Decimal(10, 2)
  items          OrderItem[]
  address        Address?
  createdAt      DateTime    @default(now())

  @@index([userId])                               // Fast lookup for order history
}

// ── ADD to Product model ──────────────────────────────────────────
// (inside existing Product model, add this relation)
  wishlistedBy  Wishlist[]
```

After editing the schema, run:
```bash
npx prisma migrate dev --name add_auth_wishlist
```

### Schema Decisions to Explain in Interview

| Decision | Reasoning |
|---|---|
| `RefreshToken` stored in DB | Allows server-side revocation. If a user logs out, their refresh token is deleted — even if someone stole it, it cannot be used. Pure stateless JWT cannot do this. |
| `userId` nullable on `Cart` and `Order` | Preserves backward compatibility with existing guest flow. Guest orders placed before the user had an account are not lost. |
| `@@unique([userId, productId])` on Wishlist | Prevents duplicate wishlist entries at DB level. Toggling wishlist is a safe `upsert`/`delete` — no race condition. |
| `userId @unique` on `Cart` | Enforces one active cart per logged-in user at the DB level. Prevents split-brain cart state. |
| Password stored as bcrypt hash | bcrypt is the industry standard for password hashing — it includes salt automatically and is deliberately slow to resist brute-force. Never store plain text or use MD5/SHA1. |

---

## 3. Feature A — User Authentication (Login / Signup)

### How JWT + httpOnly Cookies Work (the full picture)

```
LOGIN REQUEST
─────────────
Client → POST /auth/login { email, password }
Server:
  1. Verify password against bcrypt hash
  2. Generate ACCESS TOKEN  (JWT, expires in 15 minutes)
  3. Generate REFRESH TOKEN (random UUID, expires in 7 days)
  4. Store hashed refresh token in RefreshToken table
  5. Set two httpOnly cookies:
       accessToken  (maxAge: 15 min, httpOnly, sameSite: strict)
       refreshToken (maxAge: 7 days,  httpOnly, sameSite: strict)
  6. Return user info in response body (id, name, email)

AUTHENTICATED REQUEST
──────────────────────
Client → any protected route (cookie sent automatically by browser)
authenticate middleware:
  1. Read accessToken cookie
  2. jwt.verify(token, ACCESS_SECRET) → get { userId }
  3. Attach req.user = { id: userId }
  4. Call next()

TOKEN REFRESH
─────────────
When accessToken expires (401), frontend catches it and calls:
Client → POST /auth/refresh (sends refreshToken cookie)
Server:
  1. Read refreshToken cookie
  2. Find matching token in DB (compare hashed)
  3. Verify it hasn't expired
  4. Issue new accessToken cookie (15 min)
  5. Return 200

LOGOUT
──────
Client → POST /auth/logout
Server:
  1. Delete RefreshToken row from DB
  2. Clear both cookies (maxAge: 0)
  3. Return 200

WHY httpOnly COOKIES, NOT localStorage?
  localStorage is readable by any JavaScript on the page — XSS attack
  can steal tokens stored there. httpOnly cookies cannot be accessed
  by JavaScript at all, only sent by the browser with each request.
  Combined with sameSite: strict, CSRF is also mitigated.
```

### Backend — New Files and Changes

#### Install dependencies
```bash
npm install bcrypt jsonwebtoken cookie-parser
npm install --save-dev @types/bcrypt @types/jsonwebtoken
```

#### `src/middleware/authenticate.js`

```js
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'

/**
 * Middleware that verifies the JWT access token from the httpOnly cookie.
 * Attaches req.user = { id } if valid.
 * Throws 401 if missing or expired — frontend should then call /auth/refresh.
 */
export function authenticate(req, res, next) {
  const token = req.cookies?.accessToken
  if (!token) throw new AppError('Not authenticated', 401)

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = { id: payload.userId }
    next()
  } catch (err) {
    // Distinguish expired from invalid — frontend needs to know to refresh
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Token expired', 401)
    }
    throw new AppError('Invalid token', 401)
  }
}

/**
 * Optional auth — attaches req.user if cookie present, but doesn't block if not.
 * Use on routes that work for both guests and logged-in users (e.g. product listing).
 */
export function optionalAuth(req, res, next) {
  const token = req.cookies?.accessToken
  if (!token) return next()
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = { id: payload.userId }
  } catch {
    // Silently ignore — guest user
  }
  next()
}
```

#### `src/services/authService.js`

```js
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import { AppError } from '../utils/AppError.js'

const SALT_ROUNDS = 12
const ACCESS_EXPIRY  = '15m'
const REFRESH_EXPIRY = '7d'
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Generates a signed JWT access token for a given userId.
 * @param {number} userId
 * @returns {string} signed JWT
 */
function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY })
}

/**
 * Generates a cryptographically random refresh token,
 * stores its SHA-256 hash in the DB, returns the raw token.
 * @param {number} userId
 * @returns {Promise<string>} raw refresh token (sent to client)
 */
async function createRefreshToken(userId) {
  const raw = crypto.randomBytes(64).toString('hex')
  const hash = crypto.createHash('sha256').update(raw).digest('hex')

  await prisma.refreshToken.create({
    data: {
      token: hash,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS)
    }
  })
  return raw
}

/**
 * Sets httpOnly auth cookies on the response object.
 * @param {object} res - Express response
 * @param {string} accessToken
 * @param {string} refreshToken
 */
export function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production'

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,          // HTTPS only in production
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000  // 15 minutes
  })

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: REFRESH_EXPIRY_MS  // 7 days
  })
}

/**
 * Registers a new user. Throws if email already exists.
 */
export async function signup({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new AppError('Email already registered', 409)

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true }  // Never return passwordHash
  })

  const accessToken  = generateAccessToken(user.id)
  const refreshToken = await createRefreshToken(user.id)
  return { user, accessToken, refreshToken }
}

/**
 * Logs in an existing user. Throws if credentials are invalid.
 * Also handles merging a guest cart into the user's cart.
 */
export async function login({ email, password, guestCartId }) {
  const user = await prisma.user.findUnique({ where: { email } })

  // Use the same error message for both "user not found" and "wrong password"
  // to prevent user enumeration attacks
  const isValid = user && await bcrypt.compare(password, user.passwordHash)
  if (!isValid) throw new AppError('Invalid email or password', 401)

  // Cart migration: merge guest cart items into the user's cart
  if (guestCartId) {
    await mergeGuestCart(guestCartId, user.id)
  }

  const accessToken  = generateAccessToken(user.id)
  const refreshToken = await createRefreshToken(user.id)

  const safeUser = { id: user.id, name: user.name, email: user.email }
  return { user: safeUser, accessToken, refreshToken }
}

/**
 * Rotates the refresh token: validates old one, deletes it, issues new pair.
 */
export async function refreshTokens(rawRefreshToken) {
  const hash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex')

  const stored = await prisma.refreshToken.findUnique({ where: { token: hash } })

  if (!stored || stored.expiresAt < new Date()) {
    // Delete if expired — cleanup
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } })
    throw new AppError('Invalid or expired refresh token', 401)
  }

  // Delete old refresh token (rotation — old token cannot be reused)
  await prisma.refreshToken.delete({ where: { id: stored.id } })

  const accessToken  = generateAccessToken(stored.userId)
  const refreshToken = await createRefreshToken(stored.userId)
  return { accessToken, refreshToken }
}

/**
 * Logs out by deleting the refresh token from DB and clearing cookies.
 */
export async function logout(rawRefreshToken, res) {
  if (rawRefreshToken) {
    const hash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex')
    await prisma.refreshToken.deleteMany({ where: { token: hash } })
  }

  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
}

/**
 * Merges items from a guest cart into the logged-in user's cart.
 * If the user already has a cart, items are upserted (quantity incremented).
 * The guest cart is deleted after migration.
 *
 * @param {string} guestCartId - UUID of the guest cart
 * @param {number} userId
 */
async function mergeGuestCart(guestCartId, userId) {
  const guestCart = await prisma.cart.findUnique({
    where: { id: guestCartId },
    include: { items: true }
  })

  if (!guestCart || guestCart.items.length === 0) return

  // Find or create the user's own cart
  let userCart = await prisma.cart.findUnique({ where: { userId } })
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId } })
  }

  // Upsert each guest cart item into the user's cart
  for (const item of guestCart.items) {
    await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
      update: { quantity: { increment: item.quantity } },
      create: { cartId: userCart.id, productId: item.productId, quantity: item.quantity }
    })
  }

  // Delete the guest cart
  await prisma.cart.delete({ where: { id: guestCartId } })
}
```

#### `src/routes/authRoutes.js`

```js
import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import * as authController from '../controllers/authController.js'

const router = Router()

router.post('/signup',  authController.signup)
router.post('/login',   authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout',  authController.logout)
router.get('/me',       authenticate, authController.me)  // Returns current user from cookie

export default router
```

#### `src/controllers/authController.js`

```js
import * as authService from '../services/authService.js'
import { sendSuccess } from '../utils/response.js'

export const signup = async (req, res) => {
  const { name, email, password } = req.body
  const { user, accessToken, refreshToken } = await authService.signup({ name, email, password })
  authService.setAuthCookies(res, accessToken, refreshToken)
  sendSuccess(res, { user }, 'Account created successfully', 201)
}

export const login = async (req, res) => {
  const { email, password } = req.body
  const guestCartId = req.cookies?.guestCartId || null  // Sent by frontend on login
  const { user, accessToken, refreshToken } = await authService.login({ email, password, guestCartId })
  authService.setAuthCookies(res, accessToken, refreshToken)
  sendSuccess(res, { user }, 'Logged in successfully')
}

export const refresh = async (req, res) => {
  const rawRefreshToken = req.cookies?.refreshToken
  if (!rawRefreshToken) throw new AppError('No refresh token', 401)
  const { accessToken, refreshToken } = await authService.refreshTokens(rawRefreshToken)
  authService.setAuthCookies(res, accessToken, refreshToken)
  sendSuccess(res, {}, 'Token refreshed')
}

export const logout = async (req, res) => {
  await authService.logout(req.cookies?.refreshToken, res)
  sendSuccess(res, {}, 'Logged out successfully')
}

export const me = async (req, res) => {
  // req.user.id is set by authenticate middleware
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true }
  })
  sendSuccess(res, { user })
}
```

#### Updated `.env`

```env
# Add these two to your existing .env
ACCESS_TOKEN_SECRET=your_super_secret_access_key_min_32_chars
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_min_32_chars
```

Generate secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Updated `server.js`

```js
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'

// Add after existing middleware
app.use(cookieParser())

// Add new route mounts
app.use('/api/v1/auth',     authRoutes)
app.use('/api/v1/wishlist', wishlistRoutes)
```

---

### Frontend — Auth Changes

#### Install dependencies
```bash
npm install js-cookie
```

#### `src/store/authStore.js`

```js
import { create } from 'zustand'
import { authApi } from '../api/authApi'

/**
 * Zustand store for authentication state.
 * user: null = guest, { id, name, email } = logged in
 */
const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,  // true until checkSession resolves — prevents flash of wrong UI

  /**
   * Called once on App mount. Hits GET /auth/me to check if the
   * browser has a valid accessToken cookie. If 401, tries to refresh.
   * This is how the app "remembers" the user across page loads.
   */
  checkSession: async () => {
    try {
      const res = await authApi.me()
      set({ user: res.data.user, loading: false })
    } catch (err) {
      if (err.status === 401) {
        // Try token refresh silently
        try {
          await authApi.refresh()
          const res = await authApi.me()
          set({ user: res.data.user, loading: false })
        } catch {
          set({ user: null, loading: false })
        }
      } else {
        set({ user: null, loading: false })
      }
    }
  },

  login: async (email, password) => {
    // Send guest cart ID so backend can merge it
    const guestCartId = localStorage.getItem('fk_cart_id')
    const res = await authApi.login({ email, password, guestCartId })
    set({ user: res.data.user })
    // After login, the user's server cart takes over — clear guest cart ref
    localStorage.removeItem('fk_cart_id')
    return res.data.user
  },

  signup: async (name, email, password) => {
    const res = await authApi.signup({ name, email, password })
    set({ user: res.data.user })
    return res.data.user
  },

  logout: async () => {
    await authApi.logout()
    set({ user: null })
    localStorage.removeItem('fk_cart_id')
    // Reset cart store too
    useCartStore.getState().clearCart()
  }
}))

export default useAuthStore
```

#### Updated `api/apiClient.js`

Add `withCredentials: true` — this tells Axios to include cookies in every request automatically:

```js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,   // ← ADD THIS — sends httpOnly cookies with every request
})

// Existing response interceptor — add refresh logic here
let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve())
  failedQueue = []
}

apiClient.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config

    // If 401 and not already retrying and not the refresh endpoint itself
    if (err.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/refresh')) {
      if (isRefreshing) {
        // Queue concurrent requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => apiClient(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await apiClient.post('/auth/refresh')  // Uses cookie automatically
        processQueue(null)
        return apiClient(originalRequest)      // Retry original request
      } catch (refreshErr) {
        processQueue(refreshErr)
        // Refresh also failed — user must log in again
        useAuthStore.getState().logout()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    const message = err.response?.data?.error || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default apiClient
```

#### `src/api/authApi.js`

```js
import apiClient from './apiClient'

export const authApi = {
  signup:  (data) => apiClient.post('/auth/signup', data),
  login:   (data) => apiClient.post('/auth/login', data),
  refresh: ()     => apiClient.post('/auth/refresh'),
  logout:  ()     => apiClient.post('/auth/logout'),
  me:      ()     => apiClient.get('/auth/me'),
}
```

#### Updated `App.jsx`

```jsx
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import useCartStore from './store/cartStore'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/ui/ProtectedRoute'

// Pages
import HomePage from './pages/HomePage'
import ProductListingPage from './pages/ProductListingPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import WishlistPage from './pages/WishlistPage'
import OrderHistoryPage from './pages/OrderHistoryPage'

export default function App() {
  const { checkSession, loading } = useAuthStore()
  const { initCart } = useCartStore()

  useEffect(() => {
    // Run both in parallel on mount
    checkSession()
    initCart()
  }, [])

  // Prevent flash of wrong navbar state while checking session
  if (loading) return <div className="app-loader" />

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"                      element={<HomePage />} />
        <Route path="/products"              element={<ProductListingPage />} />
        <Route path="/products/:id"          element={<ProductDetailPage />} />
        <Route path="/cart"                  element={<CartPage />} />
        <Route path="/login"                 element={<LoginPage />} />
        <Route path="/signup"                element={<SignupPage />} />

        {/* Protected routes — redirect to /login if not authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout"            element={<CheckoutPage />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
          <Route path="/orders"              element={<OrderHistoryPage />} />
          <Route path="/wishlist"            element={<WishlistPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
```

#### `src/components/ui/ProtectedRoute.jsx`

```jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

/**
 * Wraps routes that require authentication.
 * Redirects to /login with the current path in state so the user
 * is sent back after logging in.
 */
export default function ProtectedRoute() {
  const { user } = useAuthStore()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
```

#### Updated `Navbar.jsx` — Dynamic User Menu

Replace the static "Login" link with:

```jsx
import useAuthStore from '../../store/authStore'
import { Link, useNavigate } from 'react-router-dom'

// Inside Navbar component:
const { user, logout } = useAuthStore()
const navigate = useNavigate()

const handleLogout = async () => {
  await logout()
  navigate('/')
}

// In JSX, replace the Login link section:
{user ? (
  <div className="nav-user-menu">
    {/* Dropdown trigger */}
    <button className="nav-link nav-user-btn">
      {user.name.split(' ')[0]} {/* Show first name only */}
      <span className="nav-dropdown-arrow">▾</span>
    </button>

    {/* Dropdown menu — show on hover via CSS */}
    <div className="nav-dropdown">
      <Link to="/orders"   className="nav-dropdown-item">My Orders</Link>
      <Link to="/wishlist" className="nav-dropdown-item">Wishlist</Link>
      <button onClick={handleLogout} className="nav-dropdown-item nav-logout-btn">
        Logout
      </button>
    </div>
  </div>
) : (
  <Link to="/login" className="nav-link nav-login-btn">
    Login
  </Link>
)}
```

#### `src/pages/LoginPage.jsx`

```jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import toast from 'react-hot-toast'

/**
 * Login page matching Flipkart's two-panel design.
 * Left panel: blue background with tagline.
 * Right panel: email/password form.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuthStore()
  const { initCart } = useCartStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to the page the user was trying to access, or home
  const from = location.state?.from || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      await initCart()  // Re-init cart with user's server cart
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel — Flipkart blue with tagline */}
      <div className="auth-left-panel">
        <h1 className="auth-tagline">Looks like you're new here!</h1>
        <p className="auth-sub-tagline">Sign in with your email & password</p>
        {/* Flipkart shopping bags illustration or solid blue */}
      </div>

      {/* Right panel — form */}
      <div className="auth-right-panel">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter Email"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
              className="form-input"
            />
          </div>

          <p className="auth-terms">
            By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.
          </p>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <Link to="/signup" className="btn-secondary btn-full">
            New to Flipkart? Create an account
          </Link>
        </form>
      </div>
    </div>
  )
}
```

**Login Page CSS** (add to `index.css`):

```css
/* Auth page — two-panel Flipkart-style */
.auth-page {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: var(--fk-bg-page);
}

.auth-left-panel {
  background: var(--fk-blue);
  color: white;
  width: 340px;
  min-height: 500px;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 2px 0 0 2px;
}

.auth-tagline { font-size: 28px; font-weight: 300; line-height: 1.4; }
.auth-sub-tagline { font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 12px; }

.auth-right-panel {
  background: white;
  width: 360px;
  min-height: 500px;
  padding: 48px 40px;
  border-radius: 0 2px 2px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 14px; color: var(--fk-text-secondary); }
.form-input {
  border: none;
  border-bottom: 1px solid var(--fk-border);
  padding: 8px 0;
  font-size: 14px;
  outline: none;
}
.form-input:focus { border-bottom-color: var(--fk-blue); }

.auth-terms { font-size: 11px; color: var(--fk-text-secondary); line-height: 1.5; }
.auth-divider { text-align: center; color: var(--fk-text-muted); font-size: 12px; margin: 8px 0; }
.btn-full { width: 100%; }

/* Mobile: stack panels */
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-left-panel { width: 100%; min-height: auto; padding: 32px 24px; border-radius: 0; }
  .auth-right-panel { width: 100%; min-height: auto; border-radius: 0; }
}
```

`SignupPage.jsx` follows the same layout — add `name` field above email, same two-panel design.

---

## 4. Feature B — Wishlist

### Backend

#### `src/services/wishlistService.js`

```js
import { prisma } from '../lib/prisma.js'

/**
 * Returns all wishlist items for a user with product details.
 * Single query, no N+1.
 */
export async function getWishlist(userId) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true, name: true, price: true, mrp: true,
          images: true, rating: true, ratingCount: true, stock: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Adds a product to wishlist. Safe to call even if already wishlisted
 * (returns existing row without error).
 */
export async function addToWishlist(userId, productId) {
  return prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    update: {},            // Already exists — do nothing
    create: { userId, productId }
  })
}

/**
 * Removes a product from wishlist.
 * Does not throw if the item wasn't in the wishlist.
 */
export async function removeFromWishlist(userId, productId) {
  await prisma.wishlist.deleteMany({
    where: { userId, productId }
  })
}

/**
 * Returns Set of productIds in the user's wishlist.
 * Used by frontend to know which heart icons to fill.
 */
export async function getWishlistProductIds(userId) {
  const items = await prisma.wishlist.findMany({
    where: { userId },
    select: { productId: true }
  })
  return new Set(items.map(i => i.productId))
}
```

#### `src/routes/wishlistRoutes.js`

```js
import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import * as wishlistController from '../controllers/wishlistController.js'

const router = Router()

// All wishlist routes require authentication
router.use(authenticate)

router.get('/',           wishlistController.getWishlist)
router.post('/:productId',    wishlistController.addToWishlist)
router.delete('/:productId',  wishlistController.removeFromWishlist)

export default router
```

#### Updated `orderRoutes.js` — Add Order History

```js
import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import * as orderController from '../controllers/orderController.js'

const router = Router()

// Existing routes
router.post('/',         orderController.placeOrder)   // Optionally protect this too
router.get('/:orderId',  orderController.getOrder)

// NEW: Order history — requires auth
router.get('/', authenticate, orderController.getOrderHistory)

export default router
```

#### `orderService.js` — Add getOrderHistory

```js
/**
 * Returns all past orders for a user, newest first.
 * Includes a summary of items and address.
 * Uses a single query with nested includes — no N+1.
 *
 * @param {number} userId
 * @returns {Promise<Order[]>}
 */
export async function getOrderHistory(userId) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      address: { select: { city: true, pincode: true } },
      items: {
        include: {
          product: { select: { name: true, images: true } }
        }
      }
    }
  })
}
```

Also update `placeOrder` to attach `userId` when user is authenticated:

```js
// In orderController.placeOrder, pass req.user?.id to the service:
export const placeOrder = async (req, res) => {
  const { cartId, address } = req.body
  const userId = req.user?.id || null  // Works for both guest and logged-in
  const order = await orderService.placeOrder(cartId, address, userId)
  sendSuccess(res, { orderId: order.id }, 'Order placed successfully', 201)
}

// In orderService.placeOrder, add userId to the order creation:
const newOrder = await tx.order.create({
  data: {
    userId,   // ← add this
    subtotal, discount, total,
    address: { create: address },
    items: { create: ... }
  }
})
```

---

### Frontend — Wishlist

#### `src/store/wishlistStore.js`

```js
import { create } from 'zustand'
import { wishlistApi } from '../api/wishlistApi'
import useAuthStore from './authStore'

/**
 * Zustand store for wishlist state.
 * wishlistedIds: Set<number> — productIds in the wishlist.
 * Using a Set allows O(1) lookup for the WishlistButton heart icon fill state.
 */
const useWishlistStore = create((set, get) => ({
  items: [],
  wishlistedIds: new Set(),
  loading: false,

  /**
   * Fetch wishlist from server. Called on mount if user is logged in.
   */
  fetchWishlist: async () => {
    set({ loading: true })
    try {
      const res = await wishlistApi.getWishlist()
      const items = res.data.data
      set({
        items,
        wishlistedIds: new Set(items.map(i => i.product.id)),
        loading: false
      })
    } catch {
      set({ loading: false })
    }
  },

  /**
   * Toggle a product in/out of wishlist.
   * Optimistic UI: update Set immediately, revert on failure.
   */
  toggle: async (productId) => {
    const { wishlistedIds } = get()
    const isWishlisted = wishlistedIds.has(productId)

    // Optimistic update
    const newSet = new Set(wishlistedIds)
    isWishlisted ? newSet.delete(productId) : newSet.add(productId)
    set({ wishlistedIds: newSet })

    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(productId)
        set({ items: get().items.filter(i => i.product.id !== productId) })
      } else {
        await wishlistApi.addToWishlist(productId)
        await get().fetchWishlist()  // Re-fetch to get full product details
      }
    } catch (err) {
      // Revert on failure
      set({ wishlistedIds })
      throw err
    }
  },

  isWishlisted: (productId) => get().wishlistedIds.has(productId)
}))

export default useWishlistStore
```

#### `src/api/wishlistApi.js`

```js
import apiClient from './apiClient'

export const wishlistApi = {
  getWishlist:        ()          => apiClient.get('/wishlist'),
  addToWishlist:      (productId) => apiClient.post(`/wishlist/${productId}`),
  removeFromWishlist: (productId) => apiClient.delete(`/wishlist/${productId}`),
}
```

#### `src/components/product/WishlistButton.jsx`

```jsx
import useAuthStore from '../../store/authStore'
import useWishlistStore from '../../store/wishlistStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

/**
 * Heart icon button shown on ProductCard (top-right corner) and ProductDetailPage.
 * Fills when product is wishlisted. Redirects to login if not authenticated.
 *
 * @param {number} productId
 * @param {string} size - 'sm' (card) or 'lg' (detail page)
 */
export default function WishlistButton({ productId, size = 'sm' }) {
  const { user } = useAuthStore()
  const { isWishlisted, toggle } = useWishlistStore()
  const navigate = useNavigate()
  const wishlisted = isWishlisted(productId)

  const handleClick = async (e) => {
    e.preventDefault()   // Prevent card link navigation
    e.stopPropagation()

    if (!user) {
      toast('Please login to save items to your wishlist', { icon: '💛' })
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }

    try {
      await toggle(productId)
      toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist')
    } catch {
      toast.error('Could not update wishlist')
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`wishlist-btn wishlist-btn--${size}`}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={wishlisted ? 'Remove from wishlist' : 'Save for later'}
    >
      {/* Filled heart when wishlisted, outline when not */}
      {wishlisted ? '❤️' : '🤍'}
    </button>
  )
}
```

**Add `WishlistButton` to `ProductCard.jsx`:**

```jsx
// In ProductCard, add a relative-positioned wrapper on the card:
<div className="product-card">
  <div className="product-card-image-wrapper">
    <img src={product.images[0]} alt={product.name} loading="lazy" />
    <WishlistButton productId={product.id} size="sm" />  {/* top-right corner */}
  </div>
  {/* ...rest of card */}
</div>
```

```css
/* WishlistButton CSS */
.product-card-image-wrapper { position: relative; }

.wishlist-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.15);
  opacity: 0;             /* Hidden by default */
  transition: opacity 0.2s;
}

/* Show on card hover */
.product-card:hover .wishlist-btn { opacity: 1; }

/* Large variant for detail page */
.wishlist-btn--lg {
  position: static;
  width: auto;
  height: auto;
  border-radius: 2px;
  padding: 8px 16px;
  font-size: 14px;
  opacity: 1;
  box-shadow: none;
  border: 1px solid var(--fk-border);
}
```

#### `src/pages/WishlistPage.jsx`

```jsx
import useWishlistStore from '../store/wishlistStore'
import { useEffect } from 'react'
import ProductCard from '../components/product/ProductCard'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'

/**
 * Displays all wishlisted products in a product grid.
 * Moving item to cart removes it from wishlist.
 */
export default function WishlistPage() {
  const { items, loading, fetchWishlist } = useWishlistStore()

  useEffect(() => { fetchWishlist() }, [])

  if (loading) return <Spinner />

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🤍"
        title="Your Wishlist is Empty"
        description="Save items that you like in your wishlist. Review them anytime and easily move them to the cart."
        actionLabel="Continue Shopping"
        actionPath="/products"
      />
    )
  }

  return (
    <div className="page-container">
      <div className="wishlist-header">
        <h2>My Wishlist ({items.length} items)</h2>
      </div>
      <div className="product-grid">
        {items.map(item => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </div>
  )
}
```

---

## 5. Feature C — Order History

### Backend

Already added `GET /orders` with `authenticate` middleware and `getOrderHistory` service above.

The response shape for order history:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "PLACED",
      "total": 24999,
      "createdAt": "2025-04-14T...",
      "address": { "city": "New Delhi", "pincode": "110001" },
      "items": [
        {
          "quantity": 1,
          "unitPrice": 24999,
          "product": { "name": "iPhone 15", "images": ["url1"] }
        }
      ]
    }
  ]
}
```

### Frontend

#### `src/api/orderApi.js` — Add history call

```js
export const orderApi = {
  placeOrder:     (data)    => apiClient.post('/orders', data),
  getOrder:       (id)      => apiClient.get(`/orders/${id}`),
  getOrderHistory: ()       => apiClient.get('/orders'),   // ← NEW
}
```

#### `src/hooks/useOrderHistory.js`

```js
import { useState, useEffect } from 'react'
import { orderApi } from '../api/orderApi'

export function useOrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    orderApi.getOrderHistory()
      .then(res => setOrders(res.data.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { orders, loading, error }
}
```

#### `src/pages/OrderHistoryPage.jsx`

```jsx
import { useOrderHistory } from '../hooks/useOrderHistory'
import { Link } from 'react-router-dom'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import { formatCurrency } from '../utils/formatCurrency'

/**
 * Shows a list of all past orders for the logged-in user.
 * Each order card shows: ID, date, status badge, item thumbnails, total.
 * Clicking an order links to the order detail page.
 */
export default function OrderHistoryPage() {
  const { orders, loading, error } = useOrderHistory()

  if (loading) return <Spinner />

  if (!orders.length) {
    return (
      <EmptyState
        icon="📦"
        title="No Orders Yet"
        description="You haven't placed any orders yet. Start shopping!"
        actionLabel="Shop Now"
        actionPath="/products"
      />
    )
  }

  return (
    <div className="page-container">
      <h2 className="page-title">My Orders</h2>

      <div className="order-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">

            {/* Order header */}
            <div className="order-card-header">
              <div>
                <span className="order-id">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
              <span className={`order-status-badge order-status--${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </div>

            {/* Items preview */}
            <div className="order-items-preview">
              {order.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="order-item-row">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="order-item-thumb"
                    loading="lazy"
                  />
                  <div className="order-item-info">
                    <p className="order-item-name">{item.product.name}</p>
                    <p className="order-item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="order-item-price">{formatCurrency(item.unitPrice * item.quantity)}</p>
                </div>
              ))}
              {order.items.length > 3 && (
                <p className="order-more-items">+{order.items.length - 3} more items</p>
              )}
            </div>

            {/* Order footer */}
            <div className="order-card-footer">
              <div className="order-delivery-info">
                <span>Delivered to: {order.address?.city} - {order.address?.pincode}</span>
              </div>
              <div className="order-total">
                <span>Total: </span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
              <Link to={`/order-confirmation/${order.id}`} className="order-view-details">
                View Details →
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
```

**Order History CSS (add to `index.css`):**

```css
.order-list { display: flex; flex-direction: column; gap: 16px; }

.order-card {
  background: var(--fk-bg-card);
  border: 1px solid var(--fk-border);
  border-radius: 2px;
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--fk-border);
}

.order-id    { font-size: 14px; font-weight: 500; margin-right: 12px; }
.order-date  { font-size: 12px; color: var(--fk-text-secondary); }

.order-status-badge {
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}
.order-status--placed    { background: #e3f2fd; color: #1565c0; }
.order-status--confirmed { background: #e8f5e9; color: #2e7d32; }
.order-status--shipped   { background: #fff8e1; color: #f57f17; }
.order-status--delivered { background: #e8f5e9; color: #2e7d32; }
.order-status--cancelled { background: #fce4ec; color: #c62828; }

.order-items-preview { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }

.order-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-item-thumb {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border: 1px solid var(--fk-border);
  border-radius: 2px;
}

.order-item-name  { font-size: 13px; font-weight: 400; }
.order-item-qty   { font-size: 12px; color: var(--fk-text-secondary); }
.order-item-price { font-size: 14px; font-weight: 500; margin-left: auto; }
.order-more-items { font-size: 12px; color: var(--fk-blue); }

.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid var(--fk-border);
  background: #fafafa;
  font-size: 13px;
}

.order-view-details { color: var(--fk-blue); font-weight: 500; text-decoration: none; }
.order-view-details:hover { text-decoration: underline; }

/* Mobile */
@media (max-width: 768px) {
  .order-card-footer { flex-direction: column; gap: 8px; align-items: flex-start; }
}
```

---

## 6. Feature D — Responsive Design Polish

Since you are partially responsive, this is a targeted CSS pass — not a rewrite. Apply these breakpoints systematically.

### Breakpoint System

```css
/* Add to index.css — reference these throughout */
/* Mobile:  < 640px  */
/* Tablet:  640px – 1023px */
/* Desktop: >= 1024px */
```

### Navbar

```css
/* Hide search bar text on small screens, show icon only */
@media (max-width: 640px) {
  .navbar-search-bar { display: none; }
  .navbar-search-icon-mobile { display: flex; }  /* magnifier icon that opens a search overlay */
  .navbar-logo-subtext { display: none; }        /* Hide "Explore Plus" */
  .nav-more-link { display: none; }              /* Hide "More" link */
}

@media (max-width: 768px) {
  .navbar-inner { padding: 0 8px; }
  .navbar-search-bar { max-width: 100%; flex: 1; }
}
```

### Category Bar

```css
/* Horizontal scroll on all screen sizes — already Flipkart's pattern */
.category-bar {
  display: flex;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;  /* Smooth scroll on iOS */
  scrollbar-width: none;              /* Hide scrollbar — Firefox */
  gap: 0;
}
.category-bar::-webkit-scrollbar { display: none; }  /* Hide scrollbar — Chrome */

.category-item {
  flex: 0 0 auto;                     /* Don't shrink */
  min-width: 80px;
  padding: 8px 12px;
  text-align: center;
}

@media (max-width: 640px) {
  .category-item { min-width: 70px; padding: 8px; }
  .category-item-label { font-size: 11px; }
}
```

### Product Listing Page

```css
.listing-page {
  display: flex;
  gap: 0;
}

/* Sidebar */
.filter-sidebar {
  width: 240px;
  flex-shrink: 0;
}

/* Product grid area */
.listing-main { flex: 1; min-width: 0; }

/* Product grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

@media (max-width: 1024px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .listing-page { flex-direction: column; }
  .filter-sidebar {
    width: 100%;
    /* On mobile: convert sidebar to a horizontal filter strip or a slide-in drawer */
  }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 6px; }
}

@media (max-width: 400px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 4px; }
  /* Tighter cards on very small screens */
}
```

**Mobile Filter Approach:** On mobile, hide the sidebar and show a sticky "Filters" button at the bottom of the screen. Clicking it opens a slide-up drawer. This matches Flipkart mobile exactly.

```jsx
// In ProductListingPage.jsx:
const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

// JSX:
<>
  {/* Desktop: sidebar always visible */}
  <aside className="filter-sidebar filter-sidebar--desktop">
    <FilterSidebar />
  </aside>

  {/* Mobile: drawer */}
  {filterDrawerOpen && (
    <div className="filter-drawer-overlay" onClick={() => setFilterDrawerOpen(false)}>
      <div className="filter-drawer" onClick={e => e.stopPropagation()}>
        <FilterSidebar onClose={() => setFilterDrawerOpen(false)} />
      </div>
    </div>
  )}

  {/* Mobile: sticky filter trigger */}
  <div className="mobile-filter-bar">
    <button onClick={() => setFilterDrawerOpen(true)}>☰ Filters</button>
    <SortDropdown />
  </div>
</>
```

### Product Detail Page

```css
.product-detail-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.product-detail-left {
  width: 40%;
  position: sticky;
  top: 80px;
}

.product-detail-right { flex: 1; }

@media (max-width: 768px) {
  .product-detail-layout { flex-direction: column; }
  .product-detail-left {
    width: 100%;
    position: static;    /* Unstick on mobile */
  }
  /* Move Add to Cart / Buy Now buttons to bottom of right column */
  .product-action-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    background: white;
    border-top: 1px solid var(--fk-border);
    z-index: 100;
    padding: 8px 16px;
  }
  .btn-add-to-cart, .btn-buy-now {
    flex: 1;
    border-radius: 0;
    height: 44px;
    font-size: 14px;
  }
}
```

### Cart Page

```css
.cart-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.cart-items-panel { flex: 1; }

.cart-summary-panel {
  width: 320px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}

@media (max-width: 768px) {
  .cart-layout { flex-direction: column; }
  .cart-summary-panel {
    width: 100%;
    position: static;
  }
  /* Show summary panel first on mobile (above items) */
  .cart-layout { flex-direction: column-reverse; }
}
```

### Checkout Page

```css
.checkout-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.checkout-form-panel { flex: 1; }

.checkout-summary-panel {
  width: 320px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}

@media (max-width: 768px) {
  .checkout-layout { flex-direction: column; }
  .checkout-summary-panel { width: 100%; position: static; }
}
```

### General Mobile Fixes

```css
/* Prevent horizontal scroll on all pages */
html, body { overflow-x: hidden; }

/* Readable tap targets on mobile */
@media (max-width: 768px) {
  button, a, input, select {
    min-height: 44px;      /* Apple's recommended minimum touch target */
  }

  /* Larger font for inputs on mobile — prevents iOS zoom on focus */
  input, select, textarea {
    font-size: 16px !important;
  }
}

/* Page padding on mobile */
@media (max-width: 640px) {
  .page-container { padding: 8px; }
}
```

---

## 7. Security Checklist

These are non-negotiable for a production-ready auth system. Verify each one:

| Check | How |
|---|---|
| Passwords hashed with bcrypt | `bcrypt.hash(password, 12)` in `signup` |
| No password returned in any API response | `select: { passwordHash: false }` or manual exclusion |
| httpOnly cookies — not accessible by JS | `httpOnly: true` in `res.cookie()` |
| Secure cookies in production | `secure: process.env.NODE_ENV === 'production'` |
| CSRF mitigated | `sameSite: 'strict'` on all cookies |
| Refresh token hashed in DB | `SHA-256` hash stored, raw token sent to client |
| Refresh token rotation | Old token deleted when rotated — prevents replay |
| Same error for wrong email and wrong password | Prevents user enumeration |
| `withCredentials: true` on all Axios calls | Ensures cookies are sent cross-origin |
| CORS origin is explicit (not `*`) | `origin: [process.env.FRONTEND_URL]` |
| Access token short-lived (15 minutes) | Limits damage window if intercepted |
| Zod validation on auth inputs | Email format, password min length 8 chars |

---

## 8. Execution Timeline

### Day 3 (or remaining time)

**Block 1 (3 hrs) — Auth Backend**
- [ ] Add `User`, `RefreshToken` models, update `Cart` and `Order` with `userId`
- [ ] Run `npx prisma migrate dev --name add_auth_wishlist`
- [ ] Install `bcrypt`, `jsonwebtoken`, `cookie-parser`
- [ ] Implement `authService.js` — `signup`, `login`, `refreshTokens`, `logout`, `mergeGuestCart`
- [ ] Implement `authenticate.js` middleware
- [ ] Wire up `authRoutes.js`
- [ ] Test auth flow in Postman: signup → login → access protected route → refresh → logout

**Block 2 (2 hrs) — Wishlist + Order History Backend**
- [ ] Add `Wishlist` model, run migration
- [ ] Implement `wishlistService.js` and `wishlistRoutes.js`
- [ ] Add `GET /orders` route and `getOrderHistory` service
- [ ] Update `placeOrder` to attach `userId`
- [ ] Test wishlist toggle and order history in Postman

**Block 3 (2 hrs) — Auth Frontend**
- [ ] Add `withCredentials: true` to `apiClient.js`
- [ ] Add 401 refresh interceptor to `apiClient.js`
- [ ] Implement `authStore.js`
- [ ] Implement `authApi.js`
- [ ] Update `App.jsx` with `ProtectedRoute` and `checkSession` on mount
- [ ] Build `LoginPage.jsx` and `SignupPage.jsx`
- [ ] Update `Navbar.jsx` with dynamic user menu

**Block 4 (2 hrs) — Wishlist + Order History Frontend**
- [ ] Implement `wishlistStore.js` and `wishlistApi.js`
- [ ] Build `WishlistButton.jsx`, add to `ProductCard` and `ProductDetailPage`
- [ ] Build `WishlistPage.jsx`
- [ ] Build `OrderHistoryPage.jsx` with all CSS

**Block 5 (1 hr) — Responsive Polish**
- [ ] Apply all breakpoint CSS from Section 6
- [ ] Test on Chrome DevTools: iPhone 12 Pro (390px), iPad (768px), desktop (1440px)
- [ ] Fix any remaining overflow or layout issues

---

## 9. Interview Prep — Bonus Questions

| Question | Answer |
|---|---|
| Why httpOnly cookies over localStorage for JWT? | localStorage is readable by any JS on the page — an XSS vulnerability could steal tokens. httpOnly cookies are invisible to JavaScript and only sent by the browser. Combined with `sameSite: strict`, CSRF is also prevented. |
| What is refresh token rotation? | Every time the refresh token is used to get a new access token, the old refresh token is deleted and a new one is issued. This means a stolen refresh token can only be used once — the next legitimate use will fail (token already deleted), alerting the system. |
| Why hash the refresh token in the DB? | If the DB is compromised, a plain-text refresh token could be used directly. Storing a SHA-256 hash means the attacker gets a hash — useless without the raw value, which only the client has. |
| What happens when a guest user logs in? | The `mergeGuestCart` function is called with the guest `cartId`. It finds or creates the user's server cart and upserts all guest items into it, then deletes the guest cart. The frontend clears the `fk_cart_id` from localStorage. |
| Why is `userId` nullable on `Order`? | Backward compatibility. Orders placed before the user registered (or by guests who never register) still exist in the DB and are not orphaned. |
| How does `ProtectedRoute` work? | It reads `user` from the Zustand auth store. If null, it redirects to `/login` with the current path in `location.state.from`. After login, the `LoginPage` reads `state.from` and navigates there. |
| How does the Wishlist heart fill on the listing page without per-card API calls? | On mount, `wishlistStore.fetchWishlist()` fetches all wishlisted product IDs once and stores them in a `Set`. The `WishlistButton` does `wishlistedIds.has(productId)` — O(1) lookup, no extra API calls. |
| What's the difference between `authenticate` and `optionalAuth` middleware? | `authenticate` throws 401 if no valid token — for routes that require login. `optionalAuth` silently attaches `req.user` if a cookie is present but doesn't block the request if not — for routes that work for both guests and logged-in users. |
