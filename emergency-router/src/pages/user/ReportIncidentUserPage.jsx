import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileEdit,
  Camera,
  MapPin,
  AlertTriangle,
  Send,
  CheckCircle2,
  Clock,
  Phone,
  User,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ReportIncidentUserPage() {
  const { networkEdges, submitPublicReport, publicReports } = useApp();

  const [form, setForm] = useState({
    title: '',
    type: 'accident',
    roadName: networkEdges[0]?.name || 'Main Street North',
    edgeId: networkEdges[0]?.id || 'e1',
    locationDetails: '',
    severity: 'high',
    reportedBy: 'Aarav Mehta (Citizen)',
    contact: '+91 98123 45678',
    affectedLanes: 'Both directions partially blocked'
  });

  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [photoUploaded, setPhotoUploaded] = useState(false);

  const handleRoadChange = (edgeId) => {
    const edge = networkEdges.find(e => e.id === edgeId);
    setForm({
      ...form,
      edgeId,
      roadName: edge ? edge.name : edgeId
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.locationDetails) return;

    const report = submitPublicReport(form);
    setSubmittedTicket(report);
    setPhotoUploaded(false);

    // Reset fields
    setForm({
      title: '',
      type: 'accident',
      roadName: networkEdges[0]?.name || 'Main Street North',
      edgeId: networkEdges[0]?.id || 'e1',
      locationDetails: '',
      severity: 'high',
      reportedBy: 'Aarav Mehta (Citizen)',
      contact: '+91 98123 45678',
      affectedLanes: 'Both directions partially blocked'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg">
        <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Citizen Reporting Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight flex items-center gap-2">
          <FileEdit size={26} />
          Report Accident, Roadblock, or Flooding
        </h1>
        <p className="text-xs sm:text-sm text-amber-50 max-w-2xl mt-1 leading-relaxed">
          Submit live road hazards directly to the Metropolitan Traffic Authority. Verified reports automatically warn fellow citizens and reroute emergency vehicles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-blue-100 p-6 sm:p-8 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={18} />
              Incident Report Submission Form
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hazard Category</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="accident">💥 Road Accident / Collision</option>
                    <option value="flood">🌊 Waterlogging / Flash Flood</option>
                    <option value="roadblock">🚧 Tree Fall / Road Obstruction</option>
                    <option value="construction">🏗️ Deep Pothole / Roadwork</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Severity Level</label>
                  <select
                    value={form.severity}
                    onChange={e => setForm({ ...form, severity: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="critical">Critical (Road Completely Blocked)</option>
                    <option value="high">High (Severe Crawl / Partial Block)</option>
                    <option value="medium">Medium (Slow Moving Hazard)</option>
                    <option value="low">Low (Minor Advisory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Affected Road Segment</label>
                <select
                  value={form.edgeId}
                  onChange={e => handleRoadChange(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {networkEdges.map(edge => (
                    <option key={edge.id} value={edge.id}>
                      {edge.name} ({edge.from} ↔ {edge.to})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Headline / Incident Title</label>
                <input
                  type="text"
                  placeholder="e.g. Fallen banyan tree blocking both lanes near junction"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Exact Location & Landmark Description</label>
                <textarea
                  rows="3"
                  placeholder="Provide precise landmark details, direction of travel, and scene conditions..."
                  value={form.locationDetails}
                  onChange={e => setForm({ ...form, locationDetails: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              {/* Photo Upload Simulator */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Attach Incident Photo (Optional)</label>
                <div
                  onClick={() => setPhotoUploaded(!photoUploaded)}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    photoUploaded
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                      : 'border-slate-300 hover:border-amber-400 bg-slate-50'
                  }`}
                >
                  <UploadCloud size={24} className={`mx-auto mb-1 ${photoUploaded ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {photoUploaded ? (
                    <span className="font-bold text-xs">✓ Photo attached: scene_capture_01.jpg (Simulated)</span>
                  ) : (
                    <span className="text-xs text-slate-500">Click to attach photo or drag file here</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={form.reportedBy}
                    onChange={e => setForm({ ...form, reportedBy: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone for Verification</label>
                  <input
                    type="text"
                    value={form.contact}
                    onChange={e => setForm({ ...form, contact: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Send size={16} />
                Submit Incident Report for Authority Verification
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Tracking Ticket & Recent Reports */}
        <div className="space-y-4">
          {submittedTicket && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 rounded-3xl border-2 border-emerald-300 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <h3 className="text-sm font-black">Report Successfully Submitted!</h3>
              </div>
              <p className="text-xs text-emerald-700">
                Your report has entered the Traffic Command verification queue.
              </p>
              <div className="p-3 bg-white rounded-2xl border border-emerald-200 text-xs">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Tracking Ticket ID:</span>
                <p className="font-mono font-black text-sm text-slate-800">{submittedTicket.id}</p>
                <p className="text-[11px] text-slate-500 mt-1">Status: <strong className="text-amber-600">Pending Review</strong></p>
              </div>
            </motion.div>
          )}

          {/* Active Citizen Reports Feed */}
          <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Clock size={14} className="text-blue-600" />
              Community Reports Status
            </h3>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {publicReports.slice(0, 4).map(report => (
                <div key={report.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">{report.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      report.status === 'verified' ? 'bg-red-100 text-red-700' :
                      report.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 leading-tight">{report.title}</h4>
                  <p className="text-[11px] text-slate-500">{report.roadName} · {report.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
