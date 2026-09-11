import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { MapPin, Navigation, X, ShieldAlert, CheckCircle2, Chrome } from 'lucide-react';

export default function LocationPromptBanner() {
  const { coords, address, loading, permissionStatus, requestLocation } = useLocation();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('wastewise_loc_dismissed') === 'true';
  });
  const [showChromeHelp, setShowChromeHelp] = useState(false);

  // If already granted and coords resolved, don't show the banner
  if (dismissed || permissionStatus === 'granted' || (coords && address)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('wastewise_loc_dismissed', 'true');
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-slate-900/95 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  <span>Enable Location Access</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    GPS
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {permissionStatus === 'denied'
                    ? 'Location is blocked in your Chrome browser settings.'
                    : 'Allow location in Chrome to automatically pinpoint waste spots and track nearby cleanup trucks.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            {permissionStatus === 'denied' ? (
              <>
                <button
                  onClick={() => setShowChromeHelp(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Chrome className="w-3.5 h-3.5 text-blue-400" />
                  <span>Chrome Instructions</span>
                </button>
                <button
                  onClick={() => requestLocation(true)}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => requestLocation(true)}
                  disabled={loading}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{loading ? 'Requesting GPS...' : 'Allow Location'}</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="py-2 px-3 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Not now
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chrome Permission Guide Modal */}
      {showChromeHelp && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Chrome className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">How to Allow Location in Chrome</h3>
                  <p className="text-xs text-slate-500">Unblock location permission in 3 simple steps</p>
                </div>
              </div>
              <button
                onClick={() => setShowChromeHelp(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-900">Click the Site Controls / Lock Icon</p>
                  <p className="text-slate-500 mt-0.5">
                    In the Chrome address bar, click the <b>tune / sliders (🎛️)</b> or <b>lock (🔒)</b> icon to the left of <code>wastewish-ten.vercel.app</code>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-900">Change "Location" to "Allow"</p>
                  <p className="text-slate-500 mt-0.5">
                    Toggle the <b>Location</b> permission switch to <b>Allow</b> (or click "Site settings" &gt; "Location" &gt; "Allow").
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-900">Reload or Click Retry</p>
                  <p className="text-slate-500 mt-0.5">
                    Refresh the page or click the Retry button below to lock your coordinates.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowChromeHelp(false);
                  requestLocation(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                I Allowed It - Refresh GPS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
