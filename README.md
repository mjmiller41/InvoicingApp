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
