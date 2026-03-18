const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// ============ existing endpoints ============
router.get('/total-users', statsController.getTotalUsers);
router.get('/verified-users', statsController.getVerifiedUsers);
router.get('/total-depots', statsController.getTotalDepots);
router.get('/total-documents', statsController.getTotalDocuments);

// ============ NEW: Temporal Trends ============
router.get('/users/registrations', statsController.getUserRegistrationsTrend);
router.get('/depots/creations', statsController.getDepotCreationsTrend);

// ============ NEW: Popularity Statistics ============
router.get('/depots/top-viewed', statsController.getTopViewedDepots);
router.get('/depots/top-downloaded', statsController.getTopDownloadedDepots);
router.get('/documents/top-downloaded', statsController.getTopDownloadedDocuments);

// ============ NEW: Category and Tag Breakdown ============
router.get('/depots/by-category', statsController.getDepotsByCategory);
router.get('/depots/by-tag', statsController.getDepotsByTag);
router.get('/depots/by-status', statsController.getDepotsByStatus);

// ============ NEW: User Statistics ============
router.get('/users/by-role', statsController.getUsersByRole);
router.get('/users/verification-rate', statsController.getVerificationRate);

// ============ Combined Dashboard ============
router.get('/dashboard', statsController.getDashboardStats);

module.exports = router;
