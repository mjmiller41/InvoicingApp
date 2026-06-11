import React, { useState } from 'react';
import { Mail, Phone, MapPin, Plus, Edit, Trash2, X, User, DollarSign, FileCheck } from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';

function Clients() {
  const { 
    clients, 
    invoices, 
    addClient, 
    updateClient, 
    deleteClient, 
    getInvoiceTotal 
  } = useInvoices();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form validator
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Client name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Billing address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      addClient(formData);
    }

    closeModal();
  };

  // Open modal for adding
  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setErrors({});
  };

  // Helper: Calculate statistics for a client
  const getClientStats = (clientId) => {
    const clientInvoices = invoices.filter(inv => inv.clientId === clientId);
    const totalBilled = clientInvoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
    return {
      invoiceCount: clientInvoices.length,
      totalBilled
    };
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your customer profiles, contact info, and view billing metrics.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-150 text-sm cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          Add Client
        </button>
      </div>

      {/* Main List Grid */}
      {clients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-md mx-auto">
          <div className="bg-slate-50 text-slate-400 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <User className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-lg mb-1">No Clients Registered</h3>
          <p className="text-slate-500 text-sm mb-6">
            Register clients first to start creating invoices and tracking balances.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clients.map(client => {
            const { invoiceCount, totalBilled } = getClientStats(client.id);
            const isConfirmingDelete = deleteConfirmId === client.id;

            return (
              <div 
                key={client.id}
                className="bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-slate-300 transition-all duration-200 p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Card Title & Actions */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 text-slate-700 font-semibold flex items-center justify-center rounded-lg text-lg border border-slate-200">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg leading-snug">
                          {client.name}
                        </h3>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full border border-slate-200">
                          ID: {client.id.slice(-6)}
                        </span>
                      </div>
                    </div>

                    {/* Desktop/Tablet Card Actions */}
                    {!isConfirmingDelete ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(client)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Client"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(client.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 rounded-lg p-1 animate-pulse">
                        <span className="text-[10px] font-bold text-rose-700 px-2">Delete?</span>
                        <button
                          onClick={() => {
                            deleteClient(client.id);
                            setDeleteConfirmId(null);
                          }}
                          className="bg-rose-600 text-white font-semibold text-xs px-2 py-1 rounded hover:bg-rose-700 transition-colors cursor-pointer"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="bg-white border border-rose-200 text-rose-700 font-semibold text-xs px-2 py-1 rounded hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Contact Info */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-4 mb-6">
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <a href={`mailto:${client.email}`} className="hover:text-emerald-600 transition-colors truncate">
                        {client.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-slate-600 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  </div>
                </div>

                {/* Card Financial Summary Bar */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-150 rounded-lg p-3 mt-auto">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Invoices Issued
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <FileCheck className="h-4 w-4 text-slate-400" />
                      <span className="font-bold text-slate-800 text-sm">
                        {invoiceCount}
                      </span>
                    </div>
                  </div>
                  <div className="text-left border-l border-slate-200 pl-4">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      Billed Total
                    </p>
                    <div className="flex items-center mt-0.5">
                      <DollarSign className="h-4 w-4 text-emerald-600 -ml-1" />
                      <span className="font-bold text-slate-800 text-sm">
                        {totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Modal Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={closeModal}
          />

          {/* Modal Content container */}
          <div className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-xl overflow-hidden z-10 transform transition-all animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingClient ? 'Edit Client Details' : 'Add New Client'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Client Name Input */}
              <div className="text-left">
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Client / Company Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Acme Corporation"
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    errors.name ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.name}</p>}
              </div>

              {/* Client Email Input */}
              <div className="text-left">
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. accounting@acme.com"
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    errors.email ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {errors.email && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.email}</p>}
              </div>

              {/* Client Phone Input */}
              <div className="text-left">
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. (555) 019-9234"
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    errors.phone ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {errors.phone && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.phone}</p>}
              </div>

              {/* Client Address Input */}
              <div className="text-left">
                <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Billing Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 100 Main St, Suite 400, Austin, TX 78701"
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 resize-none ${
                    errors.address ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {errors.address && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.address}</p>}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-350 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold rounded-lg text-sm shadow-sm transition-colors cursor-pointer"
                >
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clients;
