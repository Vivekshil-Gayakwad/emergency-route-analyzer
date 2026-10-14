import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Network, AlertTriangle, Shield, Zap, Link2, CircleDot, BarChart3, Play } from 'lucide-react';
import NetworkGraph from '../components/NetworkGraph';
import StatCard from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { findArticulationPoints, findBridgeEdges, betweennessCentrality, bfs } from '../utils/graphAlgorithms';
import { resilienceStats } from '../data/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function ResiliencePage() {
  const { networkNodes = [], networkEdges = [], updateEdgeStatus, addNotification } = useApp() || {};
  const [analysisRun, setAnalysisRun] = useState(false);
  const [simulatingEdge, setSimulatingEdge] = useState(null);
  const [simulationResult, setSimulationResult] = useState(null);

  // Helper to ensure reachable set handling whether bfs returns Set or Array
  const toSet = (collection) => {
    if (collection instanceof Set) return collection;
    if (Array.isArray(collection)) return new Set(collection);
    return new Set();
  };

  // Run analysis
  const analysis = useMemo(() => {
    if (!analysisRun) return null;
    const articulationPts = findArticulationPoints ? findArticulationPoints(networkNodes, networkEdges) : [];
    const bridges = findBridgeEdges ? findBridgeEdges(networkNodes, networkEdges) : [];
    const centrality = betweennessCentrality ? betweennessCentrality(networkNodes, networkEdges) : {};

    // Sort by centrality
    const sortedCentrality = Object.entries(centrality || {})
      .sort(([, a], [, b]) => b - a)
      .map(([id, value]) => ({
        id,
        name: networkNodes.find(n => n.id === id)?.name || id,
        centrality: value,
      }));

    // Connectivity check
    const activeEdges = networkEdges.filter(e => e.status !== 'blocked');
    const startId = networkNodes[0]?.id;
    const reachable = toSet(startId && bfs ? bfs(networkNodes, activeEdges, startId) : []);
    const connectivity = networkNodes.length > 0 ? reachable.size / networkNodes.length : 1;

    // Hospital accessibility
    const hospitals = networkNodes.filter(n => n.type === 'hospital');
    const accessibleHospitals = hospitals.filter(h => reachable.has(h.id));

    return {
      articulationPoints: articulationPts || [],
      bridges: bridges || [],
      centrality: sortedCentrality,
      connectivity,
      totalNodes: networkNodes.length,
      totalEdges: networkEdges.length,
      blockedEdges: networkEdges.filter(e => e.status === 'blocked').length,
      hospitals: hospitals.length,
      accessibleHospitals: accessibleHospitals.length,
    };
  }, [analysisRun, networkNodes, networkEdges]);

  // Simulate edge failure
  const simulateFailure = (edgeId) => {
    setSimulatingEdge(edgeId);
    const edge = networkEdges.find(e => e.id === edgeId);
    const modifiedEdges = networkEdges.map(e =>
      e.id === edgeId ? { ...e, status: 'blocked' } : e
    );
    const activeEdges = modifiedEdges.filter(e => e.status !== 'blocked');
    const startId = networkNodes[0]?.id;
    const reachable = toSet(startId && bfs ? bfs(networkNodes, activeEdges, startId) : []);
    const hospitals = networkNodes.filter(n => n.type === 'hospital');
    const accessibleHospitals = hospitals.filter(h => reachable.has(h.id));
    const unreachableNodes = networkNodes.filter(n => !reachable.has(n.id));

    setSimulationResult({
      edgeName: edge?.name || edgeId,
      connectivity: networkNodes.length > 0 ? reachable.size / networkNodes.length : 0,
      accessibleHospitals: accessibleHospitals.length,
      totalHospitals: hospitals.length,
      unreachableNodes: unreachableNodes.map(n => n.name || n.id),
      impactLevel: unreachableNodes.length > 3 ? 'critical' : unreachableNodes.length > 0 ? 'moderate' : 'minimal',
    });
  };

  const handleRunAnalysis = () => {
    setAnalysisRun(true);
    if (addNotification) {
      addNotification('Network resilience analysis completed', 'success');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Network className="text-blue-500" size={28} />
            Network Resilience Analysis
          </h1>
          <p className="text-sm text-gray-500 mt-1">Identify critical roads, bridge edges, and articulation points in the network.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRunAnalysis}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        >
          <Play size={16} />
          {analysisRun ? 'Re-run Analysis' : 'Run Analysis'}
        </motion.button>
      </motion.div>

      {!analysisRun ? (
        /* Pre-analysis state */
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-blue-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Network size={40} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Ready to Analyze</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Click &quot;Run Analysis&quot; to identify critical nodes, bridge edges, and calculate betweenness centrality for all intersections.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-500">Nodes</p>
              <p className="text-lg font-bold text-blue-600">{networkNodes.length}</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-500">Edges</p>
              <p className="text-lg font-bold text-blue-600">{networkEdges.length}</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-xs text-gray-500">Hospitals</p>
              <p className="text-lg font-bold text-blue-600">{networkNodes.filter(n => n.type === 'hospital').length}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Post-analysis results */
        <>
          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Connectivity" value={`${Math.round(analysis.connectivity * 100)}%`} icon={Link2} color={analysis.connectivity > 0.9 ? 'green' : 'amber'} delay={0.1} />
            <StatCard title="Articulation Points" value={analysis.articulationPoints.length} icon={CircleDot} color="red" delay={0.2} />
            <StatCard title="Bridge Edges" value={analysis.bridges.length} icon={Zap} color="amber" delay={0.3} />
            <StatCard title="Accessible Hospitals" value={`${analysis.accessibleHospitals}/${analysis.hospitals}`} icon={Shield} color="blue" delay={0.4} />
          </motion.div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Network graph */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Network Topology</h2>
              <NetworkGraph width={750} height={500} interactive={false} />
            </motion.div>

            {/* Analysis results panel */}
            <motion.div variants={itemVariants} className="space-y-4">
              {/* Articulation Points */}
              <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
                <div className="p-3 bg-red-50 border-b border-red-100">
                  <h3 className="font-semibold text-red-800 flex items-center gap-2 text-sm">
                    <CircleDot size={14} />
                    Articulation Points (Critical Nodes)
                  </h3>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-2">Removing these nodes disconnects the network:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.articulationPoints.length > 0 ? analysis.articulationPoints.map(id => (
                      <span key={id} className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
                        {networkNodes.find(n => n.id === id)?.name || id}
                      </span>
                    )) : (
                      <span className="text-xs text-gray-400">No articulation points found — network is robust!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bridge Edges */}
              <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
                <div className="p-3 bg-amber-50 border-b border-amber-100">
                  <h3 className="font-semibold text-amber-800 flex items-center gap-2 text-sm">
                    <Zap size={14} />
                    Bridge Edges (Critical Roads)
                  </h3>
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-2">Removing these roads disconnects the network:</p>
                  <div className="space-y-1.5">
                    {analysis.bridges.length > 0 ? analysis.bridges.map(edge => (
                      <div key={edge.id} className="flex items-center justify-between bg-amber-50 p-2 rounded-lg">
                        <span className="text-xs font-medium text-amber-800">{edge.name}</span>
                        <button
                          onClick={() => simulateFailure(edge.id)}
                          className="text-xs px-2 py-1 bg-amber-200 text-amber-800 rounded hover:bg-amber-300 transition-colors cursor-pointer"
                        >
                          Simulate
                        </button>
                      </div>
                    )) : (
                      <span className="text-xs text-gray-400">No bridge edges found — network has redundant paths!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Betweenness Centrality */}
              <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2 text-sm">
                    <BarChart3 size={14} />
                    Betweenness Centrality (Top 5)
                  </h3>
                </div>
                <div className="p-3 space-y-2">
                  {analysis.centrality.slice(0, 5).map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">{idx + 1}.</span>
                      <span className="text-xs font-medium text-gray-700 flex-1">{item.name}</span>
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(item.centrality * 100 * 5, 100)}%` }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right">{(item.centrality * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Simulation results */}
          {simulationResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border-2 p-5 ${
                simulationResult.impactLevel === 'critical' ? 'border-red-300 bg-red-50' :
                simulationResult.impactLevel === 'moderate' ? 'border-amber-300 bg-amber-50' :
                'border-green-300 bg-green-50'
              }`}
            >
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className={
                  simulationResult.impactLevel === 'critical' ? 'text-red-500' :
                  simulationResult.impactLevel === 'moderate' ? 'text-amber-500' :
                  'text-green-500'
                } />
                Simulation Result: Blocking &quot;{simulationResult.edgeName}&quot;
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Network Connectivity</p>
                  <p className="text-xl font-bold text-gray-800">{Math.round(simulationResult.connectivity * 100)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Accessible Hospitals</p>
                  <p className="text-xl font-bold text-gray-800">{simulationResult.accessibleHospitals} / {simulationResult.totalHospitals}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Impact Level</p>
                  <p className={`text-xl font-bold capitalize ${
                    simulationResult.impactLevel === 'critical' ? 'text-red-600' :
                    simulationResult.impactLevel === 'moderate' ? 'text-amber-600' :
                    'text-green-600'
                  }`}>{simulationResult.impactLevel}</p>
                </div>
              </div>
              {simulationResult.unreachableNodes.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Unreachable Locations:</p>
                  <div className="flex flex-wrap gap-1">
                    {simulationResult.unreachableNodes.map(name => (
                      <span key={name} className="px-2 py-0.5 bg-white rounded text-xs text-red-600 border border-red-200">{name}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Edge failure simulation */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Simulate Road Failure</h3>
            <p className="text-sm text-gray-500 mb-4">Select a road to simulate its failure and analyze the impact on network connectivity.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {networkEdges.filter(e => e.status !== 'blocked').slice(0, 12).map(edge => (
                <motion.button
                  key={edge.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => simulateFailure(edge.id)}
                  className={`p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    simulatingEdge === edge.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-blue-200 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {edge.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default ResiliencePage;
