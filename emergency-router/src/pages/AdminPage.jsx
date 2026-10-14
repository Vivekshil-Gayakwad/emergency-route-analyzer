import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Filter, Edit3, AlertTriangle, CheckCircle, XCircle, Plus, Trash2, Bell } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

function AdminPage() {
  const { networkEdges = [], updateEdgeStatus, incidents = [], setIncidents, addNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingEdge, setEditingEdge] = useState(null);
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [newIncident, setNewIncident] = useState({ type: 'accident', location: '', severity: 'medium', description: '' });

  const edges = networkEdges || [];
  const currentIncidents = incidents || [];

  const filteredEdges = edges.filter(edge => {
    const name = edge.name || '';
    const from = edge.from || '';
    const to = edge.to || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || edge.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleStatusChange = (edgeId, newStatus) => {
    if (updateEdgeStatus) {
      updateEdgeStatus(edgeId, newStatus);
    }
    setEditingEdge(null);
  };

  const handleAddIncident = () => {
    if (newIncident.location && newIncident.description) {
      const incident = {
        id: Date.now(),
        ...newIncident,
        edgeId: null,
        time: 'Just now',
      };
      if (setIncidents) {
        setIncidents(prev => [incident, ...(prev || [])]);
      }
      if (addNotification) {
        addNotification(`New incident reported: ${newIncident.description}`, 'danger');
      }
      setNewIncident({ type: 'accident', location: '', severity: 'medium', description: '' });
      setShowAddIncident(false);
    }
  };

  const statusCounts = {
    all: edges.length,
    available: edges.filter(e => e.status === 'available').length,
    congested: edges.filter(e => e.status === 'congested').length,
    blocked: edges.filter(e => e.status === 'blocked').length,
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-blue-500" size={28} />
            Admin Panel
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage road conditions, report incidents, and control traffic flow.</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddIncident(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus size={16} />
            Report Incident
          </motion.button>
        </div>
      </div>

      {/* Status overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterStatus(status)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              filterStatus === status
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-blue-100 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {status === 'all' && <Filter size={16} className="text-blue-500" />}
              {status === 'available' && <CheckCircle size={16} className="text-emerald-500" />}
              {status === 'congested' && <AlertTriangle size={16} className="text-amber-500" />}
              {status === 'blocked' && <XCircle size={16} className="text-red-500" />}
              <span className="text-sm font-medium text-gray-600 capitalize">{status}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
          </motion.button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search roads by name, from, or to..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
        />
      </div>

      {/* Roads management table */}
      <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
          <h3 className="font-semibold text-gray-800">Road Management ({filteredEdges.length} roads)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blue-100 bg-blue-50/50">
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Road Name</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Route</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Distance</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Time</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Traffic Load</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEdges.map((edge, idx) => (
                <motion.tr
                  key={edge.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-blue-50/50 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="p-3 text-sm text-gray-400 font-mono">{edge.id}</td>
                  <td className="p-3 text-sm font-medium text-gray-800">{edge.name}</td>
                  <td className="p-3 text-sm text-gray-500">{edge.from} → {edge.to}</td>
                  <td className="p-3 text-sm text-gray-500">{edge.distance} km</td>
                  <td className="p-3 text-sm text-gray-500">{edge.time} min</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(edge.traffic || 0) * 100}%` }}
                          className={`h-full rounded-full ${
                            (edge.traffic || 0) > 0.7 ? 'bg-red-500' : (edge.traffic || 0) > 0.4 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{Math.round((edge.traffic || 0) * 100)}%</span>
                    </div>
                  </td>
                  <td className="p-3"><StatusBadge status={edge.status} /></td>
                  <td className="p-3">
                    {editingEdge === edge.id ? (
                      <div className="flex gap-1">
                        {['available', 'congested', 'blocked'].map(s => (
                          <motion.button
                            key={s}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusChange(edge.id, s)}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              s === 'available' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                              s === 'congested' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                              'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {s === 'available' ? '✓' : s === 'congested' ? '⚠' : '✕'}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingEdge(edge.id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={14} />
                      </motion.button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incidents list */}
      <div className="bg-white rounded-xl border border-blue-100 overflow-hidden shadow-sm">
        <div className="p-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            Reported Incidents ({currentIncidents.length})
          </h3>
        </div>
        <div className="divide-y divide-blue-50">
          {currentIncidents.map((incident, idx) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 hover:bg-blue-50/30 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  incident.severity === 'critical' ? 'bg-red-100' :
                  incident.severity === 'high' ? 'bg-amber-100' : 'bg-blue-100'
                }`}>
                  {incident.type === 'accident' ? '💥' : incident.type === 'flood' ? '🌊' : '🚧'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{incident.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400">{incident.location}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      incident.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{incident.severity}</span>
                    <span className="text-xs text-gray-400">{incident.time}</span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIncidents && setIncidents(prev => (prev || []).filter(i => i.id !== incident.id))}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Incident Modal */}
      <AnimatePresence>
        {showAddIncident && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowAddIncident(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 w-full max-w-md overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Bell size={18} />
                    Report New Incident
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Incident Type</label>
                    <select
                      value={newIncident.type}
                      onChange={e => setNewIncident(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="accident">Accident</option>
                      <option value="flood">Flood</option>
                      <option value="construction">Construction</option>
                      <option value="closure">Road Closure</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Location</label>
                    <input
                      type="text"
                      value={newIncident.location}
                      onChange={e => setNewIncident(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Enter road or location name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Severity</label>
                    <div className="flex gap-2 mt-1">
                      {['low', 'medium', 'high', 'critical'].map(s => (
                        <button
                          key={s}
                          onClick={() => setNewIncident(prev => ({ ...prev, severity: s }))}
                          className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium capitalize transition-all ${
                            newIncident.severity === s
                              ? s === 'critical' ? 'bg-red-500 text-white' :
                                s === 'high' ? 'bg-amber-500 text-white' :
                                s === 'medium' ? 'bg-blue-500 text-white' :
                                'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                    <textarea
                      value={newIncident.description}
                      onChange={e => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none h-20"
                      placeholder="Describe the incident..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddIncident}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-lg font-medium text-sm shadow-md"
                    >
                      Report Incident
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddIncident(false)}
                      className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminPage;
