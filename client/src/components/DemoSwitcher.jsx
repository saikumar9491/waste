import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Truck, Shield, Sparkles } from 'lucide-react';

export default function DemoSwitcher() {
  const { user, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = async (role) => {
    const res = await demoLogin(role);
    if (res.success) {
      if (role === 'citizen') navigate('/citizen-dashboard');
      else if (role === 'collector') navigate('/collector-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
    }
  };

  return (
    <aside aria-label="Demo role switcher" className="fixed bottom-4 right-4 z-50 bg-slate-900/90 backdrop-blur-md text-white rounded-full shadow-2xl p-1 border border-slate-700 flex items-center gap-1">
      <div className="px-2 text-[11px] font-bold text-emerald-400 flex items-center gap-1 border-r border-slate-700">
        <Sparkles className="w-3 h-3" />
        <span className="hidden sm:inline">Role:</span>
      </div>
      <button
        onClick={() => handleSwitch('citizen')}
        className={'px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ' +
          (user?.role === 'citizen' ? 'bg-emerald-500 text-white shadow' : 'text-slate-300 hover:bg-slate-800')
        }
      >
        <Users className="w-3 h-3" /> Citizen
      </button>
      <button
        onClick={() => handleSwitch('collector')}
        className={'px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ' +
          (user?.role === 'collector' ? 'bg-blue-500 text-white shadow' : 'text-slate-300 hover:bg-slate-800')
        }
      >
        <Truck className="w-3 h-3" /> Collector
      </button>
      <button
        onClick={() => handleSwitch('admin')}
        className={'px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ' +
          (user?.role === 'admin' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800')
        }
      >
        <Shield className="w-3 h-3" /> Admin
      </button>
    </aside>
  );
}
