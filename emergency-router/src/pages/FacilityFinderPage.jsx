import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Navigation, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dijkstra } from '../utils/graphAlgorithms';
import NetworkGraph from '../components/NetworkGraph';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function FacilityFinderPage() {
  const { networkNodes = [], networkEdges = [] } = useApp() || {};
  const [selectedSource, setSelectedSource] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [routeResult, setRouteResult] = useState(null);

  const facilities = useMemo(() => {
    return networkNodes.filter(n => ['hospital', 'fire_station', 'police'].includes(n.type));
  }, [networkNodes]);

  const filteredFacilities = useMemo(() => {
    if (filterType === 'all') return facilities;
    return facilities.filter(f => f.type === filterType);
  }, [facilities, filterType]);

  // Calculate distances from selected source to all facilities
  const facilityDistances = useMemo(() => {
    if (!selectedSource) return [];
    return filteredFacilities.map(facility => {
      const result = dijkstra ? dijkstra(networkNodes, networkEdges, selectedSource, facility.id) : null;
      return {
        ...facility,
        distance: result?.distance ?? Infinity,
        path: result?.path ?? [],
        reachable: Boolean(result?.found),
        segments: result?.edges?.length || 0,
      };
    }).sort((a, b) => a.distance - b.distance);
  }, [selectedSource, filteredFacilities, networkNodes, networkEdges]);

  const handleFindRoute = (facility) => {
    if (selectedSource && dijkstra) {
      const result = dijkstra(networkNodes, networkEdges, selectedSource, facility.id);
      setRouteResult(result);
      setSelectedFacility(facility);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'hospital': return '🏥';
      case 'fire_station': return '🚒';
      case 'police': return '👮';
      default: return '📍';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'hospital': return 'Hospital';
      case 'fire_station': return 'Fire Station';
      case 'police': return 'Police Station';
      default: return 'Facility';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'hospital': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
      case 'fire_station': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
      case 'police': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 className="text-blue-500" size={28} />
          Emergency Facility Finder
        </h1>
        <p className="text-sm text-gray-500 mt-1">Find the nearest hospitals, fire stations, and police stations from any location.</p>
      </motion.div>

      {/* Controls */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Source selection */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Location</label>
            <select
              value={selectedSource}
              onChange={e => { setSelectedSource(e.target.value); setRouteResult(null); setSelectedFacility(null); }}
              className="w-full mt-1 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none cursor-pointer"
            >
              <option value="">Select your location...</option>
              {networkNodes.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
              ))}
            </select>
          </div>

          {/* Filter type */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Facility Type</label>
            <div className="flex gap-1.5 mt-1">
              {[
                { key: 'all', label: 'All', icon: '📍' },
                { key: 'hospital', label: 'Hospitals', icon: '🏥' },
                { key: 'fire_station', label: 'Fire', icon: '🚒' },
                { key: 'police', label: 'Police', icon: '👮' }
              ].map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setFilterType(t.key)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    filterType === t.key
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-blue-50 text-gray-600 hover:bg-blue-100'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-end">
            <div className="bg-blue-50 rounded-lg p-3 w-full">
              <p className="text-xs text-gray-500">Found</p>
              <p className="text-lg font-bold text-blue-600">{filteredFacilities.length} Facilities</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facility list */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-bold text-gray-800">
            {selectedSource ? 'Nearest Facilities' : 'All Facilities'}
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {(selectedSource ? facilityDistances : filteredFacilities).map((facility, idx) => {
              const colors = getTypeColor(facility.type);
              const isSelected = selectedFacility?.id === facility.id;

              return (
                <motion.div
                  key={facility.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleFindRoute(facility)}
                  className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 shadow-md bg-blue-50/50' : `${colors.border} hover:shadow-md`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${colors.bg}`}>
                      {getTypeIcon(facility.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{facility.name}</p>
                      <p className={`text-xs font-medium mt-0.5 ${colors.text}`}>{getTypeLabel(facility.type)}</p>
                      {selectedSource && facility.reachable !== undefined && (
                        <div className="flex items-center gap-3 mt-2">
                          {facility.reachable ? (
                            <>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock size={10} /> {facility.distance?.toFixed(1) ?? facility.distance} min
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Navigation size={10} /> {facility.segments} segments
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-red-500 font-medium">⚠ Unreachable</span>
                          )}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Navigation size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Map and route info */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-4">
          <NetworkGraph
            width={750}
            height={500}
            highlightPath={routeResult}
            interactive={false}
          />

          {/* Route details */}
          <AnimatePresence>
            {routeResult && selectedFacility && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm"
              >
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Navigation size={16} className="text-blue-500" />
                  Route to {selectedFacility.name}
                </h3>
                {routeResult.found ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500">Estimated Time</p>
                        <p className="text-xl font-bold text-blue-600">{routeResult.distance?.toFixed(1) ?? routeResult.distance} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Road Segments</p>
                        <p className="text-xl font-bold text-gray-800">{routeResult.edges?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="text-xl font-bold text-gray-800">{getTypeLabel(selectedFacility.type)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Route Path</p>
                      <div className="flex flex-wrap items-center gap-1">
                        {routeResult.path?.map((nodeId, idx) => (
                          <span key={idx} className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                              idx === 0 ? 'bg-green-100 text-green-700' :
                              idx === (routeResult.path?.length || 0) - 1 ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {networkNodes.find(n => n.id === nodeId)?.name || nodeId}
                            </span>
                            {idx < (routeResult.path?.length || 0) - 1 && (
                              <span className="text-gray-300">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    {routeResult.edges && routeResult.edges.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Roads Used</p>
                        <div className="flex flex-wrap gap-1">
                          {routeResult.edges.map(edge => (
                            <span key={edge.id || `${edge.source}-${edge.target}`} className="px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                              {edge.name || `${edge.source} ↔ ${edge.target}`} ({edge.time || edge.weight}min)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-red-600 font-medium">⚠ No route available to this facility</p>
                    <p className="text-xs text-red-400 mt-1">Some roads may be blocked. Check the Admin Panel for road status.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default FacilityFinderPage;
