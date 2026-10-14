import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, RotateCcw, Zap, Route, Clock, Ruler } from 'lucide-react';
import { useApp } from '../context/AppContext';

function RoutePanel() {
  const {
    networkNodes, currentRoute, alternativeRoute,
    algorithm, setAlgorithm,
    selectedStart, setSelectedStart,
    selectedEnd, setSelectedEnd,
    calculateRoute,
  } = useApp();
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    if (selectedStart && selectedEnd) {
      calculateRoute(selectedStart, selectedEnd);
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setSelectedStart(null);
    setSelectedEnd(null);
    setShowResult(false);
  };

  return (
    <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h3 className="font-semibold flex items-center gap-2">
          <Navigation size={18} />
          Route Calculator
        </h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Algorithm selector */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Algorithm</label>
          <div className="flex gap-2 mt-1">
            {['dijkstra', 'astar'].map(algo => (
              <motion.button
                key={algo}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setAlgorithm(algo)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  algorithm === algo
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {algo === 'dijkstra' ? "Dijkstra's" : 'A* Search'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Start location */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Location</label>
          <select
            value={selectedStart || ''}
            onChange={e => setSelectedStart(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          >
            <option value="">Select start point...</option>
            {(networkNodes || []).map(n => (
              <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
            ))}
          </select>
        </div>

        {/* End location */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Destination</label>
          <select
            value={selectedEnd || ''}
            onChange={e => setSelectedEnd(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          >
            <option value="">Select destination...</option>
            {(networkNodes || []).map(n => (
              <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCalculate}
            disabled={!selectedStart || !selectedEnd}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow"
          >
            <Zap size={16} />
            Find Route
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw size={16} />
          </motion.button>
        </div>

        {/* Route results */}
        <AnimatePresence>
          {showResult && currentRoute && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {/* Primary route */}
              <div className={`p-3 rounded-lg border-2 ${currentRoute.found ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Route size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-800">Primary Route</span>
                </div>
                {currentRoute.found ? (
                  <>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Path:</span> {currentRoute.path.join(' → ')}
                    </p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={12} /> {currentRoute.distance?.toFixed(1)} min
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Ruler size={12} /> {currentRoute.edges?.length || 0} segments
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-red-600">No route found! Roads may be blocked.</p>
                )}
              </div>

              {/* Alternative route */}
              {alternativeRoute && (
                <div className="p-3 rounded-lg border-2 border-purple-200 bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Route size={16} className="text-purple-600" />
                    <span className="text-sm font-semibold text-purple-800">Alternative Route</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Path:</span> {alternativeRoute.path.join(' → ')}
                  </p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={12} /> {alternativeRoute.distance?.toFixed(1)} min
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Ruler size={12} /> {alternativeRoute.edges?.length || 0} segments
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default RoutePanel;
