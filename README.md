# PixelMage — Staff Portal

Internal operations portal for PixelMage staff. Covers the full supply-side workflow: purchasing stock from suppliers, binding NFC chips to physical cards, and fulfilling customer orders.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| UI Library | React 19.2.3 + TypeScript 5.9 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Forms | React Hook Form 7 + Zod 4 |
| Linter / formatter | Biome 2.2 |
| Package manager | pnpm |

---

## Architecture

### Authentication

- Login POSTs credentials to the Next.js proxy `/api/auth/login`, which forwards to the backend and sets two cookies:
  - `pm_token` — httpOnly JWT; never readable by client JS.
  - `pm_user` — plain JSON cookie with username/role for display.
- A **middleware** (`proxy.ts` at project root) validates `pm_token` on every request and redirects to `/login` if expired or missing.
- All staff pages are under `/staff/*` — protected by middleware.

### API Proxy Pattern

All backend calls are routed through Next.js API routes in `app/api/`. Client code calls `apiClient.get|post|put|delete|patch` from `lib/api-client.ts`, which always targets `/api/*` — never the backend directly.

```
Browser → /api/<resource>  →  Next.js proxy route  →  http://localhost:8386/api/<resource>
                                    (attaches httpOnly token from cookie)
```

Shared proxy helpers (`proxyGet`, `proxyPost`, `proxyPut`, `proxyPatch`) live in `app/api/orchestra.ts`.

---

## Pages & Features

### Dashboard — `/staff`

- Summary stats cards pulled from the backend in parallel:
  - **Cards pending NFC bind** — count of `card-products` with status `PENDING_BIND`.
  - **Orders to fulfil** — count of customer orders with status `PENDING` or `PROCESSING`.
- Implemented as a server `page.tsx` that imports a `"use client"` `DashboardStats` component, keeping the stats interactive without polluting the server component.

### Purchase Orders

#### All POs — `/staff/purchase-orders`
- Table listing every purchase order with:  supplier name, order date, total amount,  expected delivery, and status badge.
- Status badge variants: `PENDING` (outline), `APPROVED` (default), `RECEIVED` (secondary), `CANCELLED` (destructive).
- Action buttons per row:
  - **Approve** — PATCH `purchase-orders/{id}/approve` (visible when `PENDING`).
  - **Reject** — PATCH `purchase-orders/{id}/reject` (visible when `PENDING`).
  - **Mark Received** — PATCH `purchase-orders/{id}/receive` (visible when `APPROVED`).
- Animated skeleton table (6 rows × 6 columns) while data loads.

#### Pending Approval — `/staff/purchase-orders/pending`
- Same component filtered to `status === "PENDING"` only.

#### Ready to Receive — `/staff/purchase-orders/approved`
- Same component filtered to `status === "APPROVED"` only.

### NFC Binding — `/staff/nfc`

- Lists all physical card products (`GET /api/card-products`).
- Each row shows: product ID, name, framework, template, tier, current bind status.
- Status badge: `READY` (default), `PENDING_BIND` (outline), `LINKED`/`SOLD` (secondary), `DEACTIVATED` (destructive).
- **Bind NFC** button on each `PENDING_BIND` row — opens a modal dialog where the operator enters the NFC UID serial number.
- Submits PATCH `/api/card-products/{id}/bind` with the UID. Toast confirms success or shows error.
- List auto-refreshes after a successful bind.

### Orders — `/staff/orders`

- Lists all customer orders with order ID, date, customer, total, status, and payment status.
- Status update dropdown per order (change to `PROCESSING`, `COMPLETED`, `CANCELLED`).
- Clicking an order ID navigates to `/staff/orders/{id}` for full detail:
  - Order metadata (date, status, payment method, shipping address, notes).
  - Line-items table (product, quantity, unit price, subtotal).
  - Inline status-update button.
- Skeleton loading for both list and detail views.

---

## Proxy API Routes

| Method | Next.js Route | Backend Endpoint |
|---|---|---|
| POST | `/api/auth/login` | `POST /auth/login` |
| GET | `/api/auth/me` | `GET /auth/me` |
| POST | `/api/auth/logout` | `POST /auth/logout` |
| GET | `/api/purchase-orders` | `GET /purchase-orders` |
| GET | `/api/purchase-orders/[id]` | `GET /purchase-orders/{id}` |
| PATCH | `/api/purchase-orders/[id]/approve` | `PATCH /purchase-orders/{id}/approve` |
| PATCH | `/api/purchase-orders/[id]/reject` | `PATCH /purchase-orders/{id}/reject` |
| PATCH | `/api/purchase-orders/[id]/receive` | `PATCH /purchase-orders/{id}/receive` |
| GET | `/api/suppliers` | `GET /suppliers` |
| GET | `/api/warehouses` | `GET /warehouses` |
| GET | `/api/card-products` | `GET /card-products` |
| PATCH | `/api/card-products/[id]/bind` | `PATCH /card-products/{id}/bind` |
| GET | `/api/orders` | `GET /orders` |
| GET | `/api/orders/[id]` | `GET /orders/{id}` |
| PATCH | `/api/orders/[id]/status` | `PATCH /orders/{id}/status` |

---

## Project Structure

```
app/
  staff/
    page.tsx              # Dashboard (server) → imports DashboardStats
    dashboard-stats.tsx   # Client component — live stats cards
    layout.tsx            # Sidebar + header shell
    purchase-orders/      # PO list + pending + approved sub-pages
    nfc/                  # NFC binding table + bind dialog
    orders/               # Order list + detail
  api/
    orchestra.ts          # Shared proxy helpers
    auth/                 # Login / logout / me
    card-products/        # GET list, PATCH bind
    orders/               # GET list, GET [id], PATCH status
    purchase-orders/      # GET, PATCH approve/reject/receive
    suppliers/            # GET list (for PO form dropdowns)
    warehouses/           # GET list
  login/                  # Public login page
components/
  layout/                 # AppSidebar, Header, Main, nav-group
    data/
      sidebar-data.ts     # All nav groups and items
  ui/                     # shadcn/ui components
  search.tsx
context/
  auth-context.tsx        # useAuth() — user info from pm_user cookie
  layout-provider.tsx
  search-provider.tsx
  theme-provider.tsx
features/
  purchase-orders/        # PO feature module (list, dialogs, forms)
  nfc/                    # NFC binding feature module
  orders/                 # Order fulfilment feature module
hooks/
  use-auth.ts
  use-dialog-state.ts
  use-mobile.ts
lib/
  api-client.ts           # apiClient.get|post|put|delete|patch → /api/*
  auth-utils.ts
  auth.ts
  cookies.ts
  utils.ts                # cn(), formatVND()
proxy.ts                  # Next.js middleware
types/
  index.ts                # All BE DTO interfaces
```

---

## Getting Started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8386   # Spring Boot backend
```

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Auto-format with Biome |

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Linter / Formatter | Biome 2 |
| Package manager | pnpm |

## Features

| Feature | Route | Description |
|---|---|---|
| Dashboard | `/staff` | Live stats: cards pending bind, orders to fulfil |
| All POs | `/staff/purchase-orders` | View, approve, reject, receive purchase orders |
| Pending Approval | `/staff/purchase-orders/pending` | Filtered view  PENDING POs |
| Ready to Receive | `/staff/purchase-orders/approved` | Filtered view  APPROVED POs |
| NFC Binding | `/staff/nfc` | Bind NFC UIDs to card products |
| Orders | `/staff/orders` | View customer orders and update status |

## Proxy API Routes

All routes in `app/api/` proxy to the backend at `http://localhost:8386/api`.

| Method | Next.js Route | Backend Endpoint |
|---|---|---|
| POST | `/api/auth/login` | `POST /auth/login` |
| GET | `/api/auth/me` | `GET /auth/me` |
| POST | `/api/auth/logout` | `POST /auth/logout` |
| GET | `/api/purchase-orders` | `GET /purchase-orders` |
| GET | `/api/purchase-orders/[id]` | `GET /purchase-orders/{id}` |
| PATCH | `/api/purchase-orders/[id]/approve` | `PATCH /purchase-orders/{id}/approve` |
| PATCH | `/api/purchase-orders/[id]/reject` | `PATCH /purchase-orders/{id}/reject` |
| PATCH | `/api/purchase-orders/[id]/receive` | `PATCH /purchase-orders/{id}/receive` |
| GET | `/api/suppliers` | `GET /suppliers` |
| GET | `/api/warehouses` | `GET /warehouses` |
| GET | `/api/card-products` | `GET /card-products` |
| PATCH | `/api/card-products/[id]/bind` | `PATCH /card-products/{id}/bind` |
| GET | `/api/orders` | `GET /orders` |
| GET | `/api/orders/[id]` | `GET /orders/{id}` |
| PATCH | `/api/orders/[id]/status` | `PATCH /orders/{id}/status` |

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Linting

```bash
pnpm biome check --write .
```
