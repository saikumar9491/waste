import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  MapPin,
  Sparkles,
  Truck,
  Recycle,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Leaf,
  Award,
  Clock,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFeatureClick = (featureTitle, targetPath) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(targetPath);
    }
  };

  return (
    <div className="space-y-20 pb-20">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-emerald-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-POWERED SMART MUNICIPAL TECH</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Cleaner Cities. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Smarter Collection.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            AI-powered waste reporting and intelligent collection management for cleaner, healthier communities.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleFeatureClick('Report Waste Incident', '/report')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-extrabold text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>🚨 Report Waste</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() =>
                handleFeatureClick(
                  'Dashboard Console',
                  user?.role === 'admin'
                    ? '/admin-dashboard'
                    : user?.role === 'collector'
                    ? '/collector-dashboard'
                    : '/citizen-dashboard'
                )
              }
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-extrabold text-base bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>📊 View Dashboard</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">1,240+</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Waste Reports</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600">1,153+</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Issues Resolved</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-3xl sm:text-4xl font-black text-teal-600">87%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Collection Efficiency</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-3xl sm:text-4xl font-black text-blue-600">2.4T</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">Waste Managed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow (Interactive - Asks Login if clicked) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Automated Ecosystem</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">How WasteWise Works</p>
          <p className="text-sm text-slate-500 mt-2">
            Click any step to test the end-to-end intelligence workflow
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { step: '01', title: 'Detect', icon: Camera, desc: 'Capture photo with mobile camera', color: 'from-emerald-500 to-emerald-600', path: '/report' },
            { step: '02', title: 'Analyze', icon: Sparkles, desc: 'AI classifies type & priority', color: 'from-teal-500 to-teal-600', path: '/report' },
            { step: '03', title: 'Locate', icon: MapPin, desc: 'Precision GPS coordinates & map pin', color: 'from-cyan-500 to-cyan-600', path: '/report' },
            { step: '04', title: 'Collect', icon: Truck, desc: 'Smart dispatch to nearest collector', color: 'from-blue-500 to-blue-600', path: '/collector-dashboard' },
            { step: '05', title: 'Recycle', icon: Recycle, desc: 'Upload proof & award citizen points', color: 'from-emerald-600 to-green-600', path: '/citizen-dashboard' }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                onClick={() => handleFeatureClick(`Step ${item.step}: ${item.title}`, item.path)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition text-center relative group cursor-pointer"
              >
                <span className="text-[10px] font-black text-slate-400 block mb-2">{item.step}</span>
                <div className={'w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr ' + item.color + ' text-white flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition'}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                <span className="text-[10px] font-bold text-emerald-600 mt-3 inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                  Try Feature <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Deep Dive (Interactive - Prompts login) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div
            onClick={() => handleFeatureClick('AI Waste Detection', '/report')}
            className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:scale-[1.02] transition cursor-pointer group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3 flex items-center justify-between">
                <span>AI Waste Detection</span>
                <ChevronRight className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Our vision model recognizes Plastic, Organic, E-Waste, Hazardous, and Metal waste in milliseconds with 90%+ confidence.
              </p>
            </div>
            <div className="mt-8 bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-xs">
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-200">🤖 AI Analysis</span>
                <span className="text-emerald-400">94% Confidence</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full w-[94%]"></div>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Detected: High density single-use polymer</p>
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => handleFeatureClick('Smart Priority Triage', '/report')}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:scale-[1.02] hover:border-amber-300 transition cursor-pointer group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Smart Priority Engine</span>
                <ChevronRight className="w-5 h-5 text-amber-600 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Complaints are prioritized based on waste severity, public area density, and hazard levels: Critical, High, Medium, or Low.
              </p>
            </div>
            <div className="mt-8 bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs">
              <span className="font-extrabold text-amber-800 uppercase block mb-1">🚨 AI Priority: HIGH</span>
              <p className="text-amber-900 text-xs">Reason: Large accumulation detected in commercial zone with pedestrian foot traffic.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => handleFeatureClick('Smart Fleet Dispatching', '/admin-map')}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:scale-[1.02] hover:border-blue-300 transition cursor-pointer group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Smart Dispatching</span>
                <ChevronRight className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Haversine geospatial calculations instantly recommend the nearest available collector truck with capacity to resolve tasks faster.
              </p>
            </div>
            <div className="mt-8 bg-blue-50 p-4 rounded-xl border border-blue-200 text-xs">
              <span className="font-bold text-blue-900 block mb-1">🚛 Recommended: Raj Kumar</span>
              <p className="text-blue-700">Distance: 2.1 km away • Vehicle: Truck-12 • Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Impact Counter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700 text-emerald-200 text-xs font-bold mb-4">
              <Leaf className="w-3.5 h-3.5" />
              ESTIMATED SUSTAINABILITY IMPACT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Making Real-World Environmental Change</h2>
            <p className="mt-3 text-emerald-100 text-sm sm:text-base leading-relaxed">
              Every verified collection diverts reusable materials from overflowing landfills, reducing city greenhouse emissions.
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-emerald-700/60">
              <div>
                <p className="text-2xl sm:text-3xl font-black">2,430 kg</p>
                <p className="text-xs text-emerald-200 mt-1">♻️ Waste Managed</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black">1,820 kg</p>
                <p className="text-xs text-emerald-200 mt-1">🌱 CO₂ Impact Avoided</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black">1,153</p>
                <p className="text-xs text-emerald-200 mt-1">🚛 Collections Verified</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black">820 kg</p>
                <p className="text-xs text-emerald-200 mt-1">♻️ Recyclables Diverted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section (Interactive - Prompts login) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-500" />
                <h3 className="text-xl font-extrabold text-slate-900">Eco Champions Leaderboard</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Citizens earning points by actively spotting and resolving community waste</p>
            </div>
            <button
              onClick={() => handleFeatureClick('Eco Champions Leaderboard', '/citizen-dashboard')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Your Rank & Points</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { rank: '1', name: 'Rahul Verma', points: '980 pts', badge: '🌟 Legendary Recycler', bg: 'bg-amber-50 border-amber-200' },
              { rank: '2', name: 'Priya Sharma', points: '850 pts', badge: '🏆 Eco Champion', bg: 'bg-slate-50 border-slate-200' },
              { rank: '3', name: 'Aman Deep', points: '720 pts', badge: '🎖️ Green Crusader', bg: 'bg-orange-50 border-orange-200' }
            ].map((champ) => (
              <div
                key={champ.rank}
                onClick={() => handleFeatureClick('Eco Champions Leaderboard', '/citizen-dashboard')}
                className={'p-5 rounded-2xl border ' + champ.bg + ' flex items-center gap-4 hover:shadow-xs transition cursor-pointer'}
              >
                <div className="w-10 h-10 rounded-full bg-white font-black text-sm flex items-center justify-center shadow-xs text-slate-800">
                  #{champ.rank}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{champ.name}</h4>
                  <p className="text-xs font-bold text-emerald-600">{champ.points}</p>
                  <p className="text-[11px] text-slate-500">{champ.badge}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
