# Flipkart Clone — Implementation Plan

> **Stack:** React.js (Vite) · Node.js + Express.js · PostgreSQL · Prisma ORM  
> **Architecture:** Modular Monolith (single backend, single frontend, shared DB)  
> **Deadline:** 2 days

---

## Architecture Decision: Modular Monolith, Not Microservices

For this assignment, the right call is a **Modular Monolith**:

- One Express backend, cleanly split into `routes → controllers → services → db`
- One React frontend, split into `pages → components → hooks → api`
- One PostgreSQL database

Microservices (separate auth-service, cart-service, product-service) would add Docker networking, inter-service HTTP calls, and distributed tracing overhead that kills a 2-day timeline. The *internal* code structure is just as modular and evaluator-friendly without the deployment complexity. If asked in the interview, explain: "Microservices make sense at Flipkart's scale with 100s of engineers. For this scope, a well-structured monolith is the right trade-off."

---

## API Optimisation Strategy

These are applied throughout — not as afterthoughts:

| Problem | Solution |
|---|---|
| Search triggers a request on every keystroke | 300ms debounce before firing API call |
| Product listing fetched again on every filter change | All filters (search, category, price, sort, page) bundled into a single GET call |
| Same products fetched multiple times (listing → detail → back) | In-memory cache in `apiClient.js` using a JS Map keyed by URL, TTL 60s |
| Cart re-fetched on every page visit | Cart in Zustand store, fetched once on app mount; cartId persisted in localStorage |
| N+1 query on orders | Single Prisma query with nested `include` for order + items + products |
| Unoptimised DB queries | DB-level indexes on `categoryId`, `name`, `price` |
| Large image payloads | `loading="lazy"` on all product images; explicit `width`/`height` to prevent layout shift |

---

## Table of Contents

1. [Flipkart UI Design Specification](#1-flipkart-ui-design-specification)
2. [Project Structure](#2-project-structure)
3. [Database Schema and Design](#3-database-schema-and-design)
4. [Feature-by-Feature Plan](#4-feature-by-feature-plan)
5. [API Contract](#5-api-contract)
6. [Day-by-Day Timeline](#6-day-by-day-timeline)
7. [Seeding Strategy](#7-seeding-strategy)
8. [Deployment Plan](#8-deployment-plan)
9. [Code Quality and Standards](#9-code-quality-and-standards)
10. [README Checklist](#10-readme-checklist)
11. [Interview Preparation](#11-interview-preparation)

---

## 1. Flipkart UI Design Specification

Study this section before writing a single component. This documents Flipkart's exact visual design so the implementation is pixel-accurate.

### Color Palette

```css
/* === FLIPKART DESIGN TOKENS === */
/* Paste into src/index.css */

:root {
  /* Primary brand */
  --fk-blue:        #2874f0;   /* Navbar bg, primary buttons, links */
  --fk-blue-dark:   #2469d9;   /* Cart button in navbar, hover state */
  --fk-yellow:      #ffe11b;   /* Search button, highlights */
  --fk-orange:      #ff9f00;   /* "Add to Cart" button */
  --fk-orange-dark: #f08000;   /* "Add to Cart" hover */
  --fk-buy-now:     #fb641b;   /* "Buy Now" button — orange-red */

  /* Text */
  --fk-text-primary:   #212121; /* Product names, headings — near-black, NOT pure #000 */
  --fk-text-secondary: #878787; /* MRP strikethrough, secondary info */
  --fk-text-muted:     #aaaaaa; /* Placeholder, disabled */

  /* Status */
  --fk-green:       #388e3c;   /* Rating >= 4.0, In Stock, Free Delivery, discount % */
  --fk-green-mid:   #26a541;   /* Rating 3.5–3.9 */
  --fk-amber:       #ff9800;   /* Rating < 3.5, low stock warning */
  --fk-red:         #ff6161;   /* Out of stock, error */

  /* Surfaces */
  --fk-bg-page:   #f1f3f6;   /* Page background — light blue-grey */
  --fk-bg-card:   #ffffff;   /* Card and panel backgrounds */
  --fk-border:    #e0e0e0;   /* Dividers, subtle card borders */
}
```

### Typography

```css
/* Flipkart uses system sans-serif — import Roboto from Google Fonts to match */
body {
  font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;        /* Base is 14px — NOT 16px */
  color: var(--fk-text-primary);
  background-color: var(--fk-bg-page);
  margin: 0;
}

/* Type scale */
/* 11px — seller name, fine print */
/* 12px — secondary product info, spec labels, category bar labels */
/* 13px — MRP, discount %, body text in cards */
/* 14px — default body */
/* 16px — section headers, navbar links */
/* 18px — price on detail page */
/* 24px — final total, large confirmation text */
```

### Navbar — Exact Specification

```
Height: 56px | Background: #2874f0 | Padding: 0 16px

[Flipkart logo]   [Search bar — 560px wide]   [Login]  [More ▾]  [🛒 Cart 2]

Logo: white "Flipkart" bold italic + yellow italic small "*Explore Plus*" below
Search bar: white bg, border-radius: 2px, placeholder: "Search for Products, Brands and More"
Search button: white bg with blue search icon, border-radius: 0 2px 2px 0
Navbar links: white, 16px, font-weight: 500
Cart icon: white shopping bag SVG + "Cart" text + red count badge (#ff6161)
```

Sub-navbar (below main nav on homepage only):
- Background: `#fff`, height: `80px`, `box-shadow: 0 2px 4px rgba(0,0,0,0.08)`
- Horizontal scrollable row of category icons + label
- Each category: icon (40px) + label at 12px, on hover: bottom border in `#2874f0`

### Product Card — Exact Specification

```
Card: white bg, border: 1px solid #f0f0f0, border-radius: 2px
Hover: box-shadow: 0 4px 15px 0 rgba(0,0,0,0.15) — CSS transition only, no JS

Image area:
  height: 200px | padding: 16px | object-fit: contain | background: white

Text area (padding: 12px):
  Product name — 14px, #212121, font-weight: 400
                 2-line clamp: -webkit-line-clamp: 2 (never overflow)
  Rating badge  — see RatingBadge spec below
  Review count  — 12px, #878787 e.g. "(12,483)"
  Price         — 18px, #212121, font-weight: 500  e.g. "₹24,999"
  MRP           — 13px, #878787, text-decoration: line-through  e.g. "₹34,999"
  Discount      — 13px, #388e3c  e.g. "27% off"  [on same line as MRP]
  Free delivery — 12px, #388e3c  (only show if applicable)

Grid layout:
  4 columns on desktop (>=1024px)
  3 columns on tablet (768px–1023px)
  2 columns on mobile (<768px)
  Gap: 8px (tight, matches Flipkart)
```

### Rating Badge — Exact Specification

```css
.rating-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}
/* Rating >= 4.0  → background: #388e3c */
/* Rating 3.0–3.9 → background: #ff9800 */
/* Rating < 3.0   → background: #f44336 */
/* Star: ★ character, white, same size */
```

### Buttons — Exact Specification

```css
/* Add to Cart */
background: #ff9f00 | color: #fff | height: 50px | min-width: 250px
border: none | border-radius: 2px | font-size: 16px | font-weight: 500
hover → background: #f08000

/* Buy Now */
background: #fb641b | color: #fff | height: 50px | min-width: 250px
border: none | border-radius: 2px | font-size: 16px | font-weight: 500
hover → background: #e05510

/* Place Order / Primary blue */
background: #2874f0 | color: #fff | border-radius: 2px | font-weight: 500
padding: 12px 24px
```

### Cart Page Layout

```
Left panel (white card):
  Header: "Delivery to [Pincode ▾]" in grey, 12px
  Each item row:
    Thumbnail: 96x96px, object-fit: contain
    Name, Seller (12px grey), Size/Color if applicable
    Quantity stepper: [−] [n] [+] in a bordered row
    Remove: grey text link, hover → blue
    Price: right-aligned, 16px, bold
  Items separated by 1px solid #f0f0f0 divider

Right panel (white card, sticky top: 80px, width: 320px):
  "PRICE DETAILS" — 12px, #878787, uppercase, bottom border
  Price (n items)      ₹X,XXX
  Discount            −₹X,XXX   [green]
  Delivery Charges     FREE     [green]
  ───────────────────────────
  Total Amount         ₹X,XXX   [18px, bold]

  "You will save ₹X,XXX on this order" — #388e3c, 13px
  [PLACE ORDER] button — full width, blue
```

---

## 2. Project Structure

```
flipkart-clone/
│
├── frontend/                          # React app (Vite)
│   ├── public/
│   │   └── flipkart-logo.svg
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                    # Router setup + initCart on mount
│   │   ├── index.css                  # CSS variables + global reset
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductListingPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   └── OrderConfirmationPage.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx         # Blue navbar with search + cart count
│   │   │   │   ├── CategoryBar.jsx    # Sub-navbar with category icons
│   │   │   │   └── Footer.jsx
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── ProductCardSkeleton.jsx
│   │   │   │   ├── ImageCarousel.jsx  # Main image + thumbnails, pure React state
│   │   │   │   ├── RatingBadge.jsx
│   │   │   │   └── SpecsTable.jsx
│   │   │   ├── filters/
│   │   │   │   ├── FilterSidebar.jsx
│   │   │   │   └── SortDropdown.jsx
│   │   │   ├── cart/
│   │   │   │   ├── CartItem.jsx
│   │   │   │   └── PriceSummaryPanel.jsx
│   │   │   ├── checkout/
│   │   │   │   ├── AddressForm.jsx
│   │   │   │   └── OrderSummaryPanel.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── Spinner.jsx
│   │   │       └── EmptyState.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useProducts.js         # Listing with filters
│   │   │   ├── useProduct.js          # Single product
│   │   │   ├── useCart.js             # Cart operations
│   │   │   └── useOrder.js            # Place + fetch order
│   │   │
│   │   ├── store/
│   │   │   └── cartStore.js           # Zustand: cartId, items, count, totals
│   │   │
│   │   ├── api/
│   │   │   ├── apiClient.js           # Axios instance + in-memory cache (Map, TTL 60s)
│   │   │   ├── productApi.js
│   │   │   ├── cartApi.js
│   │   │   └── orderApi.js
│   │   │
│   │   ├── utils/
│   │   │   ├── formatCurrency.js      # Indian Rupee formatting
│   │   │   ├── calculateDiscount.js   # (mrp - price) / mrp * 100
│   │   │   └── debounce.js
│   │   │
│   │   └── constants/
│   │       └── index.js               # CATEGORIES, SORT_OPTIONS, MAX_CART_QTY
│   │
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Express.js API
│   ├── src/
│   │   ├── server.js                  # Express init, middleware, mount routes
│   │   │
│   │   ├── routes/                    # Route definitions only — thin layer
│   │   │   ├── productRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   └── orderRoutes.js
│   │   │
│   │   ├── controllers/               # Parse req → call service → send res
│   │   │   ├── productController.js
│   │   │   ├── cartController.js
│   │   │   └── orderController.js
│   │   │
│   │   ├── services/                  # All business logic and DB queries
│   │   │   ├── productService.js
│   │   │   ├── cartService.js
│   │   │   └── orderService.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── errorHandler.js        # Global Express error handler
│   │   │   └── validate.js            # Zod schema validation middleware
│   │   │
│   │   ├── lib/
│   │   │   └── prisma.js              # Prisma client singleton
│   │   │
│   │   └── utils/
│   │       └── response.js            # sendSuccess() and sendError() helpers
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 3. Database Schema and Design

```prisma
// backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id        Int       @id @default(autoincrement())
  name      String    @unique       // "Electronics", "Fashion"
  slug      String    @unique       // "electronics", "fashion" — used in URL params
  imageUrl  String?                 // Icon shown in category bar
  products  Product[]
}

model Product {
  id          Int         @id @default(autoincrement())
  name        String
  description String      @db.Text
  price       Decimal     @db.Decimal(10, 2)   // Selling price
  mrp         Decimal     @db.Decimal(10, 2)   // Original price (for strikethrough + discount calc)
  stock       Int         @default(0)
  rating      Decimal     @default(0) @db.Decimal(3, 1)
  ratingCount Int         @default(0)
  brand       String
  images      String[]                          // Ordered array of image URLs (Postgres native array)
  specs       Json                              // { "RAM": "8GB", "Storage": "256GB" }
  categoryId  Int
  category    Category    @relation(fields: [categoryId], references: [id])
  cartItems   CartItem[]
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())

  @@index([categoryId])       // Category filter
  @@index([name])             // Search by name
  @@index([price])            // Price range filter
}

model Cart {
  id        String     @id @default(uuid())   // UUID stored in browser localStorage
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        Int     @id @default(autoincrement())
  cartId    String
  productId Int
  quantity  Int     @default(1)
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])

  @@unique([cartId, productId])   // One row per product — "Add to Cart" increments quantity, not insert
}

model Order {
  id             String      @id @default(uuid())
  status         OrderStatus @default(PLACED)
  subtotal       Decimal     @db.Decimal(10, 2)
  discount       Decimal     @db.Decimal(10, 2) @default(0)
  deliveryCharge Decimal     @db.Decimal(10, 2) @default(0)
  total          Decimal     @db.Decimal(10, 2)
  items          OrderItem[]
  address        Address?
  createdAt      DateTime    @default(now())
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   String
  productId Int
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2)   // Snapshotted at order time — survives price changes
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}

model Address {
  id       Int    @id @default(autoincrement())
  orderId  String @unique
  fullName String
  phone    String
  pincode  String
  line1    String
  line2    String?
  city     String
  state    String
  order    Order  @relation(fields: [orderId], references: [id])
}

enum OrderStatus {
  PLACED
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### Schema Design Decisions (explain in interview)

| Decision | Reasoning |
|---|---|
| `specs` as `Json` | Product attributes differ completely by category (phone: RAM/storage, shoe: size/material). An EAV table would require 3-way joins on every product fetch. JSON is perfect for read-heavy, heterogeneous data. |
| `images` as `String[]` | A separate `ProductImage` table with FK adds a join for what is an ordered list of URLs. Postgres native arrays handle this cleanly. |
| `mrp` + `price` as separate fields | Enables the frontend to compute and display the discount percentage without backend logic. Also preserves pricing context. |
| `unitPrice` on `OrderItem` | Product prices can change after an order. Snapshotting ensures order history always reflects what the user actually paid. |
| `@@unique([cartId, productId])` | Prevents duplicate cart rows at the DB level. "Add to Cart" on an existing item increments quantity via `upsert`, not a new row. |
| Cart `id` as UUID string | No auth required per spec. UUID generated client-side on first visit, stored in `localStorage`, sent with every cart request. |
| Prisma transaction on `placeOrder` | Stock decrement + order creation must be atomic. If stock update fails, order is not created. Prevents overselling. |

---

## 4. Feature-by-Feature Plan

Each feature is developed across three tracks simultaneously: **Database**, **Backend**, and **Frontend**.

---

### Feature 1 — Product Listing Page

**Goal:** Flipkart-style product grid with search, category filter, price filter, and sort.

#### Database Track

- Tables involved: `Product`, `Category`
- Indexes: `categoryId`, `name`, `price` (already in schema)
- Seed: 6 categories × 9 products = 54 products (see Seeding section)
- Run: `npx prisma migrate dev && node prisma/seed.js`

#### Backend Track

**Route:** `GET /api/v1/products`

Accepted query params:
```
?search=phone
&category=electronics
&minPrice=5000
&maxPrice=50000
&sort=price_asc | price_desc | rating | newest
&page=1
&limit=20
```

**productService.js — getProducts(filters):**

```js
const where = {
  ...(search && { name: { contains: search, mode: 'insensitive' } }),
  ...(category && { category: { slug: category } }),
  ...((minPrice || maxPrice) && {
    price: {
      ...(minPrice && { gte: parseFloat(minPrice) }),
      ...(maxPrice && { lte: parseFloat(maxPrice) })
    }
  })
}

const orderByMap = {
  price_asc:  { price: 'asc' },
  price_desc: { price: 'desc' },
  rating:     { rating: 'desc' },
  newest:     { createdAt: 'desc' }
}

// Two parallel queries — no N+1
const [products, total] = await Promise.all([
  prisma.product.findMany({
    where,
    orderBy: orderByMap[sort] || { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
    include: { category: { select: { name: true, slug: true } } }
  }),
  prisma.product.count({ where })
])

return { products, total, page, limit, totalPages: Math.ceil(total / limit) }
```

**Also implement:** `GET /api/v1/categories` — returns all categories for the category bar.

#### Frontend Track

**Page:** `ProductListingPage.jsx`

Use URL search params (not local state) for filters — so the back button works and state survives refresh:

```js
// hooks/useProducts.js
export function useProducts() {
  const [searchParams] = useSearchParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = Object.fromEntries(searchParams)
    setLoading(true)
    productApi.getProducts(params)
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [searchParams.toString()])  // Only re-runs when params actually change

  return { data, loading }
}
```

**Components and their roles:**
- `Navbar.jsx` — search input debounced 300ms, updates `?search=` URL param
- `CategoryBar.jsx` — click sets `?category=` param, clears page to 1
- `FilterSidebar.jsx` — price range inputs, sets `?minPrice=&maxPrice=`
- `SortDropdown.jsx` — sets `?sort=`
- `ProductGrid.jsx` — CSS grid (4/3/2 cols), `gap: 8px`
- `ProductCard.jsx` — see UI spec above; discount computed as `Math.round((1 - price/mrp) * 100)`
- `ProductCardSkeleton.jsx` — 12 grey shimmer cards shown while loading

**Optimisations applied:**
- All filters bundled in one API call (no separate requests for category + price)
- `apiClient.js` in-memory cache: `const cache = new Map()` — stores `{ data, timestamp }` keyed by full URL, expires after 60s
- 300ms debounce on search input

---

### Feature 2 — Product Detail Page

**Goal:** Full product detail view with image carousel, specs table, price, Add to Cart, Buy Now.

#### Database Track

No new tables. Fetch `Product` with `Category` included via Prisma `include`.

#### Backend Track

**Route:** `GET /api/v1/products/:id`

```js
// productService.js — getProductById(id)
const product = await prisma.product.findUnique({
  where: { id: parseInt(id) },
  include: { category: true }
})
if (!product) throw new AppError('Product not found', 404)
return product
```

#### Frontend Track

**Page:** `ProductDetailPage.jsx`

**Layout (two-column, matches Flipkart):**

```
Breadcrumb: Home > Electronics > Product Name

Left column (sticky, ~40% width):
  Main image — 400px tall, object-fit: contain, white bg
  Thumbnail strip — horizontal, 4 thumbs, 72px each, click to change main image
  [🛒 ADD TO CART]  [⚡ BUY NOW]   ← buttons below image

Right column (~60% width):
  Brand name — 14px grey
  Product full name — 18px, #212121
  [4.3★] [12,483 ratings & reviews] — rating badge + count
  ─────────────────────────────────
  ₹24,999                           ← 24px, bold
  ₹34,999  ~~MRP~~   27% off       ← 13px grey + green
  ✓ Free Delivery                   ← green, 13px
  ─────────────────────────────────
  Highlights:
    • 8 GB RAM | 256 GB ROM
    • 50 MP + 12 MP camera
  ─────────────────────────────────
  Stock status (In Stock / Only 3 left / Out of Stock)
```

Below (full width):
```
  Specifications (two-column table from specs JSON)
  Description (full text)
```

**ImageCarousel.jsx — no external library:**
```js
const [selectedIdx, setSelectedIdx] = useState(0)
// Main image: product.images[selectedIdx]
// Thumbnails: map over product.images, onClick sets selectedIdx
// Active thumbnail: border: 2px solid #2874f0
```

**Stock display logic:**
```js
stock === 0     → "Out of Stock"  color: #ff6161  | buttons disabled
stock <= 5      → "Only {n} left!" color: #ff9800
stock > 5       → "In Stock"      color: #388e3c
```

**Add to Cart flow:**
```js
// In ProductDetailPage.jsx
const handleAddToCart = async () => {
  setAdding(true)
  await cartStore.addItem(product.id)
  setAdding(false)
  // Show inline "✓ Added to Cart" text for 2 seconds, then revert button
  setTimeout(() => setAdded(false), 2000)
}
```

**Optimisation:** Product is cached in `apiClient.js` — navigating back from cart and returning to detail page is an instant cache hit.

---

### Feature 3 — Shopping Cart

**Goal:** View items, update quantity, remove items, see price breakdown, proceed to checkout.

#### Database Track

Tables: `Cart`, `CartItem`, `Product` (read-only).

Cart lifecycle: UUID created on first visit → stored in `localStorage` as `fk_cart_id` → passed in every cart API call → deleted from DB when order is placed.

#### Backend Track

**Routes:**

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/cart` | Create new cart, return `{ cartId }` |
| GET | `/api/v1/cart/:cartId` | Cart with all items + product details |
| POST | `/api/v1/cart/:cartId/items` | Add item `{ productId, quantity }` |
| PATCH | `/api/v1/cart/:cartId/items/:productId` | Update `{ quantity }` |
| DELETE | `/api/v1/cart/:cartId/items/:productId` | Remove item |

**cartService.js — getCart:** Single query, no N+1:
```js
const cart = await prisma.cart.findUnique({
  where: { id: cartId },
  include: {
    items: {
      include: {
        product: {
          select: { id: true, name: true, price: true, mrp: true, images: true, stock: true, brand: true }
        }
      }
    }
  }
})
```

**cartService.js — addItem:** Upsert pattern:
```js
await prisma.cartItem.upsert({
  where: { cartId_productId: { cartId, productId } },
  update: { quantity: { increment: quantity } },
  create: { cartId, productId, quantity }
})
```

**Validation via Zod middleware:**
- `productId` — positive integer
- `quantity` — integer between 1 and 10
- `cartId` — valid UUID format

#### Frontend Track

**Zustand store — `store/cartStore.js`:**

```js
import { create } from 'zustand'
import { cartApi } from '../api/cartApi'

const useCartStore = create((set, get) => ({
  cartId: localStorage.getItem('fk_cart_id') || null,
  items: [],
  loading: false,

  initCart: async () => {
    let { cartId } = get()
    if (!cartId) {
      const res = await cartApi.createCart()
      cartId = res.data.cartId
      localStorage.setItem('fk_cart_id', cartId)
      set({ cartId })
    }
    const cart = await cartApi.getCart(cartId)
    set({ items: cart.data.items })
  },

  addItem: async (productId, quantity = 1) => {
    await cartApi.addItem(get().cartId, { productId, quantity })
    await get()._refresh()
  },

  updateQuantity: async (productId, quantity) => {
    // Optimistic update — change local state immediately
    set({ items: get().items.map(i => i.productId === productId ? { ...i, quantity } : i) })
    try {
      await cartApi.updateItem(get().cartId, productId, { quantity })
    } catch (err) {
      await get()._refresh() // Revert on API error
    }
  },

  removeItem: async (productId) => {
    set({ items: get().items.filter(i => i.productId !== productId) }) // optimistic
    await cartApi.removeItem(get().cartId, productId)
  },

  clearCart: () => {
    localStorage.removeItem('fk_cart_id')
    set({ cartId: null, items: [] })
  },

  _refresh: async () => {
    const cart = await cartApi.getCart(get().cartId)
    set({ items: cart.data.items })
  },

  // Derived values (computed from items)
  get itemCount() { return get().items.reduce((s, i) => s + i.quantity, 0) },
  get subtotal()  { return get().items.reduce((s, i) => s + i.product.price * i.quantity, 0) },
  get savings()   { return get().items.reduce((s, i) => s + (i.product.mrp - i.product.price) * i.quantity, 0) },
}))
```

Call `cartStore.initCart()` in `App.jsx` on mount — cart is fetched once and kept in memory.

**CartItem.jsx — UI details:**
- Thumbnail: 96×96px, `object-fit: contain`
- Quantity stepper: `[−]` disabled at 1; `[+]` disabled at `product.stock`
- Remove: text link "Remove", `#878787`, hover → `#2874f0`

**PriceSummaryPanel.jsx:**
- "PRICE DETAILS" in 12px uppercase grey with bottom border
- Discount shown in green with leading `−`
- Delivery: "FREE" in green (or ₹40 if subtotal < 500 — your choice)
- "You will save ₹X,XXX on this order" callout below total
- "PLACE ORDER" button at bottom, full width

**Optimisations applied:**
- Navbar cart count reads from Zustand `itemCount` directly — no extra API call
- Optimistic UI on quantity update and remove — no loading spinner for these
- Cart fetched only once on mount, not on every navigation

---

### Feature 4 — Checkout and Order Placement

**Goal:** Collect address, confirm order, place it atomically.

#### Database Track

Tables created: `Order`, `OrderItem`, `Address`. Created together in a Prisma transaction.

#### Backend Track

**Route:** `POST /api/v1/orders`

Request body:
```json
{
  "cartId": "uuid-here",
  "address": {
    "fullName": "Rahul Sharma",
    "phone": "9876543210",
    "pincode": "110001",
    "line1": "42 MG Road",
    "line2": "Near Metro Station",
    "city": "New Delhi",
    "state": "Delhi"
  }
}
```

**orderService.js — placeOrder(cartId, address):**

```js
// 1. Fetch cart with items and current prices
const cart = await prisma.cart.findUnique({
  where: { id: cartId },
  include: { items: { include: { product: true } } }
})

if (!cart || cart.items.length === 0)
  throw new AppError('Cart is empty', 400)

// 2. Validate stock for ALL items before touching the DB
for (const item of cart.items) {
  if (item.product.stock < item.quantity)
    throw new AppError(`"${item.product.name}" is out of stock`, 400)
}

// 3. Calculate totals
const subtotal = cart.items.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)
const discount = cart.items.reduce((s, i) => s + (Number(i.product.mrp) - Number(i.product.price)) * i.quantity, 0)
const total = subtotal  // free delivery

// 4. Atomic transaction: create order + decrement stock + delete cart
const order = await prisma.$transaction(async (tx) => {
  const newOrder = await tx.order.create({
    data: {
      subtotal, discount, total,
      address: { create: address },
      items: {
        create: cart.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.product.price  // snapshot
        }))
      }
    }
  })

  for (const item of cart.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    })
  }

  await tx.cart.delete({ where: { id: cartId } })

  return newOrder
})

return order
```

**Route:** `GET /api/v1/orders/:orderId` — returns order with items, product names, and address. Single Prisma query with nested `include`.

#### Frontend Track

**Page:** `CheckoutPage.jsx` (two-column layout)

**AddressForm.jsx — Validation with react-hook-form:**
```js
rules: {
  fullName: { required: true, minLength: 3 },
  phone:    { required: true, pattern: /^[6-9]\d{9}$/ },  // Indian mobile
  pincode:  { required: true, pattern: /^\d{6}$/ },
  line1:    { required: true, minLength: 5 },
  city:     { required: true },
  state:    { required: true }   // Dropdown of Indian states
}
```

**On "PLACE ORDER" button click:**
1. `handleSubmit` validates form
2. Button shows spinner, becomes disabled
3. Call `orderApi.placeOrder({ cartId, address })`
4. On success: `cartStore.clearCart()` → `navigate('/order-confirmation/' + orderId)`
5. On error: re-enable button, show toast with error message

---

### Feature 5 — Order Confirmation

**Goal:** Show order success state with ID, delivery estimate, and item summary.

#### Database Track

Read `Order` with `items` + `address` included. Single query.

#### Backend Track

`GET /api/v1/orders/:orderId` — already implemented in Feature 4. Returns:
```json
{
  "id": "uuid",
  "status": "PLACED",
  "total": 24999,
  "createdAt": "2025-04-14T...",
  "address": { "fullName": "...", "city": "New Delhi", "pincode": "110001" },
  "items": [
    { "quantity": 1, "unitPrice": 24999, "product": { "name": "...", "images": [...] } }
  ]
}
```

#### Frontend Track

**Page:** `OrderConfirmationPage.jsx`

```
[Green checkmark icon — 56px]
"Order Placed Successfully!"    ← 24px, #388e3c
"Order ID: FK-A1B2C3D4"         ← monospace font, grey bg pill
"Estimated Delivery: Tue, 22 Apr"  ← createdAt + 5 days

Delivering to:
"Rahul Sharma | 9876543210"
"42 MG Road, New Delhi - 110001"

──────────────────────────────
[img 64px] Product Name × 1   ₹24,999
──────────────────────────────

[CONTINUE SHOPPING]  → /products
```

Date computation:
```js
const deliveryDate = new Date(order.createdAt)
deliveryDate.setDate(deliveryDate.getDate() + 5)
const formatted = deliveryDate.toLocaleDateString('en-IN', {
  weekday: 'short', day: 'numeric', month: 'short'
})
```

---

## 5. API Contract

**Base URL:** `http://localhost:5000/api/v1`

### Standard Response Format

```json
// Success
{ "success": true, "data": {}, "message": "optional string" }

// Error
{ "success": false, "error": "Human readable error message" }
```

### All Endpoints

```
Products:
  GET  /products              Paginated list with filters (search, category, price, sort, page)
  GET  /products/:id          Single product with category

Categories:
  GET  /categories            All categories

Cart:
  POST   /cart                         Create cart → { cartId }
  GET    /cart/:cartId                 Cart + all items + product details
  POST   /cart/:cartId/items           Add item { productId, quantity }
  PATCH  /cart/:cartId/items/:productId  Update { quantity }
  DELETE /cart/:cartId/items/:productId  Remove item

Orders:
  POST /orders                Place order { cartId, address } → { orderId }
  GET  /orders/:orderId       Order details with items and address
```

### HTTP Status Codes

| Code | When used |
|---|---|
| 200 | Successful GET, PATCH, DELETE |
| 201 | Successful POST (cart created, order placed) |
| 400 | Validation error, empty cart, insufficient stock |
| 404 | Product / cart / order not found |
| 500 | Unhandled server error |

---

## 6. Day-by-Day Timeline

### Day 1 — Backend + Product Listing + Product Detail

**Morning (3 hrs) — Backend Foundation**
- [ ] Init Express project, install: express, prisma, @prisma/client, zod, cors, dotenv, morgan
- [ ] Write `schema.prisma`, run `npx prisma migrate dev --name init`
- [ ] Write `seed.js` (54 products across 6 categories), run seed
- [ ] Implement `productService.getProducts()` with all filter/sort/pagination
- [ ] Implement `GET /products`, `GET /products/:id`, `GET /categories`
- [ ] Add global `errorHandler` middleware
- [ ] Test all product routes with Postman

**Midday (2 hrs) — Cart + Order APIs**
- [ ] Implement all cart service methods and routes
- [ ] Implement `orderService.placeOrder()` with Prisma transaction
- [ ] Implement `GET /orders/:orderId`
- [ ] Test full cart lifecycle with Postman (create → add → update → delete → place order)

**Afternoon (3 hrs) — Frontend Shell + Product Listing**
- [ ] Init React project (Vite), install: react-router-dom, axios, zustand, react-hook-form, react-hot-toast
- [ ] Set up `index.css` with all Flipkart CSS variables and global reset
- [ ] Build `Navbar.jsx` — exact Flipkart design with working search
- [ ] Build `CategoryBar.jsx`
- [ ] Build `apiClient.js` with Axios + in-memory cache
- [ ] Build `productApi.js`, `useProducts.js`
- [ ] Build `ProductCard.jsx`, `ProductCardSkeleton.jsx`, `ProductGrid.jsx`
- [ ] Build `FilterSidebar.jsx`, `SortDropdown.jsx`
- [ ] Complete `ProductListingPage.jsx` — filters working end-to-end with API

**Evening (2 hrs) — Product Detail Page**
- [ ] Build `ImageCarousel.jsx` (pure React state, no library)
- [ ] Build `RatingBadge.jsx`, `SpecsTable.jsx`
- [ ] Complete `ProductDetailPage.jsx` — full layout matching Flipkart
- [ ] Wire Add to Cart via `cartStore.addItem()` — verify Navbar count updates

---

### Day 2 — Cart + Checkout + Polish + Deploy

**Morning (3 hrs) — Cart + Checkout**
- [ ] Build `cartStore.js` in Zustand (full implementation including optimistic updates)
- [ ] Call `initCart()` in `App.jsx` on mount
- [ ] Build `CartItem.jsx` with quantity stepper
- [ ] Build `PriceSummaryPanel.jsx` with savings callout
- [ ] Complete `CartPage.jsx`
- [ ] Build `AddressForm.jsx` with react-hook-form validation
- [ ] Build `OrderSummaryPanel.jsx`
- [ ] Complete `CheckoutPage.jsx`
- [ ] Complete `OrderConfirmationPage.jsx`
- [ ] Test full flow: browse → add to cart → checkout → confirmation

**Afternoon (2 hrs) — UI Polish**
- [ ] Add loading skeletons on all data-fetching pages
- [ ] Add `react-hot-toast` notifications (cart add, order placed, errors)
- [ ] Add `EmptyState.jsx` for empty cart, no search results, invalid order ID
- [ ] Responsive pass: 2-col product grid on mobile, stacked layout on cart
- [ ] Verify on Chrome DevTools mobile viewport (iPhone 12 Pro)

**Late Afternoon (2 hrs) — Deploy**
- [ ] Push to GitHub public repo (clean commit history)
- [ ] Create Supabase project → get `DATABASE_URL`
- [ ] Run `npx prisma migrate deploy` and `node prisma/seed.js` on prod DB
- [ ] Deploy backend to Render, set env vars, test API endpoint
- [ ] Deploy frontend to Vercel, set `VITE_API_URL`, test full app

**Evening (1 hr) — README + Submit**
- [ ] Write `README.md` (see checklist below)
- [ ] Final smoke test on deployed URLs
- [ ] Submit GitHub link + deployed URL

---

## 7. Seeding Strategy

### Categories

| Slug | Display Name |
|---|---|
| electronics | Electronics |
| fashion | Fashion |
| home-kitchen | Home & Kitchen |
| books | Books |
| sports | Sports & Fitness |
| beauty | Beauty & Personal Care |

### Products (9 per category = 54 total)

**Electronics:** Samsung Galaxy S24, iPhone 15, OnePlus 12R, Sony WH-1000XM5 Headphones, MacBook Air M3, iPad 10th Gen, boAt Airdopes 141, Samsung 55" 4K Smart TV, Logitech MX Master 3 Mouse

**Fashion:** Men's Polo T-Shirt 3-Pack, Slim Fit Jeans, Nike Air Max Shoes, Levi's 511 Jeans, Women's Ethnic Kurta Set, Adidas Training Shoes, Men's Winter Jacket, Formal Shirt Pack of 3, Cotton Shorts 2-Pack

**Home & Kitchen:** Philips Air Fryer 4.1L, Prestige Non-stick Pan Set, Kent Grand RO Purifier, Morphy Richards OTG Oven 28L, Bajaj Room Heater, Robot Vacuum Cleaner, Havells Mixer Grinder, Drip Coffee Maker, Milton Stainless Steel Bottles Set

**Books:** Atomic Habits, System Design Interview Vol 1, Clean Code, The Pragmatic Programmer, Zero to One, Deep Work, Designing Data-Intensive Applications, Rich Dad Poor Dad, The Psychology of Money

**Sports:** MRF Virat Kohli Cricket Bat, Cosco Football, Boldfit Yoga Mat 6mm, Resistance Bands Set of 5, Cycling Helmet, Steel Jump Rope, Dumbbells Pair 5kg, Nivia Badminton Racket Set, Sports Duffel Bag

**Beauty:** Lakme Face Wash, Neutrogena Sunscreen SPF 50, Nivea Body Lotion, The Ordinary Vitamin C Serum, Mamaearth Onion Shampoo, Biotique Bio Bhringraj Hair Oil, Plum Green Tea Toner, Himalaya Moisturising Cream, Dove Soap Bar Pack of 6

### Pricing Rules for Seed

- `mrp`: realistic Indian retail prices
- `price`: 10%–45% below mrp (vary across products)
- `rating`: between 3.4 and 4.8
- `ratingCount`: between 120 and 85,000
- `stock`: mostly 20–200; include 3 out-of-stock products to test that UI state
- `images`: use `https://picsum.photos/seed/fk-{productId}/400/400` for placeholders (3 images per product)

---

## 8. Deployment Plan

```
Frontend (React) → Vercel (free hobby)
Backend (Express) → Render (free web service)
Database (PostgreSQL) → Supabase (free project)
```

**Backend `.env`:**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?pgbouncer=true"
PORT=5000
FRONTEND_URL="https://your-app.vercel.app"
NODE_ENV=production
```

**Frontend `.env`:**
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

**CORS setup in `server.js`:**
```js
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}))
```

**Known deployment limitation:** Render free tier spins down after 15 minutes of inactivity. First request takes ~30 seconds. Add a loading indicator on the frontend for slow initial load, and document this in README.

**Pre-deploy checklist:**
- [ ] `npx prisma migrate deploy` on prod DB
- [ ] `node prisma/seed.js` on prod DB  
- [ ] `NODE_ENV=production` set on Render
- [ ] CORS origin includes the Vercel domain

---

## 9. Code Quality and Standards

### JSDoc Comments (instead of TypeScript)

```js
/**
 * Formats a number as Indian Rupees with proper comma placement.
 * Example: formatCurrency(124999) → "₹1,24,999"
 *
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string with ₹ symbol
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}
```

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| React components | PascalCase | `ProductCard.jsx` |
| Hooks | camelCase with `use` prefix | `useProducts.js` |
| API modules | camelCase | `productApi.js` |
| Backend services | camelCase | `productService.js` |
| Constants | UPPER_SNAKE_CASE | `MAX_CART_QUANTITY` |
| CSS classes | kebab-case | `product-card`, `rating-badge` |

### Layer Responsibilities

- **Pages** — layout only, wire up hooks, no business logic, no direct API calls
- **Components** — presentational, receive props, render UI, emit callbacks
- **Hooks** — own all data fetching and derived state
- **api/ modules** — own Axios calls, use apiClient
- **services/ (backend)** — own all business logic and Prisma queries
- **controllers/ (backend)** — parse req, call service, call sendSuccess/sendError

### Global Error Handler (backend)

```js
// middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500
  const message = err.message || 'Internal Server Error'
  console.error(`[${status}] ${req.method} ${req.path} — ${message}`)
  res.status(status).json({ success: false, error: message })
}
```

### Axios Interceptor (frontend)

```js
// api/apiClient.js
apiClient.interceptors.response.use(
  res => res,
  err => {
    const message = err.response?.data?.error || 'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  }
)
```

### Git Commit Style

```
feat: implement product listing page with filters
feat: add cart CRUD with optimistic updates
feat: complete checkout and order placement flow
feat: add order confirmation page
fix: cart count not updating after remove
style: match Flipkart navbar exact spacing and colors
chore: seed 54 products across 6 categories
docs: add README with setup instructions
```

---

## 10. README Checklist

The `README.md` in the root of the repo must contain:

- [ ] Project title and one-paragraph description
- [ ] Live deployed URL (frontend) + backend API base URL
- [ ] Screenshot or GIF of the running app
- [ ] Tech stack table (React, Express, PostgreSQL, Prisma, Zustand, etc.)
- [ ] Local setup — exact commands from `git clone` to running the app
  - Node version required (18+)
  - `npm install` commands for both frontend and backend
  - `.env` file setup with example values
  - `npx prisma migrate dev` and `node prisma/seed.js`
  - `npm run dev` for both
- [ ] All environment variables listed with descriptions
- [ ] API endpoints reference
- [ ] Database schema overview (can be the Prisma schema or a brief description)
- [ ] Assumptions made (no login required, cart via UUID, free delivery, default user pre-seeded, etc.)
- [ ] Known limitations (Render cold start ~30s, no payment gateway, placeholder images)
- [ ] Bonus features implemented, if any

---

## 11. Interview Preparation

Be ready to explain these without hesitation:

| Question | Prepared answer |
|---|---|
| Why modular monolith over microservices? | Microservices add Docker networking, service discovery, and distributed tracing — not justified for a 2-day intern project. The internal code structure is equally modular. At Flipkart's scale, microservices make sense. Here, they'd just add failure points. |
| Why `specs` as JSON, not a relational table? | Product attributes are completely different per category. An EAV table (entity-attribute-value) would require 3-way joins on every product fetch. JSON in Postgres is the right choice for heterogeneous, read-heavy data. |
| How does cart work without login? | UUID generated on first visit, stored in localStorage, sent with every cart request. Cart is persisted on the server so it survives page refresh. Deleted when order is placed. |
| Why snapshot `unitPrice` on OrderItem? | Product prices can change after an order is placed. Without snapshotting, order history would show the wrong price. Every real e-commerce system does this. |
| What optimisations did you apply? | Debounced search (300ms), all filters in one API call, in-memory client cache (Map with TTL), optimistic UI on cart mutations, Prisma includes to avoid N+1, DB indexes on filtered columns. |
| What does the Prisma `upsert` do in addItem? | If the product already exists in the cart, it increments the quantity. If not, it creates a new CartItem row. The `@@unique([cartId, productId])` constraint makes this safe. |
| Why a Prisma transaction for placeOrder? | Stock decrement and order creation must be atomic. If stock update fails, we must not create a ghost order. If order creation fails, stock must not decrease. The transaction guarantees all-or-nothing. |
| How would you scale this? | Add Redis for cart caching and rate limiting, move product search to Elasticsearch, add a CDN for images, split into microservices per domain when team grows, add a message queue for order events. |
