import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Map, Shield, BarChart3, Network, Building2, AlertTriangle, Ambulance, Truck, Clock, MapPin, Activity, Route } from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import NetworkGraph from '../components/NetworkGraph';
import { useApp } from '../context/AppContext';
import { incidents, emergencyVehicles } from '../data/mockData';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function HomePage() {
  const { networkEdges = [], networkNodes = [] } = useApp() || {};
  const blockedCount = (networkEdges || []).filter(e => e.status === 'blocked').length;
  const congestedCount = (networkEdges || []).filter(e => e.status === 'congested').length;
  const healthPercent = networkEdges?.length ? Math.round(((networkEdges.length - blockedCount) / networkEdges.length) * 100) : 100;

  const quickActions = [
    { to: '/map', icon: Map, label: 'Find Route', desc: 'Calculate emergency routes', color: 'from-blue-500 to-blue-600' },
    { to: '/admin', icon: Shield, label: 'Admin Panel', desc: 'Manage road conditions', color: 'from-emerald-500 to-emerald-600' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics', desc: 'View system statistics', color: 'from-purple-500 to-purple-600' },
    { to: '/resilience', icon: Network, label: 'Resilience', desc: 'Network analysis', color: 'from-amber-500 to-amber-600' },
    { to: '/facilities', icon: Building2, label: 'Facilities', desc: 'Find nearby facilities', color: 'from-red-500 to-red-600' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">🚑</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Emergency Route Analyzer</h1>
              <p className="text-blue-100 text-sm">Network Resilience & Route Optimization System</p>
            </div>
          </div>
          <p className="text-blue-100 mt-3 max-w-2xl text-sm leading-relaxed">
            Monitor road networks in real-time, find optimal emergency routes, and analyze network resilience 
            to ensure emergency vehicles can always reach their destinations.
          </p>
          <div className="flex gap-3 mt-5">
            <Link
              to="/map"
              className="bg-white text-blue-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg"
            >
              Find Route →
            </Link>
            <Link
              to="/resilience"
              className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors border border-white/30"
            >
              Analyze Network
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Roads" value={networkEdges.length} icon={Route} color="blue" delay={0.1} />
        <StatCard title="Active Vehicles" value={(emergencyVehicles || []).filter(v => v.status === 'en_route').length} icon={Ambulance} color="green" delay={0.2} trend="2 en route" trendUp={true} />
        <StatCard title="Blocked Roads" value={blockedCount} icon={AlertTriangle} color="red" delay={0.3} trend={`${congestedCount} congested`} trendUp={false} />
        <StatCard title="Network Health" value={`${healthPercent}%`} icon={Activity} color={healthPercent > 80 ? 'green' : 'amber'} delay={0.4} />
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickActions.map((action, idx) => (
              <Link key={action.to} to={action.to}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="bg-white rounded-xl p-4 border border-blue-100 hover:shadow-lg transition-shadow text-center group cursor-pointer"
                >
                  <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-2 group-hover:shadow-md transition-shadow`}>
                    <action.icon size={20} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{action.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Active Vehicles */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Emergency Vehicles</h2>
          <div className="bg-white rounded-xl border border-blue-100 overflow-hidden">
            {(emergencyVehicles || []).map((vehicle, idx) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="p-3 border-b border-blue-50 last:border-b-0 hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {vehicle.type === 'ambulance' ? '🚑' : '🚒'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{vehicle.name}</p>
                      <p className="text-xs text-gray-400">ID: {vehicle.id}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    vehicle.status === 'en_route'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {vehicle.status === 'en_route' ? 'En Route' : 'Available'}
                  </span>
                </div>
                {vehicle.destination && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin size={10} /> Heading to: {networkNodes?.find(n => n.id === vehicle.destination)?.name || vehicle.destination}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Network Preview and Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Graph Preview */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Network Overview</h2>
          <NetworkGraph width={700} height={400} interactive={false} />
        </motion.div>

        {/* Recent Incidents */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Incidents</h2>
          <div className="space-y-3">
            {(incidents || []).map((incident, idx) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * idx }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-4 border border-blue-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                    incident.severity === 'critical' ? 'bg-red-100' :
                    incident.severity === 'high' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    {incident.type === 'accident' ? '💥' : incident.type === 'flood' ? '🌊' : '🚧'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{incident.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{incident.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        incident.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {incident.severity}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {incident.time}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default HomePage;
