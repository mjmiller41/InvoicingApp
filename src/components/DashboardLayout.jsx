import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, Calendar, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { useInvoices } from '../context/InvoiceContext';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { businessInfo } = useInvoices();

  // Get current date string formatted nicely
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 shrink-0">
          {/* Left part: menu toggle or brand info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              <span>{currentDate}</span>
            </div>
            <span className="sm:hidden font-semibold text-slate-800 text-lg">
              {businessInfo.name}
            </span>
          </div>

          {/* Right part: profile or quick settings */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-800 text-white font-semibold flex items-center justify-center text-sm ring-2 ring-slate-100 shadow-sm">
                {businessInfo.name ? businessInfo.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {businessInfo.name}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic page content view */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
