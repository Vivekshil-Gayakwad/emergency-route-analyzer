import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  PhoneCall,
  Navigation,
  Clock,
  Bed,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Ambulance,
  ArrowRight
} from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import { useApp } from '../../context/AppContext';
import { dijkstra } from '../../utils/graphAlgorithms';

export default function EmergencyAssistancePage() {
  const { networkNodes, networkEdges, facilities } = useApp();

  const [currentLoc, setCurrentLoc] = useState('D'); // e.g. South Plaza
  const [nearestResult, setNearestResult] = useState(null);

  const hospitals = facilities.filter(f => f.type === 'hospital');

  const handleFindNearestHospital = () => {
    let bestHospital = null;
    let minTime = Infinity;
    let bestResult = null;

    hospitals.forEach(h => {
      const result = dijkstra(networkNodes, networkEdges, currentLoc, h.nodeId);
      if (result.found && result.distance < minTime) {
        minTime = result.distance;
        bestHospital = h;
        bestResult = result;
      }
    });

    if (bestHospital) {
      setNearestResult({
        hospital: bestHospital,
        route: bestResult
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* SOS Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Emergency SOS Response
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <HeartPulse size={28} className="animate-pulse" />
              Immediate Emergency Route Assistance
            </h1>
            <p className="text-xs sm:text-sm text-red-100 max-w-2xl leading-relaxed">
              If someone is critically injured or requires urgent hospitalization, click below to compute the fastest verified path to the nearest available emergency room.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <a
              href="tel:102"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <PhoneCall size={16} /> Call 102 Ambulance
            </a>
            <a
              href="tel:112"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-950/60 hover:bg-red-950/80 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/20 transition-all"
            >
              <PhoneCall size={16} /> Call 112 National SOS
            </a>
          </div>
        </div>
      </div>

      {/* Main Action Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Finder & Hospital Guidance */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border-2 border-red-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-red-600" />
              Where Are You Currently Located?
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-500">Your Current Intersection</label>
              <select
                value={currentLoc}
                onChange={e => setCurrentLoc(e.target.value)}
                className="w-full mt-1.5 p-3 bg-red-50/40 border border-red-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-red-500 outline-none"
              >
                {networkNodes.filter(n => n.type !== 'hospital').map(node => (
                  <option key={node.id} value={node.id}>
                    {node.name} ({node.id})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleFindNearestHospital}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Navigation size={18} />
              Calculate Nearest Emergency Hospital
            </button>
          </div>

          {/* Nearest Hospital Result */}
          {nearestResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border-2 border-emerald-300 p-5 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  FASTEST TRAUMA FACILITY
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {nearestResult.route.distance.toFixed(1)} mins away
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900">{nearestResult.hospital.name}</h4>
                <p className="text-xs text-blue-600 font-semibold">{nearestResult.hospital.category}</p>
                <p className="text-xs text-slate-500 mt-1">{nearestResult.hospital.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-center text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">ICU Capacity</span>
                  <p className="font-bold text-emerald-800">{nearestResult.hospital.availableIcu} Vacancies</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Direct Phone</span>
                  <p className="font-mono font-bold text-slate-800">{nearestResult.hospital.emergencyPhone}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs pt-1">
                <p className="font-bold text-slate-700">Recommended Routing Corridor:</p>
                <p className="font-mono text-blue-700 font-semibold bg-blue-50 p-2 rounded-xl border border-blue-100">
                  {nearestResult.route.path.join(' → ')}
                </p>
              </div>
            </motion.div>
          )}

          {/* First Aid Emergency Checklist */}
          <div className="bg-white rounded-3xl border border-blue-100 p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              While Help Is En Route
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Severe Bleeding:</strong> Apply firm, direct pressure with clean cloth.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Accident Scene:</strong> Do not move spinal injury victims unless in immediate fire danger.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span><strong>Keep Line Open:</strong> Stay on the phone with the dispatch operator.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Visual Map Routing */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-3xl border border-blue-100 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Emergency Medical Corridor Map
                </h3>
                <p className="text-[11px] text-slate-400">
                  Green dots indicate hospitals; blue highlighted path shows rapid route.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                SOS Navigation
              </span>
            </div>

            <NetworkGraph
              width={780}
              height={500}
              highlightPath={nearestResult?.route}
              interactive={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
