import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Route, AlertTriangle, RefreshCw, Zap, ShieldAlert, Layers } from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import RoutePanel from '../../components/RoutePanel';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function EmergencyRoutesPage() {
  const {
    networkNodes,
    networkEdges,
    currentRoute,
    alternativeRoute,
    selectedStart,
    setSelectedStart,
    selectedEnd,
    setSelectedEnd,
    updateEdgeStatus,
    calculateRoute
  } = useApp();

  const [activeEdgeFilter, setActiveEdgeFilter] = useState('all');

  const handleNodeClick = (node) => {
    if (!selectedStart) {
      setSelectedStart(node.id);
    } else if (!selectedEnd) {
      setSelectedEnd(node.id);
    } else {
      setSelectedStart(node.id);
      setSelectedEnd(null);
    }
  };

  const blockedEdges = networkEdges.filter(e => e.status === 'blocked');
  const congestedEdges = networkEdges.filter(e => e.status === 'congested');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">
              Route Engine
            </span>
            <span className="text-xs text-slate-400">Dijkstra & A* with Blocked Road Avoidance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Navigation className="text-blue-600" size={26} />
            Emergency Route Finding & Dynamic Rerouting
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identify the quickest routes for ambulances and fire trucks. When roads are blocked, the algorithm dynamically calculates alternative bypass paths.
          </p>
        </div>

        {selectedStart && selectedEnd && (
          <button
            onClick={() => calculateRoute(selectedStart, selectedEnd)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw size={14} /> Recalculate Routes
          </button>
        )}
      </div>

      {/* Disruption Warning Strip */}
      {(blockedEdges.length > 0 || congestedEdges.length > 0) && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Dynamic Rerouting Active ({blockedEdges.length} blocked, {congestedEdges.length} congested)
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {blockedEdges.map(b => (
                  <span key={b.id} className="text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                    🚫 {b.name} (Avoided)
                  </span>
                ))}
                {congestedEdges.map(c => (
                  <span key={c.id} className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full border border-amber-200">
                    ⚠️ {c.name} (+Traffic penalty)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Controls + Interactive Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Route Panel */}
        <div className="space-y-4">
          <RoutePanel />

          {/* Dynamic Rerouting Explainer Box */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Zap size={14} className="text-blue-600" />
              How Dynamic Rerouting Works
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a road closure occurs (due to floods or multi-vehicle collisions), its cost is set to <code className="text-red-600 bg-red-50 px-1 rounded">Infinity</code> in the adjacency matrix. The engine instantly computes a verified bypass route in <strong className="text-slate-800">&lt; 15ms</strong>.
            </p>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-blue-900">Selected Path:</span>
              <span className="font-mono text-blue-700 font-bold">
                {currentRoute?.path ? currentRoute.path.join(' → ') : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Network Graph */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-2xl border border-blue-100 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Interactive Route Map Visualization
                </h3>
                <p className="text-[11px] text-slate-400">
                  Click any two intersections/facilities to set Start & Destination.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                  <span className="w-3 h-3 rounded-full bg-blue-500" /> Primary Route
                </span>
                <span className="flex items-center gap-1.5 text-purple-600 font-bold">
                  <span className="w-3 h-3 rounded-full bg-purple-500" /> Alternative Route
                </span>
              </div>
            </div>

            <NetworkGraph
              width={780}
              height={520}
              highlightPath={currentRoute}
              altPath={alternativeRoute}
              onNodeClick={handleNodeClick}
              interactive={true}
            />

            {/* Selection indicators */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-500">Origin: <strong>{selectedStart ? networkNodes.find(n => n.id === selectedStart)?.name : 'Click on graph'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-500">Destination: <strong>{selectedEnd ? networkNodes.find(n => n.id === selectedEnd)?.name : 'Click on graph'}</strong></span>
                </div>
              </div>

              {(selectedStart || selectedEnd) && (
                <button
                  onClick={() => { setSelectedStart(null); setSelectedEnd(null); }}
                  className="text-slate-400 hover:text-slate-600 text-xs underline cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
