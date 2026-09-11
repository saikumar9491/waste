import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import WasteTypeBadge from '../components/WasteTypeBadge';
import {
  BarChart3,
  MapPin,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  TrendingUp,
  Eye
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [advisory, setAdvisory] = useState(null);
  const [filterPriority, setFilterPriority] = useState('all');
  const [search, setSearch] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [recommendedCollectors, setRecommendedCollectors] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, compRes, colRes, hotRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/complaints'),
        api.get('/collectors'),
        api.get('/admin/hotspots')
      ]);

      if (dashRes.data.success) setStats(dashRes.data.stats);
      if (compRes.data.success) setComplaints(compRes.data.complaints);
      if (colRes.data.success) setCollectors(colRes.data.collectors);
      if (hotRes.data.success) {
        setHotspots(hotRes.data.hotspots);
        setAdvisory(hotRes.data.predictiveAdvisory);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenAssign = async (complaint) => {
    setSelectedComplaint(complaint);
    try {
      const { data } = await api.get('/complaints/' + complaint._id);
      if (data.success && data.recommendedCollectors) {
        setRecommendedCollectors(data.recommendedCollectors);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssign = async (col) => {
    if (!selectedComplaint) return;
    setAssigning(true);
    try {
      const { data } = await api.put('/complaints/' + selectedComplaint._id + '/assign', {
        collectorId: col.userId?._id || col.userId,
        name: col.name,
        phone: col.phone,
        vehicle: col.vehicle
      });
      if (data.success) {
        toast.success('Assigned ' + col.name + ' to ' + selectedComplaint.complaintId + '!');
        setSelectedComplaint(null);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (search.trim() !== '') {
      const term = search.toLowerCase();
      return (
        c.complaintId.toLowerCase().includes(term) ||
        (c.address && c.address.toLowerCase().includes(term)) ||
        (c.wasteType && c.wasteType.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            MUNICIPAL COMMAND CONSOLE
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">Smart Waste Management Admin</h1>
          <p className="text-xs text-slate-500 mt-1">Live complaint dispatching, IoT telemetry, and automated routing</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/track-drivers"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>Track Drivers</span>
          </Link>
          <Link
            to="/admin-map"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>Open Live Map</span>
          </Link>
          <Link
            to="/analytics"
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-black text-white shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Full Analytics</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Reports</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{stats?.totalReports || complaints.length}</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +14% this month
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-amber-600 uppercase">Pending Review</p>
          <p className="text-3xl font-black text-amber-600 mt-1">{stats?.pending || 4}</p>
          <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-2">
            <Clock className="w-3.5 h-3.5" /> Awaiting collector dispatch
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-emerald-600 uppercase">Resolved Issues</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{stats?.resolved || 3}</p>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" /> Proof photos verified
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-teal-600 uppercase">Efficiency Rate</p>
          <p className="text-3xl font-black text-teal-600 mt-1">{stats?.efficiency || 92}%</p>
          <span className="text-[11px] text-teal-600 font-bold flex items-center gap-1 mt-2">
            <Sparkles className="w-3.5 h-3.5" /> AI priority response
          </span>
        </div>
      </div>

      {/* Smart Hotspot & Predictive Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-800 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              🔥 Smart Hotspot Detected
            </span>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              47 Reports this week
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900">Market Area & Bazaar Circle</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Concentrated plastic overflow identified near food stalls. Auto-dispatch frequency increased for this zone.
          </p>
        </div>

        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-teal-800 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-teal-600" />
              📈 Predictive Collection Advisory
            </span>
            <span className="text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
              Tomorrow 07:00 AM
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900">Market Road Pre-Sweep</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Based on historical patterns, Market Road will exceed bin capacity by 11:30 AM. Pre-schedule Truck-12.
          </p>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Live Waste Complaints Telemetry</h2>
            <p className="text-xs text-slate-500">Monitor citizen reports, review AI analysis, and dispatch collectors</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ID or location..."
                className="pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="p-4">Complaint ID</th>
                <th className="p-4">Location</th>
                <th className="p-4">Waste Type</th>
                <th className="p-4">AI Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Collector</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-400">
                    No complaints match your criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">{c.complaintId}</td>
                    <td className="p-4 font-medium text-slate-700 max-w-[200px] truncate">{c.address}</td>
                    <td className="p-4">
                      <WasteTypeBadge type={c.wasteType} />
                    </td>
                    <td className="p-4">
                      <PriorityBadge priority={c.priority} pulse={c.priority === 'CRITICAL'} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {c.assignedCollector?.name ? (
                        <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
                          <Truck className="w-3.5 h-3.5" />
                          {c.assignedCollector.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenAssign(c)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 text-[11px]"
                        >
                          <Truck className="w-3 h-3" />
                          {c.status === 'Pending' ? 'Smart Assign' : 'Reassign'}
                        </button>
                        <Link
                          to={'/complaint/' + c._id}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">SMART DISPATCH ENGINE</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Assign Collector to {selectedComplaint.complaintId}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{selectedComplaint.address}</p>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 uppercase">Nearest Available Collectors (Haversine Sorted):</p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {recommendedCollectors.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">Loading nearby fleet...</div>
                ) : (
                  recommendedCollectors.map((col) => (
                    <div
                      key={col._id}
                      className={'p-4 rounded-2xl border transition flex items-center justify-between ' +
                        (col.isRecommended
                          ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20'
                          : 'bg-slate-50 border-slate-200')
                      }
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{col.name}</h4>
                          {col.isRecommended && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">
                          Vehicle: <b className="text-slate-800">{col.vehicle}</b> • Status: <b className="text-emerald-700">{col.availability}</b>
                        </p>
                        <p className="text-[11px] font-mono text-emerald-700 font-bold">
                          📍 Distance: {col.distance || '2.1'} km away • Active Tasks: {col.assignedTasks || 0}
                        </p>
                      </div>

                      <button
                        disabled={assigning}
                        onClick={() => handleAssign(col)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        {assigning ? 'Assigning...' : 'Assign'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
