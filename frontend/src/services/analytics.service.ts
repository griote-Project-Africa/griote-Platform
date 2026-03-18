import api from '../lib/axios';

// ── Types ──────────────────────────────────────────────────────────────────

export interface OverviewKPIs {
  downloads24h: number;
  downloads24hDelta: number;
  activeUsers24h: number;
  newSignups7d: number;
  newSignups7dDelta: number;
  totalEvents7d: number;
  errorsCount1h: number;
}

export interface DaySeries {
  day: string;
  count: number;
}

export interface GeoRow {
  country_code: string;
  total_events: number;
  unique_users: number;
  unique_ips: number;
}

export interface TopDepotRow {
  depot_id: number;
  title: string;
  download_count: number;
  unique_downloaders: number;
}

export interface TopArticleRow {
  article_id: number;
  title: string;
  view_count: number;
}

export interface HeatmapCell {
  day_of_week: number;
  hour_of_day: number;
  event_count: number;
}

export interface PerfHour {
  hour: string;
  p50: number;
  p95: number;
  p99: number;
  request_count: number;
}

export interface ErrorRate {
  errors: number;
  http_errors: number;
  total_requests: number;
  error_rate: number;
}

export interface RecentError {
  created_at: string;
  path: string;
  method: string;
  status_code: string;
  response_ms: string;
  ip_address: string;
  country_code: string;
}

export interface UserFunnel {
  signups: number;
  logins: number;
  uploaders: number;
  downloaders: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  ksize: number;
  vsize: number;
}

// ── API calls ──────────────────────────────────────────────────────────────

export async function getOverview(): Promise<OverviewKPIs> {
  const res = await api.get<OverviewKPIs>('/analytics/overview');
  return res.data;
}

export async function getDownloadSeries(days = 30): Promise<DaySeries[]> {
  const res = await api.get<DaySeries[]>(`/analytics/series/downloads?days=${days}`);
  return res.data;
}

export async function getActivitySeries(days = 30): Promise<DaySeries[]> {
  const res = await api.get<DaySeries[]>(`/analytics/series/activity?days=${days}`);
  return res.data;
}

export async function getSignupSeries(days = 30): Promise<DaySeries[]> {
  const res = await api.get<DaySeries[]>(`/analytics/series/signups?days=${days}`);
  return res.data;
}

export async function getGeography(days = 30): Promise<GeoRow[]> {
  const res = await api.get<GeoRow[]>(`/analytics/geography?days=${days}`);
  return res.data;
}

export async function getTopDepots(limit = 10, days = 30): Promise<TopDepotRow[]> {
  const res = await api.get<TopDepotRow[]>(`/analytics/top/depots?limit=${limit}&days=${days}`);
  return res.data;
}

export async function getTopArticles(limit = 10, days = 30): Promise<TopArticleRow[]> {
  const res = await api.get<TopArticleRow[]>(`/analytics/top/articles?limit=${limit}&days=${days}`);
  return res.data;
}

export async function getActivityHeatmap(days = 7): Promise<HeatmapCell[]> {
  const res = await api.get<HeatmapCell[]>(`/analytics/heatmap?days=${days}`);
  return res.data;
}

export async function getAPIPerformance(hours = 24): Promise<PerfHour[]> {
  const res = await api.get<PerfHour[]>(`/analytics/performance?hours=${hours}`);
  return res.data;
}

export async function getErrorRate(hours = 24): Promise<ErrorRate> {
  const res = await api.get<ErrorRate>(`/analytics/errors/rate?hours=${hours}`);
  return res.data;
}

export async function getRecentErrors(limit = 50): Promise<RecentError[]> {
  const res = await api.get<RecentError[]>(`/analytics/errors/recent?limit=${limit}`);
  return res.data;
}

export async function getUserFunnel(): Promise<UserFunnel> {
  const res = await api.get<UserFunnel>('/analytics/funnel');
  return res.data;
}

export async function flushCache(key?: string): Promise<{ flushed: string }> {
  const params = key ? `?key=${key}` : '';
  const res = await api.post<{ flushed: string }>(`/analytics/cache/flush${params}`);
  return res.data;
}

export async function getCacheStats(): Promise<CacheStats> {
  const res = await api.get<CacheStats>('/analytics/cache/stats');
  return res.data;
}
