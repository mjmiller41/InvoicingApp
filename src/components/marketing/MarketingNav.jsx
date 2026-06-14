import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hammer, ArrowRight, Menu, X } from 'lucide-react';

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const isLanding = pathname === '/welcome';

  const anchor = (hash) => (isLanding ? hash : `/welcome${hash}`);

  const navLinks = [
    { label: 'Features', to: anchor('#features') },
    { label: 'How it works', to: anchor('#workflow') },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Customers', to: anchor('#customers') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/welcome" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30">
            <Hammer className="h-5 w-5" />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight">Billwright</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`px-3 py-2 rounded-lg transition-colors hover:text-slate-900 hover:bg-slate-50 ${
                label === 'Pricing' && pathname === '/pricing'
                  ? 'text-slate-900 bg-slate-100'
                  : ''
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            to="/app"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile: start free + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm px-3 py-2 rounded-xl shadow-sm transition-colors"
          >
            Start free
          </Link>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-6 py-4 space-y-1">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link
              to="/app"
              onClick={() => setMobileOpen(false)}
              className="block text-center py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
