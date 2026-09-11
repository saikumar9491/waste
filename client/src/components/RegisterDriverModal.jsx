import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Truck, X, User, Mail, Lock, Phone, MapPin, Hash, Navigation, Loader2 } from 'lucide-react';

export default function RegisterDriverModal({ isOpen, onClose, onDriverAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('Truck-01 (Compactor)');
  const [vehicleType, setVehicleType] = useState('Truck');
  const [plateNumber, setPlateNumber] = useState('TS-09-UB-1001');
  const [address, setAddress] = useState('Central Municipal Depot');
  const [latitude, setLatitude] = useState(17.38504);
  const [longitude, setLongitude] = useState(78.48667);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(5)));
        setLongitude(Number(pos.coords.longitude.toFixed(5)));
        toast.success('GPS coordinates locked!');
      },
      () => toast.error('Could not retrieve GPS coordinates')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please enter name, email, and password.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/admin/drivers', {
        name,
        email,
        password,
        phone,
        vehicle,
        vehicleType,
        plateNumber,
        address,
        latitude,
        longitude
      });

      if (data.success) {
        toast.success(`Driver ${name} registered successfully!`);
        if (onDriverAdded) onDriverAdded(data.driver);
        onClose();
        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">FLEET ONBOARDING</span>
            <h3 className="text-xl font-extrabold text-slate-900">Register New Truck Driver</h3>
            <p className="text-xs text-slate-500">Create driver login credentials and configure their collection truck</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Driver Personal Information */}
          <div className="space-y-3">
            <p className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Driver Credentials (Login on Mobile)</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Driver Email (Login) *</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="driver@wastewise.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Truck / Vehicle Information */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <p className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              <span>Assigned Waste Vehicle</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vehicle Model / Call-Sign</label>
                <input
                  type="text"
                  placeholder="e.g. Truck-05 (Compactor)"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Truck">Truck (Standard Heavy)</option>
                  <option value="Compactor">Compactor (Hydraulic)</option>
                  <option value="Van">Van (Urban Alley)</option>
                  <option value="Electric Cart">Electric Cart (Zero Emission)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">License Plate Number</label>
                <input
                  type="text"
                  placeholder="e.g. TS-09-UB-4021"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Depot / Base Address</label>
                <input
                  type="text"
                  placeholder="e.g. Central Municipal Depot"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-700 block">Initial GPS Coordinates:</span>
                <span className="font-mono text-[11px] text-slate-500">{latitude}, {longitude}</span>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Navigation className="w-3 h-3 text-blue-600" />
                <span>My Location</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Registering...' : 'Register & Deploy Driver'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
