import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  Clock,
  RotateCcw,
  CheckCircle2,
  GitFork,
  AlertTriangle,
  Info
} from 'lucide-react';
import NetworkGraph from '../../components/NetworkGraph';
import { useApp } from '../../context/AppContext';

export default function UserDashboard() {
  const {
    networkNodes,
    networkEdges,
    currentRoute,
    alternativeRoute,
    calculateBestRoute,
    selectedStart,
    setSelectedStart,
    selectedEnd,
    setSelectedEnd,
    theme,
    t
  } = useApp();

  const isLight = theme === 'light';

  const [hasCalculated, setHasCalculated] = useState(false);
  const [showAlternative, setShowAlternative] = useState(false);

  const handleFindRoute = async () => {
    if (!selectedStart || !selectedEnd) return;
    await calculateBestRoute(selectedStart, selectedEnd);
    setHasCalculated(true);
    setShowAlternative(false);
  };

  const handleReset = () => {
    setSelectedStart(networkNodes[0]?.id || 'N1');
    setSelectedEnd('H1');
    setHasCalculated(false);
    setShowAlternative(false);
  };

  // Compute road statuses in recommended route
  const primaryRoadStatuses = currentRoute?.edges?.map(e => e.status) || [];
  const routeStatusLabel = primaryRoadStatuses.includes('congested') ? t('congestedDelay') : t('availableOpen');

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col lg:flex-row gap-4">
      {/* Left Column: Route Search Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto pr-1">
        {/* Search Box */}
        <div className={`border rounded-2xl p-5 shadow-xl space-y-4 transition-colors ${
          isLight ? 'bg-white border-emerald-200' : 'bg-[#0E1830] border-slate-800'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isLight ? 'border-emerald-200' : 'border-slate-800'
          }`}>
            <h2 className={`text-xs font-black tracking-wider uppercase flex items-center gap-2 ${
              isLight ? 'text-emerald-700' : 'text-cyan-400'
            }`}>
              <Navigation size={15} />
              {t('findARoute')}
            </h2>
            {hasCalculated && (
              <button
                onClick={handleReset}
                className={`text-[11px] flex items-center gap-1 cursor-pointer ${
                  isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                <RotateCcw size={12} /> {t('reset')}
              </button>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {/* Start Location */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wide block mb-1 ${
                isLight ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {t('startLocation')}
              </label>
              <select
                value={selectedStart}
                onChange={e => setSelectedStart(e.target.value)}
                className={`w-full p-2.5 rounded-xl font-medium outline-none border cursor-pointer ${
                  isLight
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                    : 'bg-[#091124] border-slate-700/80 text-white focus:ring-2 focus:ring-cyan-500'
                }`}
              >
                {networkNodes.map(node => (
                  <option key={node.id} value={node.id} className="bg-slate-900 text-white">
                    {node.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className={`text-[11px] font-bold uppercase tracking-wide block mb-1 ${
                isLight ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {t('destination')}
              </label>
              <select
                value={selectedEnd}
                onChange={e => setSelectedEnd(e.target.value)}
                className={`w-full p-2.5 rounded-xl font-medium outline-none border cursor-pointer ${
                  isLight
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                    : 'bg-[#091124] border-slate-700/80 text-white focus:ring-2 focus:ring-cyan-500'
                }`}
              >
                {networkNodes.map(node => (
                  <option key={node.id} value={node.id} className="bg-slate-900 text-white">
                    {node.name} {node.type === 'hospital' ? '🏥' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Find Route Button */}
            <button
              onClick={handleFindRoute}
              className={`w-full py-3 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 text-white ${
                isLight
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  : 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-cyan-950'
              }`}
            >
              <Navigation size={14} />
              {t('findRouteBtn')}
            </button>
          </div>
        </div>

        {/* Route Information Card (Appears after calculation) */}
        {hasCalculated && currentRoute && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-2xl p-5 shadow-xl space-y-3.5 text-xs transition-colors ${
              isLight ? 'bg-white border-emerald-200 text-slate-800' : 'bg-[#0E1830] border-slate-700/90 text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-emerald-200' : 'border-slate-800'
            }`}>
              <span className={`font-bold uppercase tracking-wider text-[11px] ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}>
                {t('routeInformation')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                currentRoute.found
                  ? (isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30')
                  : (isLight ? 'bg-red-100 text-red-800 border-red-300' : 'bg-red-500/10 text-red-400 border-red-500/30')
              }`}>
                {currentRoute.found ? t('optimalPathFound') : t('noRouteAvailable')}
              </span>
            </div>

            {currentRoute.found ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{t('recommendedRoute')}</span>
                    <span
                      className={`font-bold text-right max-w-[170px] truncate ${
                        isLight ? 'text-emerald-700' : 'text-cyan-300'
                      }`}
                      title={currentRoute.path.join(' → ')}
                    >
                      {currentRoute.path.join(' → ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{t('totalDistance')}</span>
                    <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {(currentRoute.edges.reduce((sum, e) => sum + e.distance, 0)).toFixed(1)} km
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{t('estTravelTime')}</span>
                    <span className={`font-mono font-bold text-sm ${isLight ? 'text-emerald-700' : 'text-cyan-400'}`}>
                      {Math.round(currentRoute.distance)} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{t('roadStatus')}</span>
                    <span className={`font-semibold ${
                      routeStatusLabel.includes('Delay') || routeStatusLabel.includes('देरी') || routeStatusLabel.includes('विलंब')
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}>
                      {routeStatusLabel}
                    </span>
                  </div>
                </div>

                {/* Estimate disclaimer */}
                <p className={`text-[10px] italic p-2 rounded-lg border ${
                  isLight
                    ? 'bg-emerald-50 text-slate-600 border-emerald-200'
                    : 'bg-[#091124] text-slate-400 border-slate-800'
                }`}>
                  {t('timeDisclaimer')}
                </p>

                {/* Alternative Route Section */}
                {alternativeRoute && alternativeRoute.found && (
                  <div className={`pt-2 border-t space-y-2 ${isLight ? 'border-emerald-200' : 'border-slate-800'}`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>{t('alternativeRoute')}</span>
                      <span className="font-mono font-semibold text-purple-600 dark:text-purple-300">
                        {(alternativeRoute.edges.reduce((sum, e) => sum + e.distance, 0)).toFixed(1)} km ({Math.round(alternativeRoute.distance)} min)
                      </span>
                    </div>

                    <button
                      onClick={() => setShowAlternative(!showAlternative)}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        showAlternative
                          ? 'bg-purple-600 text-white shadow-md'
                          : (isLight
                              ? 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                              : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30')
                      }`}
                    >
                      <GitFork size={13} />
                      {showAlternative ? t('viewingAltRoute') : t('viewAltRoute')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-900 rounded-xl text-center space-y-1">
                <AlertTriangle size={18} className="mx-auto text-red-500" />
                <p className="font-bold text-red-700 dark:text-red-300 text-xs">{t('noRouteAvailable')}</p>
                <p className="text-[11px] text-red-600 dark:text-red-200">
                  All roads leading to destination are blocked or unavailable.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Instructions Tip Card */}
        <div className={`border rounded-2xl p-4 text-[11px] space-y-1.5 mt-auto transition-colors ${
          isLight
            ? 'bg-white border-emerald-200 text-slate-600'
            : 'bg-[#0E1830] border-slate-800 text-slate-400'
        }`}>
          <p className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
            <Info size={13} className={isLight ? 'text-emerald-600' : 'text-cyan-400'} /> {t('mapNavTip')}
          </p>
          <p>
            {t('mapTipDesc')}
          </p>
        </div>
      </div>

      {/* Center/Right: Large Interactive Map */}
      <div className="flex-1 flex flex-col h-full min-h-[460px]">
        <NetworkGraph
          highlightPath={currentRoute}
          altPath={alternativeRoute}
          showActiveAlt={showAlternative}
          onNodeClick={(node) => {
            if (!hasCalculated) {
              if (selectedStart === node.id) {
                setSelectedEnd(node.id);
              } else {
                setSelectedStart(node.id);
              }
            }
          }}
          interactive={true}
        />
      </div>
    </div>
  );
}
