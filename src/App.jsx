import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import InvoiceBuilder from './pages/InvoiceBuilder';
import Settings from './pages/Settings';
import ImportInvoices from './pages/ImportInvoices';
import InvoiceDetail from './pages/InvoiceDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="invoices/new" element={<InvoiceBuilder />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="invoices/:id/edit" element={<InvoiceBuilder />} />
          <Route path="invoices/import" element={<ImportInvoices />} />
          <Route path="clients" element={<Clients />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
