import { motion } from 'framer-motion';

function StatusBadge({ status }) {
  const config = {
    available: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Available' },
    congested: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Congested' },
    blocked: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Blocked' },
  };

  const { bg, text, dot, label } = config[status] || config.available;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'blocked' ? 'animate-pulse' : ''}`} />
      {label}
    </motion.span>
  );
}

export default StatusBadge;
