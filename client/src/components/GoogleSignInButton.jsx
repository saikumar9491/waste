import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, X, Check, ArrowRight } from 'lucide-react';

export default function GoogleSignInButton({ role = 'citizen', label = 'Continue with Google', onSuccess, className = '' }) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const googleBtnRef = useRef(null);

  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Ensure Google Identity Services script is loaded
  useEffect(() => {
    if (!window.google?.accounts) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleClick = () => {
    if (clientId && window.google?.accounts?.oauth2) {
      try {
        setLoading(true);
        setLoadingStatus('Opening Google Sign-In...');
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setLoading(false);
              setLoadingStatus('');
              console.warn('Google sign-in closed or error:', tokenResponse);
              return;
            }
            if (tokenResponse.access_token) {
              setLoadingStatus('Verifying account...');
              const warmTimer = setTimeout(() => {
                setLoadingStatus('Connecting to cloud server...');
              }, 2000);
              try {
                const res = await googleLogin({ accessToken: tokenResponse.access_token, role });
                clearTimeout(warmTimer);
                setLoading(false);
                setLoadingStatus('');
                if (res.success && onSuccess) {
                  onSuccess(res.user);
                }
              } catch (err) {
                clearTimeout(warmTimer);
                setLoading(false);
                setLoadingStatus('');
              }
            } else {
              setLoading(false);
              setLoadingStatus('');
            }
          }
        });

        // Forces Google popup to display all accounts currently present on the system / browser
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        setLoading(false);
        console.error('Google OAuth init error:', err);
      }
    }

    // If Google SDK is not ready or failed to initialize, show fallback selector
    setShowDemoModal(true);
  };

  const handleSelectDemoAccount = async (profile) => {
    setLoading(true);
    setShowDemoModal(false);
    const res = await googleLogin({
      isDemo: true,
      demoProfile: profile,
      role
    });
    setLoading(false);
    if (res.success && onSuccess) {
      onSuccess(res.user);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customEmail) return;
    setLoading(true);
    setShowDemoModal(false);
    const res = await googleLogin({
      isDemo: true,
      demoProfile: {
        name: customName || customEmail.split('@')[0],
        email: customEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customEmail)}`
      },
      role
    });
    setLoading(false);
    if (res.success && onSuccess) {
      onSuccess(res.user);
    }
  };

  return (
    <>
      <div className={`w-full flex flex-col items-center ${className}`}>
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs hover:shadow-sm transition flex items-center justify-center gap-3 group relative cursor-pointer"
        >
          {/* Google 'G' Multi-Color SVG */}
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>

          <span>{loading ? (loadingStatus || 'Opening Google Sign-In...') : label}</span>
        </button>

        {/* Demo profiles toggle for testing */}
        <button
          type="button"
          onClick={() => setShowDemoModal(true)}
          className="mt-2 text-[11px] text-slate-500 hover:text-emerald-700 transition flex items-center gap-1 cursor-pointer font-medium"
        >
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Quick Google Test Profiles</span>
        </button>
      </div>

      {/* Google Account Selector Dialog (Instant testing & fallback) */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative space-y-4">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">Sign in with Google</h4>
              <p className="text-[11px] text-slate-500">
                Choose a Google profile or enter your custom Google email:
              </p>
            </div>

            {/* Quick Profiles */}
            <div className="space-y-2">
              <button
                onClick={() =>
                  handleSelectDemoAccount({
                    name: 'Priya Sharma',
                    email: 'priya.sharma@gmail.com',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                    googleId: 'google-sub-priya-101'
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
                    alt="Priya"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Priya Sharma</p>
                    <p className="text-[10px] text-slate-500">priya.sharma@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Citizen
                </span>
              </button>

              <button
                onClick={() =>
                  handleSelectDemoAccount({
                    name: 'Alex Vance',
                    email: 'alex.vance@gmail.com',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                    googleId: 'google-sub-alex-102'
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="Alex"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Alex Vance</p>
                    <p className="text-[10px] text-slate-500">alex.vance@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  Collector
                </span>
              </button>

              <button
                onClick={() =>
                  handleSelectDemoAccount({
                    name: 'Dr. Elena Rostova',
                    email: 'elena.rostova@gmail.com',
                    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
                    googleId: 'google-sub-elena-103'
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                    alt="Elena"
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Dr. Elena Rostova</p>
                    <p className="text-[10px] text-slate-500">elena.rostova@gmail.com</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                  Admin
                </span>
              </button>
            </div>

            {/* Custom Google Email Option */}
            <form onSubmit={handleCustomGoogleSubmit} className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-bold text-slate-600 uppercase">Or Enter Custom Google Account</p>
              <input
                type="text"
                placeholder="Full Name (optional)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg font-bold text-xs bg-slate-900 hover:bg-black text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
