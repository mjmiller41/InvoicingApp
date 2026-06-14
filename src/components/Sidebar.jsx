import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, Users, Settings, Plus, Hammer, ChevronDown, Check, Trash2, X, AlertTriangle, Upload } from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';

function Sidebar({ isOpen, onClose }) {
  const { 
    businessInfo, 
    businesses, 
    activeBusinessId, 
    selectBusiness, 
    addBusiness, 
    deleteBusiness 
  } = useInvoices();
  
  const navigate = useNavigate();

  // Switcher UI State
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState(null);

  // Form State
  const [newBizName, setNewBizName] = useState('');
  const [addError, setAddError] = useState('');

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleAddBusinessSubmit = (e) => {
    e.preventDefault();
    if (!newBizName.trim()) {
      setAddError('Business name is required');
      return;
    }
    const created = addBusiness({ name: newBizName });
    setNewBizName('');
    setAddError('');
    setIsAddModalOpen(false);
    setDropdownOpen(false);
    onClose(); // close mobile sidebar
    navigate('/app/settings'); // go to settings to complete setup
  };

  const handleDeleteConfirm = () => {
    if (businessToDelete) {
      deleteBusiness(businessToDelete.id);
      setBusinessToDelete(null);
      setIsDeleteModalOpen(false);
      setDropdownOpen(false);
    }
  };

  const navItems = [
    { to: '/app', label: 'Invoices', icon: FileText, end: true },
    { to: '/app/invoices/new', label: 'New Invoice', icon: Plus },
    { to: '/app/invoices/import', label: 'Import Invoices', icon: Upload },
    { to: '/app/clients', label: 'Clients', icon: Users },
    { to: '/app/settings', label: 'Settings', icon: Settings },
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand/Header Dropdown Switcher */}
        <div ref={dropdownRef} className="relative border-b border-slate-800 shrink-0">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full h-16 flex items-center justify-between px-6 gap-3 text-left hover:bg-slate-800/40 transition-colors focus:outline-none group select-none cursor-pointer"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-emerald-500 p-2 rounded-lg text-slate-900 shrink-0">
                <Hammer className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-sm text-white leading-tight truncate">
                  {businessInfo.name}
                </h2>
                <span className="text-[10px] text-slate-400 block font-medium">Invoicing Suite</span>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Switcher Dropdown Overlay */}
          {dropdownOpen && (
            <div className="absolute left-4 right-4 top-14 mt-1 bg-slate-950 border border-slate-800 rounded-lg shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                Switch Business
              </div>
              <div className="max-h-48 overflow-y-auto mt-1 space-y-0.5">
                {businesses.map((biz) => (
                  <div
                    key={biz.id}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-900 mx-1.5 transition-colors group/item"
                  >
                    <button
                      onClick={() => {
                        selectBusiness(biz.id);
                        setDropdownOpen(false);
                        onClose(); // close mobile sidebar
                      }}
                      className="flex-1 text-left font-semibold text-xs text-slate-200 truncate cursor-pointer pr-2 hover:text-emerald-400 transition-colors"
                    >
                      {biz.name}
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {biz.id === activeBusinessId && (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      {businesses.length > 1 && biz.id !== activeBusinessId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBusinessToDelete(biz);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                          title="Delete Business"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-800/80 my-1.5"></div>
              
              <button
                onClick={() => {
                  setIsAddModalOpen(true);
                  setAddError('');
                  setNewBizName('');
                }}
                className="w-[calc(100%-12px)] flex items-center justify-center gap-1.5 py-2 px-3 hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 font-bold text-xs rounded-md transition-colors text-center mx-1.5 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Business
              </button>
            </div>
          )}
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
        <div className="p-4 border-t border-slate-800 text-center shrink-0">
          <p className="text-xs text-slate-500">© 2026 {businessInfo.name}</p>
        </div>
      </aside>

      {/* Add Business Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="bg-white w-full max-w-sm rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 transform transition-all animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-150 px-5 py-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Add Business Profile</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddBusinessSubmit} className="p-5 space-y-4">
              <div className="text-left">
                <label htmlFor="newBizName" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="newBizName"
                  value={newBizName}
                  onChange={(e) => {
                    setNewBizName(e.target.value);
                    if (addError) setAddError('');
                  }}
                  placeholder="e.g. Acme Corporation"
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    addError ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                  autoFocus
                />
                {addError && <p className="text-xs text-rose-500 mt-1 font-semibold">{addError}</p>}
              </div>
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-350 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Business Modal */}
      {isDeleteModalOpen && businessToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <div className="bg-white w-full max-w-sm rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 transform transition-all animate-in fade-in zoom-in-95 duration-150 text-slate-850">
            <div className="flex items-center justify-between border-b border-slate-150 px-5 py-3 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Delete Business Profile</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 text-sm">Delete "{businessToDelete.name}"?</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Are you absolutely sure? This will permanently delete the business entity and <span className="font-bold text-rose-600">all associated invoices and clients</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-350 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
