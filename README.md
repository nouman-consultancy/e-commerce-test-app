# E-Commerce Platform

A full-stack e-commerce platform with a customer storefront and admin panel, built with NestJS, Next.js, and PostgreSQL.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20+ |
| npm | 9+ |
| PostgreSQL | 15+ |

---

## Environment Variables

### Backend — `backend/.env`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=postgres
DB_PASS=your_password

JWT_SECRET=super-secret-jwt-key
JWT_EXPIRES_IN=7d

PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=nextauth-super-secret
```

---

## Quick Start

### 1. Clone the repository

```bash
git clone <repo-url>
cd e-commerce-test-app
```

### 2. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Create the database

```sql
CREATE DATABASE ecommerce;
```

### 4. Configure environment

Copy the variables above into `backend/.env` and `frontend/.env.local`, adjusting database credentials as needed.

### 5. Seed the database

```bash
cd backend
npm run seed
```

This creates the tables (via TypeORM `synchronize: true`), 10 sample products across 3 categories, and two user accounts.

### 6. Start the backend

```bash
cd backend
npm run start:dev
```

Backend runs at **http://localhost:3000/api**

### 7. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend runs at **http://localhost:3001**

---

## Seeded Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@shop.com` | `Admin123!` |
| Customer | `customer@shop.com` | `Customer123!` |

---

## API Documentation

Swagger UI is available at: **http://localhost:3000/api/docs**

---

## Running Tests

```bash
cd backend

# Unit tests
npm test

# E2E tests (requires running PostgreSQL and seeded database)
npm run test:e2e
```

> E2E tests connect to the database configured in `backend/.env`. Run `npm run seed` before running E2E tests so the seeded admin account exists.

---

## Key Features

- **Customer storefront** — product catalog with search/filter/sort/pagination, product detail, shopping cart, checkout with mock payment, order history
- **Admin panel** — product CRUD (soft-delete), order status management with lifecycle validation, analytics dashboard
- **Product suggestions** — personalised by purchase history category; falls back to same-category for guests
- **Auth** — JWT-based, role-guarded endpoints (customer vs admin)
- **Data integrity** — checkout uses pessimistic DB locks to prevent overselling; order items snapshot price at purchase time

---

## Project Structure

```
e-commerce-test-app/
├── backend/          # NestJS API (port 3000)
│   ├── src/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── users/
│   │   ├── admin/
│   │   └── seed/
│   └── test/         # E2E tests
└── frontend/         # Next.js App Router (port 3001)
    └── src/
        ├── app/
        │   ├── (store)/   # Customer storefront
        │   └── (admin)/   # Admin panel
        └── components/
```
