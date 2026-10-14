import { motion } from 'framer-motion';

function StatCard({ title, value, icon: Icon, trend, trendUp, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
  };

  const bgColorMap = {
    blue: 'bg-blue-50',
    green: 'bg-emerald-50',
    red: 'bg-red-50',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.blue} flex items-center justify-center text-white`}>
          {Icon && <Icon size={22} />}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
