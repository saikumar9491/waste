import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import MapComponent from '../components/MapComponent';
import { MapPin, Truck, AlertTriangle } from 'lucide-react';

export default function AdminMap() {
  const [complaints, setComplaints] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [recommendedCollectors, setRecommendedCollectors] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    try {
      const [compRes, colRes] = await Promise.all([api.get('/complaints'), api.get('/collectors')]);
      if (compRes.data.success) setComplaints(compRes.data.complaints);
      if (colRes.data.success) {
        const formatted = colRes.data.collectors.map((c) => ({
          _id: c._id,
          userId: c.userId?._id,
          name: c.userId?.name || 'Collector',
          phone: c.userId?.phone || '+91 98765 00000',
          vehicle: c.vehicle,
          availability: c.availability,
          latitude: c.latitude,
          longitude: c.longitude
        }));
        setCollectors(formatted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectComplaint = async (c) => {
    setSelectedComplaint(c);
    try {
      const { data } = await api.get('/complaints/' + c._id);
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
        fetchMapData();
      }
    } catch (err) {
      toast.error('Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const displayedComplaints = complaints.filter((c) => {
    if (filterPriority === 'all') return true;
    return c.priority === filterPriority;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">GEOSPATIAL COMMAND</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Live Waste & Fleet Map</h1>
          <p className="text-xs text-slate-500 mt-1">Color-coded markers indicate live priority levels. Click pins to assign trucks.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Truck</span>
          </div>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Show All Priorities</option>
            <option value="CRITICAL">🔴 Critical Only</option>
            <option value="HIGH">🟠 High Only</option>
            <option value="MEDIUM">🟡 Medium Only</option>
            <option value="LOW">🟢 Low Only</option>
          </select>

          <Link
            to="/track-drivers"
            className="px-3.5 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Track Drivers Fleet</span>
          </Link>
        </div>
      </div>

      <div className="h-[560px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative">
        <MapComponent
          center={[31.2210, 75.7720]}
          zoom={14}
          height="560px"
          complaints={displayedComplaints}
          collectors={collectors}
          onComplaintSelect={handleSelectComplaint}
        />
      </div>

      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">SMART DISPATCH</span>
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
              <p className="text-xs font-bold text-slate-700 uppercase">Nearest Available Collectors (Proximity):</p>
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
                          📍 Distance: {col.distance || '2.1'} km away • Tasks: {col.assignedTasks || 0}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
