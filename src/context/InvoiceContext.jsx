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

  const [allNotifications, setAllNotifications] = useState(() => {
    const saved = localStorage.getItem('invoicer_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    const saved = localStorage.getItem('invoicer_dismissed_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('invoicer_notifications', JSON.stringify(allNotifications));
  }, [allNotifications]);

  useEffect(() => {
    localStorage.setItem('invoicer_dismissed_notifications', JSON.stringify(dismissedNotifications));
  }, [dismissedNotifications]);

  // Derived filtered state for the active business
  const clients = allClients.filter(c => c.businessId === activeBusinessId);
  const invoices = allInvoices.filter(inv => inv.businessId === activeBusinessId);
  const businessInfo = businesses.find(b => b.id === activeBusinessId) || businesses[0];
  const notifications = allNotifications.filter(n => !n.businessId || n.businessId === activeBusinessId);

  // Automatic notification triggers (Overdue and Due Soon)
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newNotifs = [];
    const dismissedToClean = [];

    const activeOverdueIds = new Set();
    const activeDueSoonIds = new Set();

    invoices.forEach(inv => {
      const overdueId = `overdue-${inv.id}`;
      const dueSoonId = `due-soon-${inv.id}`;

      // Check if invoice is overdue
      const isOverdue = inv.status === 'Overdue' || (inv.status === 'Sent' && inv.dueDate < todayStr);
      // Check if invoice is due soon (Sent and due within next 3 days, but not overdue)
      let isDueSoon = false;
      if (inv.status === 'Sent' && !isOverdue) {
        const diffTime = new Date(inv.dueDate) - new Date(todayStr);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 3) {
          isDueSoon = true;
        }
      }

      if (isOverdue) {
        activeOverdueIds.add(overdueId);
        const exists = allNotifications.some(n => n.id === overdueId);
        const isDismissed = dismissedNotifications.includes(overdueId);
        if (!exists && !isDismissed) {
          newNotifs.push({
            id: overdueId,
            title: 'Invoice Overdue',
            message: `Invoice ${inv.id} is overdue. Please check payment status.`,
            type: 'error',
            read: false,
            timestamp: new Date().toISOString(),
            actionLink: `/invoices/${inv.id}/edit`,
            businessId: activeBusinessId
          });
        }
      } else if (isDueSoon) {
        activeDueSoonIds.add(dueSoonId);
        const exists = allNotifications.some(n => n.id === dueSoonId);
        const isDismissed = dismissedNotifications.includes(dueSoonId);
        if (!exists && !isDismissed) {
          newNotifs.push({
            id: dueSoonId,
            title: 'Invoice Due Soon',
            message: `Invoice ${inv.id} is due in the next few days.`,
            type: 'warning',
            read: false,
            timestamp: new Date().toISOString(),
            actionLink: `/invoices/${inv.id}/edit`,
            businessId: activeBusinessId
          });
        }
      }
    });

    // Cleanup: check notifications belonging to this business that are no longer overdue/due-soon
    const cleanNotifications = allNotifications.filter(n => {
      if (n.businessId === activeBusinessId) {
        if (n.id.startsWith('overdue-') && !activeOverdueIds.has(n.id)) {
          dismissedToClean.push(n.id);
          return false;
        }
        if (n.id.startsWith('due-soon-') && !activeDueSoonIds.has(n.id)) {
          dismissedToClean.push(n.id);
          return false;
        }
      }
      return true;
    });

    // Check if dismissedNotifications needs cleanup
    let dismissedChanged = false;
    const cleanDismissed = dismissedNotifications.filter(id => {
      const invId = id.replace('overdue-', '').replace('due-soon-', '');
      const invoiceExists = invoices.some(inv => inv.id === invId);
      
      if (invoiceExists) {
        if (id.startsWith('overdue-') && !activeOverdueIds.has(id)) {
          dismissedChanged = true;
          return false;
        }
        if (id.startsWith('due-soon-') && !activeDueSoonIds.has(id)) {
          dismissedChanged = true;
          return false;
        }
      }
      return true;
    });

    const notifsChanged = cleanNotifications.length !== allNotifications.length || newNotifs.length > 0;

    if (notifsChanged) {
      setAllNotifications(prev => {
        const cleaned = prev.filter(n => {
          if (n.businessId === activeBusinessId) {
            if (n.id.startsWith('overdue-') && !activeOverdueIds.has(n.id)) return false;
            if (n.id.startsWith('due-soon-') && !activeDueSoonIds.has(n.id)) return false;
          }
          return true;
        });
        return [...newNotifs, ...cleaned];
      });
    }

    if (dismissedChanged || dismissedToClean.length > 0) {
      setDismissedNotifications(prev => {
        return prev.filter(id => {
          if (dismissedToClean.includes(id)) return false;
          return cleanDismissed.includes(id);
        });
      });
    }
  }, [invoices, activeBusinessId]);

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
  // Notification actions
  const addNotification = ({ title, message, type = 'info', actionLink = null, businessId = activeBusinessId }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
      actionLink,
      businessId
    };
    setAllNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  };

  const markAsRead = (id) => {
    setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setAllNotifications(prev => prev.map(n => !n.businessId || n.businessId === activeBusinessId ? { ...n, read: true } : n));
  };

  const clearNotification = (id) => {
    if (id.startsWith('overdue-') || id.startsWith('due-soon-')) {
      setDismissedNotifications(prev => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });
    }
    setAllNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    const activeNotifs = allNotifications.filter(n => !n.businessId || n.businessId === activeBusinessId);
    const autoIds = activeNotifs
      .filter(n => n.id.startsWith('overdue-') || n.id.startsWith('due-soon-'))
      .map(n => n.id);
      
    if (autoIds.length > 0) {
      setDismissedNotifications(prev => {
        const unique = new Set([...prev, ...autoIds]);
        return Array.from(unique);
      });
    }
    setAllNotifications(prev => prev.filter(n => n.businessId && n.businessId !== activeBusinessId));
  };

  const addInvoice = (invoice) => {
    const newInvoice = { 
      ...invoice, 
      id: invoice.id || `INV-${Date.now().toString().slice(-4)}`,
      businessId: activeBusinessId
    };
    setAllInvoices(prev => [...prev, newInvoice]);
    addNotification({
      title: 'Invoice Created',
      message: `Invoice ${newInvoice.id} was successfully created.`,
      type: 'info',
      actionLink: `/invoices/${newInvoice.id}/edit`
    });
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
    if (status === 'Paid') {
      addNotification({
        title: 'Invoice Paid',
        message: `Invoice ${id} has been marked as Paid.`,
        type: 'success',
        actionLink: `/invoices/${id}/edit`
      });
    }
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

  // Import Data method supporting merge (overwrite duplicates) or new (generate fresh IDs)
  const importData = ({ businesses: importedBiz, clients: importedClients, invoices: importedInvoices }, mode = 'merge') => {
    let targetBizId = activeBusinessId;
    let bCount = importedBiz?.length || 0;
    let cCount = importedClients?.length || 0;
    let iCount = importedInvoices?.length || 0;

    if (mode === 'new') {
      const bizIdMap = {};
      const clientIdMap = {};
      
      const newBusinesses = (importedBiz || []).map(biz => {
        const oldId = biz.id;
        const newId = `biz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        bizIdMap[oldId] = newId;
        return { ...biz, id: newId };
      });
      
      const newClients = (importedClients || []).map(c => {
        const oldId = c.id;
        const newId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        clientIdMap[oldId] = newId;
        const newBizId = bizIdMap[c.businessId] || c.businessId;
        return { ...c, id: newId, businessId: newBizId };
      });
      
      const newInvoices = (importedInvoices || []).map(inv => {
        const newId = `INV-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substr(2, 5)}`;
        const newBizId = bizIdMap[inv.businessId] || inv.businessId;
        const newClientId = clientIdMap[inv.clientId] || inv.clientId;
        return { ...inv, id: newId, businessId: newBizId, clientId: newClientId };
      });
      
      setBusinesses(prev => [...prev, ...newBusinesses]);
      setAllClients(prev => [...prev, ...newClients]);
      setAllInvoices(prev => [...prev, ...newInvoices]);
      
      if (newBusinesses.length > 0) {
        setActiveBusinessId(newBusinesses[0].id);
        targetBizId = newBusinesses[0].id;
      }
    } else {
      // Merge mode: overwrite existing matches by ID, insert new ones
      setBusinesses(prev => {
        const map = new Map(prev.map(b => [b.id, b]));
        (importedBiz || []).forEach(b => map.set(b.id, b));
        return Array.from(map.values());
      });
      
      setAllClients(prev => {
        const map = new Map(prev.map(c => [c.id, c]));
        (importedClients || []).forEach(c => map.set(c.id, c));
        return Array.from(map.values());
      });
      
      setAllInvoices(prev => {
        const map = new Map(prev.map(inv => [inv.id, inv]));
        (importedInvoices || []).forEach(inv => map.set(inv.id, inv));
        return Array.from(map.values());
      });
    }

    // Add import success notification
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Data Imported Successfully',
      message: `Imported ${bCount} business(es), ${cCount} client(s), and ${iCount} invoice(s) using ${mode === 'merge' ? 'Merge & Overwrite' : 'Import as New Profiles'}.`,
      type: 'success',
      read: false,
      timestamp: new Date().toISOString(),
      actionLink: null,
      businessId: targetBizId
    };
    setAllNotifications(prev => [newNotif, ...prev]);
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
      allClients,
      allInvoices,
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
      getInvoiceTotal,
      importData,
      notifications,
      allNotifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotification,
      clearAllNotifications
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
