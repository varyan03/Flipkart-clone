# 🛒 Flipkart Clone — Premium Fullstack E-commerce

A high-fidelity, performance-optimized Flipkart clone designed to provide a pixel-perfect shopping experience. Featuring a modular monolith architecture, this project implements advanced E-commerce patterns like debounced search, in-memory caching, atomic order transactions, and secure JWT-based authentication.

**Status:** Ready for Deployment. See `IMPLEMENTATION.md` for the full technical roadmap.

## Problem Statement

Many E-commerce clones fail to capture the specific design language and performance refinements of top-tier platforms. This project bridges that gap by using Flipkart's exact design tokens (colors, typography, grid spacing) and professional-grade backend logic to ensure a sturdy, production-ready application.

## Features

- **Premium UI/UX** — Pixel-perfect recreation of the Flipkart homepage, product listing, and detail pages.
- **Hero Banner Carousel** — Compact, gapped multi-card carousel with auto-play and responsive layout.
- **Dynamic Category Bar** — Quick navigation across Electronics, Fashion, Home, and more.
- **Search with Debounce** — 300ms debounced search to minimize API overhead and improve user experience.
- **Advanced Product Filtering** — Sidebar filters for categories and price ranges, with dynamic sorting (Price, Rating, Newest).
- **Secure Authentication** — JWT-based auth using `httpOnly` cookies for maximum security against XSS.
- **Cart with Optimistic Updates** — Persistent cart (UUID-based) with instant UI feedback on quantity changes.
- **Wishlist Integration** — Save items to your profile with a single click.
- **Atomic Order Placement** — Prisma transactions ensure stock decrement and order creation happen as a single, unbreakable step.
- **Responsive Grid** — adaptive 4/3/2 column layout designed for Desktop, Tablet, and Mobile views.
- **Full SEO Optimization** — Semantic HTML5, descriptive title tags, and meta descriptions.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS (Design Tokens), Zustand, React Router 7 |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL + Prisma ORM |
| **Security** | JWT (Access & Refresh Tokens), Helmet.js, CORS |
| **API Client** | Axios + In-memory Caching |
| **Styling** | Vanilla CSS (Flipkart Design System) |

## Project Structure

```text
flipkart-clone/
├── frontend/                          # React + Vite Frontend
│   ├── src/
│   │   ├── api/                       # Axios instance + Caching
│   │   ├── components/
│   │   │   ├── layout/                # Navbar, CategoryBar, BannerCarousel
│   │   │   ├── product/               # ProductCard, ProductGrid, WishlistButton
│   │   │   └── ui/                    # Reusable UI elements
│   │   ├── hooks/                     # useProducts, useCart, useAuth
│   │   ├── store/                     # Zustand (cartStore, authStore)
│   │   ├── pages/                     # Landing, Listing, Detail, Cart, Checkout
│   │   └── index.css                  # CSS Variables & Design Tokens
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Express.js API
│   ├── prisma/
│   │   ├── schema.prisma              # PostgreSQL Schema
│   │   └── seed.js                    # 54+ High-quality products seed
│   ├── src/
│   │   ├── config/                    # Prisma & Env config
│   │   ├── controllers/               # Busines logic (product, cart, auth)
│   │   ├── middleware/                # Auth, ErrorHandler, Validation
│   │   ├── routes/                    # API Endpoints
│   │   ├── services/                  # DB Queries & logic
│   │   └── server.js                  # Entry point
│   ├── package.json
│   └── .env.example
│
├── .gitignore                         # Project-wide exclusions
├── README.md                          # You are here
└── IMPLEMENTATION.md                  # Project Architecture & Roadmap
```

## Database Schema (Prisma)

The full schema lives in `backend/prisma/schema.prisma`. Core models:

- **User** — Profile, authentication metadata, and relationship to Cart/Orders.
- **Product** — Central record with native PG types for `images` (String Array) and `specs` (JSONB).
- **Cart / CartItem** — Persists user choice across sessions via UUID or User association.
- **Order / OrderItem** — Supports atomic transactions and price snapshotting for history.
- **Wishlist** — Simple mapping between Users and their favorite Products.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (Local or Supabase)
- npm or yarn

### 1. Environment Variables
Create `.env` files in both directories:

**backend/.env**
```env
PORT=5001
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://user:password@host:5432/db"
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
```

**frontend/.env**
```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

### 2. Install & Setup
```bash
# Install Dependencies
cd backend && npm install
cd ../frontend && npm install

# Database Setup
cd ../backend
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js
```

### 3. Run Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login & set httpOnly cookies |
| POST | `/api/v1/auth/logout` | Clear session cookies |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/products` | Paginated list with filtering/search |
| GET | `/api/v1/products/:id` | Single product details |
| GET | `/api/v1/categories` | Fetch all active categories |

### Cart & Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/cart/:id` | Get cart items |
| POST | `/api/v1/orders` | Place atomic order |

## User Flow

1. **Landing Page** (Hero Banner + Category Bar)
2. **Search/Category Click** (Filtered Product Listing)
3. **Product Detail** (Spec Tables + Add to Cart)
4. **Login** (Required for Checkout/Wishlist)
5. **Checkout** (Address Entry + Final Summary)
6. **Order Confirmation** (Success state)

## Security

- **httpOnly Cookies** — Prevents XSS-based token theft.
- **Helmet.js** — Adds essential security headers (CSP, HSTS).
- **Prisma Parameterized Queries** — Native protection against SQL injection.
- **JWT Refresh Logic** — Short-lived access tokens with long-lived secure refresh tokens.
- **CORS Protection** — Restricted to specific frontend domains in production.

## Scripts

- `npm run dev` — Starts both local servers with hot reload.
- `npm run build` — Generates production frontend bundle.
- `npx prisma studio` — Visual GUI for managing your local/production database.


