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
  // Initialize businesses list, migrating from older single business key if found
  const [businesses, setBusinesses] = useState(() => {
    const saved = localStorage.getItem('invoicer_businesses');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse businesses", e);
      }
    }
    // Attempt migration from old invoicer_business key
    const oldBiz = localStorage.getItem('invoicer_business');
    if (oldBiz) {
      try {
        const parsed = JSON.parse(oldBiz);
        return [{ ...parsed, id: 'b1' }];
      } catch (e) {
        console.error("Failed to parse old business", e);
      }
    }
    return [{ ...initialBusinessInfo, id: 'b1' }];
  });

  // Initialize active business ID
  const [activeBusinessId, setActiveBusinessId] = useState(() => {
    const saved = localStorage.getItem('invoicer_active_business_id');
    return saved || 'b1';
  });

  // Initialize all clients, ensuring they are linked to a businessId
  const [allClients, setAllClients] = useState(() => {
    const saved = localStorage.getItem('invoicer_clients');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(c => c.businessId ? c : { ...c, businessId: 'b1' });
      } catch (e) {
        console.error("Failed to parse clients", e);
      }
    }
    return initialClients.map(c => ({ ...c, businessId: 'b1' }));
  });

  // Initialize all invoices, ensuring they are linked to a businessId
  const [allInvoices, setAllInvoices] = useState(() => {
    const saved = localStorage.getItem('invoicer_invoices');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(inv => inv.businessId ? inv : { ...inv, businessId: 'b1' });
      } catch (e) {
        console.error("Failed to parse invoices", e);
      }
    }
    return initialInvoices.map(inv => ({ ...inv, businessId: 'b1' }));
  });

  useEffect(() => {
    localStorage.setItem('invoicer_businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem('invoicer_active_business_id', activeBusinessId);
  }, [activeBusinessId]);

  useEffect(() => {
    localStorage.setItem('invoicer_clients', JSON.stringify(allClients));
  }, [allClients]);

  useEffect(() => {
    localStorage.setItem('invoicer_invoices', JSON.stringify(allInvoices));
  }, [allInvoices]);

  // Derived filtered state for the active business
  const clients = allClients.filter(c => c.businessId === activeBusinessId);
  const invoices = allInvoices.filter(inv => inv.businessId === activeBusinessId);
  const businessInfo = businesses.find(b => b.id === activeBusinessId) || businesses[0];

  // Client actions
  const addClient = (client) => {
    const newClient = { 
      ...client, 
      id: `client-${Date.now()}`,
      businessId: activeBusinessId 
    };
    setAllClients(prev => [...prev, newClient]);
    return newClient;
  };

  const updateClient = (id, updatedClient) => {
    setAllClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } : c));
  };

  const deleteClient = (id) => {
    setAllClients(prev => prev.filter(c => c.id !== id));
  };

  // Invoice actions
  const addInvoice = (invoice) => {
    const newInvoice = { 
      ...invoice, 
      id: invoice.id || `INV-${Date.now().toString().slice(-4)}`,
      businessId: activeBusinessId
    };
    setAllInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = (id, updatedInvoice) => {
    setAllInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updatedInvoice } : inv));
  };

  const deleteInvoice = (id) => {
    setAllInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const updateInvoiceStatus = (id, status) => {
    setAllInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  // Business settings & management actions
  const updateBusinessInfo = (info) => {
    setBusinesses(prev => prev.map(b => b.id === activeBusinessId ? { ...b, ...info } : b));
  };

  const addBusiness = (business) => {
    const newBusiness = {
      name: business.name,
      email: business.email || '',
      phone: business.phone || '',
      address: business.address || '',
      website: business.website || '',
      id: `biz-${Date.now()}`
    };
    setBusinesses(prev => [...prev, newBusiness]);
    setActiveBusinessId(newBusiness.id);
    return newBusiness;
  };

  const deleteBusiness = (id) => {
    if (businesses.length <= 1) return;

    // Remove associated invoices and clients
    setAllInvoices(prev => prev.filter(inv => inv.businessId !== id));
    setAllClients(prev => prev.filter(c => c.businessId !== id));

    // Remove the business entity
    setBusinesses(prev => prev.filter(b => b.id !== id));

    // Shift active business context if the current active business is deleted
    if (activeBusinessId === id) {
      const remaining = businesses.filter(b => b.id !== id);
      setActiveBusinessId(remaining[0].id);
    }
  };

  const selectBusiness = (id) => {
    setActiveBusinessId(id);
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
      businesses,
      activeBusinessId,
      addClient,
      updateClient,
      deleteClient,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      updateInvoiceStatus,
      updateBusinessInfo,
      addBusiness,
      deleteBusiness,
      selectBusiness,
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
