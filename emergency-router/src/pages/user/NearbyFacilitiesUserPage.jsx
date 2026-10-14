import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Navigation,
  Phone,
  MapPin,
  Clock,
  Bed,
  HeartPulse,
  Ambulance,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import { useApp } from '../../context/AppContext';
import { dijkstra } from '../../utils/graphAlgorithms';

export default function NearbyFacilitiesUserPage() {
  const { networkNodes, networkEdges, facilities } = useApp();

  const [userLocation, setUserLocation] = useState('A'); // City Center
  const [selectedType, setSelectedType] = useState('all');
  const [activeFacility, setActiveFacility] = useState(facilities[0]);

  // Calculate routes to all facilities from user's current location
  const facilityRoutes = useMemo(() => {
    return facilities.map(f => {
      const result = dijkstra(networkNodes, networkEdges, userLocation, f.nodeId);
      return {
        ...f,
        routeResult: result,
        distanceTime: result.found ? result.distance : Infinity
      };
    }).sort((a, b) => a.distanceTime - b.distanceTime);
  }, [facilities, networkNodes, networkEdges, userLocation]);

  const filtered = facilityRoutes.filter(f =>
    selectedType === 'all' ? true : f.type === selectedType
  );

  const currentSelectedRoute = facilityRoutes.find(f => f.id === activeFacility?.id)?.routeResult;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Public Safety Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight flex items-center gap-2">
          <Building2 size={26} />
          Nearby Hospitals & Emergency Facilities
        </h1>
        <p className="text-xs sm:text-sm text-sky-100 max-w-2xl mt-1 leading-relaxed">
          Locate available trauma centers, cardiac emergency hospitals, and fire stations ranked by shortest travel time from your selected starting position.
        </p>
      </div>

      {/* Top Location Picker Strip */}
      <div className="bg-white rounded-3xl border border-blue-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase">Set Your Starting Location:</label>
            <select
              value={userLocation}
              onChange={e => setUserLocation(e.target.value)}
              className="block font-bold text-slate-900 text-sm bg-transparent outline-none cursor-pointer"
            >
              {networkNodes.map(n => (
                <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'all', label: 'All Services' },
            { key: 'hospital', label: 'Hospitals (Trauma)' },
            { key: 'fire_station', label: 'Fire & Rescue' },
            { key: 'police', label: 'Police Stations' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === t.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Facilities List + Interactive Map Route */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranked Facilities List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Ranked by Travel Time from {networkNodes.find(n => n.id === userLocation)?.name}
          </h3>

          <div className="space-y-3">
            {filtered.map((item, idx) => {
              const isSelected = activeFacility?.id === item.id;
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setActiveFacility(item)}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">
                        {item.type === 'hospital' ? '🏥' : item.type === 'fire_station' ? '🚒' : '👮'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{item.name}</h4>
                        <p className="text-[11px] text-blue-600 font-semibold">{item.category}</p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {item.distanceTime !== Infinity ? `${item.distanceTime.toFixed(1)} mins` : 'Closed'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400" />
                    <span>{item.address}</span>
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <a
                      href={`tel:${item.emergencyPhone.replace(/[^0-9]/g, '')}`}
                      onClick={e => e.stopPropagation()}
                      className="font-mono font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Phone size={11} className="text-emerald-600" /> {item.emergencyPhone}
                    </a>

                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                      Inspect Route <ArrowRight size={12} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detailed Routing to Selected Facility */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-xs space-y-4">
            {activeFacility && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Selected Destination
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{activeFacility.name}</h3>
                  <p className="text-xs text-slate-500">{activeFacility.address}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeFacility.emergencyPhone.replace(/[^0-9]/g, '')}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Phone size={14} /> Call Emergency
                  </a>
                </div>
              </div>
            )}

            {/* Travel Path Summary */}
            {currentSelectedRoute && (
              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-600">
                  Shortest Route: <strong className="font-mono text-blue-800">{currentSelectedRoute.path.join(' → ')}</strong>
                </span>
                <span className="font-bold text-blue-700">
                  Estimated Travel: {currentSelectedRoute.distance.toFixed(1)} minutes
                </span>
              </div>
            )}

            {/* Interactive Graph highlighting route */}
            <div>
              <NetworkGraph
                width={780}
                height={460}
                highlightPath={currentSelectedRoute}
                interactive={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
