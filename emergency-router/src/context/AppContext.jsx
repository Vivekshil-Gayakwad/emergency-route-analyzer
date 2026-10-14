import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { dijkstra } from '../utils/graphAlgorithms';
import { translations } from '../utils/translations';
import {
  apiLogin,
  apiSignup,
  apiGetMe,
  apiGetNodes,
  apiGetRoads,
  apiUpdateRoad,
  apiCalculateRoute,
  apiGetReports,
  apiCreateReport,
  apiVerifyReport,
  apiResolveReport
} from '../utils/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state: 'dark' | 'light' (Light mode is light green and white)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('erna_theme') || 'dark';
  });

  // Language state: 'en' | 'hi' | 'mr'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('erna_lang') || 'en';
  });

  // Persist theme and lang
  useEffect(() => {
    localStorage.setItem('erna_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.body.style.backgroundColor = '#F0FDF4';
      document.body.style.color = '#0F172A';
    } else {
      document.documentElement.classList.remove('light-theme');
      document.body.style.backgroundColor = '#0B132B';
      document.body.style.color = '#F1F5F9';
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('erna_lang', language);
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Translation helper
  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  }, [language]);

  // Current logged in user: starts as null, loaded from backend via token
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Live road network graph state from database
  const [networkNodes, setNetworkNodes] = useState([]);
  const [networkEdges, setNetworkEdges] = useState([]);

  // Public incident reports from database
  const [reports, setReports] = useState([]);

  // Route finding state
  const [currentRoute, setCurrentRoute] = useState(null);
  const [alternativeRoute, setAlternativeRoute] = useState(null);
  const [selectedStart, setSelectedStart] = useState('N1');
  const [selectedEnd, setSelectedEnd] = useState('H1');

  // Selected road popup information
  const [selectedRoadInfo, setSelectedRoadInfo] = useState(null);

  // Feedback notifications
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [
      { id, message, type, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ].slice(0, 10));
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Fetch live network data and restore user session from backend
  useEffect(() => {
    let isMounted = true;

    async function initApp() {
      // 1. Restore auth if token exists
      const token = localStorage.getItem('erna_token');
      if (token) {
        try {
          const me = await apiGetMe();
          if (me && me.email && isMounted) {
            setCurrentUser({
              role: me.role,
              name: me.full_name,
              email: me.email,
              phone: me.phone
            });
          }
        } catch {
          localStorage.removeItem('erna_token');
          if (isMounted) setCurrentUser(null);
        }
      } else {
        if (isMounted) setCurrentUser(null);
      }
      if (isMounted) setAuthLoading(false);

      // 2. Fetch live nodes, roads, and reports from MySQL database
      try {
        const [nodesData, roadsData, reportsData] = await Promise.all([
          apiGetNodes(),
          apiGetRoads(),
          apiGetReports(),
        ]);

        if (!isMounted) return;

        if (nodesData && Array.isArray(nodesData)) {
          setNetworkNodes(nodesData);
          if (nodesData.length > 0) {
            setSelectedStart(nodesData[0].id);
            const hospitalNode = nodesData.find(n => n.node_type === 'hospital' || n.type === 'hospital');
            if (hospitalNode) setSelectedEnd(hospitalNode.id);
          }
        }

        if (roadsData && Array.isArray(roadsData)) {
          setNetworkEdges(roadsData);
        }

        if (reportsData && Array.isArray(reportsData)) {
          setReports(reportsData);
        }
      } catch (err) {
        console.error('Failed to load live data from backend:', err);
      }
    }

    initApp();

    return () => {
      isMounted = false;
    };
  }, []);

  // Authentication Handlers (strictly connected to FastAPI backend)
  const loginPublic = useCallback(async (email, password) => {
    try {
      const res = await apiLogin(email, password);
      if (res && res.access_token) {
        localStorage.setItem('erna_token', res.access_token);
        setCurrentUser({
          role: res.user.role,
          name: res.user.full_name,
          email: res.user.email,
          phone: res.user.phone
        });
        addNotification(`Welcome back, ${res.user.full_name}!`, 'success');
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Incorrect email or password.';
      return { success: false, error: errorMsg };
    }
  }, [addNotification]);

  const signupPublic = useCallback(async ({ fullName, email, password, phone }) => {
    try {
      const res = await apiSignup({ fullName, email, password, phone, role: 'public' });
      if (res && res.access_token) {
        localStorage.setItem('erna_token', res.access_token);
        setCurrentUser({
          role: res.user.role,
          name: res.user.full_name,
          email: res.user.email,
          phone: res.user.phone
        });
        addNotification(`Public account created successfully for ${res.user.full_name}!`, 'success');
        return { success: true };
      }
      return { success: false, error: 'Signup failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed.';
      return { success: false, error: errorMsg };
    }
  }, [addNotification]);

  const loginAdmin = useCallback(async (officialEmail, password) => {
    try {
      const res = await apiLogin(officialEmail, password);
      if (res && res.access_token) {
        if (res.user.role !== 'admin') {
          return { success: false, error: 'Account does not have administrator privileges.' };
        }
        localStorage.setItem('erna_token', res.access_token);
        setCurrentUser({
          role: res.user.role,
          name: res.user.full_name,
          email: res.user.email,
          phone: res.user.phone
        });
        addNotification(`Admin access granted to ${res.user.full_name}.`, 'success');
        return { success: true };
      }
      return { success: false, error: 'Admin login failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid admin credentials or password.';
      return { success: false, error: errorMsg };
    }
  }, [addNotification]);

  const signupAdmin = useCallback(async ({ fullName, officialEmail, password, inviteCode }) => {
    try {
      const res = await apiSignup({
        fullName,
        email: officialEmail,
        password,
        role: 'admin',
        inviteCode
      });
      if (res && res.access_token) {
        localStorage.setItem('erna_token', res.access_token);
        setCurrentUser({
          role: res.user.role,
          name: res.user.full_name,
          email: res.user.email,
          phone: res.user.phone
        });
        addNotification(`Admin registration verified! Welcome Officer ${res.user.full_name}.`, 'success');
        return { success: true };
      }
      return { success: false, error: 'Admin registration failed' };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Invalid invitation code or admin registration failed.';
      return { success: false, error: errorMsg };
    }
  }, [addNotification]);

  const logout = useCallback(() => {
    localStorage.removeItem('erna_token');
    setCurrentUser(null);
    addNotification('Logged out successfully.', 'info');
  }, [addNotification]);

  // Calculate Best Route & Viable Alternative Route
  const calculateBestRoute = useCallback(async (startId, endId) => {
    if (!startId || !endId) return null;

    try {
      const backendRes = await apiCalculateRoute(startId, endId);
      if (backendRes && backendRes.found !== undefined) {
        setCurrentRoute(backendRes);
        setAlternativeRoute(backendRes.alternative || null);
        return backendRes;
      }
    } catch (err) {
      console.warn('Backend routing unavailable, calculating locally:', err.message);
    }

    const primary = dijkstra(networkNodes, networkEdges, startId, endId);
    setCurrentRoute(primary);

    if (primary.found && primary.edges.length > 0) {
      const altEdges = networkEdges.map(e => {
        const inPrimary = primary.edges.some(pe => pe.id === e.id);
        return inPrimary ? { ...e, time: e.time * 3 } : e;
      });
      const alt = dijkstra(networkNodes, altEdges, startId, endId);
      setAlternativeRoute(alt.found ? alt : null);
    } else {
      setAlternativeRoute(null);
    }

    return primary;
  }, [networkNodes, networkEdges]);

  // Road Status Management (Admin)
  const updateRoadStatus = useCallback(async (edgeId, newStatus, reason = '') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setNetworkEdges(prev => prev.map(edge => {
      if (edge.id === edgeId) {
        let delay = 0;
        if (newStatus === 'congested') delay = 5;
        if (newStatus === 'blocked') delay = 99;

        return {
          ...edge,
          status: newStatus,
          delay,
          reason: reason || (newStatus === 'blocked' ? 'Closed by authority' : newStatus === 'congested' ? 'Traffic delay' : 'Normal flow'),
          lastUpdated: timeStr,
        };
      }
      return edge;
    }));

    try {
      await apiUpdateRoad(edgeId, newStatus, reason);
    } catch (err) {
      console.error('Failed to sync road status to backend:', err);
    }

    const targetRoad = networkEdges.find(e => e.id === edgeId);
    const roadName = targetRoad ? targetRoad.name : edgeId;

    addNotification(
      `Road "${roadName}" updated to ${newStatus.toUpperCase()}`,
      newStatus === 'blocked' ? 'danger' : newStatus === 'congested' ? 'warning' : 'success'
    );
  }, [networkEdges, addNotification]);

  // Add Public Road Problem Report (Public)
  const addReport = useCallback(async (newReport) => {
    try {
      const created = await apiCreateReport({
        road_id: newReport.edgeId || newReport.road_id,
        location: newReport.location,
        issue_type: newReport.issueType || newReport.issue_type,
        description: newReport.description
      });
      if (created && created.id) {
        setReports(prev => [created, ...prev]);
        addNotification('Your report has been submitted and is awaiting verification.', 'info');
        return created;
      }
    } catch (err) {
      console.error('Failed to submit report to backend:', err);
    }

    const tempId = `Report #${Date.now().toString().slice(-4)}`;
    const fallbackItem = {
      id: tempId,
      status: 'Pending',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reportedBy: currentUser?.name || 'Public Citizen',
      ...newReport,
    };
    setReports(prev => [fallbackItem, ...prev]);
    addNotification('Your report has been submitted and is awaiting verification.', 'info');
    return fallbackItem;
  }, [currentUser?.name, addNotification]);

  // Verify Report (Admin)
  const verifyReport = useCallback(async (reportId, autoBlockRoad = false) => {
    const numericId = typeof reportId === 'number' ? reportId : parseInt(String(reportId).replace(/\D/g, ''), 10);

    setReports(prev => prev.map(r => {
      if (r.id === reportId || r.id === numericId) {
        if (autoBlockRoad && (r.edgeId || r.road_id)) {
          updateRoadStatus(r.edgeId || r.road_id, 'blocked', `Blocked following verified report: ${r.issueType || r.issue_type}`);
        }
        return { ...r, status: 'Verified' };
      }
      return r;
    }));

    try {
      if (numericId) {
        await apiVerifyReport(numericId, autoBlockRoad);
      }
    } catch (err) {
      console.error('Failed to sync report verification to backend:', err);
    }

    addNotification(`Report #${reportId} has been marked as Verified.`, 'success');
  }, [updateRoadStatus, addNotification]);

  // Resolve Report (Admin)
  const resolveReport = useCallback(async (reportId, autoReopenRoad = false) => {
    const numericId = typeof reportId === 'number' ? reportId : parseInt(String(reportId).replace(/\D/g, ''), 10);

    setReports(prev => prev.map(r => {
      if (r.id === reportId || r.id === numericId) {
        if (autoReopenRoad && (r.edgeId || r.road_id)) {
          updateRoadStatus(r.edgeId || r.road_id, 'available', 'Reopened: Hazard resolved');
        }
        return { ...r, status: 'Resolved' };
      }
      return r;
    }));

    try {
      if (numericId) {
        await apiResolveReport(numericId, autoReopenRoad);
      }
    } catch (err) {
      console.error('Failed to sync report resolution to backend:', err);
    }

    addNotification(`Report #${reportId} marked as Resolved.`, 'success');
  }, [updateRoadStatus, addNotification]);

  const value = {
    // Theme & Language
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    // Authentication
    currentUser,
    authLoading,
    loginPublic,
    signupPublic,
    loginAdmin,
    signupAdmin,
    logout,
    // Graph & Data
    networkNodes,
    networkEdges,
    reports,
    addReport,
    verifyReport,
    resolveReport,
    currentRoute,
    alternativeRoute,
    selectedStart,
    setSelectedStart,
    selectedEnd,
    setSelectedEnd,
    calculateBestRoute,
    updateRoadStatus,
    selectedRoadInfo,
    setSelectedRoadInfo,
    notifications,
    addNotification,
    removeNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
