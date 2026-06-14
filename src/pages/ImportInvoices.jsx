import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Upload, FileText, CheckCircle2, AlertCircle,
  Settings, Columns, Table, Check, Play, RefreshCw, X, AlertTriangle, Plus, Clipboard, UserPlus, Info
} from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';
import { parseCSV, extractFieldsFromText, loadPdfText, normalizeDate } from '../utils/importParsers';

function ImportInvoices() {
  const navigate = useNavigate();
  const { 
    clients, 
    invoices, 
    addClient, 
    addInvoice, 
    updateInvoice,
    addNotification
  } = useInvoices();

  // Navigation / Tabs State
  const [activeTab, setActiveTab] = useState('pdf'); // 'pdf' or 'csv'

  // PDF Tab State
  const [pdfFile, setPdfFile] = useState(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [pdfText, setPdfText] = useState('');
  const [pdfFormRawInput, setPdfFormRawInput] = useState('');
  
  // PDF Parsed Invoice Form State
  const [pdfInvoiceData, setPdfInvoiceData] = useState(null);
  const [pdfClientMode, setPdfClientMode] = useState('create'); // 'create' or 'link'
  const [pdfSelectedClientId, setPdfSelectedClientId] = useState('');
  const [pdfNewClientName, setPdfNewClientName] = useState('');
  const [pdfNewClientEmail, setPdfNewClientEmail] = useState('');
  const [pdfFormErrors, setPdfFormErrors] = useState({});

  // CSV Tab State
  const [csvFile, setCsvFile] = useState(null);
  const [csvRawText, setCsvRawText] = useState('');
  const [csvRows, setCsvRows] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  
  // CSV Mappings State
  const [csvMapping, setCsvMapping] = useState({
    invoiceId: '',
    clientName: '',
    clientEmail: '',
    invoiceDate: '',
    dueDate: '',
    description: '',
    quantity: '',
    rate: '',
    taxRate: '',
    status: '',
    notes: ''
  });
  
  // CSV Preview & Execution State
  const [csvPreviewInvoices, setCsvPreviewInvoices] = useState([]);
  const [csvMappingErrors, setCsvMappingErrors] = useState([]);
  const [csvImportMode, setCsvImportMode] = useState('merge'); // 'merge' or 'new'
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  const [csvImportSuccess, setCsvImportSuccess] = useState(false);

  // Inline error state replacing native alert() calls
  const [csvFileError, setCsvFileError] = useState('');
  const [csvMappingAlert, setCsvMappingAlert] = useState('');

  // Ref to cancel the post-import navigation timeout on unmount
  const csvSuccessTimeoutRef = useRef(null);
  useEffect(() => {
    return () => {
      if (csvSuccessTimeoutRef.current) clearTimeout(csvSuccessTimeoutRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // PDF Import Event Handlers & Parsing
  // ---------------------------------------------------------------------------
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setPdfError('');
    setIsParsingPdf(true);
    setPdfInvoiceData(null);

    try {
      const text = await loadPdfText(file);
      setPdfText(text);
      processPdfText(text);
    } catch (err) {
      setPdfError(err.message || 'Error parsing PDF file.');
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleRawTextSubmit = () => {
    if (!pdfFormRawInput.trim()) return;
    setPdfText(pdfFormRawInput);
    processPdfText(pdfFormRawInput);
  };

  const processPdfText = (text) => {
    const fields = extractFieldsFromText(text);
    setPdfInvoiceData(fields);
    
    // Determine if email/name match an existing client
    const matchedClient = clients.find(c => 
      (fields.clientEmail && c.email.toLowerCase() === fields.clientEmail.toLowerCase()) ||
      (fields.clientName && c.name.toLowerCase() === fields.clientName.toLowerCase())
    );

    if (matchedClient) {
      setPdfClientMode('link');
      setPdfSelectedClientId(matchedClient.id);
      setPdfNewClientName('');
      setPdfNewClientEmail('');
    } else {
      setPdfClientMode('create');
      setPdfSelectedClientId('');
      setPdfNewClientName(fields.clientName || '');
      setPdfNewClientEmail(fields.clientEmail || '');
    }
    setPdfFormErrors({});
  };

  const handlePdfFormChange = (field, value) => {
    setPdfInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
    if (pdfFormErrors[field]) {
      setPdfFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePdfItemChange = (itemId, field, value) => {
    setPdfInvoiceData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          let updatedValue = value;
          if (field === 'quantity') updatedValue = parseInt(value, 10) || 0;
          if (field === 'rate') updatedValue = parseFloat(value) || 0;
          return { ...item, [field]: updatedValue };
        }
        return item;
      })
    }));
  };

  const handleAddPdfItem = () => {
    const newItem = {
      id: `item-new-${Date.now()}`,
      description: '',
      quantity: 1,
      rate: 0
    };
    setPdfInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleRemovePdfItem = (itemId) => {
    setPdfInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleSavePdfInvoice = (e) => {
    e.preventDefault();
    if (!pdfInvoiceData) return;

    // Validate form
    const errors = {};
    if (!pdfInvoiceData.invoiceId.trim()) errors.invoiceId = 'Invoice number is required';
    if (!pdfInvoiceData.invoiceDate) errors.invoiceDate = 'Invoice Date is required';
    if (!pdfInvoiceData.dueDate) errors.dueDate = 'Due Date is required';
    
    if (pdfClientMode === 'link' && !pdfSelectedClientId) {
      errors.clientId = 'Please select a client';
    }
    if (pdfClientMode === 'create' && !pdfNewClientName.trim()) {
      errors.clientName = 'Client name is required';
    }

    if (pdfInvoiceData.items.length === 0) {
      errors.items = 'At least one line item is required';
    } else {
      const hasEmptyDescription = pdfInvoiceData.items.some(item => !item.description.trim());
      const hasInvalidNumbers = pdfInvoiceData.items.some(item => item.quantity <= 0 || item.rate < 0);
      if (hasEmptyDescription) errors.items = 'All items must have a description';
      if (hasInvalidNumbers) errors.items = 'Quantities must be > 0 and rates cannot be negative';
    }

    if (Object.keys(errors).length > 0) {
      setPdfFormErrors(errors);
      return;
    }

    // Determine Client ID
    let finalClientId = pdfSelectedClientId;
    if (pdfClientMode === 'create') {
      const newClient = addClient({
        name: pdfNewClientName.trim(),
        email: pdfNewClientEmail.trim() || `${pdfNewClientName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}@example.com`,
        phone: '',
        address: ''
      });
      finalClientId = newClient.id;
    }

    // Build Invoice Object
    const finalInvoice = {
      id: pdfInvoiceData.invoiceId.trim().toUpperCase(),
      clientId: finalClientId,
      invoiceDate: pdfInvoiceData.invoiceDate,
      dueDate: pdfInvoiceData.dueDate,
      taxRate: Number(pdfInvoiceData.taxRate) || 0,
      status: pdfInvoiceData.status,
      notes: pdfInvoiceData.notes,
      items: pdfInvoiceData.items.map(item => ({
        id: item.id.startsWith('item-parsed') || item.id.startsWith('item-new') ? `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` : item.id,
        description: item.description.trim(),
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0
      }))
    };

    // Duplicate Check
    const exists = invoices.some(inv => inv.id === finalInvoice.id);
    if (exists) {
      updateInvoice(finalInvoice.id, finalInvoice);
      addNotification({
        title: 'Invoice Updated',
        message: `Invoice ${finalInvoice.id} was merged and updated via PDF import.`,
        type: 'success',
        actionLink: `/invoices/${finalInvoice.id}/edit`
      });
    } else {
      addInvoice(finalInvoice);
    }

    navigate('/');
  };

  const resetPdfState = () => {
    setPdfFile(null);
    setPdfText('');
    setPdfInvoiceData(null);
    setPdfError('');
    setPdfFormRawInput('');
  };

  // ---------------------------------------------------------------------------
  // CSV Import Event Handlers & Column Mapping & Grouping
  // ---------------------------------------------------------------------------
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);
    setCsvPreviewInvoices([]);
    setCsvMappingErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCsvRawText(text);
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        setCsvFileError('CSV file must contain a header row and at least one data row.');
        return;
      }

      setCsvFileError('');
      const headers = parsed[0].map(h => h.trim());
      setCsvHeaders(headers);
      setCsvRows(parsed.slice(1));

      // Attempt to auto-map columns by standard keyword matching
      const autoMap = {
        invoiceId: '',
        clientName: '',
        clientEmail: '',
        invoiceDate: '',
        dueDate: '',
        description: '',
        quantity: '',
        rate: '',
        taxRate: '',
        status: '',
        notes: ''
      };

      headers.forEach((header, idx) => {
        const h = header.toLowerCase();
        if ((h.includes('invoice') || h.includes('inv')) && (h.includes('id') || h.includes('number') || h.includes('no') || h.includes('#'))) {
          autoMap.invoiceId = String(idx);
        } else if (h.includes('client') && (h.includes('name') || h.includes('customer') || h.includes('company'))) {
          autoMap.clientName = String(idx);
        } else if ((h.includes('client') || h.includes('customer') || h.includes('to')) && h.includes('email')) {
          autoMap.clientEmail = String(idx);
        } else if (h === 'email' || h === 'e-mail') {
          if (!autoMap.clientEmail) autoMap.clientEmail = String(idx);
        } else if (h.includes('date') && (h.includes('invoice') || h.includes('issue') || h.includes('created') || h === 'date')) {
          autoMap.invoiceDate = String(idx);
        } else if (h.includes('due') && h.includes('date')) {
          autoMap.dueDate = String(idx);
        } else if (h.includes('description') || h.includes('item') || h.includes('desc') || h.includes('product') || h.includes('service')) {
          autoMap.description = String(idx);
        } else if (h.includes('quantity') || h.includes('qty') || h.includes('count')) {
          autoMap.quantity = String(idx);
        } else if (h.includes('rate') || h.includes('price') || h.includes('unit')) {
          autoMap.rate = String(idx);
        } else if (h.includes('tax') && (h.includes('rate') || h.includes('%') || h.includes('percent'))) {
          autoMap.taxRate = String(idx);
        } else if (h.includes('status') || h.includes('paid') || h.includes('state')) {
          autoMap.status = String(idx);
        } else if (h.includes('note') || h.includes('comment') || h.includes('term')) {
          autoMap.notes = String(idx);
        }
      });

      // Fallback matching if not found
      if (autoMap.invoiceId === '') {
        const firstNumIndex = headers.findIndex(h => h.toLowerCase().includes('id') || h.toLowerCase().includes('number'));
        if (firstNumIndex !== -1) autoMap.invoiceId = String(firstNumIndex);
      }

      setCsvMapping(autoMap);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleCsvMappingChange = (field, value) => {
    setCsvMapping(prev => ({ ...prev, [field]: value }));
  };

  // Run mapper and build preview list
  const handleMapAndPreview = () => {
    // 1. Validation of required column selections
    const required = ['invoiceId', 'clientName', 'clientEmail', 'invoiceDate'];
    const missing = required.filter(field => csvMapping[field] === '');

    if (missing.length > 0) {
      setCsvMappingAlert(`Please map all required fields: ${missing.map(f => f.replace('Id', ' ID').replace('Name', ' Name').replace('Email', ' Email').replace('Date', ' Date')).join(', ')}`);
      return;
    }
    setCsvMappingAlert('');

    const mapErrors = [];
    const invoiceGroups = {};

    csvRows.forEach((row, rowIdx) => {
      // Row visual line number is rowIdx + 2 (1-based, plus header row)
      const lineNum = rowIdx + 2;

      const invId = row[Number(csvMapping.invoiceId)]?.trim();
      const clientName = row[Number(csvMapping.clientName)]?.trim();
      const clientEmail = row[Number(csvMapping.clientEmail)]?.trim();
      const dateRaw = row[Number(csvMapping.invoiceDate)]?.trim();

      if (!invId) {
        mapErrors.push(`Row ${lineNum}: Missing Invoice ID.`);
        return;
      }
      if (!clientName) {
        mapErrors.push(`Row ${lineNum} (Invoice: ${invId}): Missing Client Name.`);
        return;
      }
      if (!clientEmail) {
        mapErrors.push(`Row ${lineNum} (Invoice: ${invId}): Missing Client Email.`);
        return;
      }

      const invoiceDate = normalizeDate(dateRaw);
      if (!invoiceDate) {
        mapErrors.push(`Row ${lineNum} (Invoice: ${invId}): Invalid or missing Invoice Date ("${dateRaw}").`);
        return;
      }

      // Optional fields parsing
      const dueDateRaw = csvMapping.dueDate !== '' ? row[Number(csvMapping.dueDate)]?.trim() : '';
      const dueDate = normalizeDate(dueDateRaw) || normalizeDate(new Date(new Date(invoiceDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString());

      const itemDesc = csvMapping.description !== '' ? row[Number(csvMapping.description)]?.trim() : 'Services Rendered';
      const itemQty = csvMapping.quantity !== '' ? parseInt(row[Number(csvMapping.quantity)], 10) || 1 : 1;
      const itemRate = csvMapping.rate !== '' ? parseFloat(row[Number(csvMapping.rate)]?.replace(/[^0-9.-]/g, '')) || 0 : 0;
      
      const taxRateRaw = csvMapping.taxRate !== '' ? row[Number(csvMapping.taxRate)]?.trim() : '0';
      const taxRate = parseFloat(taxRateRaw?.replace(/[^0-9.-]/g, '')) || 0;

      const rawStatus = csvMapping.status !== '' ? row[Number(csvMapping.status)]?.trim() : 'Sent';
      // Normalize status to match standard Draft, Sent, Paid, Overdue
      let status = 'Sent';
      if (/paid|collected|completed/i.test(rawStatus)) status = 'Paid';
      else if (/draft|unsent/i.test(rawStatus)) status = 'Draft';
      else if (/overdue|late|delinquent/i.test(rawStatus)) status = 'Overdue';

      const notes = csvMapping.notes !== '' ? row[Number(csvMapping.notes)]?.trim() : '';

      // Initialize invoice group
      if (!invoiceGroups[invId]) {
        invoiceGroups[invId] = {
          id: invId.toUpperCase(),
          clientName,
          clientEmail,
          invoiceDate,
          dueDate,
          taxRate,
          status,
          notes,
          items: []
        };
      }

      // Add line item
      invoiceGroups[invId].items.push({
        id: `csv-item-${rowIdx}`,
        description: itemDesc,
        quantity: itemQty,
        rate: itemRate
      });
    });

    setCsvMappingErrors(mapErrors);
    setCsvPreviewInvoices(Object.values(invoiceGroups));
  };

  const handleExecuteCsvImport = async () => {
    if (csvPreviewInvoices.length === 0) return;
    setIsImportingCsv(true);

    try {
      let clientsCreatedCount = 0;
      let invoicesCreatedCount = 0;
      let invoicesMergedCount = 0;

      csvPreviewInvoices.forEach(previewInv => {
        // 1. Resolve client
        let client = clients.find(c => 
          c.email.toLowerCase() === previewInv.clientEmail.toLowerCase() ||
          c.name.toLowerCase() === previewInv.clientName.toLowerCase()
        );

        if (!client) {
          client = addClient({
            name: previewInv.clientName,
            email: previewInv.clientEmail,
            phone: '',
            address: ''
          });
          clientsCreatedCount++;
        }

        // 2. Build final invoice schema
        let finalId = previewInv.id;
        const exists = invoices.some(inv => inv.id === finalId);

        if (exists && csvImportMode === 'new') {
          // Generate a new ID
          const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
          finalId = `${previewInv.id}-${suffix}`;
        }

        const invoiceData = {
          id: finalId,
          clientId: client.id,
          invoiceDate: previewInv.invoiceDate,
          dueDate: previewInv.dueDate,
          taxRate: previewInv.taxRate,
          status: previewInv.status,
          notes: previewInv.notes,
          items: previewInv.items.map(item => ({
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate
          }))
        };

        if (exists && csvImportMode === 'merge') {
          updateInvoice(previewInv.id, invoiceData);
          invoicesMergedCount++;
        } else {
          addInvoice(invoiceData);
          invoicesCreatedCount++;
        }
      });

      // Add success notification
      addNotification({
        title: 'Batch Import Success',
        message: `Imported ${invoicesCreatedCount} new invoice(s), merged ${invoicesMergedCount} duplicate(s). Registered ${clientsCreatedCount} new client(s).`,
        type: 'success'
      });

      setCsvImportSuccess(true);
      if (csvSuccessTimeoutRef.current) clearTimeout(csvSuccessTimeoutRef.current);
      csvSuccessTimeoutRef.current = setTimeout(() => {
        setCsvImportSuccess(false);
        navigate('/');
      }, 3000);
    } catch (err) {
      alert(`Error during execution: ${err.message}`);
    } finally {
      setIsImportingCsv(false);
    }
  };

  const handleCancelCsv = () => {
    setCsvFile(null);
    setCsvRawText('');
    setCsvRows([]);
    setCsvHeaders([]);
    setCsvPreviewInvoices([]);
    setCsvMappingErrors([]);
    setCsvFileError('');
    setCsvMappingAlert('');
  };

  // Helper calculating total for preview
  const getPreviewTotal = (inv) => {
    const subtotal = inv.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    return subtotal + (subtotal * (inv.taxRate / 100));
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/"
          className="p-2 border border-slate-200 bg-white rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-left">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Import Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">
            Migrate invoicing history by uploading text-based PDF documents or CSV file templates.
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => { setActiveTab('pdf'); resetPdfState(); }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'pdf'
              ? 'border-emerald-500 text-slate-900 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="h-4 w-4" />
          PDF / Text Parser
        </button>
        <button
          onClick={() => { setActiveTab('csv'); handleCancelCsv(); }}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'csv'
              ? 'border-emerald-500 text-slate-900 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Table className="h-4 w-4" />
          CSV Batch Importer
        </button>
      </div>

      {/* -----------------------------------------------------------------------
          TAB 1: PDF SINGLE INVOICE IMPORT
          ----------------------------------------------------------------------- */}
      {activeTab === 'pdf' && (
        <div className="space-y-6">
          {!pdfInvoiceData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* PDF File Dropzone */}
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center flex flex-col justify-center items-center min-h-[300px]">
                <div className="mx-auto h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-400 mb-4">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">Upload Invoice PDF</h3>
                <p className="text-slate-400 text-xs max-w-xs mx-auto mb-6">
                  Select a vector PDF invoice. We will load PDF.js client-side and attempt to extract dates, clients, totals, and line items.
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={isParsingPdf}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled={isParsingPdf}
                    className="bg-slate-900 text-white hover:bg-slate-850 font-bold text-xs tracking-wider uppercase px-6 py-3 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isParsingPdf ? 'Parsing Document...' : 'Select PDF File'}
                  </button>
                </div>
                {pdfError && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2 max-w-sm">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>{pdfError}</span>
                  </div>
                )}
              </div>

              {/* Paste Raw Text Area Fallback */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs text-left flex flex-col">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-sm border-b border-slate-100 pb-3 mb-4">
                  <Clipboard className="h-4 w-4 text-slate-400" />
                  Paste Raw Invoice Text
                </div>
                <p className="text-slate-500 text-xs mb-3">
                  If the PDF file is scanned (image-only) or you have the invoice copied in an email, paste the raw text here to parse.
                </p>
                <textarea
                  value={pdfFormRawInput}
                  onChange={(e) => setPdfFormRawInput(e.target.value)}
                  rows="8"
                  placeholder="Paste invoice text here... E.g.
Invoice INV-1005
Date: 2026-06-08
Bill To: Sarah Jenkins Design
Email: sarah@jenkinsdesign.com
Web Design Services 1 $1200
Subtotal $1200
Total Due $1200"
                  className="w-full flex-1 p-3 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 resize-none mb-4"
                />
                <button
                  type="button"
                  onClick={handleRawTextSubmit}
                  disabled={!pdfFormRawInput.trim()}
                  className="bg-emerald-500 text-slate-950 hover:bg-emerald-600 active:bg-emerald-700 font-bold text-xs tracking-wider uppercase px-4 py-2.5 rounded-lg shadow-sm cursor-pointer self-end disabled:opacity-50"
                >
                  Analyze Text
                </button>
              </div>

            </div>
          ) : (
            
            /* Visual Mapping Side-by-Side Editor */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              
              {/* Left Column: Parsed Raw Text (Visual Reference) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col max-h-[700px] overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    Extracted Text Reference
                  </div>
                  <button
                    onClick={resetPdfState}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-755 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Upload different file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto text-xs font-mono text-emerald-400/90 whitespace-pre-wrap leading-relaxed select-text pr-2 bg-slate-950 p-4 rounded-lg border border-slate-850">
                  {pdfText || 'No text extracted.'}
                </div>
                {pdfFile && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate">File: {pdfFile.name}</span>
                    <span>{(pdfFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </div>

              {/* Right Column: Visual Form Mapper */}
              <form onSubmit={handleSavePdfInvoice} className="lg:col-span-8 space-y-6">
                
                {/* Visual Confirmation Summary */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-lg text-slate-900">
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Review & Save Invoice</h4>
                      <p className="text-xs text-slate-600">
                        Adjust parsed data values in the form fields below before committing the record.
                      </p>
                    </div>
                  </div>
                  {invoices.some(inv => inv.id === pdfInvoiceData.invoiceId.trim().toUpperCase()) && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                      <AlertTriangle className="h-3 w-3" /> Duplicate ID: Will Overwrite
                    </span>
                  )}
                </div>

                {/* Client Profile Mapping Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <h3 className="font-bold text-slate-950 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-slate-400" />
                    Client Profile Mapping
                  </h3>
                  
                  <div className="flex gap-4 border border-slate-150 p-1.5 rounded-lg bg-slate-50 mb-5 max-w-md">
                    <button
                      type="button"
                      onClick={() => setPdfClientMode('create')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        pdfClientMode === 'create' 
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Create Client Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setPdfClientMode('link')}
                      className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        pdfClientMode === 'link' 
                          ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Link Existing Client
                    </button>
                  </div>

                  {pdfClientMode === 'create' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          New Client Name *
                        </label>
                        <input
                          type="text"
                          value={pdfNewClientName}
                          onChange={(e) => {
                            setPdfNewClientName(e.target.value);
                            if (pdfFormErrors.clientName) setPdfFormErrors(prev => ({ ...prev, clientName: '' }));
                          }}
                          className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                            pdfFormErrors.clientName ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                          }`}
                          placeholder="e.g. Jenkins Design Group"
                        />
                        {pdfFormErrors.clientName && <p className="text-xs text-rose-500 mt-1 font-semibold">{pdfFormErrors.clientName}</p>}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          New Client Email
                        </label>
                        <input
                          type="email"
                          value={pdfNewClientEmail}
                          onChange={(e) => setPdfNewClientEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                          placeholder="e.g. hello@jenkins.com"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-md">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Select Existing Client *
                      </label>
                      <select
                        value={pdfSelectedClientId}
                        onChange={(e) => {
                          setPdfSelectedClientId(e.target.value);
                          if (pdfFormErrors.clientId) setPdfFormErrors(prev => ({ ...prev, clientId: '' }));
                        }}
                        className={`w-full px-3 py-2 border bg-white rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                          pdfFormErrors.clientId ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                        }`}
                      >
                        <option value="">-- Choose client --</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                        ))}
                      </select>
                      {pdfFormErrors.clientId && <p className="text-xs text-rose-500 mt-1 font-semibold">{pdfFormErrors.clientId}</p>}
                    </div>
                  )}

                </div>

                {/* Metadata Details */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <h3 className="font-bold text-slate-950 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    Invoice Metadata
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Invoice ID *
                      </label>
                      <input
                        type="text"
                        value={pdfInvoiceData.invoiceId}
                        onChange={(e) => handlePdfFormChange('invoiceId', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                          pdfFormErrors.invoiceId ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                        }`}
                        placeholder="INV-XXXX"
                      />
                      {pdfFormErrors.invoiceId && <p className="text-xs text-rose-500 mt-1 font-semibold">{pdfFormErrors.invoiceId}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Status
                      </label>
                      <select
                        value={pdfInvoiceData.status}
                        onChange={(e) => handlePdfFormChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 bg-white rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Issue Date *
                      </label>
                      <input
                        type="date"
                        value={pdfInvoiceData.invoiceDate}
                        onChange={(e) => handlePdfFormChange('invoiceDate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                          pdfFormErrors.invoiceDate ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                        }`}
                      />
                      {pdfFormErrors.invoiceDate && <p className="text-xs text-rose-500 mt-1 font-semibold">{pdfFormErrors.invoiceDate}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={pdfInvoiceData.dueDate}
                        onChange={(e) => handlePdfFormChange('dueDate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                          pdfFormErrors.dueDate ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                        }`}
                      />
                      {pdfFormErrors.dueDate && <p className="text-xs text-rose-500 mt-1 font-semibold">{pdfFormErrors.dueDate}</p>}
                    </div>
                  </div>
                </div>

                {/* Items Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <h3 className="font-bold text-slate-950 flex items-center gap-2">
                      <Columns className="h-4 w-4 text-slate-400" />
                      Line Items
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddPdfItem}
                      className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg px-2.5 py-1 text-xs font-bold text-emerald-600 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Item
                    </button>
                  </div>

                  {pdfFormErrors.items && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-semibold">
                      {pdfFormErrors.items}
                    </div>
                  )}

                  {/* Header labels */}
                  <div className="hidden md:grid md:grid-cols-12 gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                    <div className="col-span-7">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Rate ($)</div>
                    <div className="col-span-1 text-right">Total</div>
                  </div>

                  <div className="space-y-3">
                    {pdfInvoiceData.items.map((item, idx) => (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-slate-150 rounded-lg p-3 md:border-0 md:p-0">
                        <div className="col-span-12 md:col-span-7">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handlePdfItemChange(item.id, 'description', e.target.value)}
                            placeholder="Line Item Description"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handlePdfItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-center text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-2 flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handlePdfItemChange(item.id, 'rate', e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                          />
                          {pdfInvoiceData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePdfItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="hidden md:block col-span-1 text-right font-bold text-slate-700 pr-1">
                          ${(item.quantity * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-slate-100 my-4"></div>

                  {/* Summary math */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          Tax Rate (%)
                        </label>
                        <input
                          type="number"
                          value={pdfInvoiceData.taxRate}
                          onChange={(e) => handlePdfFormChange('taxRate', Number(e.target.value) || 0)}
                          className="w-24 px-2 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="flex justify-between md:justify-end gap-6 text-sm text-slate-500">
                        <span>Subtotal:</span>
                        <span className="font-semibold text-slate-850">
                          ${pdfInvoiceData.items.reduce((s, i) => s + (i.quantity * i.rate), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between md:justify-end gap-6 text-sm text-slate-500">
                        <span>Tax Amount:</span>
                        <span className="font-semibold text-slate-850">
                          ${(pdfInvoiceData.items.reduce((s, i) => s + (i.quantity * i.rate), 0) * (pdfInvoiceData.taxRate / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between md:justify-end gap-6 text-base font-bold text-slate-900 border-t border-slate-100 pt-2">
                        <span>Total Due:</span>
                        <span className="text-lg font-black text-emerald-600">
                          ${(
                            pdfInvoiceData.items.reduce((s, i) => s + (i.quantity * i.rate), 0) * (1 + (pdfInvoiceData.taxRate / 100))
                          ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes and Form Actions */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Notes & Terms
                  </label>
                  <textarea
                    value={pdfInvoiceData.notes}
                    onChange={(e) => handlePdfFormChange('notes', e.target.value)}
                    rows="3"
                    className="w-full p-3 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 resize-none mb-4"
                    placeholder="E.g. Pay within 30 days."
                  />

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetPdfState}
                      className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg text-sm cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-sm text-sm cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Save Invoice
                    </button>
                  </div>
                </div>

              </form>

            </div>
          )}
        </div>
      )}

      {/* -----------------------------------------------------------------------
          TAB 2: CSV BATCH IMPORT
          ----------------------------------------------------------------------- */}
      {activeTab === 'csv' && (
        <div className="space-y-6 text-left">
          
          {/* File Upload Phase */}
          {!csvFile && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center flex flex-col justify-center items-center min-h-[300px]">
              <div className="mx-auto h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-400 mb-4">
                <Table className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">Upload Invoices CSV</h3>
              <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6 leading-relaxed">
                Import multiple invoices at once. Upload any CSV sheet. On the next screen, you will map your column headers to our invoice fields.
              </p>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="bg-slate-900 text-white hover:bg-slate-850 font-bold text-xs tracking-wider uppercase px-6 py-3 rounded-lg shadow-sm cursor-pointer"
                >
                  Select CSV File
                </button>
              </div>

              {csvFileError && (
                <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2 max-w-sm">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>{csvFileError}</span>
                </div>
              )}

              {/* Template suggestion */}
              <div className="mt-8 max-w-md bg-slate-50 border border-slate-100 rounded-lg p-3 flex gap-2 text-left">
                <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-[10px] text-slate-500 font-medium">
                  <span className="font-bold text-slate-700 block mb-0.5">Multi-line Item Grouping Support:</span>
                  To group multiple line items under the same invoice, ensure rows share the same Invoice ID/Number. The importer will automatically group them.
                </div>
              </div>
            </div>
          )}

          {/* Mappings & Preview Phase */}
          {csvFile && csvPreviewInvoices.length === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Column Selectors Mapper */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Settings className="h-5 w-5 text-slate-400" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Map CSV Columns</h3>
                    <p className="text-[10px] text-slate-400">Match columns in "{csvFile.name}" to fields.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Required Fields</span>
                  
                  {/* Invoice ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice ID / Number *</label>
                    <select
                      value={csvMapping.invoiceId}
                      onChange={(e) => handleCsvMappingChange('invoiceId', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>

                  {/* Client Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Client Name *</label>
                    <select
                      value={csvMapping.clientName}
                      onChange={(e) => handleCsvMappingChange('clientName', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>

                  {/* Client Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Client Email *</label>
                    <select
                      value={csvMapping.clientEmail}
                      onChange={(e) => handleCsvMappingChange('clientEmail', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>

                  {/* Invoice Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date *</label>
                    <select
                      value={csvMapping.invoiceDate}
                      onChange={(e) => handleCsvMappingChange('invoiceDate', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>

                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-3">Optional Line Item & Details</span>

                  {/* Item Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Item Description</label>
                    <select
                      value={csvMapping.description}
                      onChange={(e) => handleCsvMappingChange('description', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column (Default: Services Rendered) --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                    <select
                      value={csvMapping.quantity}
                      onChange={(e) => handleCsvMappingChange('quantity', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column (Default: 1) --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>

                  {/* Rate */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Rate / Unit Price</label>
                    <select
                      value={csvMapping.rate}
                      onChange={(e) => handleCsvMappingChange('rate', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column (Default: 0) --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>

                  {/* Tax Rate */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                    <select
                      value={csvMapping.taxRate}
                      onChange={(e) => handleCsvMappingChange('taxRate', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column (Default: 0) --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={csvMapping.status}
                      onChange={(e) => handleCsvMappingChange('status', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column (Default: Sent) --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                    <select
                      value={csvMapping.notes}
                      onChange={(e) => handleCsvMappingChange('notes', e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                    >
                      <option value="">-- Match Column --</option>
                      {csvHeaders.map((h, i) => (
                        <option key={i} value={i}>{h} (Col {i+1})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {csvMappingAlert && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                    <span>{csvMappingAlert}</span>
                  </div>
                )}

                <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCancelCsv}
                    className="flex-1 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleMapAndPreview}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Play className="h-3.5 w-3.5" /> Parse & Preview
                  </button>
                </div>
              </div>

              {/* Right Column: CSV Raw File Preview */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col max-h-[600px]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-900 text-sm">File Preview: {csvFile.name}</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    {csvRows.length} rows loaded
                  </span>
                </div>

                <div className="flex-1 overflow-auto border border-slate-150 rounded-lg">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-600 font-bold">
                        <th className="p-2 border-r border-slate-150 text-center w-8 bg-slate-100 text-[10px]">#</th>
                        {csvHeaders.map((h, i) => (
                          <th key={i} className="p-2 border-r border-slate-150 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                      {csvRows.slice(0, 10).map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-150 text-center bg-slate-50 text-[10px] font-bold text-slate-400">{rIdx + 2}</td>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 border-r border-slate-150 whitespace-nowrap truncate max-w-[150px]" title={cell}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {csvRows.length > 10 && (
                        <tr>
                          <td className="p-2 text-center bg-slate-50 font-bold text-slate-400">...</td>
                          <td colSpan={csvHeaders.length} className="p-2 text-slate-450 italic text-center">
                            And {csvRows.length - 10} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Execution & Preview Grid Phase */}
          {csvFile && csvPreviewInvoices.length > 0 && (
            <div className="space-y-6">
              
              {/* Metrics Summary Row */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500 p-2.5 rounded-lg text-slate-900">
                    <Table className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Invoices Parser Summary</h3>
                    <p className="text-xs text-slate-500">
                      We grouped {csvRows.length} CSV rows into <span className="font-bold text-slate-700">{csvPreviewInvoices.length} unique invoices</span>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCsvPreviewInvoices([])}
                    className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Adjust Mappings
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelCsv}
                    className="px-3.5 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Warnings and errors lists */}
              {csvMappingErrors.length > 0 && (
                <div className="bg-rose-50 border border-rose-150 rounded-xl p-4 text-left">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                    Columns Parse Validation Warnings ({csvMappingErrors.length})
                  </div>
                  <ul className="text-xs text-rose-700 font-mono space-y-1 max-h-32 overflow-y-auto pl-5 list-disc">
                    {csvMappingErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-rose-500 mt-2 font-semibold uppercase tracking-wider">
                    Note: Rows with missing identifiers or dates will be skipped.
                  </p>
                </div>
              )}

              {/* Main Grid table preview */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Invoices Ready for Import</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    {csvPreviewInvoices.length} invoices verified
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-6 py-3">Invoice ID</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Issued / Due Dates</th>
                        <th className="px-6 py-3">Items Count</th>
                        <th className="px-6 py-3">Total Amount</th>
                        <th className="px-6 py-3 text-right">Duplicate Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {csvPreviewInvoices.map((inv) => {
                        const exists = invoices.some(i => i.id === inv.id);
                        const clientExists = clients.some(c => 
                          c.email.toLowerCase() === inv.clientEmail.toLowerCase() ||
                          c.name.toLowerCase() === inv.clientName.toLowerCase()
                        );
                        const total = getPreviewTotal(inv);

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-800">{inv.id}</td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">{inv.clientName}</div>
                              <div className="text-[10px] text-slate-500">{inv.clientEmail}</div>
                              {!clientExists && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                                  <Plus className="h-2.5 w-2.5" /> Will Create Profile
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                              <div><span className="font-medium">Issued:</span> {inv.invoiceDate}</div>
                              <div><span className="font-medium">Due:</span> {inv.dueDate}</div>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-700 font-bold">{inv.items.length}</td>
                            <td className="px-6 py-4 font-black text-slate-900">
                              ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {exists ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <AlertTriangle className="h-3 w-3" /> Duplicate ID
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <Check className="h-3 w-3" /> Ready
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Execution Options Box */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Conflict Options Radio */}
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Conflict Resolution (For Duplicate IDs)
                  </label>
                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-2 text-xs text-slate-750 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="csvImportMode"
                        value="merge"
                        checked={csvImportMode === 'merge'}
                        onChange={() => setCsvImportMode('merge')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Merge & Overwrite Duplicates</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-750 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="csvImportMode"
                        value="new"
                        checked={csvImportMode === 'new'}
                        onChange={() => setCsvImportMode('new')}
                        className="text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Keep Both (Add random suffix to new ID)</span>
                    </label>
                  </div>
                </div>

                {/* Import Confirmation Trigger */}
                <div className="shrink-0">
                  {csvImportSuccess ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span>Data Imported! Returning to Invoices...</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleExecuteCsvImport}
                      disabled={isImportingCsv}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-lg shadow-sm text-sm cursor-pointer disabled:opacity-55 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {isImportingCsv ? 'Executing Batch Import...' : `Confirm Import ${csvPreviewInvoices.length} Invoices`}
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default ImportInvoices;
