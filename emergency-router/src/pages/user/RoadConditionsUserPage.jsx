import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Info,
  Layers,
  ThermometerSun,
  CloudRain
} from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function RoadConditionsUserPage() {
  const { networkEdges, publicReports } = useApp();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const blockedEdges = networkEdges.filter(e => e.status === 'blocked');
  const congestedEdges = networkEdges.filter(e => e.status === 'congested');
  const availableEdges = networkEdges.filter(e => e.status === 'available');

  const filteredEdges = networkEdges.filter(e => {
    const matchesFilter = filter === 'all' || e.status === filter;
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.from.toLowerCase().includes(search.toLowerCase()) ||
      e.to.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Official Traffic Advisory
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight flex items-center gap-2">
          <AlertTriangle size={26} className="text-amber-300" />
          Verified Road Closures & Live Traffic Conditions
        </h1>
        <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mt-1 leading-relaxed">
          Real-time official bulletin on road blockages, construction zones, and flash flood submergence. Check before you commute or travel during emergencies.
        </p>
      </div>

      {/* Advisory Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
          <span className="text-xs text-slate-400 font-semibold">Total Monitored Roads</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{networkEdges.length}</p>
          <span className="text-[10px] text-blue-600 font-bold">100% City Coverage</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/20 shadow-xs">
          <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
            <XCircle size={13} /> Active Closures
          </span>
          <p className="text-2xl font-black text-red-700 mt-1">{blockedEdges.length}</p>
          <span className="text-[10px] text-red-600 font-bold">Avoid travel</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
            <AlertTriangle size={13} /> Traffic Congestion
          </span>
          <p className="text-2xl font-black text-amber-700 mt-1">{congestedEdges.length}</p>
          <span className="text-[10px] text-amber-600 font-bold">15+ min delays</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 size={13} /> Clear & Open
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{availableEdges.length}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Normal speeds</span>
        </div>
      </div>

      {/* Weather / Seasonal Bulletin */}
      <div className="bg-sky-50 border border-sky-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0">
            <CloudRain size={20} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-sky-950">
              Weather Warning: Heavy Monsoon Inflow in Southern Districts
            </h3>
            <p className="text-xs text-sky-800 mt-0.5">
              South Plaza & SW Connector corridor prone to sudden waterlogging. Use the Ring Road East detour.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold font-mono bg-sky-200/80 text-sky-900 px-3 py-1 rounded-full whitespace-nowrap self-start sm:self-auto">
          UPDATED 5 MIN AGO
        </span>
      </div>

      {/* Main Grid: Search & Road List + Network Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Road Directory Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter roads by name or junction..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'blocked', 'congested', 'available'].map(k => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                      filter === k ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredEdges.map(edge => (
                <div key={edge.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{edge.name}</span>
                      <StatusBadge status={edge.status} />
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Connects <strong>{edge.from}</strong> to <strong>{edge.to}</strong> · Distance: {edge.distance} km
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-slate-700 font-bold text-xs">{edge.time} mins</span>
                    <p className="text-[10px] text-slate-400">
                      {edge.status === 'blocked' ? '❌ No Access' : edge.status === 'congested' ? '⚠️ Heavy Delays' : '✓ Flowing Fast'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Network Graph Visual Guide */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-blue-100 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              Live Network Status Map
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Red dashed lines = closed roads. Orange lines = congested areas.
            </p>
            <NetworkGraph width={740} height={420} interactive={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
