const agg   = require('../services/analytics.aggregation.service');
const { withCache, invalidate, TTL, stats } = require('../services/analytics.cache');

// ── Helpers ────────────────────────────────────────────────────────────────

function qInt(val, def) {
  const n = parseInt(val);
  return isNaN(n) ? def : n;
}

function wrap(fn) {
  return async (req, res) => {
    try {
      const data = await fn(req);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

// ── Endpoints ──────────────────────────────────────────────────────────────

const getOverview = wrap(() =>
  withCache('overview', TTL.overview, () => agg.getOverviewKPIs())
);

const getDownloadSeries = wrap((req) => {
  const days = qInt(req.query.days, 30);
  return withCache(`download_series_${days}`, TTL.series, () => agg.getDownloadSeries(days));
});

const getActivitySeries = wrap((req) => {
  const days = qInt(req.query.days, 30);
  return withCache(`activity_series_${days}`, TTL.series, () => agg.getActivitySeries(days));
});

const getSignupSeries = wrap((req) => {
  const days = qInt(req.query.days, 30);
  return withCache(`signup_series_${days}`, TTL.series, () => agg.getSignupSeries(days));
});

const getGeography = wrap((req) => {
  const days = qInt(req.query.days, 30);
  return withCache(`geography_${days}`, TTL.geography, () => agg.getGeography(days));
});

const getTopDepots = wrap((req) => {
  const limit = qInt(req.query.limit, 10);
  const days  = qInt(req.query.days, 30);
  return withCache(`top_depots_${limit}_${days}`, TTL.topContent, () => agg.getTopDepots(limit, days));
});

const getTopArticles = wrap((req) => {
  const limit = qInt(req.query.limit, 10);
  const days  = qInt(req.query.days, 30);
  return withCache(`top_articles_${limit}_${days}`, TTL.topContent, () => agg.getTopArticles(limit, days));
});

const getActivityHeatmap = wrap((req) => {
  const days = qInt(req.query.days, 7);
  return withCache(`heatmap_${days}`, TTL.heatmap, () => agg.getActivityHeatmap(days));
});

const getAPIPerformance = wrap((req) => {
  const hours = qInt(req.query.hours, 24);
  return withCache(`api_perf_${hours}`, TTL.performance, () => agg.getAPIPerformance(hours));
});

const getErrorRate = wrap((req) => {
  const hours = qInt(req.query.hours, 24);
  return withCache(`error_rate_${hours}`, TTL.errors, () => agg.getErrorRate(hours));
});

const getRecentErrors = wrap((req) => {
  const limit = qInt(req.query.limit, 50);
  return withCache(`recent_errors_${limit}`, TTL.errors, () => agg.getRecentErrors(limit));
});

const getUserFunnel = wrap(() =>
  withCache('user_funnel', TTL.funnel, () => agg.getUserFunnel())
);

/** Invalide tout le cache analytique (refresh forcé depuis le dashboard) */
function flushCache(req, res) {
  const { key } = req.query;
  invalidate(key || undefined);
  res.json({ flushed: key || 'all' });
}

/** Stats du cache (debug) */
function getCacheStats(req, res) {
  res.json(stats());
}

module.exports = {
  getOverview,
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
  flushCache,
  getCacheStats,
};
