import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, FileText, DollarSign,
  Calendar, CreditCard, Percent, Save, X
} from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';

function InvoiceBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    invoices,
    clients,
    addInvoice,
    updateInvoice,
    getInvoiceSubtotal,
    getInvoiceTax,
    getInvoiceTotal
  } = useInvoices();

  const isEditMode = !!id;

  // Form State
  const [invoiceId, setInvoiceId] = useState('');
  const [clientId, setClientId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState(8);
  const [status, setStatus] = useState('Draft');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    { id: 'item-new-1', description: '', quantity: 1, rate: 0 }
  ]);

  const [errors, setErrors] = useState({});

  // Guard so that subsequent invoice state updates don't reset the form while editing
  const initialized = useRef(false);
  const prevIdRef = useRef(null);

  useEffect(() => {
    // Reset initialization guard when navigating to a different invoice
    if (prevIdRef.current !== id) {
      prevIdRef.current = id;
      initialized.current = false;
    }

    if (initialized.current) return;

    if (isEditMode) {
      const invoice = invoices.find(inv => inv.id === id);
      if (invoice) {
        initialized.current = true;
        setInvoiceId(invoice.id);
        setClientId(invoice.clientId);
        setInvoiceDate(invoice.invoiceDate);
        setDueDate(invoice.dueDate);
        setTaxRate(invoice.taxRate);
        setStatus(invoice.status);
        setNotes(invoice.notes || '');
        setItems(invoice.items.map(item => ({ ...item })));
      } else {
        navigate('/');
      }
    } else {
      initialized.current = true;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setInvoiceId(`INV-${randomNum}`);
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setInvoiceDate(today);
      setDueDate(thirtyDaysLater);
    }
  }, [id, isEditMode, invoices, navigate]);

  // Line Item Handlers
  const handleItemChange = (itemId, field, value) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          let updatedValue = value;
          if (field === 'quantity') updatedValue = Number(value) || 0;
          if (field === 'rate') updatedValue = Number(value) || 0;
          return { ...item, [field]: updatedValue };
        }
        return item;
      })
    );
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: '' }));
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-new-${Date.now()}`,
      description: '',
      quantity: 1,
      rate: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount;

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!invoiceId.trim()) newErrors.invoiceId = 'Invoice number is required';
    if (!clientId) newErrors.clientId = 'Please select a client';
    if (!invoiceDate) newErrors.invoiceDate = 'Issue date is required';
    if (!dueDate) newErrors.dueDate = 'Due date is required';

    if (invoiceDate && dueDate && dueDate < invoiceDate) {
      newErrors.dueDate = 'Due date cannot be before the issue date';
    }

    const taxNum = Number(taxRate);
    if (taxNum < 0 || taxNum > 100) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100';
    }

    const hasEmptyDescription = items.some(item => !item.description.trim());
    const hasInvalidNumbers = items.some(item => item.quantity <= 0 || item.rate < 0);

    if (hasEmptyDescription) {
      newErrors.items = 'All items must have a description';
    } else if (hasInvalidNumbers) {
      newErrors.items = 'Quantities must be greater than 0, rates cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const invoiceData = {
      id: invoiceId,
      clientId,
      invoiceDate,
      dueDate,
      taxRate: Number(taxRate) || 0,
      status,
      notes,
      items
    };

    if (isEditMode) {
      updateInvoice(id, invoiceData);
      navigate(`/invoices/${id}`);
    } else {
      const exists = invoices.some(inv => inv.id === invoiceId);
      if (exists) {
        setErrors(prev => ({ ...prev, invoiceId: 'Invoice ID already exists. Please choose a unique ID.' }));
        return;
      }
      addInvoice(invoiceData);
      navigate(`/invoices/${invoiceId}`);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Top Header Row */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/"
          className="p-2 border border-slate-200 bg-white rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Invoice' : 'New Invoice'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isEditMode ? `Modify details for ${invoiceId}` : 'Generate a brand new client invoice.'}
          </p>
        </div>
      </div>

      {/* Main Grid Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Form Details & Items */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Metadata Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-left">
            <h3 className="font-bold text-slate-950 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400" />
              General Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Invoice Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  disabled={isEditMode}
                  placeholder="e.g. INV-1004"
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 ${
                    errors.invoiceId ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {errors.invoiceId && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.invoiceId}</p>}
              </div>

              {/* Client Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Client *
                </label>
                {clients.length === 0 ? (
                  <div className="text-sm py-2 text-rose-600 font-semibold bg-rose-50 border border-rose-100 rounded-lg px-3 flex items-center justify-between">
                    <span>No clients registered.</span>
                    <Link to="/clients" className="underline text-rose-700 hover:text-rose-800">
                      Add Client First
                    </Link>
                  </div>
                ) : (
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className={`w-full px-3 py-2 border bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                      errors.clientId ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                    }`}
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                )}
                {errors.clientId && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.clientId}</p>}
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    errors.invoiceDate ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {errors.invoiceDate && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.invoiceDate}</p>}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    errors.dueDate ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
                {errors.dueDate && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.dueDate}</p>}
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-950 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                Line Items
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            {errors.items && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-lg p-3 text-xs font-semibold mb-4">
                {errors.items}
              </div>
            )}

            {/* Line Items Grid Container */}
            <div className="space-y-3">
              {/* Header labels on desktop */}
              <div className="hidden md:grid md:grid-cols-12 gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-3">Unit Price ($)</div>
                <div className="col-span-1 text-right">Total</div>
              </div>

              {/* Rows */}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-slate-150 rounded-xl p-3 md:border-0 md:p-0"
                >
                  {/* Description */}
                  <div className="col-span-12 md:col-span-6">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 md:hidden">
                      Description *
                    </span>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="e.g. Consultation / Product installation"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-span-6 md:col-span-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 md:hidden">
                      Qty *
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                    />
                  </div>

                  {/* Rate */}
                  <div className="col-span-6 md:col-span-3 flex items-center gap-2">
                    <div className="flex-1">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 md:hidden">
                        Rate *
                      </span>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate === 0 ? '' : item.rate}
                          onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-2 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-5 md:mt-0"
                        title="Delete Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Row Total */}
                  <div className="hidden md:block col-span-1 text-right font-bold text-slate-800 pr-2">
                    ${(item.quantity * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-left">
            <h3 className="font-bold text-slate-950 border-b border-slate-100 pb-3 mb-4">
              Invoice Notes & Terms
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="e.g. Please send payment within 30 days. Bank details: Acct #..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Right Column: Invoice Summary Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-left lg:sticky lg:top-6">
            <h3 className="font-bold text-slate-950 border-b border-slate-100 pb-3 mb-4">
              Invoice Summary
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-800">
                  ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Tax Rate Percentage */}
              <div className="flex items-center justify-between text-sm gap-4">
                <span className="text-slate-500 flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5 text-slate-400" />
                  Tax Rate (%)
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate === 0 ? '' : taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  placeholder="0"
                  className={`w-20 px-2 py-1 border rounded-lg text-sm text-right text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 ${
                    errors.taxRate ? 'border-rose-300' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.taxRate && (
                <p className="text-xs text-rose-500 font-semibold text-right">{errors.taxRate}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Tax Amount</span>
                <span className="font-semibold text-slate-800">
                  ${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="h-px bg-slate-100 my-2"></div>

              <div className="flex items-center justify-between">
                <span className="text-slate-800 font-bold text-sm">Total Due</span>
                <span className="text-2xl font-black text-slate-950">
                  ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Status Picker */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Invoice Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold py-2.5 rounded-lg shadow-sm transition-all text-sm cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {isEditMode ? 'Save Changes' : 'Save Invoice'}
              </button>

              <Link
                to="/"
                className="w-full inline-flex items-center justify-center border border-slate-350 text-slate-700 hover:bg-slate-50 font-semibold py-2.5 rounded-lg text-sm transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

export default InvoiceBuilder;
