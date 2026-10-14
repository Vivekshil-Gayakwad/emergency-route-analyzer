import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Ambulance,
  Flame,
  Volume2,
  VolumeX,
  Send,
  Navigation,
  Compass,
  BatteryCharging,
  Users,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import { useApp } from '../../context/AppContext';

export default function LiveTrackingPage() {
  const {
    vehicles,
    toggleSiren,
    dispatchVehicle,
    networkNodes,
    addNotification
  } = useApp();

  const [selectedVehicle, setSelectedVehicle] = useState(vehicles[0]);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchDest, setDispatchDest] = useState('');
  const [dispatchReason, setDispatchReason] = useState('Critical Medical Call');

  // Keep selected vehicle synced
  const activeVehicle = vehicles.find(v => v.id === selectedVehicle?.id) || vehicles[0];

  const handleDispatch = () => {
    if (!dispatchDest || !activeVehicle) return;
    dispatchVehicle(activeVehicle.id, dispatchDest, dispatchReason);
    setShowDispatchModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
              Fleet Telemetry
            </span>
            <span className="text-xs text-slate-400">Browser Geolocation & GPS Tracking</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Radio className="text-emerald-600 animate-pulse" size={26} />
            Live GPS Tracking & Emergency Vehicle Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time positions, speed, route heading, battery/fuel levels, and acoustic sirens for active ambulances and fire engines.
          </p>
        </div>

        <button
          onClick={() => setShowDispatchModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Send size={14} /> Dispatch Emergency Unit
        </button>
      </div>

      {/* Main Grid: Fleet list + Telemetry detail & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicles List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Connected Response Fleet ({vehicles.length})
          </h3>

          <div className="space-y-2.5">
            {vehicles.map(v => (
              <motion.div
                key={v.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedVehicle(v)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  activeVehicle.id === v.id
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{v.type === 'ambulance' ? '🚑' : '🚒'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{v.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Unit ID: {v.id}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.status === 'en_route'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {v.status === 'en_route' ? 'EN ROUTE' : 'STANDBY'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400">Speed</span>
                    <p className="font-bold text-slate-800">{v.speed} km/h</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Fuel</span>
                    <p className="font-bold text-emerald-600">{v.batteryFuel}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Siren</span>
                    <p className={`font-bold ${v.sirenActive ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>
                      {v.sirenActive ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span className="truncate">
                    Destination: <strong className="text-slate-800">{v.destinationName || v.destination || 'Station Base'}</strong>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSiren(v.id);
                    }}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      v.sirenActive
                        ? 'bg-red-500 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                    title="Toggle Siren"
                  >
                    {v.sirenActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed Telemetry & Map Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Vehicle Telemetry Banner */}
          <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeVehicle.type === 'ambulance' ? '🚑' : '🚒'}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{activeVehicle.name}</h3>
                  <p className="text-xs text-blue-600 font-mono">
                    GPS Coordinates: {activeVehicle.lat.toFixed(4)}° N, {activeVehicle.lng.toFixed(4)}° E
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleSiren(activeVehicle.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeVehicle.sirenActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30 animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {activeVehicle.sirenActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  {activeVehicle.sirenActive ? 'Siren Active (Priority)' : 'Activate Siren'}
                </button>
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-[10px]">Current Velocity</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">{activeVehicle.speed} <span className="text-xs font-normal">km/h</span></p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-[10px]">Bearing / Heading</span>
                <p className="text-lg font-black text-blue-600 mt-0.5">{activeVehicle.heading}° <span className="text-xs font-normal">NE</span></p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-[10px]">Battery & Fuel Level</span>
                <p className="text-lg font-black text-emerald-600 mt-0.5">{activeVehicle.batteryFuel}%</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-[10px]">Mission Status</span>
                <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{activeVehicle.status.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Crew and Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-blue-50/40 p-3.5 rounded-2xl border border-blue-100">
              <div>
                <span className="text-slate-400 text-[11px] font-semibold">Assigned Crew:</span>
                <p className="font-bold text-slate-800 mt-0.5">{activeVehicle.crew}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] font-semibold">Incident Mission:</span>
                <p className="font-bold text-blue-900 mt-0.5">{activeVehicle.assignedIncident || 'On Patrol / Standby'}</p>
              </div>
            </div>

            {/* Network Graph with active positioning */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Live Fleet Geographic Overlay</h4>
                <span className="text-[11px] text-slate-400 font-mono">Real-Time Refresh Active</span>
              </div>
              <NetworkGraph width={740} height={380} interactive={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {showDispatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-blue-100"
            >
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send size={18} className="text-red-600" />
                Dispatch Emergency Unit: {activeVehicle.name}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Destination Intersection / Facility</label>
                  <select
                    value={dispatchDest}
                    onChange={e => setDispatchDest(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="">Select destination node...</option>
                    {networkNodes.map(node => (
                      <option key={node.id} value={node.id}>
                        {node.name} ({node.id}) - {node.type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Dispatch Reason / Code</label>
                  <input
                    type="text"
                    value={dispatchReason}
                    onChange={e => setDispatchReason(e.target.value)}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                    placeholder="e.g. Code Red: Major Highway Collision"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDispatch}
                  disabled={!dispatchDest}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Authorize Dispatch
                </button>
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
