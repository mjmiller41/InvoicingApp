# Handoff: Billwright Marketing Site (Landing + Pricing) & App Dashboard reference

## Overview

This package contains three HTML design references for **Billwright**, the public-facing brand
for the existing invoicing application:

1. **Landing page** — marketing home that explains the product and drives signups.
2. **Pricing page** — three plan tiers with a monthly/annual toggle, comparison table, and FAQ.
3. **App dashboard** — a faithful recreation of the product's existing Invoices dashboard, included
   purely as a **styling/interaction reference** (your app already implements this screen).

The net-new work is the **Landing** and **Pricing** pages. The App dashboard file is a reference so
the marketing pages stay visually consistent with the real product.

## About the Design Files

The files in `design_handoff_billwright_marketing/designs/` are **design references created in static HTML + Tailwind (CDN) + vanilla JS**.
They are prototypes that show the intended look, copy, and behavior — **not production code to copy
verbatim**. The task is to **recreate these designs inside the existing React codebase** using its
established stack and conventions:

- **React 18 + Vite**
- **Tailwind CSS v4** (`@import "tailwindcss";` in `src/index.css`)
- **react-router-dom** for routing
- **lucide-react** for icons
- Existing components in `src/components/` and pages in `src/pages/`

> The HTML prototypes load Tailwind via CDN and pull in `Plus Jakarta Sans` + `Space Mono` from Google
> Fonts. Your real app currently uses the **default Tailwind sans stack**. Decide deliberately: either
> adopt Plus Jakarta Sans app-wide for brand consistency, or keep the default font and let the
> marketing pages inherit it. Don't ship the CDN `<script>` — use the codebase's compiled Tailwind.

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, copy, and interactions are intended as
shown. Recreate the UI closely using your existing Tailwind setup and `lucide-react` icons. The App
dashboard reference should match your already-shipped Dashboard — defer to your real component if they
differ.

## Recommended integration

Add two public routes to the existing router, outside the authenticated `DashboardLayout`:

```
/                 -> existing app (Dashboard)        // unchanged
/marketing  or  a separate marketing entry           // see note below
```

Because `/` is already the app's Invoices dashboard, Put marketing at `/` and move the app under `/app`, with auth-gating deciding the redirect. Larger change;

New files to create:

```
src/pages/marketing/Landing.jsx
src/pages/marketing/Pricing.jsx
src/components/marketing/MarketingNav.jsx     // shared sticky header
src/components/marketing/MarketingFooter.jsx  // shared footer
```

---

## Screens / Views

### 1. Landing (`design_handoff_billwright_marketing/designs/Billwright Landing.html`)

**Purpose:** Explain the product and drive users to start free / open the app.

**Layout:** Single scrolling column, content centered in a `max-w-7xl` (1280px) container with `px-6`
gutters. Sections stack vertically. Top-to-bottom:

1. **Sticky nav** (`h-16`, `bg-white/85 backdrop-blur-md`, bottom border `slate-200/70`).
   - Left: logo lockup — `9×9` emerald (`#10b981`) rounded-xl tile with white `hammer` icon + wordmark
     "Billwright" (`text-[17px] font-extrabold tracking-tight`).
   - Center (md+): text links — Features, How it works, Pricing, Customers (`text-sm font-semibold
text-slate-600`, hover `text-slate-900 bg-slate-50` rounded-lg).
   - Right: "Log in" ghost link + "Start free" emerald button (`bg-emerald-500 text-slate-950
font-bold rounded-xl px-4 py-2.5`, hover `emerald-600`) with trailing `arrow-right` icon.

2. **Hero** — two columns (`lg:grid-cols-[1.05fr_1fr]`, `gap-14`), soft blurred emerald/blue blobs
   behind, subtle dotted "grain" background.
   - Left: eyebrow pill ("INVOICING FOR MAKERS & TRADES"), `h1` (`text-5xl md:text-6xl font-extrabold
tracking-tight leading-[1.02]`) "Get paid for the work you build." with a hand-drawn emerald
     underline SVG under "build." Sub-paragraph (`text-lg text-slate-600 max-w-md`). Two CTAs (emerald
     primary, white-bordered secondary). Trust row of three checks.
   - Right: floating product mock in a browser frame (window dots + `app.billwright.com`), containing
     two mini KPI cards (Collected / Outstanding) and a 3-row invoice list with status pills. A small
     floating "Payment received" toast chip overlaps the bottom-left. `float` animation (6s ease).

3. **Logo strip** (`#customers`) — "Trusted by 4,000+…" + 6 placeholder maker logos (lucide icon +
   name), on `bg-slate-50/60` with top/bottom borders.

4. **Features** (`#features`) — eyebrow + `h2` + bento grid. Row 1: one large 2×2 card ("Build & send
   invoices in seconds" with an embedded invoice mock + Send/Download buttons) plus two small cards
   ("Track every status" with status pills, "Import your back catalog"). Row 2: three equal cards
   (Client address book, Multiple businesses, Automatic reminders). All cards: `rounded-2xl border
border-slate-200 bg-white p-7 shadow-xs`; each leads with an `11×11` rounded-xl icon tile.

5. **Stats band** — full-width `bg-slate-900` strip, 3 columns, large `text-5xl font-extrabold
text-emerald-400` numbers that count up on scroll (11 days, 38s, $62M).

6. **Workflow** (`#workflow`) — centered heading + 3 numbered step cards (mono `01/02/03` in emerald),
   with `arrow-right` connectors between them on md+.

7. **Testimonial** — `rounded-3xl bg-slate-50` panel, 5 emerald stars, large blockquote, avatar +
   name (Sarah Jenkins, Jenkins Design Studio), and a 2×2 stat card on the right.

8. **Final CTA** — `rounded-3xl bg-emerald-500` block, dotted overlay, `h2` in `slate-950`, dark
   "Open the app" button + white "Compare plans" button.

9. **Footer** — 4-column (`bg-slate-50`, top border): brand blurb + Product / Company / Legal link
   columns, then a divider row with copyright and 3 social icons.

### 2. Pricing (`design_handoff_billwright_marketing/designs/Billwright Pricing.html`)

**Purpose:** Present plans and convert. Reuses the same nav + footer.

**Layout & components:**

- **Hero:** centered eyebrow pill, `h1` "Pay for the workshop, not the paperwork", sub-paragraph, and
  a **billing toggle**: "Monthly" / "Annual" labels flanking a switch (emerald track, white knob
  sliding `translate-x-5`), plus a "Save 20%" emerald badge. Annual is the default-on state.
- **Plan cards** (3, `lg:grid-cols-3`, `items-start`):
  - **Solo** — `$0/mo`, "Free forever", white-bordered "Get started" button, 4 feature rows.
  - **Studio** — highlighted: `border-2 border-emerald-500`, `shadow-xl shadow-emerald-500/10`,
    lifted `lg:-mt-3`, "Most popular" pill centered on the top edge. `$18/mo` (monthly) → `$14/mo`
    (annual). Emerald "Start 14-day trial" button. 6 feature rows.
  - **Workshop** — `$42/mo` → `$34/mo`, slate-900 icon tile + slate-900 "Start 14-day trial" button,
    5 feature rows.
  - Each feature row: `check` icon in `emerald-500` + label; key values bolded.
  - Prices update live when the toggle flips (see Interactions). A `data-period` caption reads "billed
    monthly" / "billed annually".
- **Comparison table** — `max-w-5xl`, `rounded-2xl border` wrapper, header row with the Studio column
  tinted `emerald-50`. 12 feature rows; cells render a `check` (emerald), a `minus` (slate-300), or a
  bold text value. Rows are generated from a `cmp` array (see Design Tokens / data below).
- **FAQ** — `max-w-3xl`, 6 accordion items (`rounded-xl border bg-white`). Each: question button with
  a `chevron-down` that rotates 180° when open; answer expands via a `grid-rows-[0fr] -> [1fr]`
  transition. Single-open not required (each toggles independently).
- **CTA** — `rounded-3xl bg-slate-900` block with blurred emerald glow, "Open the app" emerald button.
- **Footer** — condensed single-row variant.

### 3. App dashboard (`design_handoff_billwright_marketing/designs/Billwright App.html`) — REFERENCE ONLY

**Purpose:** Mirror of the existing Invoices dashboard, for visual parity. Your app already implements
this (`src/pages/Dashboard.jsx`, `src/components/Sidebar.jsx`). Use it only to confirm tokens/spacing.
Layout: fixed `w-64` dark `slate-900` sidebar with brand switcher + nav (active item = emerald), top
bar (date, bell with rose dot, avatar), page header, 4 KPI cards, search + status filter chips, and an
invoices table with clickable status pills (dropdown) and view/edit/delete actions.

---

## Interactions & Behavior

**Landing**

- Sticky header stays on scroll; nav links smooth-scroll to in-page anchors (`scroll-behavior: smooth`).
- `[data-reveal]` elements fade + translate up into view via `IntersectionObserver` (threshold 0.12),
  `opacity/transform .7s cubic-bezier(.16,1,.3,1)`. In React, replicate with an `useInView` hook or a
  small wrapper component; respect `prefers-reduced-motion`.
- Stats `[data-count]` count from 0 to target when scrolled into view (threshold 0.6).
- Hero mock has a 6s vertical `floaty` keyframe loop.

**Pricing**

- **Billing toggle:** clicking flips `annual` boolean → swaps each price between its `data-m` (monthly)
  and `data-a` (annual) value, updates the period caption, and restyles the labels/track. Default:
  annual = true.
- **FAQ accordion:** each question toggles `aria-expanded` and animates its answer container's
  `grid-template-rows` between `0fr` and `1fr`; the chevron rotates 180°.

**App (reference)**

- Live search filters by invoice ID or client name; status chips filter the list; status pills open a
  dropdown to change status (recomputes KPI totals); delete removes the row; toast confirms actions;
  mobile hamburger slides the sidebar in.

## State Management

- **Pricing:** `billingCycle: 'monthly' | 'quarterly' | 'annual'` (default `quarterly`); derive displayed prices from a
  per-plan `{ monthly, quarterly, annual }` map. Per-FAQ `open` boolean (local state or an open-index).
- **Landing:** no real app state — only scroll-driven reveal/count effects.
- **App:** `invoices[]`, `searchQuery`, `statusFilter`, `openDropdownId` — already modeled in the real
  `Dashboard.jsx` / `InvoiceContext`.

## Design Tokens

**Colors (Tailwind classes / hex)**

- Primary: `emerald-500` `#10b981` (hover `emerald-600` `#059669`, active `emerald-700` `#047857`).
- Text on emerald buttons: `slate-950` `#020617`.
- Dark surfaces: `slate-900` `#0f172a`, `slate-950` `#020617`.
- Neutrals: `slate-50 #f8fafc`, `slate-100 #f1f5f9`, `slate-200 #e2e8f0`, `slate-300 #cbd5e1`,
  `slate-400 #94a3b8`, `slate-500 #64748b`, `slate-600 #475569`, `slate-900 #0f172a`.
- Status pills (border/bg/text):
  - Paid → `emerald-200 / emerald-100 / emerald-800`
  - Sent → `blue-200 / blue-100 / blue-800`
  - Overdue → `rose-200 / rose-100 / rose-800`
  - Draft → `slate-200 / slate-100 / slate-700`
- Accent tints used on icon tiles: `blue-50/100/600`, `rose-50/100/600`, `amber-50/100/600`.

**Typography**

- Display/UI: **Plus Jakarta Sans** (400/500/600/700/800). Headlines `font-extrabold tracking-tight`.
- Mono accents (invoice IDs, step numbers, URLs): **Space Mono** (400/700).
- Scale used: `h1` 48–60px, `h2` 36–48px, card titles 18–20px, body 16–18px, small 12–14px,
  eyebrows/labels 10–12px uppercase `tracking-wider/widest`.

**Radius**

- Buttons & inputs: `rounded-xl` (12px). App cards/table: `rounded-xl`. Marketing cards: `rounded-2xl`
  (16px). Big CTA/testimonial panels: `rounded-3xl` (24px). Status pills & eyebrows: `rounded-full`.

**Shadow**

- `shadow-xs` on cards; `shadow-sm` on primary buttons; `shadow-xl`/`shadow-2xl` on the hero mock and
  popovers; emerald-tinted shadows on key CTAs (`shadow-emerald-500/20`).

**Spacing**

- Container `max-w-7xl` + `px-6`. Section vertical rhythm `py-20 md:py-28`. Card padding `p-7`
  (marketing) / `p-5` (app KPI cards). Grid gaps `gap-5`/`gap-6`.

## Assets

- **Icons:** all from **lucide** — already available as `lucide-react` in the codebase. Icons used:
  hammer, arrow-right, check, play, file-text, activity, upload, users, building-2, bell-ring,
  check-circle-2, clock, send, download, star, twitter, instagram, github, chevron-down, minus, user,
  dollar-sign, alert-triangle, search, eye, pencil (Edit), trash-2, calendar, bell, menu, plus,
  trees/anvil/pen-tool/ruler/paintbrush/drill (placeholder customer logos — swap for real logos).
- **Fonts:** Plus Jakarta Sans + Space Mono (Google Fonts). Self-host or add `@font-face`/`<link>`.
- **No raster images** — the hero/feature "screens" are built from real markup. The customer logo
  strip uses placeholder icon+wordmark lockups; replace with actual customer logos when available.
- **Brand mark:** the emerald rounded tile + `hammer` glyph matches the existing app sidebar logo.

## Files

- `design_handoff_billwright_marketing/designs/Billwright Landing.html` — landing page reference (Tailwind CDN + vanilla JS).
- `design_handoff_billwright_marketing/designs/Billwright Pricing.html` — pricing page reference (toggle + FAQ logic in the `<script>`).
- `design_handoff_billwright_marketing/designs/Billwright App.html` — dashboard reference (mirrors the shipped app).

In the existing codebase, the closest real references are:

- `src/components/Sidebar.jsx`, `src/pages/Dashboard.jsx` — source of truth for app styling/tokens.
- `src/utils/statusStyles.js` — canonical status pill classes (reuse for any status UI).
