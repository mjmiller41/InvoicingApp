import React, { useState, useEffect } from 'react';
import { Save, Building, Mail, Phone, MapPin, Globe, CheckCircle2, Database, Download, Upload, FileJson, AlertCircle, X, Check } from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';

function Settings() {
  const { 
    businessInfo, 
    updateBusinessInfo, 
    businesses, 
    allClients, 
    allInvoices, 
    importData 
  } = useInvoices();

  // Form State
  const [formData, setFormData] = useState({
    name: businessInfo.name,
    email: businessInfo.email,
    phone: businessInfo.phone,
    address: businessInfo.address,
    website: businessInfo.website
  });

  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Export UI State
  const [exportScope, setExportScope] = useState('active');
  const [selectedBizIds, setSelectedBizIds] = useState({});

  // Import UI State
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importMode, setImportMode] = useState('merge');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState(null);

  // Initialize selectedBizIds when businesses changes
  useEffect(() => {
    if (businesses) {
      const initial = {};
      businesses.forEach(b => {
        initial[b.id] = b.id === businessInfo.id;
      });
      setSelectedBizIds(initial);
    }
  }, [businesses, businessInfo.id]);

  // Reset form values when the active business profile changes
  useEffect(() => {
    setFormData({
      name: businessInfo.name || '',
      email: businessInfo.email || '',
      phone: businessInfo.phone || '',
      address: businessInfo.address || '',
      website: businessInfo.website || ''
    });
    setErrors({});
  }, [businessInfo]);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Business address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    updateBusinessInfo(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Export handler
  const handleExport = () => {
    let exportBiz = [];
    let exportClients = [];
    let exportInvoices = [];
    let filename = '';

    const nowStr = new Date().toISOString().split('T')[0];

    if (exportScope === 'active') {
      exportBiz = [businessInfo];
      exportClients = allClients.filter(c => c.businessId === businessInfo.id);
      exportInvoices = allInvoices.filter(inv => inv.businessId === businessInfo.id);
      
      const slug = businessInfo.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      filename = `invoicer_backup_${slug}_${nowStr}.json`;
    } else if (exportScope === 'selected') {
      const selectedIds = Object.keys(selectedBizIds).filter(id => selectedBizIds[id]);
      if (selectedIds.length === 0) {
        alert("Please select at least one business profile to export.");
        return;
      }
      exportBiz = businesses.filter(b => selectedIds.includes(b.id));
      exportClients = allClients.filter(c => selectedIds.includes(c.businessId));
      exportInvoices = allInvoices.filter(inv => selectedIds.includes(inv.businessId));
      
      filename = `invoicer_backup_selected_${nowStr}.json`;
    } else {
      // all
      exportBiz = businesses;
      exportClients = allClients;
      exportInvoices = allInvoices;
      
      filename = `invoicer_backup_all_${nowStr}.json`;
    }

    const payload = {
      type: "invoicer_backup",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      businesses: exportBiz,
      clients: exportClients,
      invoices: exportInvoices
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportFile(file);
    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error("Invalid format: Not a valid JSON object.");
        }
        
        const hasBiz = Array.isArray(parsed.businesses);
        const hasClients = Array.isArray(parsed.clients);
        const hasInvoices = Array.isArray(parsed.invoices);

        if (!hasBiz && !hasClients && !hasInvoices) {
          throw new Error("Invalid backup: Missing business, client, or invoice arrays.");
        }

        setImportPreview({
          valid: true,
          businessesCount: parsed.businesses?.length || 0,
          clientsCount: parsed.clients?.length || 0,
          invoicesCount: parsed.invoices?.length || 0,
          rawData: parsed
        });
      } catch (err) {
        setImportPreview({
          valid: false,
          businessesCount: 0,
          clientsCount: 0,
          invoicesCount: 0,
          error: err.message
        });
        setImportError(err.message);
      }
    };
    
    reader.readAsText(file);
  };

  const handleCancelImport = () => {
    setImportFile(null);
    setImportPreview(null);
    setImportError(null);
  };

  const handleExecuteImport = () => {
    if (!importPreview || !importPreview.rawData) return;
    
    setIsImporting(true);
    try {
      importData(importPreview.rawData, importMode);
      setImportSuccess(true);
      handleCancelImport();
      setTimeout(() => {
        setImportSuccess(false);
      }, 5000);
    } catch (err) {
      setImportError(err.message || "An error occurred during import.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-left">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure your business profile details. These elements are automatically printed on client invoices.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Card Header Banner */}
        <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex items-center gap-3">
          <div className="bg-emerald-500 p-1.5 rounded-lg text-slate-900">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Issuer Profile</h3>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              {businessInfo.name} settings
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              <span>Business settings saved successfully! Changes are updated in real-time.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="text-left md:col-span-2">
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business / Brand Name *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. TimberTraceCrafts"
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    errors.name ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="text-left">
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. hello@mybusiness.com"
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    errors.email ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="text-left">
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Phone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. (555) 012-3456"
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 ${
                    errors.phone ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.phone}</p>}
            </div>

            {/* Website */}
            <div className="text-left md:col-span-2">
              <label htmlFor="website" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="e.g. www.timbertracecrafts.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Address */}
            <div className="text-left md:col-span-2">
              <label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Street Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  id="address"
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. 100 Woodworking Lane, Grants Pass, OR 97526"
                  className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 resize-none ${
                    errors.address ? 'border-rose-300 focus:border-rose-500' : 'border-slate-300 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.address && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.address}</p>}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end border-t border-slate-100 pt-4 mt-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors text-sm cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Data Import & Export Card */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden text-left animate-in fade-in duration-300">
        {/* Card Header Banner */}
        <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex items-center gap-3">
          <div className="bg-slate-900 p-1.5 rounded-lg text-emerald-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Data Import & Export</h3>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Backup, migrate, or merge your invoicing profiles
            </p>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-6 gap-6 md:gap-0">
          
          {/* Export Side */}
          <div className="space-y-6 pb-6 md:pb-0 md:pr-6 text-left">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-500" />
                Export Data
              </h4>
              <p className="text-slate-500 text-xs mt-1">
                Download your configuration, client records, and invoice lists as a secure JSON backup.
              </p>
            </div>

            {/* Export Options */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Export Scope
              </label>
              
              {/* Radio Group */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="exportScope"
                    value="active"
                    checked={exportScope === 'active'}
                    onChange={() => setExportScope('active')}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">
                      Active Business Profile
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      Only "{businessInfo?.name}" settings, clients, and invoices.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="exportScope"
                    value="selected"
                    checked={exportScope === 'selected'}
                    onChange={() => setExportScope('selected')}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <span className="block text-xs font-bold text-slate-800">
                      Selected Profiles
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      Choose specific business profiles to package together.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name="exportScope"
                    value="all"
                    checked={exportScope === 'all'}
                    onChange={() => setExportScope('all')}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-800">
                      All Local Data
                    </span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">
                      Everything: all business profiles, clients, and invoicing history.
                    </span>
                  </div>
                </label>
              </div>

              {/* Selected Businesses checklist */}
              {exportScope === 'selected' && (
                <div className="mt-3 p-3 border border-slate-100 bg-slate-50 rounded-lg space-y-2 max-h-40 overflow-y-auto animate-in fade-in duration-200">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Profiles
                  </span>
                  {businesses.map(biz => (
                    <label key={biz.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold cursor-pointer select-none py-0.5">
                      <input
                        type="checkbox"
                        checked={!!selectedBizIds[biz.id]}
                        onChange={(e) => {
                          setSelectedBizIds(prev => ({
                            ...prev,
                            [biz.id]: e.target.checked
                          }));
                        }}
                        className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>{biz.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Export Trigger */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExport}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold py-2.5 px-4 rounded-lg text-xs tracking-wider transition-colors cursor-pointer"
              >
                <FileJson className="h-4 w-4 text-emerald-400" />
                Export JSON Backup
              </button>
            </div>
          </div>

          {/* Import Side */}
          <div className="space-y-6 pt-6 md:pt-0 md:pl-6 text-left">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-500" />
                Import Data
              </h4>
              <p className="text-slate-555 text-xs mt-1">
                Upload a JSON backup file to sync profiles or restore client and invoice logs.
              </p>
            </div>

            {/* Notifications */}
            {importSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-emerald-800 text-xs font-semibold animate-in fade-in duration-200 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Backup data successfully imported into local state storage.</span>
              </div>
            )}
            {importError && (
              <div className="bg-rose-50 border border-rose-100 rounded-lg p-3 text-rose-800 text-xs font-semibold animate-in fade-in duration-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>Import failed: {importError}</span>
              </div>
            )}

            {/* File Upload Zone */}
            {!importPreview ? (
              <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-350 rounded-xl p-6 transition-colors text-center group cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  value=""
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="mx-auto h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-slate-900 hover:underline">Click to browse</span> or drag and drop
                  </div>
                  <div className="text-[10px] text-slate-400">JSON backups only</div>
                </div>
              </div>
            ) : (
              /* File Loaded & Parsed Preview */
              <div className="space-y-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50 animate-in zoom-in-98 duration-150">
                {/* File Header */}
                <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileJson className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate" title={importFile?.name}>
                      {importFile?.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelImport}
                    className="p-1 rounded text-slate-450 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Import Details Metrics */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white border border-slate-150 rounded-lg p-2 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Businesses</span>
                    <span className="block font-bold text-slate-800 text-sm mt-0.5">
                      {importPreview.businessesCount}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-150 rounded-lg p-2 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clients</span>
                    <span className="block font-bold text-slate-800 text-sm mt-0.5">
                      {importPreview.clientsCount}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-150 rounded-lg p-2 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoices</span>
                    <span className="block font-bold text-slate-800 text-sm mt-0.5">
                      {importPreview.invoicesCount}
                    </span>
                  </div>
                </div>

                {importPreview.valid && (
                  <>
                    {/* Conflict Mode Selection */}
                    <div className="space-y-2 pt-1 text-left">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Duplicate Resolution
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <label className="flex items-start gap-2.5 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-left">
                          <input
                            type="radio"
                            name="importMode"
                            value="merge"
                            checked={importMode === 'merge'}
                            onChange={() => setImportMode('merge')}
                            className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800 leading-tight">
                              Merge & Overwrite
                            </span>
                            <span className="block text-[10px] text-slate-500 leading-normal mt-0.5">
                              Update existing records if IDs match. Add new items.
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2.5 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-left">
                          <input
                            type="radio"
                            name="importMode"
                            value="new"
                            checked={importMode === 'new'}
                            onChange={() => setImportMode('new')}
                            className="mt-0.5 text-emerald-500 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800 leading-tight">
                              Import as New Profiles
                            </span>
                            <span className="block text-[10px] text-slate-500 leading-normal mt-0.5">
                              Regenerate all IDs as separate duplicate copies. Will not alter existing data.
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Trigger confirmation buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-150">
                      <button
                        type="button"
                        onClick={handleCancelImport}
                        className="flex-1 py-2 border border-slate-350 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleExecuteImport}
                        disabled={isImporting}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-55"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {isImporting ? "Importing..." : "Confirm Import"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
