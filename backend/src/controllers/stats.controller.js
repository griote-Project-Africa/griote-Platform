const statsService = require('../services/stats.service');

module.exports = {
  // ============ existing endpoints ============
  getTotalUsers: async (req, res) => {
    try {
      const stats = await statsService.getTotalUsers();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getVerifiedUsers: async (req, res) => {
    try {
      const stats = await statsService.getVerifiedUsers();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getTotalDepots: async (req, res) => {
    try {
      const stats = await statsService.getTotalDepots();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getTotalDocuments: async (req, res) => {
    try {
      const stats = await statsService.getTotalDocuments();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============ NEW: Temporal Trends ============
  getUserRegistrationsTrend: async (req, res) => {
    try {
      const { period = 'day', days = 30 } = req.query;
      const stats = await statsService.getUserRegistrationsTrend(period, parseInt(days));
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getDepotCreationsTrend: async (req, res) => {
    try {
      const { period = 'day', days = 30 } = req.query;
      const stats = await statsService.getDepotCreationsTrend(period, parseInt(days));
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============ NEW: Popularity Statistics ============
  getTopViewedDepots: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const stats = await statsService.getTopViewedDepots(limit);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getTopDownloadedDepots: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const stats = await statsService.getTopDownloadedDepots(limit);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getTopDownloadedDocuments: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const stats = await statsService.getTopDownloadedDocuments(limit);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============ NEW: Category and Tag Breakdown ============
  getDepotsByCategory: async (req, res) => {
    try {
      const stats = await statsService.getDepotsByCategory();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getDepotsByTag: async (req, res) => {
    try {
      const stats = await statsService.getDepotsByTag();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getDepotsByStatus: async (req, res) => {
    try {
      const stats = await statsService.getDepotsByStatus();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============ NEW: User Statistics ============
  getUsersByRole: async (req, res) => {
    try {
      const stats = await statsService.getUsersByRole();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getVerificationRate: async (req, res) => {
    try {
      const stats = await statsService.getVerificationRate();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // ============ Combined Dashboard ============
  getDashboardStats: async (req, res) => {
    try {
      const stats = await statsService.getDashboardStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
