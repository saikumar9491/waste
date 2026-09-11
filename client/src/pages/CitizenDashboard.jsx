import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import WasteTypeBadge from '../components/WasteTypeBadge';
import { PlusCircle, Award, Clock, CheckCircle2, AlertCircle, ArrowRight, MapPin, Sparkles, Filter } from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchComplaints();
  }, [filterStatus]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all' ? '/complaints?myComplaints=true' : '/complaints?myComplaints=true&status=' + filterStatus;
      const { data } = await api.get(url);
      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold text-emerald-300 tracking-wider">CITIZEN PORTAL</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Welcome back, {user?.name || 'Citizen'} 👋</h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
            Track your waste reports, earn Eco Points for clean reporting, and see verified resolutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
            <p className="text-xs text-emerald-200 font-semibold">Eco Points</p>
            <p className="text-2xl font-black text-white">{user?.ecoPoints || 420}</p>
          </div>
          <Link
            to="/report"
            className="px-5 py-3 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Report Waste</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase">Total Reports</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{complaints.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase">Pending</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{pendingCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase">In Progress</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{inProgressCount}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Your Waste Reports</h2>
          <p className="text-xs text-slate-500">Real-time status updates and verified clean resolution proof</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {['all', 'Pending', 'Assigned', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={'px-3 py-1.5 rounded-lg transition ' +
                (filterStatus === tab ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800')
              }
            >
              {tab === 'all' ? 'All Reports' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Complaint Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800">No Complaints Found</h3>
          <p className="text-xs text-slate-500">You haven't submitted any reports matching this filter yet.</p>
          <Link
            to="/report"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            <PlusCircle className="w-4 h-4" /> Report Waste
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Image Thumbnail */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img src={getMediaUrl(c.imageUrl)} alt="Waste report" className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <WasteTypeBadge type={c.wasteType} />
                  </div>
                  <div className="absolute top-3 right-3">
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500">{c.complaintId}</span>
                    <StatusBadge status={c.status} />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                    {c.aiSummary || c.description || 'Waste reported at ' + c.address}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </p>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex justify-between">
                    <span>AI Confidence: <b className="text-emerald-700">{c.confidence}%</b></span>
                    <span>Reported: {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={'/complaint/' + c._id}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-black text-white transition flex items-center justify-center gap-1.5"
                >
                  <span>View Details & Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
