# NOTES.md — Assessment Reflections

---

## Agent Session Transcripts

Claude Code session transcripts (`.jsonl` files) are included in the [`transcripts/`](./transcripts/) directory at the root of this repo. Each file is one session; the largest (`e0553194-…jsonl`, ~7 MB) covers the bulk of the build from Feature 5 onwards. Earlier sessions are the smaller files.

---

## Agent Workflow

I used **Claude Code** (Anthropic's CLI agent) throughout the entire build. The workflow was strictly feature-by-feature:

1. I decomposed the spec into 12 discrete features (auth, catalog, detail page, cart, checkout, order history, admin products, admin orders, admin dashboard, suggestions, tests/docs).
2. Before starting, I ran Claude Code in plan mode to produce a detailed implementation plan saved as a `.claude/plans/` file. This gave me a reference spec the agent could follow per feature.
3. For each feature I said `implement feature N`. The agent read the plan, checked existing files, and implemented backend + frontend end-to-end before I moved on.
4. After each feature, I verified manually in the browser and pushed to Git — keeping commits clean and incremental.
5. I maintained context across features by keeping the plan file open and relying on Claude Code's session summarisation for longer sessions.

**Project context file:** I used Claude Code's `CLAUDE.md` support to store the tech-stack notes (breaking-change versions, MUI v9 rules, Next.js 16 params-as-Promises) so the agent carried consistent constraints across every feature without me having to repeat them.

---

## Where the Agent Helped

- **Speed**: roughly 95% of file creation was agent-generated. Without it, building 10 features in a single session would have been impossible.
- **TypeORM transaction pattern**: the agent correctly implemented pessimistic locking (`lock: { mode: 'pessimistic_write' }`) and `manager.decrement` inside a `dataSource.transaction` callback — this is a subtle pattern I verified carefully.
- **next-auth v4 session embedding**: the JWT + session callbacks to expose `role` and `accessToken` on `session.user` were handled correctly first time.
- **State machine for order status**: the `VALID_TRANSITIONS` record and the frontend inline status `<Select>` showing only valid next states — the agent produced a clean, consistent implementation across backend and frontend.
- **Admin RBAC**: `RolesGuard` + `@Roles(UserRole.ADMIN)` wired correctly on every admin endpoint.

---

## Where the Agent Failed (Caught and Fixed)

### 1. Admin layout — double `ml` offset (significant visual bug)

**The bug**: In the admin layout, the main content `Box` had `ml: '240px'` applied manually. But a MUI `Drawer` with `variant="permanent"` IS a flex item — it's in the document flow and naturally pushes siblings to the right. Adding `ml: DRAWER_WIDTH` on top of that caused the content area to start at `2 × 240 = 480px` from the left, leaving a large gap.

**How I caught it**: Visible in the browser — the content was pushed far to the right of the sidebar.

**Fix**: Removed the `ml` from the main Box. The permanent Drawer's natural flex placement is sufficient.

### 2. recharts assumed but not installed

**The bug**: The plan stated "use recharts `BarChart`" for the admin dashboard. The agent wrote code importing from `recharts`. Only when I checked the actual `package.json` did I confirm recharts was not installed.

**How I caught it**: TypeScript compilation error + checking `frontend/package.json` explicitly.

**Fix**: Replaced recharts with a pure CSS/MUI Box bar chart proportional to `(count / maxCount) * 160px`. No install needed.

### 3. Unused imports after refactoring

Several files had unused imports left after edits (e.g. `Cart` imported in `orders.service.ts` after a refactor). These caused TypeScript warnings.

**How I caught it**: `tsc --noEmit` warnings and linter output.

**Fix**: Removed the unused imports.

### 4. Next-auth session type casts

The agent initially added `as string | undefined` casts on `session.user.accessToken` in server components, but the type augmentation in `next-auth.d.ts` already declared it as `string` (non-optional). The cast was wrong and unnecessary.

**How I caught it**: TypeScript error: `Type 'string | undefined' is not assignable to type 'string'`.

**Fix**: Used `session.user.accessToken` directly.

### 5. MUI v9 `sx` prop discipline

MUI v9 moved several shorthand CSS props to require the `sx` prop. The agent occasionally placed things like `fontWeight={700}` directly on `<Typography>` instead of inside `sx`. These caused TypeScript errors.

**How I caught it**: TypeScript errors on the component props.

**Fix**: Moved all CSS shorthand props into `sx={{ ... }}` consistently throughout.

---

## Supervision & Verification

- **After each feature**: opened the browser, walked through the golden path (e.g., add to cart → checkout → success page → orders list → order detail).
- **Admin panel**: verified role guard by attempting to access `/admin/*` as a customer — correctly redirected.
- **Snapshot prices**: placed an order, then manually changed a product price via the admin edit form, then confirmed the order history still showed the original price.
- **Stock decrement**: added a product with stock 5, ordered 3, confirmed stock showed 2 in the admin product list.
- **State machine**: attempted backward status transition via the admin orders select — confirmed 400 error toast.
- **Pessimistic lock**: not directly testable in a single-user session, but covered in unit test (ConflictException when qty > stock).
- **Type checking**: ran `cd backend && npx tsc --noEmit` and `cd frontend && npx tsc --noEmit` after each feature to catch compilation errors.

---

## Design Workflow

I directed the UI design through Claude Code prompts rather than a dedicated design tool, describing the layout and component hierarchy I wanted. Decisions included:

- **Store layout**: Tailwind for server-component layouts (grid, flex, spacing), MUI component islands (Cards, Chips, Buttons) for interactive elements. Kept MUI out of server components to avoid RSC/client boundary issues.
- **Admin layout**: permanent MUI Drawer sidebar (220px), grey.50 background on the main area, MUI DataGrid for data-heavy tables.
- **Colour palette**: muted, professional — `grey.50` backgrounds, `#1976d2` primary blue, status colours matched across the StatusBadge component and the dashboard chart (grey/blue/amber/green/red for pending/processing/shipped/delivered/cancelled).
- **Admin dashboard chart**: CSS-based bar chart since recharts wasn't installed. Bars are proportional to max count, with a 4px stub for zero values so empty statuses are visible.
- **Checkout**: two-column layout (address left, mock payment right), with React Hook Form + Yup validation for both forms.

I iterated on a few components — the ProductCard hover state, the admin sidebar active-route highlighting, and the checkout success page layout — through follow-up prompts.

---

## Product Suggestions — Interpretation & Reasoning

> "Customers should be able to see product suggestions that are relevant to them."

**My interpretation**: "relevant" should mean something specific about the customer, not just "popular items" which is the same for everyone.

**Approach**: purchase-history personalisation by category, with same-category fallback.

1. If the customer is authenticated and has placed at least one order, find the category they've ordered from most (by total units across all non-cancelled orders). Show 4 active, in-stock products from that category, excluding the current product, newest first.
2. If the customer is a guest or has no order history, fall back to 4 products from the same category as the current product.

**Why category-level rather than product-level**: With a small product catalogue (10 items at seed time), individual product-based collaborative filtering would be too noisy. Category is a meaningful signal that works with a realistic catalogue size.

**Why `POST /products/:id/view`**: Tracks product views in the `product_views` table for future use. In this submission it only records the view — a future iteration could incorporate view history into the ranking (e.g. "you viewed X, people who viewed X also viewed Y").

**Frontend**: The section title is "Recommended for you" when personalised, "More in [category]" otherwise. The view event fires silently in a `useEffect` on mount.

---

## Assumptions & Trade-offs

| Area | Decision | Reason |
|---|---|---|
| Product images | URL field, not file upload | File upload requires storage infrastructure (S3/GCS). URL is simpler, keeps the scope achievable, and is easy to swap later. Documented here as a known gap. |
| Payment | Mock (`mock_pay_<uuid>`) | No Stripe keys; the spec explicitly permits mock payment. The checkout form has a realistic-looking card number/expiry/CVV input labelled "Test Mode". |
| DB synchronisation | `synchronize: true` | Acceptable in dev — no migration files to maintain. Would switch to `synchronize: false` + TypeORM migrations for production. |
| Product deletion | Soft-delete only (`isActive = false`) | Hard-delete would orphan `OrderItem.productId` references and break order history snapshots. Soft-delete preserves referential integrity. |
| Admin orders pagination | None on the admin orders page | The DataGrid component handles client-side paging and the dataset is manageable. Server-side pagination would be added for scale. |
| Cart persistence | Server-persisted (DB) + Zustand mirror | Zustand provides instant UI updates; the server cart is the source of truth. Zustand is cleared on logout. |
| Password hashing | bcryptjs, 12 rounds | 12 rounds is the sweet spot for security vs. latency on modern hardware (~100ms per hash). |
| Error format | `{ statusCode, message, timestamp }` | Consistent JSON error shape from `HttpExceptionFilter`; no stack traces in responses. |
| `typeorm@1.0.0` | Uses class-decorator syntax | The assessment pre-installed this version; it's compatible with `@nestjs/typeorm@11`. |

---

## What I'd Do With More Time

1. **File uploads** — swap imageUrl for a proper upload to S3/R2 with presigned URLs.
2. **Stripe test mode** — replace the mock payment form with real Stripe Elements test integration.
3. **Product suggestion ranking** — incorporate view history and recency weighting into the suggestion algorithm.
4. **Admin orders server-side pagination** — the DataGrid currently loads all orders; add `?page=&limit=` params with a total count response.
5. **Refresh tokens** — the current JWT expires in 7 days with no refresh mechanism.
6. **More test coverage** — E2E tests for cart and checkout flows; test for race condition at checkout (two concurrent requests for the last unit in stock).
7. **CI pipeline** — GitHub Actions workflow running `npm test` and `npm run test:e2e` against a test database.
