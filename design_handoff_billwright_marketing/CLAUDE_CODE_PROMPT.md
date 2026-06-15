# Prompt for Claude Code

Copy everything below the line into Claude Code, run from the root of the `InvoicingApp` repo with
this `design_handoff_billwright_marketing/` folder placed inside it (or pass its path).

---

You are working in my existing invoicing web app. The repo is a **React 18 + Vite** SPA using
**Tailwind CSS v4** (`@import "tailwindcss"` in `src/index.css`), **react-router-dom**, and
**lucide-react** for icons. Read `src/components/Sidebar.jsx`, `src/pages/Dashboard.jsx`, and
`src/utils/statusStyles.js` first to learn the existing conventions, color usage, and component style.

Inside `design_handoff_billwright_marketing/` there is a `README.md` spec and three HTML design
references in `designs/`. These HTML files are **design references only** — do not copy their markup,
their Tailwind CDN script, or their vanilla JS. **Recreate the designs as idiomatic React components**
in this codebase, reusing existing patterns, Tailwind classes, and `lucide-react` icons.

## What to build
Add a public-facing marketing surface to the app:

1. **Landing page** — recreate `designs/Billwright Landing.html`.
2. **Pricing page** — recreate `designs/Billwright Pricing.html`, including the working
   monthly/annual billing toggle, the feature comparison table, and the accordion FAQ.

The third file, `designs/Billwright App.html`, is a **reference recreation of our existing Invoices
dashboard** — do not rebuild it; use it only to keep the marketing pages visually consistent with the
real product. Defer to the actual `Dashboard.jsx`/`Sidebar.jsx` for any token questions.

## How to integrate
- Create the pages as **new public routes outside** the authenticated `DashboardLayout`:
  - `/welcome` → Landing
  - `/pricing` → Pricing
  - Keep the existing app at `/` (Invoices dashboard) unchanged. The marketing "Log in" / "Open app" /
    "Start free" CTAs should link to `/`.
- New files (adjust to match repo conventions):
  - `src/pages/marketing/Landing.jsx`
  - `src/pages/marketing/Pricing.jsx`
  - `src/components/marketing/MarketingNav.jsx` (shared sticky header)
  - `src/components/marketing/MarketingFooter.jsx` (shared footer)
- Register the routes in the app router (`src/App.jsx`).
- Use `<Link>`/`<NavLink>` from react-router for all navigation, not `<a href>`.
- Replace the prototypes' inline SVG/CDN icons with `lucide-react` imports.
- Implement scroll-reveal and the stats count-up with small reusable hooks
  (e.g. `useInView`), and **gate animations behind `prefers-reduced-motion`** so reduced-motion and
  SSR/first paint show the final state, not the pre-animation hidden state.

## Design system — match exactly
- Primary action color **emerald-500 `#10b981`** with **slate-950** text on it (hover `emerald-600`,
  active `emerald-700`). Dark surfaces **slate-900**. Neutral palette is Tailwind **slate**.
- Reuse the status pill colors from `src/utils/statusStyles.js` for any Paid/Sent/Overdue/Draft UI.
- Radii: buttons/inputs/app-cards `rounded-xl`, marketing cards `rounded-2xl`, hero/CTA panels
  `rounded-3xl`, pills `rounded-full`. Card borders are `border-slate-200` with `shadow-xs`.
- **Fonts:** the prototypes use **Plus Jakarta Sans** (display/UI) + **Space Mono** (invoice IDs, step
  numbers). Our app currently uses the default Tailwind sans. **Ask me which to do**, or default to:
  add Plus Jakarta Sans + Space Mono via self-hosted `@font-face` (or a `<link>` in `index.html`),
  wire them into the Tailwind v4 theme (`--font-sans`, `--font-mono`), and apply app-wide.
- Full token list, per-section layout, copy, and interaction details are in
  `design_handoff_billwright_marketing/README.md` — follow it as the source of truth.

## Quality bar
- Pixel-match the references' spacing, type scale, and color (this is a hi-fi handoff).
- Fully responsive: the marketing nav collapses on mobile; grids reflow to single column; the hero
  stacks. Test at 375px, 768px, and 1280px.
- Accessible: semantic landmarks, `aria-expanded` on FAQ items, focus-visible states on all
  interactive elements, the billing toggle as a real `role="switch"`.
- No console errors or warnings. Keep components reasonably small and colocate shared bits.

## Deliverables
- The new routes working and linked to/from the existing app.
- A short note in your summary listing the files you added/changed and any decisions (especially the
  font question) you made.

Start by reading the existing code and the README, propose a brief plan, then implement.
