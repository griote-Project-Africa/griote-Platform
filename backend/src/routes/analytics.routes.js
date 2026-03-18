const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/analytics.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireAdmin }   = require('../middleware/role.middleware');

// All analytics endpoints require authentication + admin role
router.use(authMiddleware);
router.use(requireAdmin);

// ── Overview ───────────────────────────────────────────────────────────────
router.get('/overview',           ctrl.getOverview);

// ── Séries temporelles ─────────────────────────────────────────────────────
router.get('/series/downloads',   ctrl.getDownloadSeries);
router.get('/series/activity',    ctrl.getActivitySeries);
router.get('/series/signups',     ctrl.getSignupSeries);

// ── Contenu populaire ──────────────────────────────────────────────────────
router.get('/top/depots',         ctrl.getTopDepots);
router.get('/top/articles',       ctrl.getTopArticles);

// ── Géographie ─────────────────────────────────────────────────────────────
router.get('/geography',          ctrl.getGeography);

// ── Heatmap activité ───────────────────────────────────────────────────────
router.get('/heatmap',            ctrl.getActivityHeatmap);

// ── Performance & Erreurs ──────────────────────────────────────────────────
router.get('/performance',        ctrl.getAPIPerformance);
router.get('/errors/rate',        ctrl.getErrorRate);
router.get('/errors/recent',      ctrl.getRecentErrors);

// ── Funnel ─────────────────────────────────────────────────────────────────
router.get('/funnel',             ctrl.getUserFunnel);

// ── Cache management ───────────────────────────────────────────────────────
router.post('/cache/flush',       ctrl.flushCache);
router.get('/cache/stats',        ctrl.getCacheStats);

module.exports = router;
