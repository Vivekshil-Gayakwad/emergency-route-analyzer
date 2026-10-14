import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Search, Edit2, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ManageRoadsPage() {
  const { networkEdges, updateRoadStatus, theme, t } = useApp();
  const isLight = theme === 'light';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingRoad, setEditingRoad] = useState(null);

  // Edit modal form state
  const [newStatus, setNewStatus] = useState('available');
  const [reason, setReason] = useState('');

  const filteredEdges = networkEdges.filter(e => {
    const matchesFilter = statusFilter === 'all' || e.status === statusFilter;
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.from.toLowerCase().includes(search.toLowerCase()) ||
      e.to.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenEdit = (road) => {
    setEditingRoad(road);
    setNewStatus(road.status);
    setReason(road.reason || '');
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (!editingRoad) return;

    updateRoadStatus(editingRoad.id, newStatus, reason);
    setEditingRoad(null);
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
              ? 'bg-violet-100 text-violet-800 border-violet-300'
              : 'bg-violet-950/80 text-violet-400 border-violet-800/60'
          }`}>
            {t('adminBadge')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-1.5 flex items-center gap-2">
            <ShieldAlert className="text-violet-500" size={24} />
            {t('manageRoadsTitle')}
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {t('manageRoadsSub')}
          </p>
        </div>

        {/* Quick status counts */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-lg font-bold border ${
            isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {networkEdges.filter(e => e.status === 'available').length} {t('available')}
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold border ${
            isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {networkEdges.filter(e => e.status === 'congested').length} {t('congested')}
          </span>
          <span className={`px-2.5 py-1 rounded-lg font-bold border ${
            isLight ? 'bg-red-100 text-red-900 border-red-300' : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {networkEdges.filter(e => e.status === 'blocked').length} {t('blocked')}
          </span>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder={t('searchRoadPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium outline-none border transition-colors ${
              isLight
                ? 'bg-white border-emerald-200 text-slate-900 focus:border-violet-500'
                : 'bg-[#0E1830] border-slate-800 text-white focus:ring-2 focus:ring-violet-500'
            }`}
          />
        </div>

        <div className="flex gap-1.5">
          {['all', 'available', 'congested', 'blocked'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                statusFilter === st
                  ? 'bg-violet-600 text-white shadow-sm border-violet-600'
                  : (isLight
                      ? 'bg-white text-slate-700 hover:bg-slate-100 border-emerald-200'
                      : 'bg-[#0E1830] text-slate-400 hover:text-white hover:bg-slate-800 border-slate-800')
              }`}
            >
              {st === 'all' ? t('all') : t(st)}
            </button>
          ))}
        </div>
      </div>

      {/* Roads Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-xl transition-colors ${
        isLight ? 'bg-white border-emerald-200' : 'bg-[#0E1830] border-slate-800'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`border-b font-bold uppercase tracking-wider text-[11px] ${
                isLight ? 'bg-emerald-50/70 border-emerald-200 text-slate-700' : 'bg-[#091124] border-slate-800 text-slate-400'
              }`}>
                <th className="p-4 pl-6">{t('roadName')}</th>
                <th className="p-4">{t('intersections')}</th>
                <th className="p-4">{t('lengthBaseTime')}</th>
                <th className="p-4">{t('currentStatus')}</th>
                <th className="p-4">{t('activeDelayReason')}</th>
                <th className="p-4 pr-6 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
              {filteredEdges.map(edge => (
                <tr key={edge.id} className={isLight ? 'hover:bg-emerald-50/40' : 'hover:bg-slate-800/40'}>
                  <td className={`p-4 pl-6 font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {edge.name}
                  </td>
                  <td className={`p-4 font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <span className="font-semibold">{edge.from}</span> ↔ <span className="font-semibold">{edge.to}</span>
                  </td>
                  <td className={`p-4 font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {edge.distance} km ({edge.time} min)
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      edge.status === 'available'
                        ? (isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30')
                        : edge.status === 'congested'
                        ? (isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')
                        : (isLight ? 'bg-red-100 text-red-900 border-red-300' : 'bg-red-500/10 text-red-400 border-red-500/30')
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        edge.status === 'available' ? 'bg-emerald-500' :
                        edge.status === 'congested' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                      {t(edge.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium">{edge.reason || t('normalFlow')}</span>
                    {edge.delay > 0 && edge.status !== 'blocked' && (
                      <span className="text-amber-500 font-mono block text-[10px]">+{edge.delay} min delay</span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleOpenEdit(edge)}
                      className={`px-3 py-1.5 border rounded-lg font-bold text-xs flex items-center gap-1 ml-auto transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100'
                          : 'bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 hover:text-white border-violet-500/40'
                      }`}
                    >
                      <Edit2 size={12} />
                      {t('edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Road Modal */}
      <AnimatePresence>
        {editingRoad && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 ${
                isLight ? 'bg-white border-emerald-300 text-slate-900' : 'bg-[#0E1830] border-slate-700 text-white'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${
                isLight ? 'border-emerald-200' : 'border-slate-800'
              }`}>
                <h3 className="text-base font-bold">{t('updateRoad')}</h3>
                <button
                  onClick={() => setEditingRoad(null)}
                  className={`p-1 rounded cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveChanges} className="space-y-4 text-xs">
                <div>
                  <span className={`font-semibold block text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('roadName')}:
                  </span>
                  <p className="text-sm font-bold mt-0.5">{editingRoad.name}</p>
                  <p className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {editingRoad.from} ↔ {editingRoad.to} ({editingRoad.distance} km)
                  </p>
                </div>

                <div>
                  <span className={`font-semibold block text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('currentStatus')}:
                  </span>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    editingRoad.status === 'available'
                      ? (isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30')
                      : editingRoad.status === 'congested'
                      ? (isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')
                      : (isLight ? 'bg-red-100 text-red-900 border-red-300' : 'bg-red-500/10 text-red-400 border-red-500/30')
                  }`}>
                    {editingRoad.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {t('newStatus')}
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className={`w-full p-2.5 rounded-xl font-medium outline-none border cursor-pointer ${
                      isLight
                        ? 'bg-slate-50 border-emerald-200 text-slate-900 focus:ring-2 focus:ring-violet-500'
                        : 'bg-[#091124] border-slate-700 text-white focus:ring-2 focus:ring-violet-500'
                    }`}
                  >
                    <option value="available" className="bg-slate-900 text-white">{t('availableOpen')}</option>
                    <option value="congested" className="bg-slate-900 text-white">{t('congestedDelay')}</option>
                    <option value="blocked" className="bg-slate-900 text-white">{t('blockedClosed')}</option>
                  </select>
                </div>

                <div>
                  <label className={`font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    {t('reason')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('reasonPlaceholder')}
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className={`w-full p-2.5 rounded-xl font-medium outline-none border ${
                      isLight
                        ? 'bg-slate-50 border-emerald-200 text-slate-900 focus:ring-2 focus:ring-violet-500'
                        : 'bg-[#091124] border-slate-700 text-white focus:ring-2 focus:ring-violet-500'
                    }`}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingRoad(null)}
                    className={`flex-1 py-2.5 rounded-xl font-bold transition-colors cursor-pointer border ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-md shadow-violet-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check size={14} />
                    {t('saveChanges')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
