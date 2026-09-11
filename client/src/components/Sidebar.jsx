import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, BarChart3, Truck, Users, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const adminLinks = [
    { name: 'Overview', path: '/admin-dashboard', icon: LayoutDashboard },
    { name: 'Live Waste Map', path: '/admin-map', icon: MapPin },
    { name: 'Analytics & KPIs', path: '/analytics', icon: BarChart3 },
    { name: 'Collectors Team', path: '/admin-dashboard#collectors', icon: Users }
  ];

  const collectorLinks = [
    { name: 'My Tasks', path: '/collector-dashboard', icon: Truck },
    { name: 'Active Map View', path: '/collector-dashboard#map', icon: MapPin }
  ];

  const links = user?.role === 'admin' ? adminLinks : collectorLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Console</p>
          <p className="text-sm font-extrabold text-slate-800 capitalize">{user?.role} Portal</p>
          <p className="text-xs text-emerald-600 font-medium truncate">{user?.name}</p>
        </div>

        <nav aria-label="Console Navigation" className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ' +
                  (active
                    ? 'bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
                }
              >
                <Icon className={'w-4 h-4 ' + (active ? 'text-emerald-600' : 'text-slate-400')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-3.5 rounded-xl border border-emerald-500/20">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
          <AlertCircle className="w-4 h-4 text-emerald-600" />
          <span>Smart Tip</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          High-priority waste reports trigger instant proximity routing to nearest available trucks.
        </p>
      </div>
    </aside>
  );
}
