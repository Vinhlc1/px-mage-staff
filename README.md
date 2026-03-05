# PX Mage  Staff Portal

Next.js 16 staff portal for PX Mage. Provides purchase-order management, NFC card binding, and customer order fulfilment.

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
