import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, Navigation, Radio, Network, AlertTriangle, ArrowRight, CheckCircle2, HeartPulse, Building2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PortalSelectPage() {
  const navigate = useNavigate();
  const { switchRole, networkEdges, publicReports, vehicles } = useApp();

  const blockedCount = networkEdges.filter(e => e.status === 'blocked').length;
  const pendingReportsCount = publicReports.filter(r => r.status === 'pending').length;

  const handleSelectAdmin = () => {
    switchRole('admin');
    navigate('/admin');
  };

  const handleSelectUser = () => {
    switchRole('user');
    navigate('/user');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Banner */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl text-white shadow-lg shadow-blue-500/25">
            🚑
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
              Emergency Route & Network Resilience Analyzer
            </h1>
            <p className="text-xs text-blue-600 font-medium">Smart Traffic Authority & Citizen Emergency Navigation System</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-blue-100 shadow-xs text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Road Network: <strong>30 Edges · 18 Nodes</strong></span>
        </div>
      </header>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center my-6 sm:my-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-4 border border-blue-200">
            Role-Based Access Control Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Select Your Designated Portal
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-2xl mx-auto leading-relaxed">
            Welcome to the centralized platform for dynamic emergency routing, live road status management, and algorithmic network resilience analysis.
          </p>
        </motion.div>
      </div>

      {/* 2 Portal Choice Cards */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 my-auto">
        {/* 1. Admin Portal */}
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border-2 border-blue-900/20 hover:border-blue-600 p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-600/10 transition-all flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/5 rounded-full -translate-y-12 translate-x-12" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F2038] to-[#1E3A5F] flex items-center justify-center text-3xl shadow-md">
                👨‍💼
              </div>
              <span className="text-xs font-mono font-bold bg-blue-900 text-blue-100 px-3 py-1 rounded-full">
                FULL AUTHORITY
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
              Admin Portal
            </h3>
            <p className="text-xs font-semibold text-blue-600 mb-3">Traffic Authorities & Emergency Dispatchers</p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Complete access to manage the entire city road network, dynamically block roads, review citizen incident reports, track emergency vehicles with live GPS, and run graph resilience algorithms.
            </p>

            <div className="space-y-2 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Authority Capabilities:</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />
                  <span><strong>Road Management:</strong> Block, congest, or reopen any road edge</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />
                  <span><strong>Incident Review:</strong> Verify public reports with 1-click road blockage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />
                  <span><strong>Network Resilience:</strong> Tarjan's articulation points & bridge edges</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />
                  <span><strong>Live GPS Tracking:</strong> Fleet telemetry, siren controls, and dispatching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0" />
                  <span><strong>User Management:</strong> Role permissions & department credentials</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleSelectAdmin}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#0F2038] to-[#1E3A5F] hover:from-blue-700 hover:to-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 group-hover:shadow-blue-600/30 transition-all cursor-pointer"
          >
            <span>Enter Admin Command Portal</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* 2. User Portal */}
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl border-2 border-sky-300 hover:border-sky-500 p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-sky-500/10 transition-all flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-sky-400/10 rounded-full -translate-y-12 translate-x-12" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-3xl shadow-md text-white">
                👤
              </div>
              <span className="text-xs font-mono font-bold bg-sky-100 text-sky-800 px-3 py-1 rounded-full border border-sky-200">
                CITIZEN & PUBLIC
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
              User Portal
            </h3>
            <p className="text-xs font-semibold text-sky-600 mb-3">Citizens, Drivers & Emergency Callers</p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
              Safe public-facing interface to find fastest routes, request immediate emergency guidance to nearby trauma facilities, report accidents or road floods, and check verified road condition advisories.
            </p>

            <div className="space-y-2 mb-8 bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Public Features:</h4>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sky-600 flex-shrink-0" />
                  <span><strong>Interactive Route Finder:</strong> Calculate shortest routes with live traffic</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sky-600 flex-shrink-0" />
                  <span><strong>Emergency Assistance:</strong> 1-tap fastest route to nearest trauma hospital</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sky-600 flex-shrink-0" />
                  <span><strong>Incident Reporting:</strong> Report floods/accidents with photo upload simulation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sky-600 flex-shrink-0" />
                  <span><strong>Road Conditions Feed:</strong> View verified road closures and avoid congestion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-sky-600 flex-shrink-0" />
                  <span><strong>Alternative Routes:</strong> Explore detours when main arterial roads are blocked</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleSelectUser}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 group-hover:shadow-sky-600/35 transition-all cursor-pointer"
          >
            <span>Enter Citizen Portal</span>
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto text-center py-6 text-xs text-slate-500">
        <p>You can seamlessly switch between portals at any time using the header toggle button.</p>
        <p className="mt-1 text-slate-400">Powered by Dijkstra's Algorithm, A* Heuristic Search & NetworkX-equivalent Graph Resilience Analysis.</p>
      </footer>
    </div>
  );
}
