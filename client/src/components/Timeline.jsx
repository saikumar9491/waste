import React from 'react';
import { Clock, Truck, ShieldCheck, Camera, Sparkles } from 'lucide-react';

const steps = [
  { key: 'Complaint Created', label: 'Complaint Created', icon: Camera },
  { key: 'AI Analyzed', label: 'AI Analyzed', icon: Sparkles },
  { key: 'Assigned', label: 'Collector Assigned', icon: Truck },
  { key: 'In Progress', label: 'Collector On The Way', icon: Clock },
  { key: 'Waste Collected', label: 'Waste Collected', icon: Camera },
  { key: 'Resolved', label: 'Verified & Resolved', icon: ShieldCheck }
];

export default function Timeline({ history = [], currentStatus = 'Pending' }) {
  const statusOrder = ['Pending', 'Assigned', 'In Progress', 'Collected', 'Resolved'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="py-2">
      <div className="relative border-l-2 border-emerald-200 ml-4 pl-5 space-y-5">
        {steps.map((step, idx) => {
          const matched = history.find((h) => h.status.toLowerCase().includes(step.key.toLowerCase()));
          const isDone = Boolean(matched) || (idx === 0) || (idx === 1 && history.length > 1) || (idx <= currentIndex + 1 && currentIndex >= 0);
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative">
              <div
                className={'absolute -left-[31px] top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 transition ' +
                  (isDone ? 'bg-emerald-500 border-white text-white shadow-xs' : 'bg-white border-slate-300 text-slate-400')
                }
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className={'text-xs font-bold ' + (isDone ? 'text-slate-900' : 'text-slate-400')}>
                    {step.label}
                  </h4>
                  {matched && (
                    <span className="text-[10px] text-slate-400">
                      {new Date(matched.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                {matched && (
                  <p className="text-xs text-slate-600 mt-0.5">{matched.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
