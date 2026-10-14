import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  FileText,
  AlertTriangle,
  LogOut,
  X,
  Send,
  CheckCircle2,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UserLayout() {
  const navigate = useNavigate();
  const {
    networkEdges,
    addReport,
    logout,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t
  } = useApp();

  const isLight = theme === 'light';

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState(false);

  // Modal form state
  const [reportLocation, setReportLocation] = useState('');
  const [issueType, setIssueType] = useState('Road blockage');
  const [description, setDescription] = useState('');

  const activeRoadId = reportLocation || networkEdges[0]?.id || 'R1';

  const handleSubmitReport = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const targetEdge = networkEdges.find(e => e.id === activeRoadId);
    const locName = targetEdge ? `${targetEdge.name} (${targetEdge.from} ↔ ${targetEdge.to})` : activeRoadId;

    addReport({
      edgeId: activeRoadId,
      location: locName,
      issueType,
      description,
    });

    setReportSuccessMessage(true);
    setTimeout(() => {
      setReportSuccessMessage(false);
      setIsReportModalOpen(false);
      setDescription('');
    }, 2200);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isLight ? 'bg-[#F0FDF4] text-slate-900' : 'bg-[#070D1E] text-slate-100'
    }`}>
      {/* Top Navigation Bar */}
      <header className={`h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md border-b transition-colors ${
        isLight ? 'bg-white border-emerald-200' : 'bg-[#0E1830] border-slate-800/90'
      }`}>
        {/* Left: Branding & Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/public')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-500 flex items-center justify-center text-lg shadow-md text-white">
              🚑
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  ERNA
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                  isLight
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                }`}>
                  {t('publicPortal')}
                </span>
              </div>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink
              to="/public"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? (isLight
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')
                    : (isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60')
                }`
              }
            >
              <Map size={14} />
              <span>{t('dashboard')}</span>
            </NavLink>

            <NavLink
              to="/public/reports"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? (isLight
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30')
                    : (isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60')
                }`
              }
            >
              <FileText size={14} />
              <span>{t('myReports')}</span>
            </NavLink>
          </nav>
        </div>

        {/* Right: Language, Theme Toggle, Report Button & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className={`flex items-center gap-1 p-1 rounded-xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700'
          }`}>
            <Globe size={13} className="text-slate-400 ml-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`bg-transparent text-xs font-bold px-1.5 py-0.5 outline-none cursor-pointer ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              <option value="en" className="bg-slate-900 text-white">EN</option>
              <option value="hi" className="bg-slate-900 text-white">हिं</option>
              <option value="mr" className="bg-slate-900 text-white">म</option>
            </select>
          </div>

          {/* Theme Toggle (Light Green & White vs Dark Navy) */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isLight
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Light / Dark Mode"
          >
            {isLight ? <Moon size={14} className="text-slate-700" /> : <Sun size={14} className="text-amber-400" />}
            <span className="hidden md:inline">{isLight ? 'Dark' : 'Light'}</span>
          </button>

          {/* Report Road Problem CTA */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className={`px-3 py-1.5 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
              isLight
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-200'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-950'
            }`}
          >
            <AlertTriangle size={14} />
            <span className="hidden sm:inline">{t('reportRoadIssue')}</span>
            <span className="sm:hidden">Report</span>
          </button>

          {/* Logout (No portal switch button: users log out to switch) */}
          <button
            onClick={handleLogout}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-600 hover:text-rose-600 hover:bg-emerald-100'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
            title={t('logout')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 p-3 sm:p-6 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Report Road Issue Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 ${
                isLight ? 'bg-white border-emerald-300 text-slate-900' : 'bg-[#0E1830] border-slate-700 text-white'
              }`}
            >
              {reportSuccessMessage ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 size={40} className="mx-auto text-emerald-500 animate-bounce" />
                  <h3 className="text-base font-bold">{t('reportSubmittedTitle')}</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    "{t('reportSubmittedMsg')}"
                  </p>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {t('reportSubmittedSub')}
                  </p>
                </div>
              ) : (
                <>
                  <div className={`flex items-center justify-between pb-3 border-b ${
                    isLight ? 'border-emerald-200' : 'border-slate-800'
                  }`}>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <AlertTriangle className="text-amber-500" size={18} />
                      {t('reportRoadIssue')}
                    </h3>
                    <button
                      onClick={() => setIsReportModalOpen(false)}
                      className={`p-1 rounded cursor-pointer ${
                        isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
                    <div>
                      <label className={`font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {t('locationRoad')}
                      </label>
                      <select
                        value={activeRoadId}
                        onChange={e => setReportLocation(e.target.value)}
                        className={`w-full p-2.5 rounded-xl font-medium outline-none border ${
                          isLight
                            ? 'bg-slate-50 border-emerald-200 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                            : 'bg-[#091124] border-slate-700 text-white focus:ring-2 focus:ring-cyan-500'
                        }`}
                      >
                        {networkEdges.map(edge => (
                          <option key={edge.id} value={edge.id} className="bg-slate-900 text-white">
                            {edge.name} ({edge.from} ↔ {edge.to})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {t('issueType')}
                      </label>
                      <select
                        value={issueType}
                        onChange={e => setIssueType(e.target.value)}
                        className={`w-full p-2.5 rounded-xl font-medium outline-none border ${
                          isLight
                            ? 'bg-slate-50 border-emerald-200 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                            : 'bg-[#091124] border-slate-700 text-white focus:ring-2 focus:ring-cyan-500'
                        }`}
                      >
                        <option value="Road blockage" className="bg-slate-900 text-white">{t('roadBlockage')}</option>
                        <option value="Accident" className="bg-slate-900 text-white">{t('accident')}</option>
                        <option value="Flooding" className="bg-slate-900 text-white">{t('flooding')}</option>
                      </select>
                    </div>

                    <div>
                      <label className={`font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        {t('description')}
                      </label>
                      <textarea
                        rows="3"
                        placeholder={t('descPlaceholder')}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className={`w-full p-2.5 rounded-xl font-medium outline-none resize-none border ${
                          isLight
                            ? 'bg-slate-50 border-emerald-200 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                            : 'bg-[#091124] border-slate-700 text-white focus:ring-2 focus:ring-cyan-500'
                        }`}
                        required
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsReportModalOpen(false)}
                        className={`flex-1 py-2.5 rounded-xl font-bold transition-colors cursor-pointer border ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send size={13} />
                        {t('submitReport')}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
