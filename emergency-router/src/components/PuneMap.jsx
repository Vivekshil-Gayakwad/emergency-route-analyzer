import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, Clock, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon creators for facilities
function createFacilityIcon(emoji, bgColor) {
  return L.divIcon({
    className: 'custom-facility-icon',
    html: `<div style="background:${bgColor};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

const facilityIcons = {
  hospital: () => createFacilityIcon('🏥', '#EF4444'),
  school: () => createFacilityIcon('🏫', '#8B5CF6'),
  college: () => createFacilityIcon('🎓', '#3B82F6'),
  bus_stop: () => createFacilityIcon('🚌', '#F59E0B'),
  railway_station: () => createFacilityIcon('🚂', '#6366F1'),
  fire_station: () => createFacilityIcon('🚒', '#F97316'),
  intersection: () => null, // No special icon for intersections
};

// Tile layer configs
const LIGHT_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const LIGHT_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const DARK_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

// Map theme switcher component
function ThemeSwitcher({ theme }) {
  const map = useMap();

  useEffect(() => {
    // Force map to re-render tiles when theme changes
    map.invalidateSize();
  }, [theme, map]);

  const isLight = theme === 'light';
  return (
    <TileLayer
      key={isLight ? 'light' : 'dark'}
      attribution={isLight ? LIGHT_ATTRIBUTION : DARK_ATTRIBUTION}
      url={isLight ? LIGHT_TILES : DARK_TILES}
    />
  );
}

// Road color based on status
function getRoadColor(edge, highlightPath, altPath, criticalEdges, showActiveAlt) {
  const isPrimary = highlightPath?.edges?.some(e => e.id === edge.id);
  const isAlt = altPath?.edges?.some(e => e.id === edge.id);
  const isCritical = criticalEdges?.some(ce => ce.id === edge.id);

  if (showActiveAlt && isAlt) return '#A855F7'; // violet
  if (isPrimary) return '#0EA5E9'; // sky blue for primary route
  if (isAlt) return '#8B5CF6'; // violet dashed
  if (isCritical) return '#0EA5E9'; // cyan for critical

  if (edge.status === 'blocked') return '#EF4444'; // red
  if (edge.status === 'congested') return '#F59E0B'; // orange
  return '#10B981'; // green
}

function getRoadWeight(edge, highlightPath, altPath, criticalEdges) {
  const isPrimary = highlightPath?.edges?.some(e => e.id === edge.id);
  const isAlt = altPath?.edges?.some(e => e.id === edge.id);
  const isCritical = criticalEdges?.some(ce => ce.id === edge.id);
  if (isPrimary || isAlt) return 6;
  if (isCritical) return 5;
  return 3;
}

export default function PuneMap({
  highlightPath = null,
  altPath = null,
  criticalEdges = [],
  criticalNodes = [],
  onNodeClick = null,
  interactive = true,
  showActiveAlt = false,
}) {
  const { networkNodes, networkEdges, selectedRoadInfo, setSelectedRoadInfo, theme, t } = useApp();
  const isLight = theme === 'light';

  // Pune city center
  const PUNE_CENTER = [18.5204, 73.8567];
  const DEFAULT_ZOOM = 13;

  // Build node lookup
  const nodeMap = useMemo(() => {
    const m = {};
    networkNodes.forEach(n => { m[n.id] = n; });
    return m;
  }, [networkNodes]);

  // Parse polyline or fallback to [from, to] coordinates
  const getPolylineCoords = (edge) => {
    if (edge.polyline) {
      try {
        const parsed = typeof edge.polyline === 'string' ? JSON.parse(edge.polyline) : edge.polyline;
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      } catch { /* fall through */ }
    }
    const fromNode = nodeMap[edge.from_node || edge.from];
    const toNode = nodeMap[edge.to_node || edge.to];
    if (fromNode && toNode) {
      return [[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]];
    }
    return null;
  };

  return (
    <div className={`relative w-full h-full min-h-[460px] rounded-2xl border overflow-hidden shadow-2xl transition-colors ${
      isLight ? 'border-emerald-300' : 'border-slate-800/80'
    }`}>
      <MapContainer
        center={PUNE_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        style={{ minHeight: '460px', zIndex: 1 }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <ThemeSwitcher theme={theme} />

        {/* Draw Roads as Polylines */}
        {networkEdges.map(edge => {
          const coords = getPolylineCoords(edge);
          if (!coords) return null;

          const color = getRoadColor(edge, highlightPath, altPath, criticalEdges, showActiveAlt);
          const weight = getRoadWeight(edge, highlightPath, altPath, criticalEdges);
          const isPrimary = highlightPath?.edges?.some(e => e.id === edge.id);
          const isAlt = altPath?.edges?.some(e => e.id === edge.id) && !isPrimary;
          const isBlocked = edge.status === 'blocked';

          return (
            <Polyline
              key={edge.id}
              positions={coords}
              pathOptions={{
                color,
                weight,
                opacity: 0.9,
                dashArray: isBlocked ? '10 6' : (isAlt && !isPrimary) ? '10 6' : null,
              }}
              eventHandlers={{
                click: () => setSelectedRoadInfo(edge),
              }}
            >
              <Tooltip sticky>
                <strong>{edge.name}</strong>
                <br />
                {(edge.from_node || edge.from)} ↔ {(edge.to_node || edge.to)} · {edge.distance} km
                <br />
                Status: <span style={{ color }}>{(edge.status || 'available').toUpperCase()}</span>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* Glow layer for highlighted routes */}
        {highlightPath?.edges?.map(edge => {
          const coords = getPolylineCoords(edge);
          if (!coords) return null;
          return (
            <Polyline
              key={`glow-${edge.id}`}
              positions={coords}
              pathOptions={{
                color: '#0EA5E9',
                weight: 12,
                opacity: 0.25,
              }}
            />
          );
        })}

        {/* Draw Nodes */}
        {networkNodes.map(node => {
          const isStart = highlightPath?.path?.[0] === node.id;
          const isEnd = highlightPath?.path?.[highlightPath?.path?.length - 1] === node.id;
          const isInRoute = highlightPath?.path?.includes(node.id);
          const isCriticalNode = criticalNodes?.includes(node.id);
          const nodeType = node.node_type || node.type || 'intersection';
          const isFacility = nodeType !== 'intersection';

          // Use special marker for facilities
          if (isFacility) {
            const iconFn = facilityIcons[nodeType];
            const icon = iconFn ? iconFn() : null;
            if (!icon) return null;

            return (
              <Marker
                key={node.id}
                position={[node.lat, node.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => interactive && onNodeClick?.(node),
                }}
              >
                <Tooltip>
                  <strong>{node.name}</strong>
                  <br />
                  Type: {nodeType.replace('_', ' ')}
                </Tooltip>
              </Marker>
            );
          }

          // Intersection nodes as circle markers
          let fillColor = isLight ? '#FFFFFF' : '#1E293B';
          let borderColor = isLight ? '#059669' : '#64748B';
          let radius = 6;

          if (isStart) {
            fillColor = '#10B981'; borderColor = '#FFFFFF'; radius = 10;
          } else if (isEnd) {
            fillColor = '#EC4899'; borderColor = '#FFFFFF'; radius = 10;
          } else if (isInRoute) {
            fillColor = '#0EA5E9'; borderColor = '#FFFFFF'; radius = 8;
          } else if (isCriticalNode) {
            fillColor = '#F59E0B'; borderColor = '#FEF08A'; radius = 9;
          }

          return (
            <CircleMarker
              key={node.id}
              center={[node.lat, node.lng]}
              radius={radius}
              pathOptions={{
                fillColor,
                color: borderColor,
                weight: 2,
                fillOpacity: 1,
              }}
              eventHandlers={{
                click: () => interactive && onNodeClick?.(node),
              }}
            >
              <Tooltip>
                <strong>{node.name}</strong>
                {isStart && <span> (START)</span>}
                {isEnd && <span> (DESTINATION)</span>}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend (Bottom-Left) */}
      <div className={`absolute bottom-3 left-3 z-[1000] p-3 rounded-xl border shadow-lg text-[11px] backdrop-blur-md pointer-events-auto ${
        isLight ? 'bg-white/95 border-emerald-300 text-slate-800' : 'bg-[#0B132B]/95 border-slate-700/80 text-slate-300'
      }`}>
        <span className={`font-bold uppercase tracking-wider text-[10px] block mb-1.5 ${
          isLight ? 'text-emerald-800' : 'text-slate-100'
        }`}>
          {t('roadConditions')}
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span>{t('availableOpen')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span>{t('congestedDelay')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span>{t('blockedClosed')}</span>
          </div>
        </div>
        {/* Facility markers legend */}
        <div className={`pt-1.5 mt-1.5 border-t space-y-1 ${isLight ? 'border-emerald-200' : 'border-slate-700/60'}`}>
          <div className="flex items-center gap-2"><span>🏥</span><span>Hospital</span></div>
          <div className="flex items-center gap-2"><span>🎓</span><span>College</span></div>
          <div className="flex items-center gap-2"><span>🏫</span><span>School</span></div>
          <div className="flex items-center gap-2"><span>🚌</span><span>Bus Stop</span></div>
          <div className="flex items-center gap-2"><span>🚂</span><span>Railway Station</span></div>
          <div className="flex items-center gap-2"><span>🚒</span><span>Fire Station</span></div>
        </div>
      </div>

      {/* Road Info Popup */}
      <AnimatePresence>
        {selectedRoadInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`absolute top-4 right-4 w-72 p-4 rounded-2xl shadow-2xl z-[1000] text-xs border ${
              isLight ? 'bg-white border-emerald-300 text-slate-800' : 'bg-[#131F37] border-slate-700 text-slate-300'
            }`}
          >
            <div className={`flex items-center justify-between pb-2 border-b ${
              isLight ? 'border-emerald-200' : 'border-slate-700/80'
            }`}>
              <span className={`font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 ${
                isLight ? 'text-emerald-800' : 'text-slate-200'
              }`}>
                <Info size={14} className={isLight ? 'text-emerald-600' : 'text-cyan-400'} />
                {t('roadInfoTitle')}
              </span>
              <button
                onClick={() => setSelectedRoadInfo(null)}
                className={`p-0.5 rounded cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              <div>
                <span className={`text-[10px] uppercase font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('roadName')}
                </span>
                <p className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedRoadInfo.name}
                </p>
                <p className={`text-[11px] font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {selectedRoadInfo.from_node || selectedRoadInfo.from} ↔ {selectedRoadInfo.to_node || selectedRoadInfo.to} ({selectedRoadInfo.distance} km)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{t('currentStatus')}</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                  selectedRoadInfo.status === 'available'
                    ? (isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40')
                    : selectedRoadInfo.status === 'congested'
                    ? (isLight ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-amber-500/20 text-amber-400 border-amber-500/40')
                    : (isLight ? 'bg-red-100 text-red-900 border-red-300' : 'bg-red-500/20 text-red-400 border-red-500/40')
                }`}>
                  {(selectedRoadInfo.status || 'available').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{t('estDelay')}</span>
                <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {selectedRoadInfo.status === 'blocked' ? t('closed') : `${selectedRoadInfo.delay || 0} min`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>{t('reasonDetails')}</span>
                <span className={`text-right font-medium text-[11px] max-w-[150px] truncate ${
                  isLight ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  {selectedRoadInfo.reason || t('normalFlow')}
                </span>
              </div>

              <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${
                isLight ? 'border-emerald-200 text-slate-500' : 'border-slate-700/60 text-slate-400'
              }`}>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {t('lastUpdated')} {selectedRoadInfo.last_updated || selectedRoadInfo.lastUpdated || 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
