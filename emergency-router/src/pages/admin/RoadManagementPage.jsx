import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Sliders,
  Flame,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';

export default function RoadManagementPage() {
  const { networkEdges, updateEdgeStatus, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredEdges = networkEdges.filter(edge => {
    const matchesSearch =
      edge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      edge.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      edge.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || edge.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: networkEdges.length,
    available: networkEdges.filter(e => e.status === 'available').length,
    congested: networkEdges.filter(e => e.status === 'congested').length,
    blocked: networkEdges.filter(e => e.status === 'blocked').length,
  };

  const handleReopenAll = () => {
    networkEdges.forEach(e => {
      if (e.status !== 'available') {
        updateEdgeStatus(e.id, 'available');
      }
    });
    addNotification('All road closures and congestion flags cleared. All roads operational.', 'success');
  };

  const handleSimulateDisruption = () => {
    // Block SW Connector and congest East Boulevard
    updateEdgeStatus('e10', 'blocked');
    updateEdgeStatus('e4', 'blocked');
    updateEdgeStatus('e15', 'congested');
    addNotification('Simulation triggered: SW Connector (e10) & West Blvd (e4) blocked!', 'danger');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded uppercase">
              Authority Controls
            </span>
            <span className="text-xs text-slate-400">Live Status Override</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <ShieldAlert className="text-rose-600" size={26} />
            Road Status & Network Flow Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Block roads during floods or accidents, clear obstructions, or regulate traffic density. All modifications trigger immediate dynamic rerouting across all connected systems.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSimulateDisruption}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Flame size={14} /> Simulate Disruption
          </button>
          <button
            onClick={handleReopenAll}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} /> Reopen All Roads
          </button>
        </div>
      </div>

      {/* Filter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'all', label: 'All Network Roads', count: statusCounts.all, icon: Sliders, color: 'border-blue-200 bg-white' },
          { key: 'available', label: 'Available (Open)', count: statusCounts.available, icon: CheckCircle2, color: 'border-emerald-200 bg-emerald-50/40 text-emerald-800' },
          { key: 'congested', label: 'Congested (Delay)', count: statusCounts.congested, icon: AlertTriangle, color: 'border-amber-200 bg-amber-50/40 text-amber-800' },
          { key: 'blocked', label: 'Blocked (Closed)', count: statusCounts.blocked, icon: XCircle, color: 'border-rose-200 bg-rose-50/40 text-rose-800' },
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilterStatus(item.key)}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              filterStatus === item.key
                ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20 bg-blue-50/30'
                : 'hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{item.label}</span>
              <item.icon size={16} />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{item.count}</p>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search roads by name, origin intersection, or destination..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-blue-100 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-xs"
        />
      </div>

      {/* Roads Table */}
      <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-xs">
        <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-blue-100 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            Road Infrastructure Directory ({filteredEdges.length} segments matching)
          </h3>
          <span className="text-[11px] text-slate-400">Instant Status Toggle</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-blue-50 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5 pl-5">Road Identifier</th>
                <th className="p-3.5">Segment Name</th>
                <th className="p-3.5">Connects</th>
                <th className="p-3.5">Distance / Base Time</th>
                <th className="p-3.5">Traffic Density</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 pr-5 text-right">Administrative Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEdges.map((edge) => (
                <tr
                  key={edge.id}
                  className={`hover:bg-blue-50/30 transition-colors ${
                    edge.status === 'blocked' ? 'bg-red-50/30' : edge.status === 'congested' ? 'bg-amber-50/20' : ''
                  }`}
                >
                  <td className="p-3.5 pl-5 font-mono font-bold text-slate-500">{edge.id}</td>
                  <td className="p-3.5 font-bold text-slate-800">{edge.name}</td>
                  <td className="p-3.5 text-slate-600 font-mono">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">{edge.from}</span>
                    <span className="text-slate-400 mx-1">↔</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">{edge.to}</span>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">
                    {edge.distance} km <span className="text-slate-400">({edge.time} min)</span>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            edge.traffic > 0.7 ? 'bg-red-500' : edge.traffic > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.round(edge.traffic * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{Math.round(edge.traffic * 100)}%</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={edge.status} />
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => updateEdgeStatus(edge.id, 'available')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          edge.status === 'available'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title="Mark Available"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => updateEdgeStatus(edge.id, 'congested')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          edge.status === 'congested'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                        }`}
                        title="Mark Congested"
                      >
                        Slow
                      </button>
                      <button
                        onClick={() => updateEdgeStatus(edge.id, 'blocked')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          edge.status === 'blocked'
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
                        }`}
                        title="Mark Blocked"
                      >
                        Block
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
