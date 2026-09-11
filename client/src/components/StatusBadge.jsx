import React from 'react';
const cfg = {
  Pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  Assigned: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  'In Progress': { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  Collected: { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  Resolved: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  Rejected: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' }
};

export default function StatusBadge({ status }) {
  const c = cfg[status] || cfg['Pending'];
  return (
    <span className={'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ' + c.bg}>
      <span className={'w-1.5 h-1.5 rounded-full ' + c.dot}></span>
      {status}
    </span>
  );
}
