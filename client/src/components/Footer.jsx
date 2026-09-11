import React from 'react';
import { Recycle, Heart, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Waste<span className="text-emerald-400">Wise</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              AI-powered waste reporting and intelligent collector dispatching for cleaner, healthier communities.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Workflow</h5>
            <ul className="space-y-2">
              <li>📷 Mobile Camera Capture</li>
              <li>📍 GPS Geo-Tagging</li>
              <li>🤖 AI Waste Classification</li>
              <li>🚨 Automated Priority Engine</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">Platform</h5>
            <ul className="space-y-2">
              <li>Citizen Reporting Portal</li>
              <li>Collector Dispatch & Proof</li>
              <li>Municipal Admin Command Map</li>
              <li>Predictive Hotspot Analytics</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-200 uppercase tracking-wider mb-3 text-[11px]">System Status</h5>
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>All Systems Operational</span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                AI Inference Engine Ready
              </p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                MERN + Leaflet Live GIS
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 WasteWise Technologies. Smart Waste Management Platform.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for clean sustainable cities
          </p>
        </div>
      </div>
    </footer>
  );
}
