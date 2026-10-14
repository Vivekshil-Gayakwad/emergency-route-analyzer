import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Layers, AlertTriangle, Ambulance } from 'lucide-react';
import NetworkGraph from '../components/NetworkGraph';
import RoutePanel from '../components/RoutePanel';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

function MapPage() {
  const {
    networkNodes = [],
    networkEdges = [],
    currentRoute,
    alternativeRoute,
    selectedStart,
    setSelectedStart,
    selectedEnd,
    setSelectedEnd,
    vehicles = []
  } = useApp() || {};
  const [showEdgeList, setShowEdgeList] = useState(false);

  const handleNodeClick = (node) => {
    if (!selectedStart) {
      setSelectedStart?.(node.id);
    } else if (!selectedEnd) {
      setSelectedEnd?.(node.id);
    } else {
      setSelectedStart?.(node.id);
      setSelectedEnd?.(null);
    }
  };

  const blockedEdges = (networkEdges || []).filter(e => e.status === 'blocked');
  const congestedEdges = (networkEdges || []).filter(e => e.status === 'congested');

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Map className="text-blue-500" size={28} />
            Route Map
          </h1>
          <p className="text-sm text-gray-500 mt-1">Click nodes on the graph to set start and destination, then find the optimal route.</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEdgeList(!showEdgeList)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors"
          >
            <Layers size={16} />
            {showEdgeList ? 'Hide' : 'Show'} Roads
          </motion.button>
        </div>
      </div>

      {/* Status alerts */}
      {(blockedEdges.length > 0 || congestedEdges.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <span className="text-sm font-semibold text-amber-800">Active Road Issues</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {blockedEdges.map(e => (
              <span key={e.id} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                🚫 {e.name} (Blocked)
              </span>
            ))}
            {congestedEdges.map(e => (
              <span key={e.id} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                ⚠️ {e.name} (Congested)
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Panel */}
        <div className="lg:col-span-1 space-y-4">
          <RoutePanel />

          {/* Vehicle status */}
          <div className="bg-white rounded-xl border border-blue-100 p-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <Ambulance size={16} className="text-blue-500" />
              Active Vehicles
            </h3>
            <div className="space-y-2">
              {(vehicles || []).filter(v => v.status === 'en_route').map(v => (
                <div key={v.id} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{v.type === 'ambulance' ? '🚑' : '🚒'}</span>
                    <span className="text-sm font-medium text-gray-700">{v.name}</span>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">{v.speed} km/h</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Network Graph */}
        <div className="lg:col-span-2">
          <NetworkGraph
            width={800}
            height={550}
            highlightPath={currentRoute}
            altPath={alternativeRoute}
            onNodeClick={handleNodeClick}
            interactive={true}
          />
          {/* Selection indicator */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">
                Start: {selectedStart ? networkNodes?.find(n => n.id === selectedStart)?.name : 'Click to select'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-500">
                End: {selectedEnd ? networkNodes?.find(n => n.id === selectedEnd)?.name : 'Click to select'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Road list */}
      {showEdgeList && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-xl border border-blue-100 overflow-hidden"
        >
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h3 className="font-semibold text-gray-800">All Roads ({(networkEdges || []).length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-50">
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Road Name</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">From → To</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Distance</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Traffic</th>
                </tr>
              </thead>
              <tbody>
                {(networkEdges || []).map(edge => (
                  <tr key={edge.id} className="border-b border-blue-50/50 hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 text-sm font-medium text-gray-800">{edge.name}</td>
                    <td className="p-3 text-sm text-gray-500">{edge.from} → {edge.to}</td>
                    <td className="p-3 text-sm text-gray-500">{edge.distance} km</td>
                    <td className="p-3 text-sm text-gray-500">{edge.time} min</td>
                    <td className="p-3"><StatusBadge status={edge.status} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              edge.traffic > 0.7 ? 'bg-red-500' : edge.traffic > 0.4 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${edge.traffic * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{Math.round(edge.traffic * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default MapPage;
