import React, { createContext, useContext, useState, useEffect } from 'react';

const InvoiceContext = createContext();

// Mock Initial State
const initialClients = [
  {
    id: 'c1',
    name: 'Sarah Jenkins Design',
    email: 'sarah@jenkinsdesign.com',
    phone: '555-0199',
    address: '123 Maple St, Portland, OR 97201',
  },
  {
    id: 'c2',
    name: 'Oak & Iron Builders',
    email: 'billing@oakandiron.com',
    phone: '555-0244',
    address: '456 Industrial Pkwy, Suite B, Seattle, WA 98101',
  }
];

const initialInvoices = [
  {
    id: 'INV-1001',
    clientId: 'c1',
    invoiceDate: '2026-06-01',
    dueDate: '2026-07-01',
    items: [
      { id: 'item-1', description: 'Custom Walnut Dining Table', quantity: 1, rate: 2400 },
      { id: 'item-2', description: 'Delivery & Installation', quantity: 1, rate: 250 }
    ],
    taxRate: 8,
    status: 'Paid', // Paid, Sent, Draft, Overdue
    notes: 'Thank you for your custom order! Enjoy your table.',
  },
  {
    id: 'INV-1002',
    clientId: 'c2',
    invoiceDate: '2026-06-05',
    dueDate: '2026-06-20',
    items: [
      { id: 'item-3', description: 'Live Edge Floating Shelves (Oak)', quantity: 4, rate: 150 },
      { id: 'item-4', description: 'Heavy Duty Brackets & Mounting Hardware', quantity: 8, rate: 15 }
    ],
    taxRate: 8,
    status: 'Sent',
    notes: 'Net 15 payment terms. Please include INV-1002 in payment details.',
  },
  {
    id: 'INV-1003',
    clientId: 'c1',
    invoiceDate: '2026-05-10',
    dueDate: '2026-05-24',
    items: [
      { id: 'item-5', description: 'Cedar Garden Planter Box', quantity: 2, rate: 300 }
    ],
    taxRate: 8,
    status: 'Overdue',
    notes: 'Reminder: This payment is now overdue. Please contact us if you need assistance.',
  }
];

const initialBusinessInfo = {
  name: 'TimberTraceCrafts',
  email: 'info@timbertracecrafts.com',
  phone: '555-0100',
  address: '789 Redwood Hwy, Grants Pass, OR 97526',
  website: 'www.timbertracecrafts.com'
};

export const InvoiceProvider = ({ children }) => {
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('invoicer_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('invoicer_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [businessInfo, setBusinessInfo] = useState(() => {
    const saved = localStorage.getItem('invoicer_business');
    return saved ? JSON.parse(saved) : initialBusinessInfo;
  });

  useEffect(() => {
    localStorage.setItem('invoicer_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('invoicer_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('invoicer_business', JSON.stringify(businessInfo));
  }, [businessInfo]);

  // Client actions
  const addClient = (client) => {
    const newClient = { ...client, id: `client-${Date.now()}` };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id, updatedClient) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } : c));
  };

  const deleteClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Invoice actions
  const addInvoice = (invoice) => {
    const newInvoice = { 
      ...invoice, 
      id: invoice.id || `INV-${Date.now().toString().slice(-4)}` 
    };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = (id, updatedInvoice) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updatedInvoice } : inv));
  };

  const deleteInvoice = (id) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const updateInvoiceStatus = (id, status) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  // Business settings
  const updateBusinessInfo = (info) => {
    setBusinessInfo(prev => ({ ...prev, ...info }));
  };

  // Dynamic calculations
  const getInvoiceSubtotal = (invoice) => {
    if (!invoice || !invoice.items) return 0;
    return invoice.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.rate) || 0)), 0);
  };

  const getInvoiceTax = (invoice) => {
    if (!invoice) return 0;
    const subtotal = getInvoiceSubtotal(invoice);
    return subtotal * ((Number(invoice.taxRate) || 0) / 100);
  };

  const getInvoiceTotal = (invoice) => {
    if (!invoice) return 0;
    return getInvoiceSubtotal(invoice) + getInvoiceTax(invoice);
  };

  return (
    <InvoiceContext.Provider value={{
      clients,
      invoices,
      businessInfo,
      addClient,
      updateClient,
      deleteClient,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      updateInvoiceStatus,
      updateBusinessInfo,
      getInvoiceSubtotal,
      getInvoiceTax,
      getInvoiceTotal
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};
