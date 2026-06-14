export function getStatusStyles(status) {
  switch (status) {
    case 'Paid':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Sent':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Overdue':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
