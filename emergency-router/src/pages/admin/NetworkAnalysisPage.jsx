import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Play,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import { useApp } from '../../context/AppContext';
import { findBridgeEdges, findArticulationPoints, bfs, dijkstra } from '../../utils/graphAlgorithms';
import { apiSimulateClosure } from '../../utils/api';

export default function NetworkAnalysisPage() {
  const { networkNodes, networkEdges, theme, t } = useApp();
  const isLight = theme === 'light';

  const [hasRunAnalysis, setHasRunAnalysis] = useState(false);
  const [selectedRoadToSimulate, setSelectedRoadToSimulate] = useState('');
  const [simulationResult, setSimulationResult] = useState(null);

  // Active unblocked edges
  const activeEdges = useMemo(() => {
    return networkEdges.filter(e => e.status !== 'blocked');
  }, [networkEdges]);

  // Overall network connectivity status
  const networkConnectivity = useMemo(() => {
    if (networkNodes.length === 0) return { isConnected: true, reachableCount: 0 };
    const reachable = bfs(networkNodes, activeEdges, networkNodes[0].id);
    return {
      isConnected: reachable.size === networkNodes.length,
      reachableCount: reachable.size,
      totalCount: networkNodes.length
    };
  }, [networkNodes, activeEdges]);

  // Critical Roads (Bridge Edges) and Critical Intersections (Articulation Points)
  const analysisResults = useMemo(() => {
    if (!hasRunAnalysis) return null;

    const bridges = findBridgeEdges(networkNodes, networkEdges);
    const articulationPoints = findArticulationPoints(networkNodes, networkEdges);

    return {
      bridges,
      articulationPoints,
      criticalRoadCount: bridges.length,
    };
  }, [hasRunAnalysis, networkNodes, networkEdges]);

  const handleRunAnalysis = () => {
    setHasRunAnalysis(true);
    const bridges = findBridgeEdges(networkNodes, networkEdges);
    if (bridges.length > 0 && !selectedRoadToSimulate) {
      setSelectedRoadToSimulate(bridges[0].id);
    } else if (activeEdges.length > 0 && !selectedRoadToSimulate) {
      setSelectedRoadToSimulate(activeEdges[0].id);
    }
  };

  // Simulate Road Closure Impact
  const handleSimulateImpact = async (edgeId) => {
    if (!edgeId) return;
    const targetEdge = networkEdges.find(e => e.id === edgeId);
    if (!targetEdge) return;

    try {
      const res = await apiSimulateClosure(edgeId);
      if (res && res.disconnected !== undefined) {
        setSimulationResult({
          road: targetEdge,
          disconnected: res.disconnected,
          disconnectedNames: res.disconnected_names || [],
          hasAlternativeRoute: res.has_alternative,
          alternativeRouteDistance: res.alt_distance,
          originalTime: targetEdge.time,
          timeIncrease: res.time_increase
        });
        return;
      }
    } catch (e) {
      console.warn('Backend simulation error, using local computation:', e.message);
    }

    // Simulate graph with this edge blocked (local fallback)
    const simulatedEdges = networkEdges.map(e =>
      e.id === edgeId ? { ...e, status: 'blocked' } : e
    );
    const activeSimulated = simulatedEdges.filter(e => e.status !== 'blocked');

    // Check connectivity
    const reachable = bfs(networkNodes, activeSimulated, targetEdge.from);
    const disconnectedNodes = networkNodes.filter(n => !reachable.has(n.id));

    // Test route between from & to endpoints to check if alternative route exists
    const altRoute = dijkstra(networkNodes, simulatedEdges, targetEdge.from, targetEdge.to);

    setSimulationResult({
      road: targetEdge,
      disconnected: disconnectedNodes.length > 0,
      disconnectedNames: disconnectedNodes.map(n => n.name),
      hasAlternativeRoute: altRoute.found,
      alternativeRouteDistance: altRoute.found ? altRoute.distance : null,
      originalTime: targetEdge.time,
      timeIncrease: altRoute.found ? (altRoute.distance - targetEdge.time).toFixed(1) : null
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className={`border rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-[#0E1830] border-slate-800 text-white'
      }`}>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            isLight
              ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
              : 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60'
          }`}>
            {t('appSubtitle')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-1.5 flex items-center gap-2">
            <Network className={isLight ? 'text-cyan-600' : 'text-cyan-400'} size={24} />
            {t('resilienceTitle')}
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {t('resilienceSub')}
          </p>
        </div>

        {/* Network Status & Run Action */}
        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-2 rounded-xl border text-xs ${
            isLight ? 'bg-slate-50 border-emerald-200' : 'bg-[#091124] border-slate-800'
          }`}>
            <span className={`block text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('networkStatus')}
            </span>
            <span className={`font-bold flex items-center gap-1.5 ${
              networkConnectivity.isConnected ? 'text-emerald-500' : 'text-red-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${networkConnectivity.isConnected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
              {networkConnectivity.isConnected ? t('connected') : `${t('fragmented')} (${networkConnectivity.reachableCount}/${networkConnectivity.totalCount})`}
            </span>
          </div>

          <button
            onClick={handleRunAnalysis}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-950 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Play size={14} />
            <span>{hasRunAnalysis ? t('reRunAnalysis') : t('runAnalysis')}</span>
          </button>
        </div>
      </div>

      {/* Road Network Visualization */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xs font-black tracking-wider uppercase ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
              {t('roadNetworkMap')}
            </h2>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {hasRunAnalysis ? 'Cyan road highlights represent Critical Bridge Roads.' : 'Click "Run Analysis" to compute critical roads.'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> {t('normalRoad')}
            </span>
            <span className={`flex items-center gap-1.5 font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" /> {t('criticalRoad')}
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> {t('blockedRoad')}
            </span>
          </div>
        </div>

        <div className="h-[440px]">
          <NetworkGraph
            criticalEdges={analysisResults?.bridges || []}
            criticalNodes={analysisResults?.articulationPoints || []}
            interactive={false}
          />
        </div>
      </div>

      {/* Analysis Results Panel */}
      {hasRunAnalysis && analysisResults && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border rounded-2xl p-6 shadow-xl space-y-6 transition-colors ${
            isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-[#0E1830] border-slate-800 text-white'
          }`}
        >
          <div className={`flex items-center justify-between pb-3 border-b ${
            isLight ? 'border-emerald-200' : 'border-slate-800'
          }`}>
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-cyan-700' : 'text-cyan-400'}`}>
                Graph Algorithm Output
              </span>
              <h3 className="text-base font-bold mt-0.5">
                {t('analysisResults')}
              </h3>
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isLight
                ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
            }`}>
              {t('criticalRoadsFound')} {analysisResults.criticalRoadCount}
            </span>
          </div>

          {/* Critical Roads List */}
          <div className="space-y-3">
            {analysisResults.bridges.length === 0 ? (
              <div className={`p-4 border rounded-xl text-xs flex items-center gap-2 ${
                isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
              }`}>
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                <span>{t('noBridgesFound')}</span>
              </div>
            ) : (
              analysisResults.bridges.map((edge) => (
                <div
                  key={edge.id}
                  className={`p-4 border rounded-xl space-y-2 text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#091124] border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                        isLight ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {edge.id}
                      </span>
                      <strong className="text-sm font-bold">{edge.name}</strong>
                      <span className={`font-mono text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        ({edge.from} ↔ {edge.to})
                      </span>
                    </div>

                    <button
                      onClick={() => handleSimulateImpact(edge.id)}
                      className={`px-3 py-1 border rounded-lg font-bold text-[11px] self-start sm:self-auto transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100'
                          : 'bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border-violet-500/40'
                      }`}
                    >
                      {t('simulateClosure')}
                    </button>
                  </div>

                  <p className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                    <strong className="text-amber-500">{t('impact')}</strong> {t('bridgeImpactDesc')}
                  </p>

                  <p className={isLight ? 'text-slate-600' : 'text-slate-400'}>
                    <strong className={isLight ? 'text-cyan-700' : 'text-cyan-400'}>{t('suggestedAction')}</strong> {t('suggestedActionDesc')}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Road Closure Impact Simulator */}
          <div className={`pt-4 border-t space-y-4 ${isLight ? 'border-emerald-200' : 'border-slate-800'}`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-800' : 'text-slate-300'
            }`}>
              <Sliders size={14} className={isLight ? 'text-cyan-600' : 'text-cyan-400'} />
              {t('simulateImpactForAny')}
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedRoadToSimulate}
                onChange={e => setSelectedRoadToSimulate(e.target.value)}
                className={`w-full sm:flex-1 p-2.5 rounded-xl text-xs outline-none border cursor-pointer ${
                  isLight
                    ? 'bg-slate-50 border-emerald-200 text-slate-900 focus:ring-2 focus:ring-violet-500'
                    : 'bg-[#091124] border-slate-700 text-white'
                }`}
              >
                <option value="" className="bg-slate-900 text-white">{t('selectRoadToSimulate')}</option>
                {networkEdges.map(edge => (
                  <option key={edge.id} value={edge.id} className="bg-slate-900 text-white">
                    {edge.name} ({edge.from} ↔ {edge.to}) - {t(edge.status)}
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleSimulateImpact(selectedRoadToSimulate)}
                disabled={!selectedRoadToSimulate}
                className="w-full sm:w-auto px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                {t('simulateImpactBtn')}
              </button>
            </div>

            {/* Simulation Results Display */}
            {simulationResult && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  simulationResult.disconnected
                    ? (isLight ? 'bg-red-50 border-red-200 text-red-900' : 'bg-red-950/20 border-red-800/60 text-red-200')
                    : (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200')
                }`}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>Simulation: Closing "{simulationResult.road.name}"</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                    simulationResult.disconnected
                      ? 'bg-red-100 text-red-900 border-red-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {simulationResult.disconnected ? t('disconnectionCaused') : t('networkStaysConnected')}
                  </span>
                </div>

                {simulationResult.disconnected ? (
                  <p className="text-red-600 dark:text-red-300">
                    ⚠️ <strong>{t('areaIsolation')}</strong> Blocking this road disconnects <strong>{simulationResult.disconnectedNames.length} location(s)</strong>: {simulationResult.disconnectedNames.join(', ')}.
                  </p>
                ) : (
                  <p className="text-emerald-700 dark:text-emerald-300">
                    ✓ <strong>{t('connMaintained')}</strong>
                  </p>
                )}

                {simulationResult.hasAlternativeRoute && (
                  <div className={`pt-1 border-t flex items-center justify-between text-[11px] ${
                    isLight ? 'border-emerald-200 text-slate-700' : 'border-slate-700/60 text-slate-300'
                  }`}>
                    <span>{t('altBypassAvailable')} {simulationResult.road.from} and {simulationResult.road.to}:</span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      Takes ~{simulationResult.alternativeRouteDistance.toFixed(1)} min (+{simulationResult.timeIncrease} min {t('detourExtra')})
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
