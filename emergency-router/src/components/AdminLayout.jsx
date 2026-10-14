import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Network, LogOut, Shield, Sun, Moon, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const {
    logout,
    reports,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t
  } = useApp();

  const isLight = theme === 'light';
  const pendingCount = reports.filter(r => r.status === 'Pending').length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isLight ? 'bg-[#F0FDF4] text-slate-900' : 'bg-[#070D1E] text-slate-100'
    }`}>
      {/* Top Header */}
      <header className={`h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md border-b transition-colors ${
        isLight ? 'bg-white border-emerald-200' : 'bg-[#0E1830] border-slate-800/90'
      }`}>
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-lg shadow-md shadow-violet-500/20 text-white">
              <Shield size={19} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black text-sm tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  ERNA ADMIN
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                  isLight
                    ? 'bg-violet-100 text-violet-800 border-violet-300'
                    : 'bg-violet-500/10 text-violet-300 border-violet-500/20'
                }`}>
                  {t('adminBadge')}
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
              to="/admin"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? (isLight
                        ? 'bg-violet-100 text-violet-900 border border-violet-300 font-bold'
                        : 'bg-violet-600/20 text-violet-300 border border-violet-500/30')
                    : (isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60')
                }`
              }
            >
              <LayoutDashboard size={14} />
              <span>{t('dashboard')}</span>
            </NavLink>

            <NavLink
              to="/admin/roads"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? (isLight
                        ? 'bg-violet-100 text-violet-900 border border-violet-300 font-bold'
                        : 'bg-violet-600/20 text-violet-300 border border-violet-500/30')
                    : (isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60')
                }`
              }
            >
              <ShieldAlert size={14} />
              <span>{t('manageRoads')}</span>
            </NavLink>

            <NavLink
              to="/admin/resilience"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? (isLight
                        ? 'bg-violet-100 text-violet-900 border border-violet-300 font-bold'
                        : 'bg-violet-600/20 text-violet-300 border border-violet-500/30')
                    : (isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60')
                }`
              }
            >
              <Network size={14} />
              <span>{t('networkAnalysis')}</span>
            </NavLink>
          </nav>
        </div>

        {/* Right Controls: Pending Counter, Language, Theme, and Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {pendingCount > 0 && (
            <span className={`hidden md:inline-flex items-center gap-1.5 text-xs font-bold border px-2.5 py-1 rounded-xl ${
              isLight
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {pendingCount} {t('pendingReports')}
            </span>
          )}

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

          {/* Logout (No cross-portal switch: users log out to switch) */}
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

      {/* Main Admin Viewport */}
      <main className="flex-1 p-3 sm:p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
