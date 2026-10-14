import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  X
} from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import { useApp } from '../../context/AppContext';

export default function AdminDashboard() {
  const {
    networkEdges,
    reports,
    verifyReport,
    resolveReport,
    theme,
    t
  } = useApp();

  const isLight = theme === 'light';
  const [selectedReport, setSelectedReport] = useState(null);

  const blockedCount = networkEdges.filter(e => e.status === 'blocked').length;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Network Overview Cards */}
      <div>
        <h2 className={`text-xs font-black tracking-wider uppercase mb-3 ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          {t('networkOverview')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Roads */}
          <div className={`border rounded-2xl p-5 shadow-lg flex items-center justify-between transition-colors ${
            isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-[#0E1830] border-slate-800 text-white'
          }`}>
            <div>
              <span className={`text-xs font-bold uppercase tracking-wide ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {t('totalRoads')}
              </span>
              <p className="text-3xl font-black mt-1">{networkEdges.length}</p>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-emerald-700' : 'text-cyan-400'}`}>
                {t('totalRoadsSub')}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border ${
              isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
            }`}>
              🛣️
            </div>
          </div>

          {/* Card 2: Blocked Roads */}
          <div className={`border rounded-2xl p-5 shadow-lg flex items-center justify-between transition-colors ${
            isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-[#0E1830] border-slate-800 text-white'
          }`}>
            <div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wide">
                {t('blockedRoads')}
              </span>
              <p className="text-3xl font-black text-red-500 mt-1">{blockedCount}</p>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('blockedRoadsSub')}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border ${
              isLight ? 'bg-red-50 border-red-200 text-red-500' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              🚫
            </div>
          </div>

          {/* Card 3: Pending Reports */}
          <div className={`border rounded-2xl p-5 shadow-lg flex items-center justify-between transition-colors ${
            isLight ? 'bg-white border-emerald-200 text-slate-900' : 'bg-[#0E1830] border-slate-800 text-white'
          }`}>
            <div>
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                {t('pendingReports')}
              </span>
              <p className="text-3xl font-black text-amber-500 mt-1">{pendingCount}</p>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('pendingReportsSub')}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              ⚠️
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Road Network Map & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Road Network Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {t('roadNetworkMap')}
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {t('available')} (Green) · {t('congested')} (Orange) · {t('blocked')} (Red)
              </p>
            </div>
            <Link
              to="/admin/roads"
              className={`text-xs font-semibold flex items-center gap-1 ${
                isLight ? 'text-violet-700 hover:text-violet-900' : 'text-violet-400 hover:text-violet-300'
              }`}
            >
              <span>{t('manageRoads')}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="h-[460px]">
            <NetworkGraph interactive={false} />
          </div>
        </div>

        {/* Recent Road Reports */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <FileText size={15} className="text-amber-500" />
              {t('recentRoadReports')}
            </h2>
            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Click to review
            </span>
          </div>

          <div className={`border rounded-2xl p-3 space-y-2.5 shadow-lg max-h-[460px] overflow-y-auto transition-colors ${
            isLight ? 'bg-white border-emerald-200' : 'bg-[#0E1830] border-slate-800'
          }`}>
            {reports.length === 0 ? (
              <p className={`p-6 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                {t('noReportsYet')}
              </p>
            ) : (
              reports.map(report => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    report.status === 'Pending'
                      ? (isLight ? 'bg-amber-50/70 border-amber-300 hover:border-amber-500' : 'bg-amber-950/20 border-amber-800/60 hover:border-amber-500')
                      : report.status === 'Verified'
                      ? (isLight ? 'bg-violet-50/70 border-violet-300 hover:border-violet-500' : 'bg-violet-950/20 border-violet-800/60 hover:border-violet-500')
                      : (isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700')
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-bold ${isLight ? 'text-slate-800' : 'text-cyan-400'}`}>
                      {report.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                      report.status === 'Pending'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : report.status === 'Verified'
                        ? 'bg-violet-100 text-violet-900 border-violet-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <p className={`text-xs font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {report.issueType}
                  </p>
                  <p className={`text-[11px] truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    {report.location}
                  </p>
                  <p className={`text-[10px] mt-1 flex items-center gap-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                    <Clock size={10} /> {report.timestamp}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Report Modal */}
      <AnimatePresence>
        {selectedReport && (
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
                <div>
                  <span className={`font-mono text-xs font-bold ${isLight ? 'text-slate-700' : 'text-cyan-400'}`}>
                    {selectedReport.id}
                  </span>
                  <h3 className="text-base font-bold mt-0.5">{selectedReport.issueType}</h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className={`p-1 rounded cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className={`font-semibold text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('reportedLocation')}
                  </span>
                  <p className="font-bold">{selectedReport.location}</p>
                </div>

                <div>
                  <span className={`font-semibold text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('description')}:
                  </span>
                  <p className={`italic p-3 rounded-xl border mt-1 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#091124] border-slate-800 text-slate-200'
                  }`}>
                    "{selectedReport.description}"
                  </p>
                </div>

                <div className={`flex items-center justify-between ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>{t('reportedAt')}: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{selectedReport.timestamp}</strong></span>
                  <span>Status: <strong className="text-amber-500">{selectedReport.status}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`pt-2 border-t flex flex-col gap-2 ${
                isLight ? 'border-emerald-200' : 'border-slate-800'
              }`}>
                {selectedReport.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        verifyReport(selectedReport.id, true);
                        setSelectedReport(null);
                      }}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <ShieldAlert size={14} />
                      {t('verifyAndBlock')}
                    </button>
                    <button
                      onClick={() => {
                        verifyReport(selectedReport.id, false);
                        setSelectedReport(null);
                      }}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      {t('verifyOnly')}
                    </button>
                  </>
                )}

                {selectedReport.status === 'Verified' && (
                  <button
                    onClick={() => {
                      resolveReport(selectedReport.id, true);
                      setSelectedReport(null);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                    {t('markResolved')}
                  </button>
                )}

                <button
                  onClick={() => setSelectedReport(null)}
                  className={`w-full py-2 rounded-xl text-xs font-medium cursor-pointer border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {t('close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
