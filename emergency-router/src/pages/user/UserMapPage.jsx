import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Map,
  Navigation,
  Clock,
  Ruler,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import { useApp } from '../../context/AppContext';
import { dijkstra } from '../../utils/graphAlgorithms';

export default function UserMapPage() {
  const { networkNodes, networkEdges } = useApp();

  const [startNode, setStartNode] = useState('A');
  const [endNode, setEndNode] = useState('H1');
  const [routeResult, setRouteResult] = useState(null);

  const blockedEdges = networkEdges.filter(e => e.status === 'blocked');
  const congestedEdges = networkEdges.filter(e => e.status === 'congested');

  const handleCalculateRoute = () => {
    if (!startNode || !endNode) return;
    const result = dijkstra(networkNodes, networkEdges, startNode, endNode);
    setRouteResult(result);
  };

  const handleNodeClick = (node) => {
    if (!startNode) {
      setStartNode(node.id);
    } else {
      setEndNode(node.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-blue-500 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Public Navigation Assistance
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              Interactive Road Map & Route Finder
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1 leading-relaxed">
              Find the fastest travel route across the city. The navigation engine automatically avoids all verified road closures and accounts for live traffic delays.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/20 text-xs">
            <Sparkles size={16} className="text-yellow-300" />
            <span>Smart Real-Time Rerouting Active</span>
          </div>
        </div>
      </div>

      {/* Road Advisory Notice */}
      {blockedEdges.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
            <p className="text-amber-900">
              <strong>Traffic Advisory:</strong> {blockedEdges.map(b => b.name).join(', ')} currently closed. Your route will automatically divert via safe corridors.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Finder controls + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Navigation size={17} className="text-blue-600" />
              Plan Your Journey
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Starting Location</label>
              <select
                value={startNode}
                onChange={e => setStartNode(e.target.value)}
                className="w-full mt-1.5 p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {networkNodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Destination (Hospital, Station, or Area)</label>
              <select
                value={endNode}
                onChange={e => setEndNode(e.target.value)}
                className="w-full mt-1.5 p-3 bg-blue-50/50 border border-blue-200 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {networkNodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.id}) {node.type === 'hospital' ? '🏥' : ''}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCalculateRoute}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation size={16} />
              Find Safest & Fastest Route
            </button>
          </div>

          {/* Route Result Card */}
          {routeResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border-2 border-blue-200 p-5 shadow-sm space-y-4"
            >
              {routeResult.found ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✓ Optimal Route Ready
                    </span>
                    <span className="text-xs font-mono text-slate-400">Dijkstra Engine</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold">
                        <Clock size={11} /> Est. Travel Time
                      </span>
                      <p className="text-xl font-black text-blue-700 mt-0.5">
                        {routeResult.distance.toFixed(1)} <span className="text-xs font-normal">min</span>
                      </p>
                    </div>

                    <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                      <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold">
                        <Ruler size={11} /> Segments
                      </span>
                      <p className="text-xl font-black text-slate-800 mt-0.5">
                        {routeResult.edges.length} <span className="text-xs font-normal">roads</span>
                      </p>
                    </div>
                  </div>

                  {/* Path Breakdown */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-2">Turn-by-Turn Navigation:</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
                      {routeResult.edges.map((edge, idx) => (
                        <div key={edge.id} className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800">{edge.name}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">{edge.distance} km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-xs text-red-600 space-y-2">
                  <AlertTriangle size={24} className="mx-auto text-red-500" />
                  <p className="font-bold">No available route between selected locations.</p>
                  <p className="text-slate-500 text-[11px]">Road closures have isolated this part of the network.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Interactive Map Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-3xl border border-blue-100 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Road Network Navigator
                </h3>
                <p className="text-[11px] text-slate-400">
                  Highlighted blue line indicates your computed fastest route.
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Interactive Map
              </span>
            </div>

            <NetworkGraph
              width={780}
              height={500}
              highlightPath={routeResult}
              onNodeClick={handleNodeClick}
              interactive={true}
            />

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Tip: Click any location on the map to set starting point or destination.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
