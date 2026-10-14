import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  User,
  MapPin,
  ShieldAlert,
  ThumbsUp,
  Filter,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function IncidentManagementPage() {
  const {
    publicReports,
    verifyReport,
    rejectReport,
    resolveReport,
    networkEdges
  } = useApp();

  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = publicReports.filter(r =>
    filterStatus === 'all' ? true : r.status === filterStatus
  );

  const counts = {
    all: publicReports.length,
    pending: publicReports.filter(r => r.status === 'pending').length,
    verified: publicReports.filter(r => r.status === 'verified').length,
    resolved: publicReports.filter(r => r.status === 'resolved').length,
    rejected: publicReports.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
              Incident Verification Queue
            </span>
            <span className="text-xs text-slate-400">Public Safety Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={26} />
            Public Incident Review & Verification Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review citizen-submitted accidents, road waterlogging, and tree blockages. Verifying high-severity incidents can automatically close roads to reroute emergency vehicles.
          </p>
        </div>

        {counts.pending > 0 && (
          <span className="bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs self-start sm:self-auto flex items-center gap-1.5">
            <Clock size={14} /> {counts.pending} Reports Pending Verification
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All Submissions', count: counts.all },
          { key: 'pending', label: 'Pending Review', count: counts.pending, highlight: counts.pending > 0 },
          { key: 'verified', label: 'Verified & Active', count: counts.verified },
          { key: 'resolved', label: 'Resolved (Cleared)', count: counts.resolved },
          { key: 'rejected', label: 'Rejected', count: counts.rejected },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : tab.highlight
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterStatus === tab.key ? 'bg-white/20' : 'bg-slate-200/80 text-slate-700'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-blue-100 p-12 text-center">
            <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Reports in this category</h3>
            <p className="text-xs text-slate-400 mt-1">Select another filter tab to view incidents.</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-3xl border p-5 shadow-xs transition-all ${
                report.status === 'pending'
                  ? 'border-amber-300 bg-amber-50/15'
                  : report.status === 'verified'
                  ? 'border-red-200 bg-red-50/10'
                  : report.status === 'resolved'
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : 'border-slate-200 opacity-75'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{report.id}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      report.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                      report.severity === 'high' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {report.severity} Severity
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      report.status === 'pending' ? 'bg-amber-500 text-slate-950 animate-pulse' :
                      report.status === 'verified' ? 'bg-red-600 text-white' :
                      report.status === 'resolved' ? 'bg-emerald-600 text-white' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {report.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {report.time} ({report.timestamp})
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{report.title}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                    <p className="flex items-center gap-1.5 font-medium">
                      <MapPin size={13} className="text-blue-500 flex-shrink-0" />
                      <strong className="text-slate-800">Road:</strong> {report.roadName}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <User size={13} className="text-slate-400 flex-shrink-0" />
                      <span>{report.reportedBy}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-mono">
                      <Phone size={13} className="text-slate-400 flex-shrink-0" />
                      <span>{report.contact}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-700 mt-2">
                    <p className="font-semibold text-slate-800 mb-0.5">Location & Details:</p>
                    <p className="italic">{report.locationDetails}</p>
                    {report.affectedLanes && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        <strong>Affected lanes:</strong> {report.affectedLanes}
                      </p>
                    )}
                  </div>

                  {report.verificationNotes && (
                    <div className="text-[11px] bg-blue-50/60 text-blue-900 p-2.5 rounded-xl border border-blue-100 flex items-start gap-2">
                      <Sparkles size={13} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Authority Log:</strong> {report.verificationNotes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Authority Action Buttons */}
                <div className="flex flex-wrap lg:flex-col gap-2 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => verifyReport(report.id, true)}
                        className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Verifies incident and automatically blocks affected road in routing engine"
                      >
                        <ShieldAlert size={14} /> Verify & Block Road
                      </button>
                      <button
                        onClick={() => verifyReport(report.id, false)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check size={14} /> Verify (Keep Road Open)
                      </button>
                      <button
                        onClick={() => rejectReport(report.id)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle size={14} /> Reject Report
                      </button>
                    </>
                  )}

                  {report.status === 'verified' && (
                    <button
                      onClick={() => resolveReport(report.id)}
                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={14} /> Mark Cleared & Reopen Road
                    </button>
                  )}

                  {report.status === 'resolved' && (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 size={13} /> Hazard Cleared
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
