import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { getMediaUrl } from '../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import WasteTypeBadge from '../components/WasteTypeBadge';
import {
  Truck,
  MapPin,
  Navigation,
  CheckCircle2,
  Camera,
  Clock,
  Play,
  Upload,
  RefreshCw,
  Eye,
  Calendar
} from 'lucide-react';

export default function CollectorDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proof Modal state
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);

  const proofInputRef = useRef(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/collectors/tasks');
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load collector tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = async (task) => {
    try {
      const { data } = await api.put('/collectors/tasks/' + task._id + '/status', {
        status: 'In Progress'
      });
      if (data.success) {
        toast.success('Task ' + task.complaintId + ' is now In Progress! En route.');
        fetchTasks();
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleOpenProofModal = (task) => {
    setSelectedTask(task);
    setProofFile(null);
    setProofPreview(null);
    setNotes('Area cleared completely, swept clean, sanitized, and waste transferred to truck.');
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Demo shortcut for desktop proof
  const loadDemoCleanProof = async () => {
    const demoUrl = getMediaUrl('/uploads/sample-clean.jpg');
    setProofPreview(demoUrl);
    try {
      const res = await fetch(demoUrl);
      const blob = await res.blob();
      const demoFile = new File([blob], 'demo-clean.jpg', { type: 'image/jpeg' });
      setProofFile(demoFile);
    } catch (e) {}
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofPreview && !proofFile) {
      toast.error('Please upload or capture a clean area proof photo');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (proofFile) {
        formData.append('proofImage', proofFile);
      }
      formData.append('notes', notes);

      const { data } = await api.post('/collectors/tasks/' + selectedTask._id + '/proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success('Collection Proof verified! Complaint marked as RESOLVED 🎉');
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload proof');
    } finally {
      setUploading(false);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status === 'Assigned' || t.status === 'In Progress');
  const completedTasks = tasks.filter((t) => t.status === 'Resolved' || t.status === 'Collected');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">COLLECTOR WORKSPACE</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Good Day, {user?.name || 'Raj Kumar'} 👋</h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Review assigned pick-ups, navigate to GPS waypoints, and upload collection verification proof photos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
            <p className="text-xs text-blue-200 font-semibold">Active Tasks</p>
            <p className="text-2xl font-black text-white">{pendingTasks.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
            <p className="text-xs text-blue-200 font-semibold">Completed</p>
            <p className="text-2xl font-black text-emerald-300">{completedTasks.length}</p>
          </div>
        </div>
      </div>

      {/* Active Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Assigned Pick-Up Tasks</h2>
            <p className="text-xs text-slate-500">Pick-ups dispatched by municipal admins based on your vehicle location</p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {pendingTasks.length} Pending Actions
          </span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading assigned tasks...</div>
        ) : pendingTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-md mx-auto space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-slate-800 text-sm">All Tasks Completed!</h3>
            <p className="text-xs text-slate-500">You have no active collection requests waiting at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img src={getMediaUrl(task.imageUrl)} alt="Waste task" className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <PriorityBadge priority={task.priority} pulse={task.priority === 'HIGH' || task.priority === 'CRITICAL'} />
                    </div>
                    <div className="absolute top-3 right-3">
                      <WasteTypeBadge type={task.wasteType} />
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-600">{task.complaintId}</span>
                      <StatusBadge status={task.status} />
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {task.aiSummary || task.description || 'Waste task'}
                    </h3>

                    <p className="text-xs text-slate-600 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{task.address}</span>
                    </p>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex justify-between font-medium">
                      <span>Proximity: <b className="text-blue-700">~2.1 km away</b></span>
                      <span>Assigned: {new Date(task.assignedCollector?.assignedAt || task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={'https://www.google.com/maps/dir/?api=1&destination=' + task.latitude + ',' + task.longitude}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600" />
                      <span>🗺️ Navigate</span>
                    </a>

                    {task.status === 'Assigned' ? (
                      <button
                        onClick={() => handleStartTask(task)}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Route</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenProofModal(task)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Proof</span>
                      </button>
                    )}
                  </div>

                  {task.status === 'In Progress' && (
                    <button
                      onClick={() => handleOpenProofModal(task)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-extrabold text-xs text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Collected (Add Proof)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed History Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-lg font-extrabold text-slate-900">Completed Collections Archive</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedTasks.map((t) => (
            <div key={t._id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-xs">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-emerald-950 shrink-0">
                <img src={getMediaUrl(t.collectionProof?.imageUrl || t.imageUrl)} alt="Clean proof" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[11px] font-bold text-slate-500">{t.complaintId}</span>
                <h4 className="font-bold text-xs text-slate-900 truncate">{t.address}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✅ Verified Resolved
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(t.resolvedAt || t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Collection Proof Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase">COLLECTION PROOF VERIFICATION</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Complete Task {selectedTask.complaintId}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{selectedTask.address}</p>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-4">
              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Clean Area Photo (After Collection)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={proofInputRef}
                  onChange={handleProofFileChange}
                  className="hidden"
                />

                {!proofPreview ? (
                  <div className="space-y-3">
                    <div
                      onClick={() => proofInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition group"
                    >
                      <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition" />
                      <p className="text-xs font-bold text-slate-800">📷 Upload / Take Clean Area Photo</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Proof that garbage has been collected</p>
                    </div>

                    <button
                      type="button"
                      onClick={loadDemoCleanProof}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs transition"
                    >
                      Use Sample Clean Proof Photo (Desktop Demo)
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-48 bg-black flex items-center justify-center">
                    <img src={proofPreview} alt="Proof preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => proofInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-3 py-1 rounded-lg bg-slate-900/80 text-white text-xs font-bold"
                    >
                      Retake
                    </button>
                  </div>
                )}
              </div>

              {/* Collector Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Collection Notes / Actions Taken
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{uploading ? 'Verifying...' : '✅ MARK AS COLLECTED'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
