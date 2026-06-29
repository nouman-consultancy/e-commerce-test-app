# E-Commerce Platform — Feature-Based Implementation Plan

## Context

Full-stack assessment: NestJS + Next.js 15/16 + PostgreSQL + TypeORM. All dependencies are pre-installed — **zero npm installs needed**. Each feature is implemented end-to-end (backend + frontend together), verified, then committed and pushed.

**Ports:** Backend → `localhost:3000/api` | Frontend → `localhost:3001`

## Critical Version Notes (Breaking Changes)
- **Next.js 16.2.9:** `params` and `searchParams` in page components are **Promises** — every dynamic page must `await params` before use. Server Components use `async` functions.
- **next-auth v4.24.14** (not v5): uses `app/api/auth/[...nextauth]/route.ts` route handler, `CredentialsProvider`, JWT callbacks to embed role + backend token into session.
- **TypeORM v1.0.0:** standard decorator imports from `'typeorm'`; use `dataSource.transaction()` for transactions; `SELECT FOR UPDATE` via `.setLock('pessimistic_write')`.
- **All deps already installed** (both backend and frontend) — no `npm install` needed.

---

## Data Model

```
User          id(uuid PK), email(unique), password(bcrypt hash), name, role(enum: customer|admin), createdAt, updatedAt
Product       id(uuid PK), name, description, price(decimal 10,2), imageUrl, category, stock(int), isActive(bool default true), createdAt, updatedAt
Cart          id(uuid PK), userId(FK→User unique), createdAt, updatedAt
CartItem      id(uuid PK), cartId(FK→Cart), productId(FK→Product), quantity; UNIQUE(cartId,productId)
Order         id(uuid PK), userId(FK→User), status(enum: pending|processing|shipped|delivered|cancelled), totalAmount(decimal 10,2), paymentRef(string), createdAt, updatedAt
OrderItem     id(uuid PK), orderId(FK→Order), productId(FK→Product nullable), productName(snapshot), productPrice(snapshot decimal 10,2), quantity, lineTotal(snapshot)
ProductView   id(uuid PK), userId(FK→User), productId(FK→Product), viewedAt(timestamp)   ← for suggestions
```

**Key invariants:**
- `OrderItem` snapshots name + price at checkout — order history is immutable to product edits/deletion
- `Cart` is server-persisted; client Zustand store mirrors it for instant UI
- `TypeORM synchronize: true` in dev — no migrations needed
- Products use soft-delete (`isActive = false`), not hard delete

---

## Feature 1 — Project Foundation
**What:** DB connection, all entities, seed script, global backend config. No UI changes.

### Backend
- `backend/.env`: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS, JWT_SECRET=`super-secret-jwt-key`, JWT_EXPIRES_IN=7d, PORT=3000, FRONTEND_URL=http://localhost:3001
- `src/config/database.config.ts` — TypeORM async config from ConfigService (synchronize: true, autoLoadEntities: true)
- Update `src/app.module.ts` — import ConfigModule.forRoot({ isGlobal: true }), TypeOrmModule.forRootAsync
- Update `src/main.ts` — add global ValidationPipe({ whitelist: true, transform: true }), helmet(), compression(), HttpExceptionFilter
- Create `src/common/filters/http-exception.filter.ts` — returns `{ statusCode, message, timestamp }`, no stack traces
- Create all 7 entities in their module folders (User, Product, Cart, CartItem, Order, OrderItem, ProductView)
- `src/seed/seed.ts` — standalone script, `npm run seed`:
  - 10 products across 3 categories (Electronics, Clothing, Home & Garden), realistic imageUrls, prices £9.99–£299.99
  - Admin: `admin@shop.com` / `Admin123!`
  - Customer: `customer@shop.com` / `Customer123!`
- Add to `package.json` scripts: `"seed": "ts-node -r tsconfig-paths/register src/seed/seed.ts"`

### Frontend
- `src/lib/api.ts` — axios instance, baseURL = NEXT_PUBLIC_API_URL, request interceptor attaches `Authorization: Bearer <token>` from session
- `src/types/index.ts` — TypeScript interfaces: Product, User, Order, CartItem, OrderItem, Cart, DashboardStats
- `src/lib/utils.ts` — formatPrice(n: number): string, formatDate(d: string): string

**Verify:** Run seed → DB tables created with data. `GET /api/health` → 200.

**Commit:** `feat: project foundation — db config, entities, seed script, shared types`

---

## Feature 2 — Authentication
**What:** Register/Login API + guards + Login/Register pages + session handling.

### Backend
- `src/users/` — UserEntity, UsersModule, UsersService (findByEmail, findById, create)
- `src/auth/` — AuthModule with:
  - `POST /api/auth/register` — hash password (bcryptjs, 12 rounds), return `{ access_token, user }`
  - `POST /api/auth/login` — verify password, return `{ access_token, user }`
  - `GET /api/auth/me` — JWT-guarded, return current user
  - `JwtStrategy` — validates token, attaches user to request
  - `jwt-auth.guard.ts`, `roles.guard.ts`
  - `@CurrentUser()` decorator, `@Roles()` decorator
  - DTOs: RegisterDto (name, email, password min 8 chars), LoginDto (email, password) — class-validator

### Frontend
- `src/app/api/auth/[...nextauth]/route.ts` — next-auth v4 handler with CredentialsProvider:
  - `authorize()` calls POST /api/auth/login, returns user + access_token
  - JWT callback: embed `role` and `access_token` into token
  - Session callback: expose role + access_token on `session.user`
- `src/lib/auth.ts` — next-auth options (exported for use in route handler and server components)
- `src/components/providers.tsx` — `'use client'`, wraps children with SessionProvider, QueryClientProvider, Toaster
- Update `src/app/layout.tsx` — import Providers
- `src/store/authStore.ts` — Zustand: user, role, isAdmin helpers (hydrated from session)
- `src/app/auth/login/page.tsx` — `'use client'`, React Hook Form + Yup, calls `signIn('credentials', ...)`, redirects to /products on success
- `src/app/auth/register/page.tsx` — calls POST /api/auth/register then auto-login
- `src/components/layout/Navbar.tsx` — MUI AppBar, links to /products, user menu (login/logout), cart icon (badge placeholder)

**Verify:** Register → JWT returned → login same creds → JWT returned → wrong password → 401 → customer token denied on `GET /api/admin/orders` → 403.

**Commit:** `feat: authentication — JWT register/login, guards, auth pages, session`

---

## Feature 3 — Product Catalog
**What:** Products API with search/filter/sort/pagination + home page product grid.

### Backend
- `src/products/` — ProductEntity, ProductsModule, ProductsController, ProductsService:
  - `GET /api/products` — QueryBuilder with optional `.andWhere` for search (ILIKE), category, minPrice, maxPrice; ORDER BY price|createdAt ASC|DESC; `.skip((page-1)*limit).take(limit)`; returns `{ data: Product[], total, page, limit }`
  - `GET /api/products/categories` — `SELECT DISTINCT category FROM products WHERE isActive = true`
  - `GET /api/products/:id` — findOne, throw NotFoundException if not found or isActive=false
  - `ProductQueryDto` with @IsOptional, @IsString, @IsNumber, @Transform decorators

### Frontend
- `src/app/(store)/layout.tsx` — Server Component: Navbar + Footer
- `src/app/(store)/products/page.tsx` — `async` Server Component, `await searchParams`, fetch products server-side, pass to grid
- `src/components/store/ProductCard.tsx` — Server Component: MUI Card with image, name, category chip, price, "View" button
- `src/components/store/ProductGrid.tsx` — Server Component: responsive MUI Grid2
- `src/components/store/ProductFilters.tsx` — `'use client'`: category checkboxes, price range sliders, sort select; uses `useRouter` + `useSearchParams` to update URL params
- MUI Pagination in products page, controlled by searchParams

**Verify:** Home page loads 12 products → filter by category → grid updates → change sort → order changes → search "laptop" → matching results only.

**Commit:** `feat: product catalog — listing API, search, filter, sort, pagination`

---

## Feature 4 — Product Detail Page
**What:** Single product page + add-to-cart stub (fully wired in Feature 5).

### Backend
- Already exposed `GET /api/products/:id` in Feature 3 — no changes needed

### Frontend
- `src/app/(store)/products/[id]/page.tsx` — `async` Server Component: `const { id } = await params`, fetch product, 404 if missing
  - Full-width product image, name, category, price (large), description, stock badge (In Stock / Low Stock / Out of Stock)
  - `AddToCartButton` component (client island) — quantity selector (1–min(10,stock)), "Add to Cart" button (stubbed for now, wired in Feature 5)
  - `ProductSuggestions` placeholder (wired in Feature 11)
  - Breadcrumb: Home → Products → Product Name

**Verify:** Click product card → detail page with correct data → quantity selector shows max = stock value → Out of Stock product shows disabled button.

**Commit:** `feat: product detail page with quantity selector`

---

## Feature 5 — Shopping Cart
**What:** Cart API (server-persisted) + cart page + header cart badge.

### Backend
- `src/cart/` — CartEntity, CartItemEntity, CartModule, CartController (all JWT-guarded), CartService:
  - `GET /api/cart` — return cart with items joined to product data
  - `POST /api/cart/items` `{ productId, quantity }` — find or create cart; upsert CartItem (UNIQUE constraint: increment if exists, create if not); validate stock before inserting
  - `PUT /api/cart/items/:productId` `{ quantity }` — update; if quantity=0 delete the row; validate stock
  - `DELETE /api/cart/items/:productId`
  - Always filter by `userId` from JWT — never accept cartId from client

### Frontend
- `src/store/cartStore.ts` — Zustand with persistence: `{ items: CartItem[], totalItems, totalPrice, setCart, addItem, updateQty, removeItem, clear }`
- On session load: fetch `/api/cart` and hydrate store
- Wire `AddToCartButton.tsx` — POST /api/cart/items on click, update Zustand store, react-hot-toast success/error
- `src/components/layout/Navbar.tsx` — update cart icon to show `totalItems` badge from cartStore
- `src/app/(store)/cart/page.tsx` — `'use client'`:
  - `CartItemRow.tsx` — product thumbnail, name, unit price, quantity ± controls, line total, remove button
  - Order total section with "Proceed to Checkout" button (disabled if cart empty or not logged in)
  - Empty cart state with "Browse Products" link

**Verify:** Add product → header badge shows 1 → go to cart → item shown → increase qty → total updates → remove → cart empty → add out-of-stock item → error toast.

**Commit:** `feat: shopping cart — server-persisted cart, cart page, header badge`

---

## Feature 6 — Checkout & Order Creation
**What:** Full checkout flow: address capture + mock payment + order created in a DB transaction.

### Backend
- `src/orders/` — OrderEntity, OrderItemEntity, OrdersModule, OrdersController, OrdersService:
  - `POST /api/orders` `{ shippingAddress?: { street, city, postcode } }` — **DB transaction with row locks:**
    1. Fetch cart items; throw 400 if empty
    2. Lock product rows: `.setLock('pessimistic_write')`
    3. For each item: if `product.stock < quantity` throw 409 `"Only ${product.stock} of '${product.name}' available"`
    4. Create Order with `status: 'pending'`
    5. Create OrderItems with snapshots: `productName = product.name`, `productPrice = product.price`, `lineTotal = price * qty`
    6. Set `order.totalAmount = SUM(orderItems.lineTotal)`
    7. Decrement each product's stock: `product.stock -= quantity`
    8. Set `order.paymentRef = 'mock_pay_' + uuid()`
    9. Clear cart items
    10. Return created order
  - `CreateOrderDto` — optional shippingAddress nested object with class-validator

### Frontend
- `src/app/(store)/checkout/page.tsx` — `'use client'`, guard: redirect to /auth/login if not authenticated:
  - Left column: `AddressForm.tsx` (React Hook Form + Yup: street, city, postcode)
  - Right column: `MockPaymentForm.tsx` — card number field (16 digits, display only), expiry (MM/YY), CVV (3 digits); labelled "Test Mode — any values accepted"
  - Order summary: items from cartStore + total
  - On submit: POST /api/orders → clear Zustand cart → redirect to /checkout/success?orderId=xxx
- `src/app/(store)/checkout/success/page.tsx` — `async` Server Component: `await searchParams`, fetch order by ID, show confirmation card with order ID, items, total, "View My Orders" button

**Verify:** Full flow: login → add 2 products → checkout → success page shows order → DB has order with status=pending → product stock decremented → cart cleared → try qty > stock → 409 error displayed.

**Commit:** `feat: checkout — transactional order creation, mock payment, stock decrement`

---

## Feature 7 — Order History
**What:** Customer's past orders list + detail view.

### Backend
- `GET /api/orders` — all orders for JWT user, newest first, with orderItems populated; return `{ data: Order[], total }`
- `GET /api/orders/:id` — single order; throw 403 if `order.userId !== currentUser.id`

### Frontend
- `src/app/(store)/orders/page.tsx` — `async` Server Component: fetch with auth header from session, redirect to login if 401
  - List of orders: short order ID, date, status badge, item count, total
  - Each row links to `/orders/:id`
- `src/app/(store)/orders/[id]/page.tsx` — `async` Server Component: `await params`, fetch order detail
  - Order items with snapshot name + price (NOT current product price)
  - Order total, status badge, paymentRef
- `src/components/ui/StatusBadge.tsx` — reusable MUI Chip: pending=grey, processing=blue, shipped=amber, delivered=green, cancelled=red

**Verify:** Place 2 orders → /orders shows both → click one → items and snapshot prices shown → manually change product price in DB → order still shows original price → try `/api/orders/<other-user-id>` → 403.

**Commit:** `feat: order history — customer order list and detail with price snapshots`

---

## Feature 8 — Admin: Product Management
**What:** Admin product CRUD API + admin layout + products management UI.

### Backend
- Add to ProductsController (role:admin guarded):
  - `POST /api/admin/products` — CreateProductDto (name, description, price, imageUrl, category, stock — all validated)
  - `PATCH /api/admin/products/:id` — UpdateProductDto (partial, all optional)
  - `DELETE /api/admin/products/:id` — soft-delete: set `isActive = false` (preserves order history references)

### Frontend
- `src/app/(admin)/layout.tsx` — `'use client'`, check `session.user.role === 'admin'`, redirect to /auth/login if not; render AdminSidebar + main content area
- `src/components/admin/AdminSidebar.tsx` — MUI Drawer: links to /admin/dashboard, /admin/products, /admin/orders
- `src/app/(admin)/admin/products/page.tsx` — `'use client'`, MUI DataGrid: name, category, price, stock, isActive; row actions: Edit (link), Delete (confirm dialog → soft delete)
- `src/app/(admin)/admin/products/new/page.tsx` — `ProductForm.tsx` for create
- `src/app/(admin)/admin/products/[id]/page.tsx` — `async` page: `await params`, prefill ProductForm for edit
- `src/components/admin/ProductForm.tsx` — `'use client'`: React Hook Form, all product fields, imageUrl preview, submit to create or update

**Verify:** Login as admin → /admin/products → create product → appears in catalog → edit price → updated on catalog → delete → gone from catalog (isActive=false) → order history for that product still shows original name/price → login as customer → /admin/products → redirected.

**Commit:** `feat: admin product management — CRUD with soft delete, admin layout`

---

## Feature 9 — Admin: Order Management
**What:** All orders view + order status update with lifecycle validation.

### Backend
- `src/admin/` — AdminModule, AdminOrdersController (role:admin), AdminOrdersService:
  - `GET /api/admin/orders` — all orders with user info + items; optional query params: `status`, `page`, `limit`
  - `PATCH /api/admin/orders/:id/status` `{ status }` — validate state machine:
    - `pending → processing → shipped → delivered` (forward only)
    - Any status → `cancelled`
    - All other transitions throw 400 with message `"Cannot transition from X to Y. Valid: [list]"`
  - `UpdateOrderStatusDto` with `@IsEnum(OrderStatus)`

### Frontend
- `src/app/(admin)/admin/orders/page.tsx` — `'use client'`, TanStack Query + MUI DataGrid: order ID, customer name/email, date, items count, total, status
  - MUI Tab bar at top: All / Pending / Processing / Shipped / Delivered / Cancelled
  - Each row has inline status `<Select>` — onChange fires PATCH mutation, optimistic update
- `src/app/(admin)/admin/orders/[id]/page.tsx` — `async` page, order detail with items table

**Verify:** Admin sees all orders → change pending → processing → cannot go back → can cancel → customer's /orders page reflects updated status → try invalid transition → 400 error shown.

**Commit:** `feat: admin order management — all orders view, status lifecycle`

---

## Feature 10 — Admin Dashboard
**What:** Analytics aggregation API + dashboard with chart.

### Backend
- `src/admin/admin-dashboard.controller.ts` — `GET /api/admin/dashboard` (role:admin):
  - `totalSales`: `SUM(totalAmount) WHERE status != 'cancelled'`
  - `totalOrders`: COUNT(*)
  - `totalCustomers`: COUNT(*) WHERE role = 'customer'
  - `ordersByStatus`: GROUP BY status → `{ status, count }[]`
  - `topProducts`: JOIN order_items GROUP BY productId, productName → ORDER BY SUM(quantity) DESC LIMIT 5 → `{ productName, unitsSold, revenue }[]`

### Frontend
- `src/app/(admin)/admin/dashboard/page.tsx` — `'use client'`, TanStack Query:
  - Row of 4 MUI Cards: Total Revenue (£), Total Orders, Total Customers, Pending Orders count
  - `DashboardChart.tsx` — recharts `BarChart` with `ordersByStatus` (x = status label, y = count); tooltips enabled
  - Top Products table: rank, name, units sold, revenue

**Verify:** After seeded orders, dashboard shows non-zero values → cancel an order → Total Revenue decreases → chart shows cancelled bar → top products table populated.

**Commit:** `feat: admin dashboard — revenue stats, orders-by-status chart, top products`

---

## Feature 11 — Product Suggestions
**What:** Personalised suggestions API + suggestions row on product detail page.

### Backend
- `GET /api/products/:id/suggestions` — optional auth (custom `OptionalJwtGuard` that calls `super.canActivate()` without throwing if no token):
  - If JWT present + user has ≥1 order: find user's most-purchased category (`GROUP BY product.category ORDER BY SUM(qty) DESC LIMIT 1`) → return 4 products from that category (exclude current product, stock > 0, newest first)
  - Otherwise: return 4 products from same category as `:id` product (exclude current, stock > 0)
- `POST /api/products/:id/view` — JWT required, insert ProductView row (for future ranking; no dedup needed now)

### Frontend
- Wire `ProductSuggestions.tsx` in `/products/[id]/page.tsx`:
  - `'use client'` component: fetch `/api/products/:id/suggestions` via React Query (pass auth header if logged in)
  - Swiper carousel of up to 4 `ProductCard`s below the product description
  - Section title: "Recommended for you" (logged-in with history) or "More in [category]" (guest/new user)
  - Fire `POST /api/products/:id/view` in a `useEffect` on mount (silently, no loading state)

**Verify:** View product as guest → suggestions from same category → place order in Electronics → view a Clothing product → suggestions still show Clothing (category of current product) → view an Electronics product → suggestions shift to Electronics (user's purchase history).

**Commit:** `feat: product suggestions — category-based with purchase-history personalisation`

---

## Feature 12 — Tests, README, NOTES.md
**What:** Meaningful automated tests + complete documentation.

### Tests

**Unit: `src/orders/orders.service.spec.ts`**
- Throws 409 when `quantity > product.stock` (message includes product name)
- `orderItem.productPrice` equals `product.price` at time of checkout (not affected by later price change)
- Stock is decremented by the ordered quantity after successful checkout

**Unit: `src/auth/auth.service.spec.ts`**
- `register()` stores a bcrypt hash, not plaintext password
- `login()` with wrong password throws `UnauthorizedException`
- `login()` with correct password returns a string `access_token`

**Unit: `src/products/products.service.spec.ts`**
- `findAll()` applies `minPrice` filter correctly via QueryBuilder
- Results are paginated: page=2, limit=2 skips first 2 records

**E2E: `test/auth.e2e-spec.ts`**
- `POST /api/auth/register` → 201 + access_token
- `POST /api/auth/login` with valid creds → 200 + access_token
- `POST /api/auth/login` with wrong password → 401

**E2E: `test/admin-guard.e2e-spec.ts`**
- Customer JWT on `DELETE /api/admin/products/:id` → 403
- Admin JWT on `DELETE /api/admin/products/:id` → 200 or 404 (not 403)

### Docs
- `README.md` — prerequisites (Node 20+, PostgreSQL 15+), env variable table, step-by-step setup, seeded credentials, Swagger URL
- `NOTES.md` — agent workflow, where agent helped/failed, supervision methods, design decisions, product suggestions reasoning, trade-offs

**Verify:** `npm test` green → `npm run test:e2e` green → fresh clone → follow README → app fully functional.

**Commit:** `feat: automated tests, README, and NOTES.md`

---

## Edge Cases Matrix

| Case | Feature | Handling |
|---|---|---|
| qty > stock at checkout | 6 | DB transaction + `SELECT FOR UPDATE` row lock; throws 409 with product name |
| Race condition (2 users buy last item) | 6 | Pessimistic row lock ensures only one transaction succeeds |
| Price change between cart add and checkout | 6 | Snapshot `productPrice` from `Product.price` inside transaction |
| Duplicate add-to-cart | 5 | UNIQUE(cartId,productId) + upsert: increments quantity |
| Cart qty updated to 0 | 5 | Delete CartItem row instead of setting qty=0 |
| Product deleted after cart add | 5/6 | 404 on cart fetch; snapshot in OrderItem preserved |
| Admin deletes product with order history | 8 | Soft-delete only; OrderItem.productId nullable; snapshots intact |
| Invalid order status transition | 9 | State machine check; 400 with valid transitions listed |
| Customer accessing another user's order | 7 | All order queries filter by `userId` from JWT — never from params |
| Customer accessing admin endpoints | 8/9 | `RolesGuard` + `@Roles('admin')` → 403 |
| JWT expiry mid-session | 2 | axios interceptor receives 401 → calls next-auth `signOut()` |
| Checkout with empty cart | 6 | 400 "Cart is empty" before any DB work |
| Input with extra/unknown fields | All | `ValidationPipe({ whitelist: true })` strips them silently |
| Stack trace in error response | All | `HttpExceptionFilter` normalises all errors to `{ statusCode, message, timestamp }` |
