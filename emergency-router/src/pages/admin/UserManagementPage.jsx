import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Building,
  Mail,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function UserManagementPage() {
  const { users, updateUserRole, toggleUserStatus, addUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'admin',
    department: 'Traffic Control Operations',
    permissions: ['all_access']
  });

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) return;
    addUser(newUser);
    setShowAddModal(false);
    setNewUser({
      name: '',
      email: '',
      role: 'admin',
      department: 'Traffic Control Operations',
      permissions: ['all_access']
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded uppercase">
              Security & Permissions
            </span>
            <span className="text-xs text-slate-400">Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Users className="text-indigo-600" size={26} />
            User Management & Portal Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure access credentials for traffic controllers, hospital dispatchers, and public citizens across the two portals.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus size={15} /> Add User Account
        </button>
      </div>

      {/* Role Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F2038] to-[#1E3A5F] text-white flex items-center justify-center text-xl shadow-sm">
            👨‍💼
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold">Admin Accounts</span>
            <p className="text-2xl font-black text-slate-900">
              {users.filter(u => u.role === 'admin').length}
            </p>
            <p className="text-[11px] text-blue-600 font-medium">Full road & dispatch control</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 text-white flex items-center justify-center text-xl shadow-sm">
            👤
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold">Citizen Accounts</span>
            <p className="text-2xl font-black text-slate-900">
              {users.filter(u => u.role === 'user').length}
            </p>
            <p className="text-[11px] text-sky-600 font-medium">Public routing & reporting</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-blue-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-xl shadow-sm">
            <KeyRound size={22} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold">Security State</span>
            <p className="text-2xl font-black text-emerald-600">Active</p>
            <p className="text-[11px] text-slate-400">Enforced by RBAC Guard</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-blue-100 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800">
            Registered Accounts & Portal Assignment ({users.length})
          </h3>
          <span className="text-[11px] text-slate-400">Instant Role Modification</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-blue-50 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5 pl-5">User</th>
                <th className="p-3.5">Department / Affiliation</th>
                <th className="p-3.5">Portal Level</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        u.role === 'admin' ? 'bg-blue-900 text-white' : 'bg-sky-100 text-sky-800'
                      }`}>
                        {u.role === 'admin' ? '👨‍💼' : '👤'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">{u.department}</td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === 'admin'
                        ? 'bg-blue-950 text-blue-200 border border-blue-800'
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                      {u.portal || (u.role === 'admin' ? 'Admin Portal' : 'User Portal')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <select
                      value={u.role}
                      onChange={e => updateUserRole(u.id, e.target.value)}
                      className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-xs"
                    >
                      <option value="admin">Admin (Full)</option>
                      <option value="user">Citizen (Public)</option>
                    </select>
                  </td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">{u.lastActive}</td>
                  <td className="p-3.5 pr-5 text-right">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        u.status === 'Active'
                          ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-blue-100"
            >
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus size={18} className="text-blue-600" />
                Register New User Account
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Captain Ramesh Sen"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Official Email</label>
                  <input
                    type="email"
                    placeholder="user@traffic.gov or name@domain.com"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Portal Access Level</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="admin">Admin Portal (Authority & Emergency Operations)</option>
                    <option value="user">User Portal (Public Citizen & Assistance)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700">Department / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Traffic Police HQ, Fire Command, Citizen Commuter"
                    value={newUser.department}
                    onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full mt-1 p-2.5 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreateUser}
                  disabled={!newUser.name || !newUser.email}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs"
                >
                  Create User Account
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
