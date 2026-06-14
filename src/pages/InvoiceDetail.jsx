import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Printer, Download, Send, Edit, Mail,
  FileText, Loader2, X, ChevronRight, Info, Check
} from 'lucide-react';
import { useInvoices } from '../context/InvoiceContext';
import { getStatusStyles } from '../utils/statusStyles';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

function InvoiceDetail() {
  const { id } = useParams();
  const {
    invoices,
    clients,
    businessInfo,
    getInvoiceSubtotal,
    getInvoiceTax,
    getInvoiceTotal,
    updateInvoiceStatus,
    addNotification
  } = useInvoices();

  const invoiceCardRef = useRef(null);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const [emailTab, setEmailTab] = useState('mock');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingStage, setSendingStage] = useState(0);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingStatusText, setSendingStatusText] = useState('');

  const invoice = invoices.find(inv => inv.id === id);
  const client = invoice ? clients.find(c => c.id === invoice.clientId) : null;

  if (!invoice) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-500 text-sm">Invoice not found.</p>
        <Link to="/app" className="text-emerald-600 underline mt-4 inline-block font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const invoiceSubtotal = getInvoiceSubtotal(invoice);
  const invoiceTax = getInvoiceTax(invoice);
  const invoiceTotal = getInvoiceTotal(invoice);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceCardRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const element = invoiceCardRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      pdf.save(`Invoice_${invoice.id}.pdf`);

      addNotification({
        title: 'PDF Downloaded',
        message: `Invoice ${invoice.id} exported successfully.`,
        type: 'success'
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleMockSend = () => {
    if (!emailTo.trim()) return;

    setSendingStage(1);
    setSendingProgress(0);
    setSendingStatusText('Generating secure PDF attachment...');

    const stages = [
      { progress: 25, text: 'Connecting to mail delivery nodes...' },
      { progress: 55, text: 'Uploading Invoice payload...' },
      { progress: 85, text: 'Signing email certificate...' },
      { progress: 100, text: 'Delivered!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < stages.length) {
        setSendingProgress(stages[currentStep].progress);
        setSendingStatusText(stages[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          updateInvoiceStatus(invoice.id, 'Sent');
          addNotification({
            title: 'Invoice Sent',
            message: `Invoice ${invoice.id} was successfully emailed to ${emailTo}.`,
            type: 'success',
            actionLink: `/invoices/${invoice.id}`
          });
          setSendingStage(2);
        }, 500);
      }
    }, 700);
  };

  const handleNativeSend = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    const link = document.createElement('a');
    link.href = mailtoUrl;
    link.target = '_blank';
    link.click();

    updateInvoiceStatus(invoice.id, 'Sent');
    addNotification({
      title: 'Invoice Shared via Client App',
      message: `Invoice ${invoice.id} dispatch initiated to ${emailTo}.`,
      type: 'info'
    });

    setSendingStage(2);
  };

  const openSendModal = () => {
    setEmailTo(client?.email || '');
    setEmailSubject(`Invoice ${invoice.id} from ${businessInfo.name}`);
    setEmailBody(
      `Hi ${client ? client.name : 'there'},\n\n` +
      `We appreciate your business! Here is invoice ${invoice.id} for $${invoiceTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.\n\n` +
      `Payment is due by ${new Date(invoice.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.\n\n` +
      `${invoice.notes ? `Notes:\n${invoice.notes}\n\n` : ''}` +
      `Best regards,\n` +
      `${businessInfo.name}\n` +
      `${businessInfo.email || ''}`
    );

    setSendingStage(0);
    setSendingProgress(0);
    setIsSendModalOpen(true);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">

      {/* Header Control Bar (Hides in Print Mode) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 print:hidden">

        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="p-2 border border-slate-200 bg-white rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Invoices</span>
              <ChevronRight className="h-3 w-3" />
              <span>Preview</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Invoice {invoice.id}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/app/invoices/${invoice.id}/edit`}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-350 hover:bg-slate-50 text-slate-750 font-semibold px-3.5 py-2 rounded-lg text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-350 hover:bg-slate-50 text-slate-755 font-semibold px-3.5 py-2 rounded-lg text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-350 hover:bg-slate-50 text-slate-755 font-semibold px-3.5 py-2 rounded-lg text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-55"
          >
            {isGeneratingPDF ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </button>

          <button
            onClick={openSendModal}
            className="inline-flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
            Send Invoice
          </button>
        </div>
      </div>

      {/* Main Invoice Sheet (Print Optimized Card) */}
      <div
        ref={invoiceCardRef}
        className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 max-w-4xl mx-auto text-left relative overflow-hidden print:border-0 print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900 print:hidden" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-b border-slate-150 pb-8 mb-8">

          {/* Issuer Brand Block */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 bg-slate-900 text-emerald-400 font-black flex items-center justify-center rounded-xl text-lg border border-slate-800">
                {businessInfo.name ? businessInfo.name.charAt(0).toUpperCase() : 'B'}
              </div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                {businessInfo.name}
              </span>
            </div>
            <div className="space-y-1 text-slate-500 text-xs font-medium">
              <p>{businessInfo.address}</p>
              <p>Phone: {businessInfo.phone}</p>
              <p>Email: {businessInfo.email}</p>
              {businessInfo.website && <p>Web: {businessInfo.website}</p>}
            </div>
          </div>

          {/* Invoice Identity Box */}
          <div className="md:text-right space-y-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Invoice</h2>
              <p className="text-slate-500 text-sm font-bold mt-1">
                No. <span className="text-slate-900">{invoice.id}</span>
              </p>
            </div>

            <div className="inline-block md:text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${getStatusStyles(invoice.status)}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                {invoice.status}
              </span>
            </div>

            {/* Dates — parse as local time to avoid UTC off-by-one */}
            <div className="grid grid-cols-2 gap-4 text-xs font-medium md:justify-items-end">
              <div className="text-left md:text-right">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date Issued</span>
                <span className="text-slate-800 font-semibold">
                  {new Date(invoice.invoiceDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="text-left md:text-right">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Due Date</span>
                <span className="text-slate-800 font-semibold">
                  {new Date(invoice.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recipient details */}
        <div className="mb-8 max-w-md">
          <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Billed To</h4>
          {client ? (
            <div className="space-y-1.5 text-xs font-medium">
              <p className="text-slate-900 font-bold text-base leading-snug">{client.name}</p>
              <p className="text-slate-650 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {client.email}
              </p>
              {client.phone && <p className="text-slate-650">Phone: {client.phone}</p>}
              <p className="text-slate-500 mt-1 whitespace-pre-line leading-relaxed">{client.address}</p>
            </div>
          ) : (
            <div className="text-rose-600 text-xs font-semibold">Client information missing</div>
          )}
        </div>

        {/* Invoice Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3 text-center w-20">Quantity</th>
                <th className="px-5 py-3 text-right w-32">Rate</th>
                <th className="px-5 py-3 text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-850">
              {invoice.items && invoice.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{item.description}</td>
                  <td className="px-5 py-3.5 text-center">{item.quantity}</td>
                  <td className="px-5 py-3.5 text-right">
                    ${Number(item.rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-950">
                    ${(Number(item.quantity) * Number(item.rate)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Totals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-t border-slate-100 pt-8">
          <div className="space-y-2">
            {invoice.notes && (
              <>
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Notes & Payment Terms</h4>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-150 p-4 rounded-xl">
                  {invoice.notes}
                </p>
              </>
            )}
          </div>

          <div className="space-y-3.5 md:justify-self-end w-full max-w-sm">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-800">
                ${invoiceSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 flex items-center gap-1">
                Tax Rate ({invoice.taxRate}%)
              </span>
              <span className="text-slate-800">
                ${invoiceTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-px bg-slate-150 my-1"></div>

            <div className="flex items-center justify-between">
              <span className="text-slate-900 font-extrabold text-sm">Total Due</span>
              <span className="text-2xl font-black text-slate-950">
                ${invoiceTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-12 pt-6 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
          Thank you for your business!
        </div>
      </div>

      {/* Send Invoice Dialog Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => sendingStage !== 1 && setIsSendModalOpen(false)}
          />

          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 transform transition-all animate-in fade-in zoom-in-95 duration-250 text-slate-850">

            <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Send Invoice {invoice.id}</h3>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Choose transmission route</p>
              </div>
              {sendingStage !== 1 && (
                <button
                  onClick={() => setIsSendModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Stage 0: Edit & Configure */}
            {sendingStage === 0 && (
              <div className="flex flex-col">
                <div className="flex border-b border-slate-150 bg-slate-50/50">
                  <button
                    onClick={() => setEmailTab('mock')}
                    className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      emailTab === 'mock'
                        ? 'border-emerald-500 text-emerald-700 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/30'
                    }`}
                  >
                    Simulated Email Dispatch
                  </button>
                  <button
                    onClick={() => setEmailTab('native')}
                    className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                      emailTab === 'native'
                        ? 'border-emerald-500 text-emerald-700 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/30'
                    }`}
                  >
                    Open Default Email Client
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="text-left">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      To *
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="client@company.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                    />
                  </div>

                  <div className="text-left">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Invoice subject"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500"
                    />
                  </div>

                  <div className="text-left">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Message Body
                    </label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows="5"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 resize-none font-sans"
                    />
                  </div>

                  {emailTab === 'mock' ? (
                    <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span>Attachment: Invoice_{invoice.id}.pdf</span>
                      </div>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                        PDF Included
                      </span>
                    </div>
                  ) : (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-left">
                      <Info className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-bold text-amber-900">Attachment Instructions</span>
                        <p className="text-[10px] text-amber-800 leading-normal">
                          Browsers cannot programmatically attach files to desktop clients. Please download the invoice PDF first, and manually attach it to the email window that opens.
                        </p>
                      </div>
                    </div>
                  )}

                  {!emailTo.trim() && (
                    <p className="text-xs text-rose-500 font-semibold text-left">
                      * Please specify a recipient email address.
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsSendModalOpen(false)}
                      className="px-4 py-2 border border-slate-350 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    {emailTab === 'mock' ? (
                      <button
                        type="button"
                        onClick={handleMockSend}
                        disabled={!emailTo.trim()}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-55"
                      >
                        Send Mock Email
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNativeSend}
                        disabled={!emailTo.trim()}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-55"
                      >
                        Open Native Email App
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stage 1: Sending */}
            {sendingStage === 1 && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-6">
                <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                <div className="space-y-2.5 w-full max-w-xs">
                  <h4 className="font-bold text-slate-800 text-sm">{sendingStatusText}</h4>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                      style={{ width: `${sendingProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{sendingProgress}% Completed</span>
                </div>
              </div>
            )}

            {/* Stage 2: Success */}
            {sendingStage === 2 && (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="font-bold text-slate-900 text-lg">Invoice Dispatched Successfully</h4>
                  <p className="text-slate-500 text-xs leading-normal">
                    {emailTab === 'mock'
                      ? `We successfully simulated email transmission. Invoice status for ${invoice.id} is now updated to "Sent".`
                      : `Your browser was redirected to launch the system email program. Invoice status for ${invoice.id} is now updated to "Sent".`
                    }
                  </p>
                </div>
                <div className="w-full bg-slate-50 border border-slate-150 rounded-xl p-3 text-left space-y-1 text-[11px] font-medium text-slate-650">
                  <p><span className="text-slate-400 font-semibold">Recipient:</span> {emailTo}</p>
                  <p><span className="text-slate-400 font-semibold">Subject:</span> {emailSubject}</p>
                </div>
                <div className="w-full border-t border-slate-100 pt-4 mt-6">
                  <button
                    onClick={() => setIsSendModalOpen(false)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-semibold rounded-lg text-xs tracking-wider transition-colors cursor-pointer"
                  >
                    Close Dialog
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default InvoiceDetail;
