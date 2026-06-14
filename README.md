# InvoicingApp

A client-side invoicing application for small businesses. Create and manage invoices, track payment statuses, manage clients across multiple business profiles, and export invoices as PDF — all stored locally in the browser with no backend required.

## Features

- **Invoice management** — Create, edit, delete, and filter invoices by status (Draft, Sent, Paid, Overdue)
- **Invoice detail view** — Print-optimized invoice layout with PDF download and email dispatch (simulated or via native mail client)
- **Client management** — Add, edit, and delete client records with contact details
- **Multi-business profiles** — Switch between multiple business identities; each has isolated clients and invoices
- **Financial dashboard** — At-a-glance totals for revenue, collected, outstanding, and overdue amounts
- **Notification system** — Automatic alerts for overdue and due-soon invoices; manual notifications on key actions
- **Data import / export** — Export all data as JSON; import from JSON (merge or new-profile mode), or import past invoices from CSV/PDF
- **Persistent storage** — All data stored in `localStorage`; no login or server required

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI | React 19, Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| State | React Context API + `localStorage` |
| Icons | Lucide React |
| PDF | jsPDF + html2canvas-pro |
| Build | Vite 8 |
| Deploy | Vercel |

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:5173` by default.

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint
```

## Deployment

The project is pre-configured for Vercel. `vercel.json` includes an SPA rewrite rule so all routes resolve to `index.html`.

```bash
vercel deploy
```

No environment variables are required.

## Project Structure

```
src/
├── App.jsx                  # Route definitions
├── main.jsx                 # React entry point
├── components/
│   ├── DashboardLayout.jsx  # Root layout with sidebar and notification panel
│   └── Sidebar.jsx          # Navigation and business switcher
├── context/
│   └── InvoiceContext.jsx   # Global state for invoices, clients, businesses, notifications
├── pages/
│   ├── Dashboard.jsx        # Invoice list with search, filters, and financial summary
│   ├── InvoiceBuilder.jsx   # Create / edit invoice form
│   ├── InvoiceDetail.jsx    # Invoice preview, PDF export, email dispatch
│   ├── ImportInvoices.jsx   # CSV / PDF invoice importer
│   ├── Clients.jsx          # Client list and management
│   └── Settings.jsx         # Business profile and data import / export
└── utils/
    ├── importParsers.js     # RFC-4180 CSV parser and PDF text extractor
    └── statusStyles.js      # Tailwind class map for invoice status badges
```

## Routes

| Path | Page |
|---|---|
| `/` | Invoice dashboard |
| `/invoices/new` | Create invoice |
| `/invoices/:id` | Invoice detail and preview |
| `/invoices/:id/edit` | Edit invoice |
| `/invoices/import` | Import invoices from CSV or PDF |
| `/clients` | Client management |
| `/settings` | Business profile and data management |

## Roadmap

Planned features in priority order, targeting freelancers, independent contractors, sole proprietors, and small business owners.

### Core Workflow

1. **Logo & branding upload** — Upload a business logo stored as a base64 data URL and rendered on every invoice PDF. The single highest-visibility improvement for client-facing professionalism.

2. **Custom invoice numbering** — User-defined prefix and starting number (e.g. `ACME-2026-001`) with auto-increment. Required for consistent paper trails and tax/audit readiness.

3. **Discount line support** — Apply a percentage or flat discount at the invoice level before tax is calculated. Expected by most users; absence forces awkward workarounds.

4. **Partial payments & payment history** — Log multiple payments against a single invoice (date, amount, note). Track what has been collected vs. what remains outstanding. Fixes the current binary Paid/Unpaid model.

5. **Quote / estimate builder** — Mirror the invoice builder to produce a client-facing estimate. One-click conversion from estimate to live invoice captures the full project lifecycle in one tool.

6. **Recurring invoices** — Define a billing schedule (weekly, monthly, custom) and auto-generate the next invoice from a saved template. Essential for contractors on retainer and subscription-based engagements.

### Reporting & Retention

7. **Late fee automation** — Configurable flat or percentage late fee that can be applied to any overdue invoice as a new line item. Low implementation cost, strong professional signal.

8. **Invoice aging report** — Summary table bucketing outstanding invoices by 0–30, 31–60, 61–90, and 90+ days past due. No new data model required; high value for cash-flow awareness.

9. **Annual income / tax summary** — Year-over-year report of total invoiced, total collected, and total outstanding, filterable by business profile. Sole proprietors return to this every tax season.

10. **Time tracker → invoice** — Built-in stopwatch tied to a client that accumulates billable hours and pushes them to invoice line items. Keeps hourly contractors in the app daily rather than a separate tool.

11. **Expense tracking** — Log business expenses (description, amount, date, category) and optionally pass them through to a client invoice. Critical for contractors who bill reimbursable costs.

### Platform & Growth

12. **PWA / install to home screen** — Add `manifest.json` and a minimal service worker to make the app installable on mobile and desktop. The app already works fully offline; this makes that official and improves retention.

13. **Landing page** — Public marketing page explaining the product for prospective users. Key message: **your data never leaves your device** — all invoices, clients, and business profiles are stored in your browser's local storage with no account, no server, and no subscription required to get started. Highlight the privacy and zero-setup angle as a direct counter-pitch to cloud-based competitors.

14. **Pricing page** — Tiered plan page (e.g. free tier with core features, paid tier unlocking recurring invoices, time tracking, and cloud backup). Communicates product value before sign-up and supports monetization.

15. **User login / cloud sync** — Optional account creation that syncs localStorage data to a cloud backend. Designed as opt-in so the zero-setup, privacy-first experience remains available without an account. Enables cross-device access and data recovery.
