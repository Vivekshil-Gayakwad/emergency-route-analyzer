import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, AlertTriangle, Activity, Route } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import StatCard from '../components/StatCard';
import { useApp } from '../context/AppContext';
import { analyticsData as mockAnalyticsData } from '../data/mockData';

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'];

const fallbackAnalyticsData = {
  responseTimeHistory: [
    { time: '00:00', avgTime: 9.2 },
    { time: '04:00', avgTime: 7.8 },
    { time: '08:00', avgTime: 12.4 },
    { time: '12:00', avgTime: 10.1 },
    { time: '16:00', avgTime: 13.5 },
    { time: '20:00', avgTime: 8.9 },
  ],
  incidentsByType: [
    { type: 'Accident', count: 14 },
    { type: 'Congestion', count: 28 },
    { type: 'Road Work', count: 8 },
    { type: 'Weather', count: 5 },
    { type: 'Hazard', count: 3 },
  ],
  routeEfficiency: [
    { route: 'Downtown → North Hosp', optimal: 8, actual: 11 },
    { route: 'Central → South Clin', optimal: 12, actual: 13 },
    { route: 'West End → Station 3', optimal: 6, actual: 9 },
    { route: 'East Dist → General Hosp', optimal: 15, actual: 16 },
    { route: 'Port → Trauma Center', optimal: 10, actual: 14 },
  ],
  dailyEmergencies: [
    { day: 'Mon', calls: 42 },
    { day: 'Tue', calls: 38 },
    { day: 'Wed', calls: 55 },
    { day: 'Thu', calls: 49 },
    { day: 'Fri', calls: 62 },
    { day: 'Sat', calls: 58 },
    { day: 'Sun', calls: 45 },
  ],
};

const analyticsData = mockAnalyticsData || fallbackAnalyticsData;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function AnalyticsPage() {
  const { networkEdges = [], networkNodes = [] } = useApp();
  const edges = networkEdges || [];
  const blockedCount = edges.filter(e => e.status === 'blocked').length;
  const congestedCount = edges.filter(e => e.status === 'congested').length;
  const avgTraffic = edges.length > 0 ? Math.round((edges.reduce((sum, e) => sum + (e.traffic || 0), 0) / edges.length) * 100) : 0;

  const responseTimeHistory = analyticsData.responseTimeHistory || fallbackAnalyticsData.responseTimeHistory;
  const incidentsByType = analyticsData.incidentsByType || fallbackAnalyticsData.incidentsByType;
  const routeEfficiency = analyticsData.routeEfficiency || fallbackAnalyticsData.routeEfficiency;
  const dailyEmergencies = analyticsData.dailyEmergencies || fallbackAnalyticsData.dailyEmergencies;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-500" size={28} />
          Analytics Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Monitor system performance, traffic patterns, and emergency response metrics.</p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Response Time" value="8.5 min" icon={Clock} color="blue" delay={0.1} trend="-12% from last week" trendUp={true} />
        <StatCard title="Active Incidents" value={blockedCount + congestedCount} icon={AlertTriangle} color="amber" delay={0.2} />
        <StatCard title="Network Uptime" value="94.2%" icon={Activity} color="green" delay={0.3} trend="+2.1%" trendUp={true} />
        <StatCard title="Routes Calculated" value="1,247" icon={Route} color="purple" delay={0.4} trend="+8% today" trendUp={true} />
      </motion.div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            Average Response Time (24h)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={responseTimeHistory}>
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFF6FF" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #DBEAFE', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="avgTime" stroke="#3B82F6" strokeWidth={2} fill="url(#colorTime)" name="Avg Time (min)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Incidents by Type */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            Incidents by Type
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={incidentsByType}
                cx="50%" cy="50%"
                outerRadius={90}
                innerRadius={50}
                dataKey="count"
                nameKey="type"
                label={({ type, count }) => `${type}: ${count}`}
                labelLine={true}
              >
                {incidentsByType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #DBEAFE' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Route Efficiency */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Route size={16} className="text-green-500" />
            Route Efficiency (Optimal vs Actual)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={routeEfficiency} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFF6FF" />
              <XAxis dataKey="route" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #DBEAFE' }}
              />
              <Bar dataKey="optimal" fill="#3B82F6" name="Optimal (min)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#93C5FD" name="Actual (min)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Emergencies */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity size={16} className="text-purple-500" />
            Daily Emergency Calls
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyEmergencies}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFF6FF" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #DBEAFE' }}
              />
              <Line type="monotone" dataKey="calls" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 4 }} name="Calls" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Traffic overview */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl border border-blue-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Road Traffic Overview</h3>
        <div className="space-y-3">
          {edges.slice(0, 10).map((edge, idx) => (
            <div key={edge.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-40 truncate">{edge.name}</span>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(edge.traffic || 0) * 100}%` }}
                  transition={{ delay: idx * 0.05, duration: 0.8 }}
                  className={`h-full rounded-full ${
                    (edge.traffic || 0) > 0.7 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                    (edge.traffic || 0) > 0.4 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                    'bg-gradient-to-r from-green-400 to-green-500'
                  }`}
                />
              </div>
              <span className="text-xs text-gray-400 w-10 text-right">{Math.round((edge.traffic || 0) * 100)}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AnalyticsPage;
