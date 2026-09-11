import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Sparkles, Users, Truck, Shield, X, ArrowRight } from 'lucide-react';
import GoogleSignInButton from './GoogleSignInButton';

export default function LoginPromptModal({ isOpen, onClose, featureTitle, targetPath }) {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRedirect = (role) => {
    onClose();
    if (targetPath) {
      navigate(targetPath);
    } else {
      if (role === 'citizen') navigate('/citizen-dashboard');
      else if (role === 'collector') navigate('/collector-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
    }
  };

  const handleDemo = async (role) => {
    const res = await demoLogin(role);
    if (res.success) {
      handleRedirect(role);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Sign In Required</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            To access <span className="font-bold text-slate-800">"{featureTitle || 'this feature'}"</span>, please sign in or choose an instant test role:
          </p>
        </div>

        {/* Google Authentication */}
        <div>
          <GoogleSignInButton
            label="Continue with Google"
            onSuccess={(u) => handleRedirect(u.role)}
          />
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold text-[10px] tracking-wider">
                Or select demo role
              </span>
            </div>
          </div>
        </div>

        {/* 1-Click Role Logins */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleDemo('citizen')}
            className="w-full p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 hover:border-emerald-400 transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">Sign In as Citizen</p>
                <p className="text-[11px] text-emerald-700 font-medium">Report waste with camera & GPS</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => handleDemo('collector')}
            className="w-full p-3.5 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 hover:border-blue-400 transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">Sign In as Collector</p>
                <p className="text-[11px] text-blue-700 font-medium">Task routing & proof upload</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-700 group-hover:translate-x-1 transition" />
          </button>

          <button
            onClick={() => handleDemo('admin')}
            className="w-full p-3.5 rounded-2xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/70 hover:border-purple-400 transition flex items-center justify-between group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">Sign In as Municipal Admin</p>
                <p className="text-[11px] text-purple-700 font-medium">Live GIS map & analytics</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Standard Links */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
          <Link
            to="/login"
            onClick={onClose}
            className="text-slate-700 hover:text-emerald-600 transition"
          >
            Standard Login →
          </Link>
          <Link
            to="/register"
            onClick={onClose}
            className="text-emerald-600 hover:underline"
          >
            Create Citizen Account
          </Link>
        </div>
      </div>
    </div>
  );
}
