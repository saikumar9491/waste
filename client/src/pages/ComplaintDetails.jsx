import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import WasteTypeBadge from '../components/WasteTypeBadge';
import Timeline from '../components/Timeline';
import MapComponent from '../components/MapComponent';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Sparkles,
  Truck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get('/complaints/' + id);
        if (data.success) {
          setComplaint(data.complaint);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20 text-xs text-slate-400">Loading complaint details...</div>;
  }

  if (!complaint) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Complaint Not Found</h2>
        <Link to="/" className="text-xs font-bold text-emerald-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/citizen-dashboard"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{complaint.complaintId}</h1>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Reported on {new Date(complaint.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WasteTypeBadge type={complaint.wasteType} />
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            🤖 AI Confidence: {complaint.confidence}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Before/After Photos, Timeline, AI Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo Proof Section (Before vs After) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Visual Evidence & Collection Proof</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Before Photo */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                  📷 Reported Garbage (Before)
                </span>
                <div className="h-56 rounded-2xl overflow-hidden border border-slate-200 bg-black flex items-center justify-center">
                  <img src={complaint.imageUrl} alt="Before collection" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* After Photo (Proof) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  ✅ Clean Restoration (After)
                </span>
                {complaint.collectionProof?.imageUrl ? (
                  <div className="h-56 rounded-2xl overflow-hidden border border-emerald-300 bg-emerald-950 flex items-center justify-center">
                    <img src={complaint.collectionProof.imageUrl} alt="After collection proof" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-56 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-4 bg-slate-50">
                    <Clock className="w-8 h-8 text-slate-400 mb-2 animate-pulse" />
                    <p className="text-xs font-bold text-slate-600">Pending Collector Proof</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Collector will capture verification photo upon resolving this task.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {complaint.collectionProof?.notes && (
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold block mb-0.5">Collector Verification Notes:</span>
                <p className="italic leading-relaxed">{complaint.collectionProof.notes}</p>
              </div>
            )}
          </div>

          {/* AI Detection Deep Dive */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-extrabold uppercase text-slate-200">AI Intelligence Diagnostic</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Executive AI Summary:</span>
                <p className="font-bold text-sm text-emerald-300">
                  {complaint.aiSummary || 'Waste accumulation at ' + complaint.address}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 font-semibold">Priority Assessment Reason:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  {complaint.priorityReason || 'Large accumulation detected in high activity public sector.'}
                </p>
              </div>
            </div>
          </div>

          {/* Lifecycle Timeline */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-base text-slate-900">Complaint Lifecycle Progress</h3>
            <Timeline history={complaint.statusHistory || []} currentStatus={complaint.status} />
          </div>
        </div>

        {/* Right Col: Map, Location, Assigned Collector */}
        <div className="space-y-6">
          {/* Location & Map Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Incident GPS Location</h3>
            <p className="text-xs font-semibold text-slate-700 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{complaint.address}</span>
            </p>

            <div className="h-48 rounded-2xl overflow-hidden border border-slate-200">
              <MapComponent
                center={[complaint.latitude, complaint.longitude]}
                zoom={15}
                height="192px"
                complaints={[complaint]}
              />
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-500">
              Lat: {complaint.latitude} • Lng: {complaint.longitude}
            </div>
          </div>

          {/* Assigned Collector Details */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Assigned Collector</h3>
            {complaint.assignedCollector?.name ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{complaint.assignedCollector.name}</h4>
                    <p className="text-xs text-blue-600 font-semibold">{complaint.assignedCollector.vehicle}</p>
                    <p className="text-[11px] text-slate-500">{complaint.assignedCollector.phone}</p>
                  </div>
                </div>

                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Assigned on {new Date(complaint.assignedCollector.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                <p>No collector assigned yet.</p>
                <p className="text-[11px] text-slate-500 mt-1">Admin will assign the nearest available truck shortly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
