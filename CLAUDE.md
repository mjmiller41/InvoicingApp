# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend dev server (port 3000)
npm run dev

# Backend auth API server (port 3001) — required for login/register to work
npm run dev:api

# Both must run simultaneously during auth development

npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # ESLint
```

The backend reads from `.env.local`. Required variables: `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (the auth API server's own base URL), `FRONTEND_URL` (the frontend app's origin — used for CORS and trusted origins), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. The server throws on startup if any are missing.

## Architecture

### Two-server dev setup

Vite runs on port 3000 and proxies `/api/*` to the auth API server on port 3001 (`vite.config.js`). The auth API is a plain Node HTTP server (`dev-server.js`) wrapping [better-auth](https://better-auth.dev). In production this handler is deployed as a Vercel serverless function at `api/auth/[...all].js`.

### Two independent state layers

**`InvoiceContext`** (`src/context/InvoiceContext.jsx`) — all app data. Invoices, clients, businesses, and notifications all live here, persisted to `localStorage` under `invoicer_*` keys. This is the single source of truth for everything in `/app/*`. Access via `useInvoices()`.

**`AuthContext`** (`src/context/AuthContext.jsx`) — session only. Wraps better-auth's `useSession()` hook. Exposes `user`, `loading`, `login`, `register`, `loginWithGoogle`, and `logout`. Access via `useAuth()`.

These two contexts are intentionally separate: `InvoiceProvider` wraps the entire tree in `main.jsx`; `AuthProvider` wraps only the router inside `App.jsx`.

### Multi-business data model

Every invoice and client carries a `businessId` field. `InvoiceContext` stores *all* businesses' data together but exposes filtered `invoices` and `clients` derived from `activeBusinessId`. Always use the filtered `invoices`/`clients` values (not `allInvoices`/`allClients`) in app pages. The active business is persisted to `localStorage` separately.

### Route structure

| Prefix | Access | Notes |
|--------|--------|-------|
| `/` and `/pricing` | Public | Marketing pages using `MarketingNav` + `MarketingFooter` |
| `/login`, `/register` | Public | Redirect to `/app` if already authenticated |
| `/app/*` | Protected | Gated by `ProtectedRoute`; renders inside `DashboardLayout` |

`ProtectedRoute` shows a spinner while session loads, then redirects to `/login` (preserving `location.state.from`) if no user.

### Shared auth page components

`src/components/auth/AuthShared.jsx` exports `GoogleIcon` and `AuthPageHeader` — used by both `LoginPage` and `RegisterPage` to avoid duplication.

### Notification system

Auto-notifications for overdue and due-soon invoices are generated inside a `useEffect` in `InvoiceContext`. They use stable IDs (`overdue-<invoiceId>`, `due-soon-<invoiceId>`) so they deduplicate on re-render. Dismissed auto-notifications are tracked in a separate `dismissedNotifications` array so they don't reappear after the user clears them.

### PDF export

`InvoiceDetail.jsx` uses `html2canvas-pro` to rasterize the invoice DOM node and `jsPDF` to embed it as a PDF. The invoice preview element must remain in the DOM (not conditionally rendered) for this to work.
