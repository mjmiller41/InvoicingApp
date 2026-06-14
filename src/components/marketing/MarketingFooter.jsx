import React from 'react';
import { Link } from 'react-router-dom';
import { Hammer, Share2, Globe, Code2 } from 'lucide-react';

export function MarketingFooter({ variant = 'full' }) {
  if (variant === 'condensed') {
    return (
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/welcome" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-slate-950">
              <Hammer className="h-4 w-4" />
            </span>
            <span className="font-extrabold tracking-tight">Billwright</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/welcome#features" className="hover:text-slate-900 transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link>
            <Link to="/app" className="hover:text-slate-900 transition-colors">Open app</Link>
          </nav>
          <p className="text-xs text-slate-500">© 2026 Billwright</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          <div>
            <Link to="/welcome" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-slate-950">
                <Hammer className="h-5 w-5" />
              </span>
              <span className="text-[17px] font-extrabold tracking-tight">Billwright</span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 max-w-xs">
              Invoicing built for the people who make, build and craft. Less admin, faster deposits.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Product</h4>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-slate-600">
              <li><Link to="/welcome#features" className="hover:text-slate-900 transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="hover:text-slate-900 transition-colors">Pricing</Link></li>
              <li><Link to="/app" className="hover:text-slate-900 transition-colors">Open app</Link></li>
              <li><Link to="/welcome#workflow" className="hover:text-slate-900 transition-colors">How it works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-slate-600">
              <li><a href="#" className="hover:text-slate-900 transition-colors">About</a></li>
              <li><Link to="/welcome#customers" className="hover:text-slate-900 transition-colors">Customers</Link></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Legal</h4>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-slate-600">
              <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 Billwright. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-900 transition-colors" aria-label="Social">
              <Share2 className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors" aria-label="Web">
              <Globe className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors" aria-label="Code">
              <Code2 className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
