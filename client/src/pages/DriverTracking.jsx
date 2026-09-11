import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import L from 'leaflet';
import {
  Truck,
  MapPin,
  Navigation,
  Phone,
  BatteryCharging,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Compass,
  Radio,
  ArrowLeft,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function DriverTracking() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [simulatingId, setSimulatingId] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routesGroupRef = useRef(null);

  // Fetch driver telemetry from backend
  const fetchDrivers = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const { data } = await api.get('/collectors/tracking');
      if (data.success) {
        setDrivers(data.drivers);
        if (!selectedDriverId && data.drivers.length > 0) {
          setSelectedDriverId(data.drivers[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch driver tracking:', err);
      if (!quiet) toast.error('Failed to load live driver telemetry');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Auto-refresh telemetry every 6 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchDrivers(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([31.2210, 75.7720], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    markersGroupRef.current = L.featureGroup().addTo(map);
    routesGroupRef.current = L.featureGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map markers and route polylines when drivers change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current || !routesGroupRef.current) return;

    markersGroupRef.current.clearLayers();
    routesGroupRef.current.clearLayers();

    drivers.forEach((driver) => {
      if (!driver.latitude || !driver.longitude) return;

      const isSelected = selectedDriverId === driver._id;

      // Custom animated truck icon
      const truckHtml = `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          ${
            driver.availability === 'On Task'
              ? '<div style="position:absolute; inset:0; border-radius:9999px; background:#3b82f6; opacity:0.35; animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>'
              : ''
          }
          <div style="width:38px; height:38px; border-radius:9999px; background:${
            isSelected ? '#1e40af' : '#2563eb'
          }; color:white; border:3px solid white; box-shadow:0 10px 15px -3px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:18px; transform:${
        isSelected ? 'scale(1.15)' : 'scale(1)'
      }; transition:transform 0.2s ease;">
            🚛
          </div>
        </div>
      `;

      const truckIcon = L.divIcon({
        html: truckHtml,
        className: 'driver-truck-pin',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });

      const driverMarker = L.marker([driver.latitude, driver.longitude], { icon: truckIcon }).addTo(
        markersGroupRef.current
      );

      // Popup with driver telemetry
      const popupHtml = `
        <div style="font-family:sans-serif; min-width:210px; padding:2px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <div style="font-size:13px; font-weight:800; color:#0f172a;">${driver.name}</div>
            <span style="font-size:10px; font-weight:bold; padding:2px 6px; border-radius:6px; background:${
              driver.availability === 'On Task' ? '#dbeafe; color:#1e40af' : '#f1f5f9; color:#475569'
            };">${driver.availability}</span>
          </div>
          <div style="font-size:11px; color:#475569; margin-bottom:4px;"><b>Vehicle:</b> ${driver.vehicle} (${driver.plateNumber})</div>
          <div style="font-size:11px; color:#475569; margin-bottom:4px;"><b>Speed:</b> ${driver.speed || 0} km/h • <b>Battery:</b> ${driver.batteryLevel || 85}%</div>
          <div style="font-size:11px; color:#475569; margin-bottom:8px;"><b>Location:</b> ${driver.currentAddress}</div>
          ${
            driver.activeTask
              ? `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px; margin-bottom:8px;">
              <div style="font-size:10px; font-weight:bold; color:#059669; text-transform:uppercase;">En Route to Pickup</div>
              <div style="font-size:11px; font-weight:bold; color:#0f172a;">${driver.activeTask.complaintId} • ${driver.activeTask.wasteType}</div>
              <div style="font-size:10px; color:#64748b;">${driver.activeTask.distanceKm || '1.2'} km away (ETA ~${driver.activeTask.etaMinutes || '4'} mins)</div>
            </div>
            `
              : ''
          }
        </div>
      `;
      driverMarker.bindPopup(popupHtml);

      driverMarker.on('click', () => {
        setSelectedDriverId(driver._id);
      });

      // If driver has an active assigned task, draw destination marker & route polyline
      if (driver.activeTask && driver.activeTask.latitude && driver.activeTask.longitude) {
        const destIcon = L.divIcon({
          html: `
            <div style="width:30px; height:30px; border-radius:9999px; background:#ef4444; color:white; border:2px solid white; box-shadow:0 4px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:bold;">
              📍
            </div>
          `,
          className: 'dest-pin',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const destMarker = L.marker([driver.activeTask.latitude, driver.activeTask.longitude], {
          icon: destIcon
        }).addTo(markersGroupRef.current);

        destMarker.bindPopup(`
          <div style="font-family:sans-serif; min-width:180px;">
            <div style="font-size:12px; font-weight:bold; color:#dc2626;">Destination: ${driver.activeTask.complaintId}</div>
            <div style="font-size:11px; color:#475569; margin:3px 0;">${driver.activeTask.address}</div>
            <div style="font-size:11px; color:#059669; font-weight:bold;">Assigned to: ${driver.name}</div>
          </div>
        `);

        // Route line from truck to waste incident
        L.polyline(
          [
            [driver.latitude, driver.longitude],
            [driver.activeTask.latitude, driver.activeTask.longitude]
          ],
          {
            color: isSelected ? '#2563eb' : '#94a3b8',
            weight: isSelected ? 4 : 2,
            dashArray: isSelected ? '6, 8' : '4, 6',
            opacity: isSelected ? 0.9 : 0.6
          }
        ).addTo(routesGroupRef.current);
      }
    });
  }, [drivers, selectedDriverId]);

  // Focus map on selected driver
  const handleFocusDriver = (driver) => {
    setSelectedDriverId(driver._id);
    if (mapInstanceRef.current && driver.latitude && driver.longitude) {
      mapInstanceRef.current.flyTo([driver.latitude, driver.longitude], 15, {
        animate: true,
        duration: 1.2
      });
    }
  };

  // Simulate live GPS driver movement along the route towards destination
  const handleSimulateMovement = async (driver) => {
    if (!driver.activeTask || !driver.activeTask.latitude || !driver.activeTask.longitude) {
      toast.error('Driver does not have an active task destination to route towards.');
      return;
    }

    setSimulatingId(driver._id);
    try {
      // Step 20% closer towards the destination coordinates
      const targetLat = driver.activeTask.latitude;
      const targetLng = driver.activeTask.longitude;

      const newLat = Number((driver.latitude + (targetLat - driver.latitude) * 0.25).toFixed(6));
      const newLng = Number((driver.longitude + (targetLng - driver.longitude) * 0.25).toFixed(6));
      const newSpeed = Math.floor(Math.random() * 15) + 25; // 25-40 km/h

      const { data } = await api.put(`/collectors/${driver._id}/location`, {
        latitude: newLat,
        longitude: newLng,
        speed: newSpeed,
        availability: 'On Task',
        currentAddress: `En Route on Main Arterial (${newLat}, ${newLng})`
      });

      if (data.success) {
        toast.success(`GPS ping updated! ${driver.name} is moving towards ${driver.activeTask.complaintId}.`);
        await fetchDrivers(true);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([newLat, newLng]);
        }
      }
    } catch (err) {
      console.error('Movement simulation failed:', err);
      toast.error('Failed to update GPS telemetry');
    } finally {
      setSimulatingId(null);
    }
  };

  const selectedDriver = drivers.find((d) => d._id === selectedDriverId) || drivers[0];

  const totalDrivers = drivers.length;
  const onTaskDrivers = drivers.filter((d) => d.availability === 'On Task').length;
  const availableDrivers = drivers.filter((d) => d.availability === 'Available').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin-dashboard"
              className="text-xs font-bold text-slate-500 hover:text-purple-600 transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              LIVE FLEET TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Driver & Vehicle Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time GPS coordinates, vehicle speed, active collection routes, and simulated telemetry
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Counter Pills */}
          <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1 text-slate-700">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              {totalDrivers} Total
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              {onTaskDrivers} On Task
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {availableDrivers} Available
            </span>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span>{autoRefresh ? 'Live Radar (6s)' : 'Live Off'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchDrivers()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-black text-white transition shadow-xs cursor-pointer"
            title="Refresh Fleet"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Map (Left/Center) + Driver Telemetry Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live GPS Map (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-4 rounded-3xl border border-slate-200 shadow-lg space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>City Fleet Telemetry Map</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Collector Truck
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Assigned Pickup
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 border-t-2 border-dashed border-blue-600"></span> Active Route
              </span>
            </div>
          </div>

          <div className="h-[560px] rounded-2xl overflow-hidden border border-slate-200 relative">
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

            {/* Floating Quick Action Overlay */}
            {selectedDriver && selectedDriver.activeTask && (
              <div className="absolute top-4 right-4 z-1000 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 max-w-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                    Selected Vehicle
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">{selectedDriver.plateNumber}</span>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-slate-900">{selectedDriver.name}</p>
                  <p className="text-[11px] text-slate-500">{selectedDriver.vehicle}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Speed: {selectedDriver.speed || 0} km/h</span>
                  <button
                    onClick={() => handleSimulateMovement(selectedDriver)}
                    disabled={simulatingId === selectedDriver._id}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{simulatingId === selectedDriver._id ? 'Moving...' : 'Simulate Move'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drivers Telemetry List & Details (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Driver Fleet List ({drivers.length})</span>
              <span className="text-xs font-semibold text-slate-400">Click to focus</span>
            </h3>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {drivers.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading active fleet...</div>
              ) : (
                drivers.map((driver) => {
                  const isSelected = selectedDriverId === driver._id;

                  return (
                    <div
                      key={driver._id}
                      onClick={() => handleFocusDriver(driver)}
                      className={`p-4 rounded-2xl border transition text-left cursor-pointer space-y-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Driver Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                            {driver.avatar ? (
                              <img
                                src={driver.avatar}
                                alt={driver.name}
                                className="w-full h-full rounded-2xl object-cover"
                              />
                            ) : (
                              driver.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
                              {driver.name}
                              <span className="text-[10px] text-amber-500 font-bold">★ {driver.rating || 4.8}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium">{driver.vehicle}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{driver.plateNumber}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            driver.availability === 'On Task'
                              ? 'bg-blue-100 text-blue-800'
                              : driver.availability === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {driver.availability}
                        </span>
                      </div>

                      {/* Telemetry Chips (Speed, Battery, Address) */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span>Speed: <b className="text-slate-800">{driver.speed || 0} km/h</b></span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Battery: <b className="text-slate-800">{driver.batteryLevel || 85}%</b></span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-start gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{driver.currentAddress || 'Sector 14 Arterial Road'}</span>
                      </div>

                      {/* Active Task Box */}
                      {driver.activeTask ? (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-blue-700 uppercase">Active Dispatch</span>
                            <span className="text-[10px] font-bold text-slate-500">{driver.activeTask.complaintId}</span>
                          </div>
                          <p className="font-semibold text-slate-800 text-[11px] truncate">
                            {driver.activeTask.wasteType} Waste • {driver.activeTask.address}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Distance: <b className="text-slate-700">{driver.activeTask.distanceKm} km</b> • ETA: <b className="text-slate-700">~{driver.activeTask.etaMinutes} mins</b>
                          </p>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/60 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Available for next dispatch triage</span>
                        </div>
                      )}

                      {/* Driver Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFocusDriver(driver);
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Navigation className="w-3 h-3 text-blue-600" />
                          <span>Focus Map</span>
                        </button>

                        {driver.activeTask && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateMovement(driver);
                            }}
                            disabled={simulatingId === driver._id}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{simulatingId === driver._id ? 'Moving...' : 'Simulate'}</span>
                          </button>
                        )}

                        <a
                          href={`tel:${driver.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                          title="Call Driver"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
