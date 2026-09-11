import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export default function PriorityBadge({ priority, pulse = false }) {
  if (priority === 'CRITICAL') {
    return (
      <span className={'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 ' + (pulse ? 'animate-pulse' : '')}>
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        CRITICAL
      </span>
    );
  }
  if (priority === 'HIGH') {
    return (
      <span className={'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 ' + (pulse ? 'animate-pulse' : '')}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        HIGH
      </span>
    );
  }
  if (priority === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
        MEDIUM
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <Info className="w-3.5 h-3.5 text-slate-500" />
      LOW
    </span>
  );
}
