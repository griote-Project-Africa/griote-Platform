const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * Aggregation Service — LECTURE SEULE sur analytics_events.
 * Aucun INSERT, aucun UPDATE, aucune donnée agrégée persistée.
 * Toutes les méthodes calculent à la demande via SQL GROUP BY.
 */

// ── Helpers ────────────────────────────────────────────────────────────────

function clampDays(days, max = 365) {
  return Math.min(Math.max(parseInt(days) || 30, 1), max);
}

// ── Overview KPIs ──────────────────────────────────────────────────────────

async function getOverviewKPIs() {
  const [downloads24h, downloads24hPrev, activeUsers24h, newSignups7d, newSignups7dPrev,
         totalEvents7d, errorsCount1h] = await Promise.all([
    countEventsSince('download', '24 hours'),
    countEventsBetween('download', '48 hours', '24 hours'),
    countDistinctUsersSince('24 hours'),
    countEventsSince('signup', '7 days'),
    countEventsBetween('signup', '14 days', '7 days'),
    countEventsSince(null, '7 days'),
    countEventsSince('error', '1 hour'),
  ]);

  return {
    downloads24h,
    downloads24hDelta: pct(downloads24h, downloads24hPrev),
    activeUsers24h,
    newSignups7d,
    newSignups7dDelta: pct(newSignups7d, newSignups7dPrev),
    totalEvents7d,
    errorsCount1h,
  };
}

function pct(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

async function countEventsSince(eventType, interval) {
  const where = eventType
    ? `event_type = :eventType AND created_at >= NOW() - INTERVAL :interval`
    : `created_at >= NOW() - INTERVAL :interval`;

  const [row] = await sequelize.query(
    `SELECT COUNT(*) AS count FROM analytics_events WHERE ${where}`,
    { replacements: { eventType, interval }, type: QueryTypes.SELECT }
  );
  return parseInt(row.count) || 0;
}

async function countEventsBetween(eventType, fromInterval, toInterval) {
  const [row] = await sequelize.query(
    `SELECT COUNT(*) AS count FROM analytics_events
     WHERE  event_type = :eventType
       AND  created_at >= NOW() - INTERVAL :fromInterval
       AND  created_at <  NOW() - INTERVAL :toInterval`,
    { replacements: { eventType, fromInterval, toInterval }, type: QueryTypes.SELECT }
  );
  return parseInt(row.count) || 0;
}

async function countDistinctUsersSince(interval) {
  const [row] = await sequelize.query(
    `SELECT COUNT(DISTINCT user_id) AS count FROM analytics_events
     WHERE user_id IS NOT NULL AND created_at >= NOW() - INTERVAL :interval`,
    { replacements: { interval }, type: QueryTypes.SELECT }
  );
  return parseInt(row.count) || 0;
}

// ── Séries temporelles ─────────────────────────────────────────────────────

async function getDownloadSeries(days = 30) {
  return sequelize.query(
    `SELECT
       DATE(created_at AT TIME ZONE 'UTC') AS day,
       COUNT(*)                             AS count
     FROM   analytics_events
     WHERE  event_type  = 'download'
       AND  created_at >= NOW() - INTERVAL :interval
     GROUP  BY DATE(created_at AT TIME ZONE 'UTC')
     ORDER  BY day ASC`,
    { replacements: { interval: `${clampDays(days)} days` }, type: QueryTypes.SELECT }
  );
}

async function getActivitySeries(days = 30) {
  return sequelize.query(
    `SELECT
       DATE(created_at AT TIME ZONE 'UTC') AS day,
       COUNT(*)                             AS count
     FROM   analytics_events
     WHERE  created_at >= NOW() - INTERVAL :interval
     GROUP  BY DATE(created_at AT TIME ZONE 'UTC')
     ORDER  BY day ASC`,
    { replacements: { interval: `${clampDays(days)} days` }, type: QueryTypes.SELECT }
  );
}

async function getSignupSeries(days = 30) {
  return sequelize.query(
    `SELECT
       DATE(created_at AT TIME ZONE 'UTC') AS day,
       COUNT(*)                             AS count
     FROM   analytics_events
     WHERE  event_type  = 'signup'
       AND  created_at >= NOW() - INTERVAL :interval
     GROUP  BY DATE(created_at AT TIME ZONE 'UTC')
     ORDER  BY day ASC`,
    { replacements: { interval: `${clampDays(days)} days` }, type: QueryTypes.SELECT }
  );
}

// ── Géographie ─────────────────────────────────────────────────────────────

async function getGeography(days = 30) {
  return sequelize.query(
    `SELECT
       country_code,
       COUNT(*)                    AS total_events,
       COUNT(DISTINCT user_id)     AS unique_users,
       COUNT(DISTINCT ip_address)  AS unique_ips
     FROM   analytics_events
     WHERE  country_code IS NOT NULL
       AND  created_at  >= NOW() - INTERVAL :interval
     GROUP  BY country_code
     ORDER  BY total_events DESC
     LIMIT  60`,
    { replacements: { interval: `${clampDays(days)} days` }, type: QueryTypes.SELECT }
  );
}

// ── Top contenu ────────────────────────────────────────────────────────────

async function getTopDepots(limit = 10, days = 30) {
  return sequelize.query(
    `SELECT
       ae.entity_id                                    AS depot_id,
       MAX(d.title)                                    AS title,
       COUNT(*)                                        AS download_count,
       COUNT(DISTINCT ae.user_id)                      AS unique_downloaders
     FROM   analytics_events ae
     JOIN   depots d ON d.depot_id = ae.entity_id
     WHERE  ae.event_type  = 'download'
       AND  ae.entity_type = 'depot'
       AND  ae.created_at >= NOW() - INTERVAL :interval
     GROUP  BY ae.entity_id
     ORDER  BY download_count DESC
     LIMIT  :limit`,
    { replacements: { interval: `${clampDays(days)} days`, limit }, type: QueryTypes.SELECT }
  );
}

async function getTopArticles(limit = 10, days = 30) {
  return sequelize.query(
    `SELECT
       ae.entity_id        AS article_id,
       MAX(a.title)        AS title,
       COUNT(*)            AS view_count
     FROM   analytics_events ae
     JOIN   articles a ON a.article_id = ae.entity_id
     WHERE  ae.event_type  = 'view'
       AND  ae.entity_type = 'article'
       AND  ae.created_at >= NOW() - INTERVAL :interval
     GROUP  BY ae.entity_id
     ORDER  BY view_count DESC
     LIMIT  :limit`,
    { replacements: { interval: `${clampDays(days)} days`, limit }, type: QueryTypes.SELECT }
  );
}

// ── Heatmap activité horaire ───────────────────────────────────────────────

async function getActivityHeatmap(days = 7) {
  return sequelize.query(
    `SELECT
       EXTRACT(DOW  FROM created_at AT TIME ZONE 'UTC')::int  AS day_of_week,
       EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC')::int  AS hour_of_day,
       COUNT(*)                                                AS event_count
     FROM   analytics_events
     WHERE  created_at >= NOW() - INTERVAL :interval
     GROUP  BY day_of_week, hour_of_day
     ORDER  BY day_of_week, hour_of_day`,
    { replacements: { interval: `${clampDays(days, 90)} days` }, type: QueryTypes.SELECT }
  );
}

// ── Performance API ────────────────────────────────────────────────────────

async function getAPIPerformance(hours = 24) {
  return sequelize.query(
    `SELECT
       DATE_TRUNC('hour', created_at AT TIME ZONE 'UTC')     AS hour,
       PERCENTILE_CONT(0.50) WITHIN GROUP
         (ORDER BY (metadata->>'response_ms')::int)          AS p50,
       PERCENTILE_CONT(0.95) WITHIN GROUP
         (ORDER BY (metadata->>'response_ms')::int)          AS p95,
       PERCENTILE_CONT(0.99) WITHIN GROUP
         (ORDER BY (metadata->>'response_ms')::int)          AS p99,
       COUNT(*)                                              AS request_count
     FROM   analytics_events
     WHERE  event_type  = 'api_request'
       AND  metadata->>'response_ms' IS NOT NULL
       AND  created_at >= NOW() - INTERVAL :interval
     GROUP  BY hour
     ORDER  BY hour ASC`,
    { replacements: { interval: `${Math.min(hours, 168)} hours` }, type: QueryTypes.SELECT }
  );
}

async function getErrorRate(hours = 24) {
  const [row] = await sequelize.query(
    `SELECT
       COUNT(*) FILTER (WHERE event_type = 'error')  AS errors,
       COUNT(*) FILTER (WHERE event_type = 'api_request'
         AND (metadata->>'status_code')::int >= 400) AS http_errors,
       COUNT(*) FILTER (WHERE event_type = 'api_request') AS total_requests
     FROM analytics_events
     WHERE created_at >= NOW() - INTERVAL :interval`,
    { replacements: { interval: `${hours} hours` }, type: QueryTypes.SELECT }
  );
  const errors  = parseInt(row.errors)        || 0;
  const http4xx = parseInt(row.http_errors)   || 0;
  const total   = parseInt(row.total_requests)|| 0;
  return {
    errors,
    http_errors: http4xx,
    total_requests: total,
    error_rate: total > 0 ? +((http4xx / total) * 100).toFixed(2) : 0,
  };
}

async function getRecentErrors(limit = 50) {
  return sequelize.query(
    `SELECT
       created_at,
       metadata->>'path'          AS path,
       metadata->>'method'        AS method,
       metadata->>'status_code'   AS status_code,
       metadata->>'response_ms'   AS response_ms,
       ip_address,
       country_code
     FROM   analytics_events
     WHERE  event_type = 'api_request'
       AND  (metadata->>'status_code')::int >= 400
     ORDER  BY created_at DESC
     LIMIT  :limit`,
    { replacements: { limit }, type: QueryTypes.SELECT }
  );
}

// ── Funnel utilisateur ─────────────────────────────────────────────────────

async function getUserFunnel() {
  const [row] = await sequelize.query(
    `SELECT
       COUNT(DISTINCT CASE WHEN event_type = 'signup'   THEN user_id END) AS signups,
       COUNT(DISTINCT CASE WHEN event_type = 'login'    THEN user_id END) AS logins,
       COUNT(DISTINCT CASE WHEN event_type = 'upload'   THEN user_id END) AS uploaders,
       COUNT(DISTINCT CASE WHEN event_type = 'download' THEN user_id END) AS downloaders
     FROM analytics_events
     WHERE created_at >= NOW() - INTERVAL '30 days'`,
    { type: QueryTypes.SELECT }
  );
  return row;
}

module.exports = {
  getOverviewKPIs,
  getDownloadSeries,
  getActivitySeries,
  getSignupSeries,
  getGeography,
  getTopDepots,
  getTopArticles,
  getActivityHeatmap,
  getAPIPerformance,
  getErrorRate,
  getRecentErrors,
  getUserFunnel,
};
