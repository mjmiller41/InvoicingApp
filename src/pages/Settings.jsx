import React, { useState, useEffect } from 'react';
import { Save, Building, Mail, Phone, MapPin, Globe, CheckCircle2 } from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';

function Settings() {
  const { businessInfo, updateBusinessInfo } = useInvoices();

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
    </div>
  );
}

export default Settings;
