import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Recycle, Bell, CheckCircle2, LogOut, MapPin, BarChart3, Truck, PlusCircle, Award, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to={
              user
                ? user.role === 'citizen'
                  ? '/citizen-dashboard'
                  : user.role === 'collector'
                  ? '/collector-dashboard'
                  : '/admin-dashboard'
                : '/'
            }
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
              <Recycle className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                Waste<span className="text-emerald-600">Wise</span>
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase block -mt-1">
                Smart Clean Cities
              </span>
            </div>
          </Link>

          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
            {!user && (
              <Link to="/" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition">
                Home
              </Link>
            )}

            {user?.role === 'citizen' && (
              <>
                <Link to="/report" className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition">
                  <PlusCircle className="w-4 h-4" />
                  Report Waste
                </Link>
                <Link to="/citizen-dashboard" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition">
                  My Dashboard
                </Link>
              </>
            )}

            {user?.role === 'collector' && (
              <Link to="/collector-dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition">
                <Truck className="w-4 h-4" />
                Tasks Console
              </Link>
            )}

            {user?.role === 'admin' && (
              <>
                <Link to="/admin-dashboard" className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-purple-600 hover:bg-purple-50 transition">
                  Dashboard
                </Link>
                <Link to="/track-drivers" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition">
                  <Truck className="w-4 h-4 text-blue-600" />
                  Track Drivers
                </Link>
                <Link to="/admin-map" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 transition">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Live Waste Map
                </Link>
                <Link to="/analytics" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-teal-50 transition">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  Analytics
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'citizen' && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{user.ecoPoints || 50} Eco Pts</span>
                  </div>
                )}

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-emerald-600 hover:underline font-medium">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => markAsRead(n._id)}
                              className={'p-3 hover:bg-slate-50 cursor-pointer transition flex items-start gap-2.5 ' + (!n.read ? 'bg-emerald-50/50' : '')}
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                                <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-300 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user.name}</p>
                    <p className="text-[10px] uppercase font-semibold text-emerald-600">{user.role}</p>
                  </div>
                  <button onClick={handleLogout} title="Logout" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
                  Sign In
                </Link>
                <Link to="/register" className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition">
                  Register
                </Link>
              </div>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {!user && (
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-emerald-50">
              Home
            </Link>
          )}
          {user?.role === 'citizen' && (
            <>
              <Link to="/report" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-bold text-emerald-600 bg-emerald-50">
                🚨 Report Waste
              </Link>
              <Link to="/citizen-dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-emerald-50">
                Citizen Dashboard
              </Link>
            </>
          )}
          {user?.role === 'collector' && (
            <Link to="/collector-dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-bold text-blue-700 bg-blue-50">
              Collector Tasks
            </Link>
          )}
          {user?.role === 'admin' && (
            <>
              <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700">
                Admin Dashboard
              </Link>
              <Link to="/track-drivers" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-bold text-blue-700 bg-blue-50">
                🚛 Track Drivers
              </Link>
              <Link to="/admin-map" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700">
                Live Waste Map
              </Link>
              <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700">
                Analytics
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
