import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Plus, FileText, CheckCircle2, AlertTriangle,
  Clock, DollarSign, Edit, Trash2, Eye, RefreshCw, ChevronDown, Check, Upload
} from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';
import { getStatusStyles } from '../utils/statusStyles';

function Dashboard() {
  const navigate = useNavigate();
  const {
    invoices,
    clients,
    deleteInvoice,
    updateInvoiceStatus,
    getInvoiceTotal
  } = useInvoices();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Financial calculations — only recompute when invoices change
  const { totalBilled, totalPaid, totalOutstanding, totalOverdue } = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;

    invoices.forEach(inv => {
      const total = getInvoiceTotal(inv);
      totalBilled += total;

      if (inv.status === 'Paid') {
        totalPaid += total;
      } else if (inv.status === 'Sent') {
        totalOutstanding += total;
      } else if (inv.status === 'Overdue') {
        totalOverdue += total;
      }
    });

    return { totalBilled, totalPaid, totalOutstanding, totalOverdue };
  }, [invoices, getInvoiceTotal]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => invoices.filter(inv => {
    const client = clients.find(c => c.id === inv.clientId);
    const clientName = client ? client.name.toLowerCase() : 'unknown client';
    const invoiceId = inv.id.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = invoiceId.includes(query) || clientName.includes(query);
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  }), [invoices, clients, searchQuery, statusFilter]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor receivables, track payment statuses, and generate client invoices.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            to="/app/invoices/import"
            className="inline-flex items-center justify-center gap-2 bg-white border border-slate-350 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-lg shadow-xs transition-colors duration-150 text-sm cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            Import Invoices
          </Link>
          <Link
            to="/app/invoices/new"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-150 text-sm cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            ${totalBilled.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">All historical billing</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Collected Paid
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 mt-1 font-semibold">
            {totalBilled > 0 ? `${Math.round((totalPaid / totalBilled) * 100)}%` : '0%'} collection rate
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Outstanding
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Sent & pending response</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Overdue Balances
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            ${totalOverdue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-rose-600 mt-1 font-semibold">Requires immediate attention</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID or client name..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 placeholder-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'Paid', 'Sent', 'Draft', 'Overdue'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto">
            <div className="bg-slate-50 text-slate-400 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-base mb-1">No Invoices Found</h3>
            <p className="text-slate-500 text-xs">
              No results found matching search filters. Create a new invoice to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Issued / Due</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInvoices.map((inv, index) => {
                  const client = clients.find(c => c.id === inv.clientId);
                  const clientName = client ? client.name : 'Unknown Client';
                  const total = getInvoiceTotal(inv);
                  const isConfirmingDelete = deleteConfirmId === inv.id;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                        {inv.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{clientName}</div>
                        {client && <div className="text-[10px] text-slate-500 mt-0.5">{client.email}</div>}
                      </td>

                      {/* Dates — parse as local time to avoid UTC off-by-one */}
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs">
                        <div>
                          <span className="font-medium">Issued:</span>{' '}
                          {new Date(inv.invoiceDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="mt-0.5 text-slate-500">
                          <span className="font-medium">Due:</span>{' '}
                          {new Date(inv.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap text-base">
                        ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === inv.id ? null : inv.id);
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border hover:opacity-85 select-none transition-all cursor-pointer ${getStatusStyles(inv.status)}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                            {inv.status}
                            <ChevronDown className="h-3 w-3 text-slate-500 shrink-0" />
                          </button>

                          {openDropdownId === inv.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(null);
                                }}
                              />
                              <div className={`absolute left-0 w-32 rounded-lg bg-white border border-slate-200 shadow-lg z-25 py-1.5 animate-in fade-in duration-150 ${
                                (filteredInvoices.length > 1 ? index >= filteredInvoices.length - 2 : true)
                                  ? 'bottom-full mb-1.5 slide-in-from-bottom-1'
                                  : 'top-full mt-1.5 slide-in-from-top-1'
                              }`}>
                                {['Draft', 'Sent', 'Paid', 'Overdue'].map((status) => (
                                  <button
                                    key={status}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateInvoiceStatus(inv.id, status);
                                      setOpenDropdownId(null);
                                    }}
                                    className={`w-full text-left px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50 flex items-center justify-between cursor-pointer ${
                                      inv.status === status ? 'text-slate-900 bg-slate-50/50' : 'text-slate-600'
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className={`h-1.5 w-1.5 rounded-full ${
                                        status === 'Paid' ? 'bg-emerald-500' :
                                        status === 'Sent' ? 'bg-blue-500' :
                                        status === 'Overdue' ? 'bg-rose-500' : 'bg-slate-400'
                                      }`} />
                                      {status}
                                    </span>
                                    {inv.status === status && (
                                      <Check className="h-3 w-3 text-emerald-500" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {!isConfirmingDelete ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/app/invoices/${inv.id}`)}
                              className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/app/invoices/${inv.id}/edit`)}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Invoice"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(inv.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Invoice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 text-xs">
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100">Delete?</span>
                            <button
                              onClick={() => {
                                deleteInvoice(inv.id);
                                setDeleteConfirmId(null);
                              }}
                              className="bg-rose-600 text-white font-semibold px-2 py-1 rounded hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="bg-white border border-slate-200 text-slate-700 font-semibold px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
