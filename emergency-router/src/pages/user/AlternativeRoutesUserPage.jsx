import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitFork,
  Navigation,
  Clock,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import { useApp } from '../../context/AppContext';
import { dijkstra } from '../../utils/graphAlgorithms';

export default function AlternativeRoutesUserPage() {
  const { networkNodes, networkEdges } = useApp();

  const [origin, setOrigin] = useState('D'); // South Plaza
  const [destination, setDestination] = useState('H1'); // City Hospital

  // Calculate primary route
  const primaryResult = dijkstra(networkNodes, networkEdges, origin, destination);

  // Calculate alternative route by inflating primary edges weight
  let altResult = null;
  if (primaryResult.found && primaryResult.edges.length > 0) {
    const modified = networkEdges.map(e => {
      const isPrimary = primaryResult.edges.some(pe => pe.id === e.id);
      return isPrimary ? { ...e, time: e.time * 3 } : e;
    });
    altResult = dijkstra(networkNodes, modified, origin, destination);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Disruption Bypass Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight flex items-center gap-2">
          <GitFork size={26} />
          Alternative Routes & Road Disruption Detours
        </h1>
        <p className="text-xs sm:text-sm text-purple-100 max-w-2xl mt-1 leading-relaxed">
          Compare recommended primary paths against secondary bypass corridors. When road incidents, flooding, or construction cause congestion, review alternative routes to reach your destination safely.
        </p>
      </div>

      {/* Origin/Destination Selector */}
      <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-slate-500 uppercase">Starting Point</label>
          <select
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {networkNodes.map(n => (
              <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
            ))}
          </select>
        </div>

        <div className="hidden sm:flex items-center justify-center pt-5">
          <ArrowRight className="text-purple-600" size={20} />
        </div>

        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-slate-500 uppercase">Destination</label>
          <select
            value={destination}
            onChange={e => setDestination(e.target.value)}
            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {networkNodes.map(n => (
              <option key={n.id} value={n.id}>{n.name} ({n.id}) {n.type === 'hospital' ? '🏥' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Route Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Route */}
        <div className="bg-white rounded-3xl border-2 border-blue-300 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-blue-50">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Primary Recommended Route
            </span>
            <span className="text-xs font-bold text-slate-700">
              {primaryResult.found ? `${primaryResult.distance.toFixed(1)} mins` : 'Blocked'}
            </span>
          </div>

          {primaryResult.found ? (
            <>
              <p className="text-xs text-slate-500">Shortest path under current road regulations:</p>
              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 font-mono text-xs font-bold text-blue-900">
                {primaryResult.path.join(' → ')}
              </div>
              <p className="text-[11px] text-slate-500">
                Covers {primaryResult.edges.length} street segments. Avoids all currently blocked road closures.
              </p>
            </>
          ) : (
            <p className="text-xs text-red-600 font-bold">No primary path found.</p>
          )}
        </div>

        {/* Alternative Route */}
        <div className="bg-white rounded-3xl border-2 border-purple-300 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-purple-50">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Secondary Detour Route
            </span>
            <span className="text-xs font-bold text-slate-700">
              {altResult && altResult.found ? `${altResult.distance.toFixed(1)} mins` : 'N/A'}
            </span>
          </div>

          {altResult && altResult.found ? (
            <>
              <p className="text-xs text-slate-500">Alternative bypass corridor if primary encounters delays:</p>
              <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 font-mono text-xs font-bold text-purple-900">
                {altResult.path.join(' → ')}
              </div>
              <p className="text-[11px] text-slate-500">
                Covers {altResult.edges.length} street segments. Recommended bypass in high traffic.
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-400">Alternative path calculated identically to primary.</p>
          )}
        </div>
      </div>

      {/* Network Graph Visualizing Both Routes */}
      <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Route Comparison Map View
            </h3>
            <p className="text-[11px] text-slate-400">
              🔵 Blue line = Primary Path · 🟣 Purple line = Secondary Detour Bypass
            </p>
          </div>
          <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full">
            Dual Path Visualization
          </span>
        </div>

        <NetworkGraph
          width={780}
          height={500}
          highlightPath={primaryResult}
          altPath={altResult}
          interactive={false}
        />
      </div>
    </div>
  );
}
