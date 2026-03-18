const { User, Depot, Document, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

async function getTotalUsers() {
  const count = await User.count();
  return { totalUsers: count };
}

async function getVerifiedUsers() {
  const count = await User.count({ where: { is_email_verified: true } });
  return { verifiedUsers: count };
}

async function getTotalDepots() {
  const count = await Depot.count();
  return { totalDepots: count };
}

async function getTotalDocuments() {
  const count = await Document.count();
  return { totalDocuments: count };
}

// ── Temporal trends (PostgreSQL TO_CHAR) ──────────────────────────────────────

async function getUserRegistrationsTrend(period = 'day', days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const fmt = period === 'month' ? 'YYYY-MM' : period === 'week' ? 'IYYY-IW' : 'YYYY-MM-DD';

  const results = await User.findAll({
    attributes: [
      [sequelize.fn('TO_CHAR', sequelize.col('created_at'), fmt), 'date'],
      [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']
    ],
    where: { created_at: { [Op.gte]: startDate } },
    group:  [sequelize.fn('TO_CHAR', sequelize.col('created_at'), fmt)],
    order:  [[sequelize.fn('TO_CHAR', sequelize.col('created_at'), fmt), 'ASC']]
  });

  return { trend: results.map(r => ({ date: r.dataValues.date, count: parseInt(r.dataValues.count) })) };
}

async function getDepotCreationsTrend(period = 'day', days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const fmt = period === 'month' ? 'YYYY-MM' : period === 'week' ? 'IYYY-IW' : 'YYYY-MM-DD';

  const results = await Depot.findAll({
    attributes: [
      [sequelize.fn('TO_CHAR', sequelize.col('created_at'), fmt), 'date'],
      [sequelize.fn('COUNT', sequelize.col('depot_id')), 'count']
    ],
    where: { created_at: { [Op.gte]: startDate } },
    group:  [sequelize.fn('TO_CHAR', sequelize.col('created_at'), fmt)],
    order:  [[sequelize.fn('TO_CHAR', sequelize.col('created_at'), fmt), 'ASC']]
  });

  return { trend: results.map(r => ({ date: r.dataValues.date, count: parseInt(r.dataValues.count) })) };
}

// ── Popularity ────────────────────────────────────────────────────────────────

async function getTopViewedDepots(limit = 10) {
  const depots = await Depot.findAll({
    attributes: ['depot_id', 'title', 'view_count', 'download_count', 'created_at'],
    where:   { status: 'PUBLISHED' },
    order:   [['view_count', 'DESC']],
    limit,
    include: [{ model: Category, as: 'category', attributes: ['name'] }]
  });

  return {
    depots: depots.map(d => ({
      depot_id:       d.depot_id,
      title:          d.title,
      view_count:     d.view_count || 0,
      download_count: d.download_count || 0,
      category:       d.category?.name || 'N/A',
      created_at:     d.created_at
    }))
  };
}

async function getTopDownloadedDepots(limit = 10) {
  const depots = await Depot.findAll({
    attributes: ['depot_id', 'title', 'view_count', 'download_count', 'created_at'],
    where:   { status: 'PUBLISHED' },
    order:   [['download_count', 'DESC']],
    limit,
    include: [{ model: Category, as: 'category', attributes: ['name'] }]
  });

  return {
    depots: depots.map(d => ({
      depot_id:       d.depot_id,
      title:          d.title,
      view_count:     d.view_count || 0,
      download_count: d.download_count || 0,
      category:       d.category?.name || 'N/A',
      created_at:     d.created_at
    }))
  };
}

async function getTopDownloadedDocuments(limit = 10) {
  const documents = await Document.findAll({
    attributes: ['document_id', 'filename', 'file_type', 'download_count', 'file_size', 'created_at'],
    order:   [['download_count', 'DESC']],
    limit,
    include: [{ model: Depot, attributes: ['title'] }]
  });

  return {
    documents: documents.map(d => ({
      document_id:    d.document_id,
      filename:       d.filename,
      file_type:      d.file_type,
      download_count: d.download_count || 0,
      file_size:      d.file_size || 0,
      depot_title:    d.Depot?.title || 'N/A',
      created_at:     d.created_at
    }))
  };
}

// ── Category / Tag / Status breakdown ────────────────────────────────────────

async function getDepotsByCategory() {
  const results = await Depot.findAll({
    attributes: [
      'category_id',
      [sequelize.fn('COUNT', sequelize.col('Depot.depot_id')), 'count']
    ],
    group:   ['Depot.category_id', 'category.category_id'],
    include: [{ model: Category, as: 'category', attributes: ['name'] }]
  });

  return {
    categories: results.map(r => ({
      category_id: r.category_id,
      name:  r.category?.name || 'Sans catégorie',
      count: parseInt(r.dataValues.count)
    }))
  };
}

async function getDepotsByTag() {
  const results = await sequelize.query(`
    SELECT t.tag_id, t.name, COUNT(dt.depot_id) AS count
    FROM tags t
    LEFT JOIN depot_tags dt ON t.tag_id = dt.tag_id
    GROUP BY t.tag_id, t.name
    ORDER BY count DESC
  `, { type: sequelize.QueryTypes.SELECT });

  return {
    tags: results.map(r => ({
      tag_id: r.tag_id,
      name:   r.name,
      count:  parseInt(r.count)
    }))
  };
}

async function getDepotsByStatus() {
  const results = await Depot.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('depot_id')), 'count']
    ],
    group: ['status']
  });

  return {
    statuses: results.map(r => ({
      status: r.status,
      count:  parseInt(r.dataValues.count)
    }))
  };
}

// ── User stats ────────────────────────────────────────────────────────────────

async function getUsersByRole() {
  const results = await User.findAll({
    attributes: [
      'role',
      [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']
    ],
    group: ['role']
  });

  return {
    roles: results.map(r => ({
      role:  r.role,
      count: parseInt(r.dataValues.count)
    }))
  };
}

async function getVerificationRate() {
  const total    = await User.count();
  const verified = await User.count({ where: { is_email_verified: true } });
  return {
    totalUsers:       total,
    verifiedUsers:    verified,
    verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0
  };
}

// ── Combined dashboard ────────────────────────────────────────────────────────

async function getDashboardStats() {
  const [
    { totalUsers },
    { totalDepots },
    { totalDocuments },
    depotsByCategory,
    depotsByStatus,
    usersByRole,
    verificationRate,
    topViewedDepots,
    topDownloadedDepots
  ] = await Promise.all([
    getTotalUsers(),
    getTotalDepots(),
    getTotalDocuments(),
    getDepotsByCategory(),
    getDepotsByStatus(),
    getUsersByRole(),
    getVerificationRate(),
    getTopViewedDepots(5),
    getTopDownloadedDepots(5)
  ]);

  return {
    totalUsers,
    totalDepots,
    totalDocuments,
    categories:          depotsByCategory.categories,
    statuses:            depotsByStatus.statuses,
    roles:               usersByRole.roles,
    verificationRate:    verificationRate.verificationRate,
    verifiedUsers:       verificationRate.verifiedUsers,
    topViewedDepots:     topViewedDepots.depots,
    topDownloadedDepots: topDownloadedDepots.depots
  };
}

module.exports = {
  getTotalUsers, getVerifiedUsers, getTotalDepots, getTotalDocuments,
  getUserRegistrationsTrend, getDepotCreationsTrend,
  getTopViewedDepots, getTopDownloadedDepots, getTopDownloadedDocuments,
  getDepotsByCategory, getDepotsByTag, getDepotsByStatus,
  getUsersByRole, getVerificationRate, getDashboardStats
};
