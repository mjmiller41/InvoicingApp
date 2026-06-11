import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, Bell, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import Sidebar from './Sidebar';
import { useInvoices } from '../context/InvoiceContext';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { 
    businessInfo,
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  } = useInvoices();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (n) => {
    markAsRead(n.id);
    setNotificationsOpen(false);
    if (n.actionLink) {
      navigate(n.actionLink);
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          wrapper: 'bg-emerald-50/45 border-emerald-100 hover:bg-emerald-50/70',
          border: 'border-l-emerald-500',
          icon: <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />,
          titleText: 'text-emerald-950 font-bold',
          descText: 'text-emerald-800 text-[11px]'
        };
      case 'warning':
        return {
          wrapper: 'bg-amber-50/45 border-amber-100 hover:bg-amber-50/70',
          border: 'border-l-amber-500',
          icon: <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />,
          titleText: 'text-amber-950 font-bold',
          descText: 'text-amber-800 text-[11px]'
        };
      case 'error':
        return {
          wrapper: 'bg-rose-50/45 border-rose-100 hover:bg-rose-50/70',
          border: 'border-l-rose-500',
          icon: <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0 mt-0.5" />,
          titleText: 'text-rose-950 font-bold',
          descText: 'text-rose-800 text-[11px]'
        };
      default:
        return {
          wrapper: 'bg-slate-50/45 border-slate-150 hover:bg-slate-50/70',
          border: 'border-l-blue-500',
          icon: <Info className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />,
          titleText: 'text-slate-900 font-bold',
          descText: 'text-slate-650 text-[11px]'
        };
    }
  };

  // Get current date string formatted nicely
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 shrink-0 print:hidden">
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-lg transition-all relative cursor-pointer focus:outline-none ${
                  notificationsOpen
                    ? 'bg-slate-100 text-slate-700'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse"></span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col max-h-[480px]">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-150 flex items-center justify-between shrink-0">
                    <div className="text-left">
                      <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                        {unreadCount} unread alert{unreadCount !== 1 && 's'}
                      </p>
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                        <span className="text-slate-350 text-xs">|</span>
                        <button
                          onClick={clearAllNotifications}
                          className="text-[10px] text-slate-500 hover:text-slate-700 font-bold hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[360px]">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <div className="h-10 w-10 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                          <Bell className="h-5 w-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">All caught up!</p>
                        <p className="text-[10px] text-slate-450 mt-1">No active alerts for this profile.</p>
                      </div>
                    ) : (
                      notifications.map(n => {
                        const styles = getNotificationStyles(n.type);
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3.5 border-l-4 transition-all flex gap-3 cursor-pointer relative group ${styles.wrapper} ${
                              n.read ? 'border-l-transparent opacity-70' : styles.border
                            }`}
                          >
                            {/* Icon */}
                            <div className="shrink-0">
                              {styles.icon}
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 text-left min-w-0 pr-4">
                              <div className="flex items-baseline justify-between gap-1.5 mb-1">
                                <span className={`text-xs truncate ${styles.titleText} ${!n.read ? 'font-extrabold' : ''}`}>
                                  {n.title}
                                </span>
                                <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                                  {formatTime(n.timestamp)}
                                </span>
                              </div>
                              <p className={`line-clamp-2 pr-1.5 leading-normal ${styles.descText} ${!n.read ? 'font-medium' : ''}`}>
                                {n.message}
                              </p>
                            </div>

                            {/* Unread indicator / Close icon */}
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                              {!n.read && (
                                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0 group-hover:hidden" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearNotification(n.id);
                                }}
                                className="hidden group-hover:flex p-1 rounded hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
                                aria-label="Dismiss notification"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
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
        <main className="flex-1 overflow-y-auto focus:outline-none bg-slate-50 print:bg-white print:overflow-visible print:p-0">
          <div className="max-w-7xl mx-auto print:max-w-none print:w-full print:p-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
