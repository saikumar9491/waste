import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import MapComponent from '../components/MapComponent';
import PriorityBadge from '../components/PriorityBadge';
import WasteTypeBadge from '../components/WasteTypeBadge';
import {
  Camera,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ArrowRight,
  RefreshCw,
  Info,
  Navigation,
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function ReportWaste() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Photo & upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // GPS Location state
  const [coords, setCoords] = useState({ lat: 31.2210, lng: 75.7720 });
  const [address, setAddress] = useState('College Road, Phagwara, Punjab');
  const [locationLoading, setLocationLoading] = useState(false);

  // AI Pipeline State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState(null); // 'uploaded' | 'analyzing' | 'done'
  const [aiResult, setAiResult] = useState(null);

  // Description & Submit
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const fileInputRef = useRef(null);

  // Send real image to AI Service
  const analyzeWithAiService = async (file, previewUrl, customFilename = '') => {
    setImageFile(file);
    setImagePreview(previewUrl);
    setAiResult(null);
    setAiAnalyzing(true);
    setAiAnalysisStep('uploaded');

    setTimeout(() => {
      setAiAnalysisStep('analyzing');
    }, 400);

    try {
      const formData = new FormData();
      formData.append('image', file, customFilename || file.name);
      if (description) formData.append('description', description);

      const { data } = await api.post('/ai/classify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        setAiResult(data);
        setAiAnalysisStep('done');
        if (data.wasteDetected) {
          toast.success(`AI Detected: ${data.wasteType} Waste (${Math.round(data.confidence * 100)}% confidence)`);
        } else {
          toast.error('⚠️ No waste detected in this image.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('AI image analysis failed.');
      setAiResult({
        wasteDetected: false,
        wasteType: null,
        confidence: 0,
        description: 'Failed to analyze image with AI service.',
        priority: null,
        priorityReason: null
      });
      setAiAnalysisStep('done');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Handle Photo Selection / Camera Capture
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      analyzeWithAiService(file, reader.result, file.name);
    };
    reader.readAsDataURL(file);
  };

  // 1-Click Test Scenarios (Testing the exact 5 requirements)
  const testScenario = async (sampleFile, scenarioName) => {
    try {
      const sampleUrl = '/uploads/' + sampleFile;
      const res = await fetch(sampleUrl);
      const blob = await res.blob();
      const file = new File([blob], sampleFile, { type: 'image/jpeg' });
      analyzeWithAiService(file, sampleUrl, sampleFile);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load sample image');
    }
  };

  // Get Browser GPS Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setCoords({ lat, lng });
        setLocationLoading(false);

        fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng)
          .then((r) => r.json())
          .then((data) => {
            if (data && data.display_name) {
              setAddress(data.display_name.split(',').slice(0, 3).join(', '));
            }
          })
          .catch(() => {
            setAddress('GPS: ' + lat + ', ' + lng);
          });

        toast.success('📍 Precise GPS coordinates locked!');
      },
      (err) => {
        setLocationLoading(false);
        toast.error('Could not obtain GPS permission. You can drag the map pin manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Submit Complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagePreview || !imageFile) {
      toast.error('Please take or upload a garbage photo first');
      return;
    }

    if (!aiResult?.wasteDetected) {
      toast.error('Cannot report waste: No waste was detected in this image.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);
      formData.append('address', address);
      formData.append('description', description);
      formData.append('wasteTypeManual', aiResult.wasteType);
      formData.append('priorityManual', aiResult.priority);

      const { data } = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        setSubmittedComplaint(data.complaint);
        toast.success('Waste complaint registered: ' + data.complaint.complaintId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-2">
          <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          CITIZEN REPORT PORTAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Report Waste Incident</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
          Upload photo & GPS location. AI strictly validates if real waste is present before submission.
        </p>
      </div>

      {/* Success Modal View */}
      {submittedComplaint ? (
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Waste Report Submitted!</h2>
            <p className="text-xs text-slate-500 mt-1">Thank you for keeping our community clean.</p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 max-w-md mx-auto text-left space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Complaint ID:</span>
              <span className="font-mono font-bold text-emerald-700 text-base">{submittedComplaint.complaintId}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Waste Classification:</span>
              <WasteTypeBadge type={submittedComplaint.wasteType} />
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">AI Priority:</span>
              <PriorityBadge priority={submittedComplaint.priority} />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Status:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                {submittedComplaint.status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/complaint/' + submittedComplaint._id)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition flex items-center justify-center gap-2"
            >
              <span>Track Complaint Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSubmittedComplaint(null);
                setImagePreview(null);
                setImageFile(null);
                setAiResult(null);
                setDescription('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Camera Photo */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Take or Upload Photo</h3>
                  <p className="text-xs text-slate-500">Opens mobile camera or file picker</p>
                </div>
              </div>
              {imagePreview && !aiAnalyzing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake Photo
                </button>
              )}
            </div>

            {/* Hidden Input for camera */}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {!imagePreview ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-105 transition mb-3">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-base font-extrabold text-slate-800">📷 Take Photo</p>
                  <p className="text-xs text-slate-500 mt-1">Tap to capture with mobile camera or upload from computer</p>
                </div>

                {/* 5 Explicit Test Scenarios for Validation */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Test Image Validation Scenarios (1-Click):
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Test real AI triage</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => testScenario('sample-plastic.jpg', 'Plastic')}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/60 font-bold text-[11px] text-slate-800 text-center transition flex flex-col items-center gap-1"
                    >
                      <span className="text-base">🥤</span>
                      <span>Plastic Waste</span>
                      <span className="text-[9px] text-emerald-600 font-bold">Waste: YES</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => testScenario('sample-organic.jpg', 'Organic')}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-lime-400 hover:bg-lime-50/60 font-bold text-[11px] text-slate-800 text-center transition flex flex-col items-center gap-1"
                    >
                      <span className="text-base">🥬</span>
                      <span>Organic Waste</span>
                      <span className="text-[9px] text-lime-600 font-bold">Waste: YES</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => testScenario('sample-beach.jpg', 'Beach')}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 font-bold text-[11px] text-slate-800 text-center transition flex flex-col items-center gap-1"
                    >
                      <span className="text-base">🏖️</span>
                      <span>Clean Beach</span>
                      <span className="text-[9px] text-rose-500 font-bold">Waste: NO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => testScenario('sample-person.jpg', 'Person')}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 font-bold text-[11px] text-slate-800 text-center transition flex flex-col items-center gap-1"
                    >
                      <span className="text-base">👤</span>
                      <span>Person / Selfie</span>
                      <span className="text-[9px] text-rose-500 font-bold">Waste: NO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => testScenario('sample-building.jpg', 'Building')}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 font-bold text-[11px] text-slate-800 text-center transition flex flex-col items-center gap-1"
                    >
                      <span className="text-base">🏢</span>
                      <span>City Road</span>
                      <span className="text-[9px] text-rose-500 font-bold">Waste: NO</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image Preview Thumbnail */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-black flex items-center justify-center">
                  <img src={imagePreview} alt="Uploaded candidate" className="w-full h-full object-cover max-h-72" />
                </div>

                {/* AI Analysis Loading State Sequence */}
                {aiAnalyzing && (
                  <div className="bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 text-center space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">
                        {aiAnalysisStep === 'uploaded' ? '📷 Image uploaded' : '🤖 Analyzing image with AI Vision...'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Inspecting visual pixels for discarded materials, safety hazards, and volume...
                      </p>
                    </div>
                    <div className="w-48 mx-auto bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full animate-[pulse_1s_ease-in-out_infinite] w-3/4"></div>
                    </div>
                  </div>
                )}

                {/* AI RESULT DISPLAY (Only displayed when analysis finishes) */}
                {!aiAnalyzing && aiResult && (
                  <div>
                    {aiResult.wasteDetected ? (
                      /* CASE A: WASTE DETECTED */
                      <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-emerald-500/40 shadow-lg space-y-4 animate-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            <span className="text-sm font-extrabold tracking-wide uppercase text-slate-200">
                              🤖 AI Waste Analysis
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-md font-bold border border-emerald-500/30">
                            {aiResult.engine || 'Vision Engine'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Classification */}
                          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-400 font-semibold">Classification:</span>
                              <span className="text-xs font-black text-emerald-400">
                                {Math.round(aiResult.confidence * 100)}% Confidence
                              </span>
                            </div>
                            <div className="text-lg font-black text-white flex items-center gap-2 mt-1">
                              <WasteTypeBadge type={aiResult.wasteType} />
                            </div>
                            <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
                                style={{ width: Math.round(aiResult.confidence * 100) + '%' }}
                              ></div>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-2.5 leading-tight">
                              {aiResult.description}
                            </p>
                          </div>

                          {/* Priority */}
                          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-400 font-semibold">Calculated Priority:</span>
                              <PriorityBadge
                                priority={aiResult.priority}
                                pulse={aiResult.priority === 'HIGH' || aiResult.priority === 'CRITICAL'}
                              />
                            </div>
                            <p className="text-xs font-bold text-amber-300 mt-2">Triage Reason:</p>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                              {aiResult.priorityReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* CASE B: NO WASTE DETECTED */
                      <div className="bg-amber-50/90 border-2 border-amber-300 p-6 rounded-2xl shadow-md space-y-4 animate-in zoom-in-95">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-black text-amber-900 flex items-center gap-2">
                              <span>⚠️ No Waste Detected</span>
                            </h3>
                            <p className="text-xs font-semibold text-amber-800 mt-1">
                              "The image does not appear to contain recognizable waste."
                            </p>
                            <p className="text-xs text-slate-600 mt-2 bg-white/80 p-3 rounded-xl border border-amber-200 leading-relaxed">
                              <b>AI Observation:</b> {aiResult.description}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white/60 p-3 rounded-xl border border-amber-200 text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <span>
                            To ensure high data quality, reports cannot be filed without visible waste.
                          </span>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Retake / Upload Another Photo</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Automatic GPS Location */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-extrabold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Automatic GPS Location</h3>
                  <p className="text-xs text-slate-500">Detects your exact coordinates via browser</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs transition flex items-center gap-1.5"
              >
                <Navigation className={'w-3.5 h-3.5 ' + (locationLoading ? 'animate-spin' : '')} />
                <span>{locationLoading ? 'Detecting GPS...' : '📍 Get My Location'}</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-extrabold text-slate-800 flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  {address}
                </p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Latitude: {coords.lat} • Longitude: {coords.lng}
                </p>
              </div>
              <span className="text-[11px] text-slate-500 italic">
                * Drag the pin to adjust position if needed
              </span>
            </div>

            <div className="h-64 rounded-2xl overflow-hidden border border-slate-200">
              <MapComponent
                center={[coords.lat, coords.lng]}
                zoom={15}
                height="256px"
                draggableMarker={coords}
                onMarkerDragEnd={(newPos) => {
                  setCoords(newPos);
                  toast.success('Updated coordinates: ' + newPos.lat + ', ' + newPos.lng);
                }}
              />
            </div>
          </div>

          {/* STEP 3: Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-sm">
                3
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Additional Details (Optional)</h3>
                <p className="text-xs text-slate-500">AI automatically generates a concise action summary</p>
              </div>
            </div>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem (optional)... e.g. 'There is garbage everywhere near the market and it smells very bad...'"
              className="w-full p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* STEP 4: Submission Bar */}
          <div
            className={'p-6 rounded-3xl border transition flex flex-col sm:flex-row items-center justify-between gap-4 ' +
              (aiResult?.wasteDetected
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-slate-100 border-slate-300')
            }
          >
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  📷 Photo {imagePreview ? '✅' : '⏳'}
                </span>
                <span className="flex items-center gap-1">
                  📍 Location ✅
                </span>
                <span className="flex items-center gap-1">
                  🤖 Waste Detected:{' '}
                  {aiAnalyzing ? (
                    <span className="text-emerald-600 animate-pulse">Scanning...</span>
                  ) : aiResult ? (
                    aiResult.wasteDetected ? (
                      <span className="text-emerald-700">✅ YES ({aiResult.wasteType})</span>
                    ) : (
                      <span className="text-rose-600">❌ NO</span>
                    )
                  ) : (
                    <span className="text-slate-400">Waiting for photo</span>
                  )}
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                {aiResult && !aiResult.wasteDetected
                  ? '⚠️ Submission disabled: Upload an image containing visible waste to proceed.'
                  : 'Submitting will register this complaint and dispatch the nearest available collector.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || aiAnalyzing || !imagePreview || !aiResult?.wasteDetected}
              className={'w-full sm:w-auto px-8 py-4 rounded-xl font-extrabold text-sm sm:text-base transition flex items-center justify-center gap-2 ' +
                (aiResult?.wasteDetected && !submitting && !aiAnalyzing
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed')
              }
            >
              <span>{submitting ? 'Submitting Report...' : '🚀 REPORT WASTE'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
