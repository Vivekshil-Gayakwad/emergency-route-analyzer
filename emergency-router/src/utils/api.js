import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erna_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ──────────────────────── AUTH ────────────────────────

export async function apiLogin(email, password) {
  const res = await api.post('/auth/login', { email, password });
  return res.data; // { access_token, token_type, user }
}

export async function apiSignup({ fullName, email, password, phone, role, inviteCode }) {
  const res = await api.post('/auth/signup', {
    full_name: fullName,
    email,
    password,
    phone: phone || null,
    role: role || 'public',
    invite_code: inviteCode || null,
  });
  return res.data;
}

export async function apiGetMe() {
  const res = await api.get('/auth/me');
  return res.data;
}

// ──────────────────────── NODES ────────────────────────

export async function apiGetNodes() {
  const res = await api.get('/nodes');
  return res.data;
}

export async function apiGetFacilities(type = null) {
  const params = type ? { type } : {};
  const res = await api.get('/facilities', { params });
  return res.data;
}

// ──────────────────────── ROADS ────────────────────────

export async function apiGetRoads() {
  const res = await api.get('/roads');
  return res.data;
}

export async function apiUpdateRoad(roadId, status, reason) {
  const res = await api.put(`/roads/${roadId}`, { status, reason });
  return res.data;
}

// ──────────────────────── ROUTING ────────────────────────

export async function apiCalculateRoute(start, end) {
  const res = await api.post('/route', { start, end });
  return res.data; // { path, edges, distance, found, alternative }
}

// ──────────────────────── REPORTS ────────────────────────

export async function apiGetReports() {
  const res = await api.get('/reports');
  return res.data;
}

export async function apiCreateReport({ road_id, location, issue_type, description }) {
  const res = await api.post('/reports', { road_id, location, issue_type, description });
  return res.data;
}

export async function apiVerifyReport(reportId, blockRoad = false) {
  const res = await api.put(`/reports/${reportId}/verify`, { block_road: blockRoad });
  return res.data;
}

export async function apiResolveReport(reportId, reopenRoad = false) {
  const res = await api.put(`/reports/${reportId}/resolve`, { reopen_road: reopenRoad });
  return res.data;
}

// ──────────────────────── NETWORK ANALYSIS ────────────────────────

export async function apiGetBridges() {
  const res = await api.get('/analysis/bridges');
  return res.data;
}

export async function apiGetArticulationPoints() {
  const res = await api.get('/analysis/articulation-points');
  return res.data;
}

export async function apiSimulateClosure(roadId) {
  const res = await api.post('/analysis/simulate', { road_id: roadId });
  return res.data;
}

export async function apiGetConnectivity() {
  const res = await api.get('/analysis/connectivity');
  return res.data;
}

export default api;
