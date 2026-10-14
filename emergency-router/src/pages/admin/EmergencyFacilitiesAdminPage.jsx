import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Bed,
  HeartPulse,
  Ambulance,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Star,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function EmergencyFacilitiesAdminPage() {
  const { facilities, updateFacility, addFacility } = useApp();
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);

  const [newFacility, setNewFacility] = useState({
    id: '',
    nodeId: '',
    name: '',
    type: 'hospital',
    category: 'Trauma & Emergency Care',
    totalBeds: 100,
    availableBeds: 25,
    icuBeds: 15,
    availableIcu: 4,
    ambulancesReady: 2,
    emergencyPhone: '+91 11 0000 0000',
    address: '',
    status: 'Operational',
    statusColor: 'emerald',
    rating: 4.8
  });

  const filteredFacilities = facilities.filter(f =>
    filterType === 'all' ? true : f.type === filterType
  );

  const handleSaveEdit = (facility) => {
    updateFacility(facility.id, facility);
    setEditingFacility(null);
  };

  const handleCreateFacility = () => {
    if (!newFacility.name || !newFacility.nodeId) return;
    addFacility({
      ...newFacility,
      id: newFacility.nodeId
    });
    setShowAddModal(false);
    setNewFacility({
      id: '',
      nodeId: '',
      name: '',
      type: 'hospital',
      category: 'Trauma & Emergency Care',
      totalBeds: 100,
      availableBeds: 25,
      icuBeds: 15,
      availableIcu: 4,
      ambulancesReady: 2,
      emergencyPhone: '+91 11 0000 0000',
      address: '',
      status: 'Operational',
      statusColor: 'emerald',
      rating: 4.8
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded uppercase">
              Healthcare & Station Assets
            </span>
            <span className="text-xs text-slate-400">Emergency Facility Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Building2 className="text-sky-600" size={26} />
            Emergency Facilities & Critical Care Capacity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor hospital bed occupancies, ICU vacancies, and stationed ambulances across City trauma centers and fire stations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} /> Add Facility
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All Facilities', count: facilities.length },
          { key: 'hospital', label: 'Hospitals', count: facilities.filter(f => f.type === 'hospital').length },
          { key: 'fire_station', label: 'Fire Stations', count: facilities.filter(f => f.type === 'fire_station').length },
          { key: 'police', label: 'Police HQ', count: facilities.filter(f => f.type === 'police').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFacilities.map(facility => (
          <motion.div
            key={facility.id}
            whileHover={{ y: -3 }}
            className="bg-white rounded-3xl border border-blue-100 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-xs ${
                    facility.type === 'hospital' ? 'bg-red-50 text-red-600 border border-red-100' :
                    facility.type === 'fire_station' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {facility.type === 'hospital' ? '🏥' : facility.type === 'fire_station' ? '🚒' : '👮'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{facility.name}</h3>
                    <p className="text-[11px] text-blue-600 font-semibold">{facility.category}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  facility.status === 'Operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  facility.status === 'High Load' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {facility.status}
                </span>
              </div>

              <div className="text-xs text-slate-500 space-y-1 mb-4">
                <p className="flex items-center gap-1.5 text-[11px]">
                  <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{facility.address}</span>
                </p>
                <p className="flex items-center gap-1.5 text-[11px]">
                  <Phone size={12} className="text-slate-400 flex-shrink-0" />
                  <span className="font-mono text-slate-700 font-bold">{facility.emergencyPhone}</span>
                </p>
              </div>

              {/* Capacities Grid */}
              {facility.type === 'hospital' ? (
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center mb-4">
                  <div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Bed size={10} /> Beds
                    </p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">
                      {facility.availableBeds}<span className="text-[10px] font-normal text-slate-400">/{facility.totalBeds}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <HeartPulse size={10} /> ICU
                    </p>
                    <p className="text-sm font-black text-red-600 mt-0.5">
                      {facility.availableIcu}<span className="text-[10px] font-normal text-slate-400">/{facility.icuBeds}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                      <Ambulance size={10} /> Docks
                    </p>
                    <p className="text-sm font-black text-blue-600 mt-0.5">
                      {facility.ambulancesReady}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs mb-4">
                  <span className="text-slate-500">Response Vehicles Ready:</span>
                  <span className="font-bold text-slate-800">{facility.ambulancesReady} Units</span>
                </div>
              )}
            </div>

            {/* Quick Action Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">Node ID: {facility.nodeId}</span>
              <button
                onClick={() => setEditingFacility(facility)}
                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Edit2 size={12} /> Edit Capacity
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingFacility && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-blue-100"
            >
              <h3 className="text-base font-bold text-slate-900">
                Update Capacity: {editingFacility.name}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Operational Status</label>
                  <select
                    value={editingFacility.status}
                    onChange={e => setEditingFacility({ ...editingFacility, status: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Operational">Operational</option>
                    <option value="High Load">High Load</option>
                    <option value="Critical Overflow">Critical Overflow</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </div>

                {editingFacility.type === 'hospital' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700">Available Beds</label>
                      <input
                        type="number"
                        value={editingFacility.availableBeds}
                        onChange={e => setEditingFacility({ ...editingFacility, availableBeds: Number(e.target.value) })}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700">Available ICU</label>
                      <input
                        type="number"
                        value={editingFacility.availableIcu}
                        onChange={e => setEditingFacility({ ...editingFacility, availableIcu: Number(e.target.value) })}
                        className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700">Emergency Phone</label>
                  <input
                    type="text"
                    value={editingFacility.emergencyPhone}
                    onChange={e => setEditingFacility({ ...editingFacility, emergencyPhone: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleSaveEdit(editingFacility)}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingFacility(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Facility Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-blue-100"
            >
              <h3 className="text-base font-bold text-slate-900">
                Register New Emergency Facility
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Facility Name</label>
                  <input
                    type="text"
                    placeholder="e.g. North City Emergency Trauma Center"
                    value={newFacility.name}
                    onChange={e => setNewFacility({ ...newFacility, name: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700">Facility Type</label>
                    <select
                      value={newFacility.type}
                      onChange={e => setNewFacility({ ...newFacility, type: e.target.value })}
                      className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                    >
                      <option value="hospital">Hospital</option>
                      <option value="fire_station">Fire Station</option>
                      <option value="police">Police Command</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700">Node Identifier</label>
                    <input
                      type="text"
                      placeholder="e.g. H4 or F3"
                      value={newFacility.nodeId}
                      onChange={e => setNewFacility({ ...newFacility, nodeId: e.target.value.toUpperCase() })}
                      className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Physical Address</label>
                  <input
                    type="text"
                    placeholder="Street, District"
                    value={newFacility.address}
                    onChange={e => setNewFacility({ ...newFacility, address: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Emergency Phone</label>
                  <input
                    type="text"
                    placeholder="+91 11 ..."
                    value={newFacility.emergencyPhone}
                    onChange={e => setNewFacility({ ...newFacility, emergencyPhone: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreateFacility}
                  disabled={!newFacility.name || !newFacility.nodeId}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Create Facility
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
