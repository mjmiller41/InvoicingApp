import React from 'react';
import { NavLink } from 'react-router-dom';
import { FileText, Users, Settings, Plus, Hammer } from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';

function Sidebar({ isOpen, onClose }) {
  const { businessInfo } = useInvoices();

  const navItems = [
    { to: '/', label: 'Invoices', icon: FileText, end: true },
    { to: '/invoices/new', label: 'New Invoice', icon: Plus },
    { to: '/clients', label: 'Clients', icon: Users },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand/Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg text-slate-900">
            <Hammer className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight tracking-wide text-white">
              {businessInfo.name}
            </h2>
            <span className="text-xs text-slate-400">Invoicing Suite</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">© 2026 {businessInfo.name}</p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
