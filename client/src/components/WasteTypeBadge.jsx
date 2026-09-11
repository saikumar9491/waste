import React from 'react';
const types = {
  Plastic: { emoji: '🥤', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  Organic: { emoji: '🥬', bg: 'bg-lime-50 text-lime-800 border-lime-200' },
  Metal: { emoji: '🥫', bg: 'bg-zinc-100 text-zinc-800 border-zinc-300' },
  Glass: { emoji: '🍾', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  Paper: { emoji: '📦', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  'E-Waste': { emoji: '💻', bg: 'bg-violet-50 text-violet-800 border-violet-200' },
  Hazardous: { emoji: '☣️', bg: 'bg-red-50 text-red-800 border-red-200' },
  General: { emoji: '🗑️', bg: 'bg-slate-100 text-slate-800 border-slate-200' }
};

export default function WasteTypeBadge({ type }) {
  const item = types[type] || types['General'];
  return (
    <span className={'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ' + item.bg}>
      <span>{item.emoji}</span>
      <span>{type} Waste</span>
    </span>
  );
}
