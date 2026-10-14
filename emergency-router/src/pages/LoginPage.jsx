import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  User,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Key,
  X,
  Sun,
  Moon,
  Globe,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    loginPublic,
    signupPublic,
    loginAdmin,
    signupAdmin
  } = useApp();

  // Active portal auth modal: null | 'public' | 'admin'
  const [authModal, setAuthModal] = useState(null);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Public Form state
  const [publicForm, setPublicForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Admin Form state
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    officialEmail: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
  });

  const isLight = theme === 'light';

  // Handle Public Authentication
  const handlePublicSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'signin') {
      if (!publicForm.email || !publicForm.password) {
        setErrorMsg(t('fillRequiredFields'));
        return;
      }
      const res = await loginPublic(publicForm.email, publicForm.password);
      if (res && res.success) {
        setAuthModal(null);
        navigate('/public');
      } else {
        setErrorMsg(res?.error || 'Authentication failed');
      }
    } else {
      // 5 fields validation
      if (!publicForm.fullName || !publicForm.email || !publicForm.password || !publicForm.confirmPassword) {
        setErrorMsg(t('fillRequiredFields'));
        return;
      }
      if (publicForm.password !== publicForm.confirmPassword) {
        setErrorMsg(t('passwordMismatch'));
        return;
      }
      const res = await signupPublic({
        fullName: publicForm.fullName,
        email: publicForm.email,
        password: publicForm.password,
        phone: publicForm.phone,
      });
      if (res && res.success) {
        setAuthModal(null);
        navigate('/public');
      } else {
        setErrorMsg(res?.error || 'Registration failed');
      }
    }
  };

  // Handle Admin Authentication
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (authMode === 'signin') {
      if (!adminForm.officialEmail || !adminForm.password) {
        setErrorMsg(t('fillRequiredFields'));
        return;
      }
      const res = await loginAdmin(adminForm.officialEmail, adminForm.password);
      if (res && res.success) {
        setAuthModal(null);
        navigate('/admin');
      } else {
        setErrorMsg(res?.error || 'Authentication failed');
      }
    } else {
      if (!adminForm.fullName || !adminForm.officialEmail || !adminForm.password || !adminForm.confirmPassword || !adminForm.inviteCode) {
        setErrorMsg(t('fillRequiredFields'));
        return;
      }
      if (adminForm.password !== adminForm.confirmPassword) {
        setErrorMsg(t('passwordMismatch'));
        return;
      }
      const res = await signupAdmin({
        fullName: adminForm.fullName,
        officialEmail: adminForm.officialEmail,
        password: adminForm.password,
        inviteCode: adminForm.inviteCode,
      });
      if (res && res.success) {
        setAuthModal(null);
        navigate('/admin');
      } else {
        setErrorMsg(res?.error || 'Admin registration failed');
      }
    }
  };

  const openAuth = (portal, mode = 'signin') => {
    setAuthModal(portal);
    setAuthMode(mode);
    setErrorMsg('');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between p-4 sm:p-8 font-sans transition-colors duration-300 ${
      isLight ? 'bg-[#F0FDF4] text-slate-900' : 'bg-[#070D1E] text-slate-100'
    }`}>
      {/* Top Controls Header */}
      <header className={`max-w-6xl w-full mx-auto flex items-center justify-between py-3 px-4 sm:px-6 rounded-2xl border transition-colors shadow-sm ${
        isLight ? 'bg-white border-emerald-200' : 'bg-[#0E1830] border-slate-800'
      }`}>
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-500 flex items-center justify-center text-xl font-bold shadow-md text-white">
            🚑
          </div>
          <div>
            <h1 className={`text-base font-black tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
              ERNA
            </h1>
            <p className={`text-[10px] font-semibold ${isLight ? 'text-emerald-700' : 'text-cyan-400'}`}>
              Emergency Route & Network Resilience Analyzer
            </p>
          </div>
        </div>

        {/* Language & Theme Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <Globe size={13} className="text-slate-400 ml-1.5" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`bg-transparent text-xs font-bold px-1.5 py-0.5 outline-none cursor-pointer ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              <option value="en" className="bg-slate-900 text-white">EN (English)</option>
              <option value="hi" className="bg-slate-900 text-white">हिं (हिन्दी)</option>
              <option value="mr" className="bg-slate-900 text-white">म (मराठी)</option>
            </select>
          </div>

          {/* Theme Toggle (Dark to Light - Light mode is Light Green & White) */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
              isLight
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle Light / Dark Mode"
          >
            {isLight ? <Moon size={14} className="text-slate-700" /> : <Sun size={14} className="text-amber-400" />}
            <span className="hidden sm:inline">{isLight ? 'Dark Mode' : 'Light Green Mode'}</span>
          </button>
        </div>
      </header>

      {/* Main Home Page Hero & Themed Map Image */}
      <div className="max-w-6xl w-full mx-auto my-auto py-6 space-y-6">
        {/* Title and Image Header */}
        <div className="text-center space-y-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isLight
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
          }`}>
            🚦 {t('appSubtitle')}
          </span>

          <h2 className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}>
            {t('appTitle')}
          </h2>

          <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {t('portalDesc')}
          </p>

          {/* Themed City Map Image Banner - changes color based on theme mode */}
          <div className="relative max-w-4xl mx-auto mt-4 overflow-hidden rounded-3xl border-2 transition-all duration-500 shadow-2xl group">
            <img
              src="/city-map.jpg"
              alt="Road Network Map"
              className={`w-full h-44 sm:h-56 object-cover object-center transition-all duration-500 transform group-hover:scale-105 ${
                isLight
                  ? 'brightness-105 contrast-100 saturate-105 hue-rotate-0'
                  : 'brightness-75 contrast-125 saturate-125 hue-rotate-[195deg] invert-[0.1]'
              }`}
            />
            {/* Color Overlay changing with Mode */}
            <div className={`absolute inset-0 transition-colors duration-500 flex items-end p-4 sm:p-6 ${
              isLight
                ? 'bg-gradient-to-t from-white/90 via-emerald-900/10 to-transparent'
                : 'bg-gradient-to-t from-[#070D1E] via-[#0E1830]/40 to-transparent'
            }`}>
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-emerald-800' : 'text-cyan-400'}`}>
                    {t('roadNetworkMap')}
                  </p>
                  <p className={`text-sm sm:text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Active Real-Time Network Graph
                  </p>
                </div>
                <div className={`hidden sm:flex items-center gap-3 text-xs font-bold px-3 py-1.5 rounded-xl border backdrop-blur-md ${
                  isLight ? 'bg-white/90 text-slate-800 border-emerald-300' : 'bg-[#0E1830]/90 text-slate-200 border-slate-700'
                }`}>
                  <span className="flex items-center gap-1.5 text-emerald-600">● {t('available')}</span>
                  <span className="flex items-center gap-1.5 text-amber-500">● {t('congested')}</span>
                  <span className="flex items-center gap-1.5 text-red-500">● {t('blocked')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Dedicated Portal Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-2">
          {/* 1. Public Portal Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className={`border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all ${
              isLight
                ? 'bg-white border-emerald-300 hover:border-emerald-500 shadow-emerald-100'
                : 'bg-[#0E1830] border-slate-800 hover:border-cyan-500 shadow-black/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                  isLight
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                }`}>
                  <User size={24} />
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isLight
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                }`}>
                  {t('publicBadge')}
                </span>
              </div>

              <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t('publicPortal')}
              </h3>
              <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {t('publicRoleDesc')}
              </p>

              <div className={`mt-5 space-y-2 text-xs p-3.5 rounded-2xl border ${
                isLight ? 'bg-emerald-50/60 border-emerald-200 text-slate-700' : 'bg-[#091124] border-slate-800/80 text-slate-300'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={isLight ? 'text-emerald-600' : 'text-cyan-400'} />
                  <span>{t('findARoute')} (Dijkstra shortest path)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={isLight ? 'text-emerald-600' : 'text-cyan-400'} />
                  <span>{t('roadConditions')} (Green / Orange / Red)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={isLight ? 'text-emerald-600' : 'text-cyan-400'} />
                  <span>{t('reportRoadIssue')} & {t('myReports')}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => openAuth('public', 'signin')}
                className={`flex-1 py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  isLight
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950'
                }`}
              >
                <span>{t('signIn')}</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => openAuth('public', 'signup')}
                className={`py-3 px-4 font-bold text-xs rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border-slate-700'
                }`}
              >
                <span>{t('signUp')}</span>
              </button>
            </div>
          </motion.div>

          {/* 2. Admin Portal Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className={`border-2 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl transition-all ${
              isLight
                ? 'bg-white border-emerald-300 hover:border-emerald-500 shadow-emerald-100'
                : 'bg-[#0E1830] border-slate-800 hover:border-violet-500 shadow-black/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${
                  isLight
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                    : 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                }`}>
                  <Shield size={24} />
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  isLight
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-violet-500/10 text-violet-300 border-violet-500/20'
                }`}>
                  {t('adminBadge')}
                </span>
              </div>

              <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {t('adminPortal')}
              </h3>
              <p className={`text-xs mt-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {t('adminRoleDesc')}
              </p>

              <div className={`mt-5 space-y-2 text-xs p-3.5 rounded-2xl border ${
                isLight ? 'bg-emerald-50/60 border-emerald-200 text-slate-700' : 'bg-[#091124] border-slate-800/80 text-slate-300'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={isLight ? 'text-emerald-600' : 'text-violet-400'} />
                  <span>{t('manageRoadsTitle')} (Available / Congested / Blocked)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={isLight ? 'text-emerald-600' : 'text-violet-400'} />
                  <span>{t('reviewReport')} & Incident verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className={isLight ? 'text-emerald-600' : 'text-violet-400'} />
                  <span>{t('resilienceTitle')} (Tarjan Bridge Detection)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => openAuth('admin', 'signin')}
                className={`flex-1 py-3 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-300'
                    : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-950'
                }`}
              >
                <span>{t('signIn')}</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => openAuth('admin', 'signup')}
                className={`py-3 px-4 font-bold text-xs rounded-xl border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-emerald-50 text-slate-800 border-emerald-300'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-violet-300 border-slate-700'
                }`}
              >
                <span>Invitation Sign Up</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`max-w-6xl w-full mx-auto text-center py-4 text-xs border-t ${
        isLight ? 'border-emerald-200 text-slate-600' : 'border-slate-800/60 text-slate-500'
      }`}>
        <p>{t('appTitle')} · Dynamic Routing & Network Resilience</p>
      </footer>

      {/* 🔐 AUTHENTICATION MODAL (Public or Admin) */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className={`border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4 ${
                isLight ? 'bg-white border-emerald-300 text-slate-900' : 'bg-[#0E1830] border-slate-700 text-white'
              }`}
            >
              {/* Close Button */}
              <button
                onClick={() => setAuthModal(null)}
                className={`absolute top-5 right-5 p-1 rounded-lg ${
                  isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    authModal === 'admin'
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  }`}>
                    {authModal === 'admin' ? t('adminPortal') : t('publicPortal')}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-1">
                  {authMode === 'signin' ? t('signIn') : t('signUp')}
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {authModal === 'admin'
                    ? (authMode === 'signup' ? t('invitationHint') : 'Sign in with your official authority email')
                    : (authMode === 'signup' ? 'Create your free public navigation account' : 'Sign in to access route finding and report road issues')}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className={`flex rounded-xl p-1 border text-xs font-bold ${
                isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-[#091124] border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMsg(''); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authMode === 'signin'
                      ? (isLight ? 'bg-white text-emerald-800 shadow-xs' : 'bg-slate-800 text-white shadow-xs')
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('signIn')}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authMode === 'signup'
                      ? (isLight ? 'bg-white text-emerald-800 shadow-xs' : 'bg-slate-800 text-white shadow-xs')
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('signUp')}
                </button>
              </div>

              {/* Error banner */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* AUTH FORM */}
              {authModal === 'public' ? (
                /* 👤 PUBLIC FORM */
                <form onSubmit={handlePublicSubmit} className="space-y-3 text-xs">
                  {authMode === 'signup' && (
                    <div>
                      <label className="font-bold block mb-1">{t('fullName')} *</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kulkarni"
                        value={publicForm.fullName}
                        onChange={e => setPublicForm({ ...publicForm, fullName: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-[#091124] border-slate-700 text-white focus:border-cyan-500'
                        }`}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-bold block mb-1">{t('emailAddress')} *</label>
                    <input
                      type="email"
                      placeholder="citizen@example.com"
                      value={publicForm.email}
                      onChange={e => setPublicForm({ ...publicForm, email: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-[#091124] border-slate-700 text-white focus:border-cyan-500'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t('password')} *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={publicForm.password}
                        onChange={e => setPublicForm({ ...publicForm, password: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border outline-none font-medium pr-9 ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-[#091124] border-slate-700 text-white focus:border-cyan-500'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="font-bold block mb-1">{t('confirmPassword')} *</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={publicForm.confirmPassword}
                          onChange={e => setPublicForm({ ...publicForm, confirmPassword: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-[#091124] border-slate-700 text-white focus:border-cyan-500'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1">{t('phoneNumber')}</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={publicForm.phone}
                          onChange={e => setPublicForm({ ...publicForm, phone: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-[#091124] border-slate-700 text-white focus:border-cyan-500'
                          }`}
                        />
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer mt-3 ${
                      isLight
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950'
                    }`}
                  >
                    {authMode === 'signin' ? t('enterPublicPortal') : t('createPublicAccount')}
                  </button>

                  {/* Demo fill credentials helper */}
                  {authMode === 'signin' && (
                    <p
                      onClick={() => setPublicForm({ ...publicForm, email: 'citizen@erna.org', password: 'password123' })}
                      className="text-center text-[11px] text-cyan-400 hover:underline cursor-pointer pt-1"
                    >
                      Fill Demo Credentials (citizen@erna.org)
                    </p>
                  )}
                </form>
              ) : (
                /* 🔐 ADMIN FORM (Invitation Based) */
                <form onSubmit={handleAdminSubmit} className="space-y-3 text-xs">
                  {authMode === 'signup' && (
                    <div>
                      <label className="font-bold block mb-1">{t('fullName')} *</label>
                      <input
                        type="text"
                        placeholder="e.g. Officer Vikram Malhotra"
                        value={adminForm.fullName}
                        onChange={e => setAdminForm({ ...adminForm, fullName: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-[#091124] border-slate-700 text-white focus:border-violet-500'
                        }`}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-bold block mb-1">{t('officialEmail')} *</label>
                    <input
                      type="email"
                      placeholder="officer@traffic.gov"
                      value={adminForm.officialEmail}
                      onChange={e => setAdminForm({ ...adminForm, officialEmail: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-[#091124] border-slate-700 text-white focus:border-violet-500'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">{t('password')} *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={adminForm.password}
                        onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                        className={`w-full p-2.5 rounded-xl border outline-none font-medium pr-9 ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-[#091124] border-slate-700 text-white focus:border-violet-500'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {authMode === 'signup' && (
                    <>
                      <div>
                        <label className="font-bold block mb-1">{t('confirmPassword')} *</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={adminForm.confirmPassword}
                          onChange={e => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-[#091124] border-slate-700 text-white focus:border-violet-500'
                          }`}
                          required
                        />
                      </div>

                      <div>
                        <label className="font-bold block mb-1 flex items-center justify-between">
                          <span>{t('invitationCode')} *</span>
                          <span className="text-[10px] text-amber-400 font-normal">Invitation-Only</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ADMIN-ERNA-2026"
                          value={adminForm.inviteCode}
                          onChange={e => setAdminForm({ ...adminForm, inviteCode: e.target.value })}
                          className={`w-full p-2.5 rounded-xl border outline-none font-mono font-bold uppercase tracking-wider ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-violet-500' : 'bg-[#091124] border-slate-700 text-violet-300 focus:border-violet-500'
                          }`}
                          required
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Authorized code: <code className="text-violet-400 font-bold">ADMIN-ERNA-2026</code>
                        </p>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer mt-3 ${
                      isLight
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-300'
                        : 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-950'
                    }`}
                  >
                    {authMode === 'signin' ? t('enterAdminPortal') : t('registerAdmin')}
                  </button>

                  {/* Demo fill credentials helper */}
                  {authMode === 'signin' && (
                    <p
                      onClick={() => setAdminForm({ ...adminForm, officialEmail: 'admin@traffic.gov', password: 'adminpassword' })}
                      className="text-center text-[11px] text-violet-400 hover:underline cursor-pointer pt-1"
                    >
                      Fill Demo Credentials (admin@traffic.gov)
                    </p>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
