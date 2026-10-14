import { motion } from 'framer-motion';
import { FileText, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MyReportsPage() {
  const { reports, theme, t } = useApp();
  const isLight = theme === 'light';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className={`border rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-[#0E1830] border-slate-800 text-white'
      }`}>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            isLight
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60'
          }`}>
            {t('publicBadge')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-1.5 flex items-center gap-2">
            <FileText className={isLight ? 'text-emerald-600' : 'text-cyan-400'} size={24} />
            {t('myReportsTitle')}
          </h1>
          <p className={`text-xs sm:text-sm mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            {t('myReportsSubtitle')}
          </p>
        </div>

        <div className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border ${
          isLight ? 'bg-emerald-50 border-emerald-200 text-slate-800' : 'bg-[#091124] border-slate-800 text-slate-300'
        }`}>
          <span>Total Reports:</span>
          <span className={`font-mono text-sm ${isLight ? 'text-emerald-700' : 'text-cyan-400'}`}>
            {reports.length}
          </span>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.length === 0 ? (
          <div className={`border rounded-2xl p-12 text-center space-y-2 ${
            isLight ? 'bg-white border-emerald-200 text-slate-600' : 'bg-[#0E1830] border-slate-800 text-slate-400'
          }`}>
            <CheckCircle2 size={36} className={`mx-auto ${isLight ? 'text-emerald-500' : 'text-slate-600'}`} />
            <p className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {t('noReportsSubmitted')}
            </p>
            <p className="text-xs">{t('clickReportTip')}</p>
          </div>
        ) : (
          reports.map(report => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-2xl p-5 shadow-lg space-y-3 transition-colors ${
                isLight
                  ? 'bg-white border-emerald-200 hover:border-emerald-300'
                  : 'bg-[#0E1830] border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                    isLight
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-cyan-950/60 text-cyan-400 border-cyan-900/60'
                  }`}>
                    {report.id}
                  </span>
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {report.issueType}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Clock size={12} /> {report.timestamp}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    report.status === 'Pending'
                      ? (isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/10 text-amber-400 border-amber-500/30')
                      : report.status === 'Verified'
                      ? (isLight ? 'bg-violet-100 text-violet-900 border-violet-300' : 'bg-violet-500/10 text-violet-300 border-violet-500/30')
                      : (isLight ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30')
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>

              <div>
                <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('reportedLocation')}
                </span>
                <p className={`text-xs font-bold mt-0.5 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                  {report.location}
                </p>
              </div>

              <div className={`p-3 rounded-xl border text-xs ${
                isLight ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' : 'bg-[#091124] border-slate-800/80 text-slate-300'
              }`}>
                <p className={`text-[11px] font-semibold mb-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {t('description')}:
                </p>
                <p className="italic">"{report.description}"</p>
              </div>

              <div className={`flex items-center justify-between text-[11px] pt-1 border-t ${
                isLight ? 'border-emerald-200 text-slate-600' : 'border-slate-800/60 text-slate-400'
              }`}>
                <span>Reported by: <strong className={isLight ? 'text-slate-900' : 'text-slate-300'}>{report.reportedBy}</strong></span>
                <span>
                  {report.status === 'Pending' && t('statusPendingMsg')}
                  {report.status === 'Verified' && t('statusVerifiedMsg')}
                  {report.status === 'Resolved' && t('statusResolvedMsg')}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
