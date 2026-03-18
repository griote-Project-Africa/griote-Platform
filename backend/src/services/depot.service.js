const { Depot, Document, Tag, Category, User, sequelize } = require('../models');
const minioService = require('./minio.service');
const mailService  = require('./mail.service');

function buildIncludes() {
  return [
    { model: Category, as: 'category', attributes: ['category_id', 'name', 'slug'] },
    { model: Document, as: 'documents' },
    { model: Tag,      as: 'tags', attributes: ['tag_id', 'name', 'slug'], through: { attributes: [] } }
  ];
}

async function getDepotById(depotId) {
  const depot = await Depot.findByPk(depotId, { include: buildIncludes() });
  if (!depot) throw new Error('Depot not found');
  return depot;
}

async function getAllDepots(filters = {}) {
  const where = {};
  if (filters.status)      where.status      = filters.status;
  if (filters.owner_id)    where.owner_id    = filters.owner_id;
  if (filters.category_id) where.category_id = filters.category_id;

  return Depot.findAll({
    where,
    include: buildIncludes(),
    order: [['created_at', 'DESC']]
  });
}

async function createDepot(data, userId) {
  const { title, description, category_id, tag_ids, status, previewImageFile, documentFiles } = data;

  const t = await sequelize.transaction();
  let depot;
  try {
    let cover_image_url = null;
    if (previewImageFile) {
      cover_image_url = await minioService.upload(previewImageFile, 'depot-covers');
    }

    depot = await Depot.create({
      owner_id:        userId,
      title,
      description,
      category_id:     category_id ? parseInt(category_id, 10) : null,
      status:          status || 'DRAFT',
      cover_image_url
    }, { transaction: t });

    if (tag_ids?.length) {
      const parsedIds = typeof tag_ids === 'string' ? JSON.parse(tag_ids) : tag_ids;
      const tags = await Tag.findAll({ where: { tag_id: parsedIds } });
      await depot.setTags(tags, { transaction: t });
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }

  if (documentFiles?.length) {
    for (const file of documentFiles) {
      const url = await minioService.upload(file, `depot-${depot.depot_id}`);
      await Document.create({
        depot_id:      depot.depot_id,
        uploader_id:   userId,
        filename:      file.originalname,
        original_name: file.originalname,
        url,
        file_type:     file.mimetype,
        file_size:     file.size
      });
    }
  }

  return getDepotById(depot.depot_id);
}

async function updateDepot(depotId, data, userId) {
  const depot = await Depot.findByPk(depotId);
  if (!depot) throw new Error('Depot not found');

  const { title, description, category_id, tag_ids, previewImageFile, documentFiles } = data;

  const updates = {};
  if (title       !== undefined) updates.title       = title;
  if (description !== undefined) updates.description = description;
  if (category_id !== undefined) updates.category_id = category_id ? parseInt(category_id, 10) : null;

  if (previewImageFile) {
    updates.cover_image_url = await minioService.upload(previewImageFile, 'depot-covers');
  }

  await depot.update(updates);

  if (tag_ids !== undefined) {
    const parsedIds = typeof tag_ids === 'string' ? JSON.parse(tag_ids) : (tag_ids || []);
    const tags = parsedIds.length > 0 ? await Tag.findAll({ where: { tag_id: parsedIds } }) : [];
    await depot.setTags(tags);
  }

  if (documentFiles?.length) {
    for (const file of documentFiles) {
      const url = await minioService.upload(file, `depot-${depotId}`);
      await Document.create({
        depot_id:      depotId,
        uploader_id:   userId,
        filename:      file.originalname,
        original_name: file.originalname,
        url,
        file_type:     file.mimetype,
        file_size:     file.size
      });
    }
  }

  return getDepotById(depotId);
}

async function deleteDepot(depotId) {
  const rows = await Depot.destroy({ where: { depot_id: depotId } });
  if (rows === 0) throw new Error('Depot not found');
}

async function submitDepotForReview(depotId, userId) {
  const depot = await Depot.findByPk(depotId);
  if (!depot) throw new Error('Depot not found');
  if (Number(depot.owner_id) !== Number(userId)) throw new Error('Not authorized to submit this depot');
  if (!['DRAFT', 'REJECTED'].includes(depot.status)) throw new Error('Cannot submit from current status');

  await depot.update({ status: 'PENDING' });
  return getDepotById(depotId);
}

async function approveDepot(depotId) {
  const depot = await Depot.findByPk(depotId, {
    include: [{ model: User, as: 'owner' }]
  });
  if (!depot) throw new Error('Depot not found');

  await depot.update({ status: 'PUBLISHED', published_at: new Date(), rejection_reason: null });

  if (depot.owner?.email) {
    await mailService.sendDepotApprovedEmail(depot.owner.email, depot.title).catch(() => {});
  }

  return getDepotById(depotId);
}

async function rejectDepot(depotId, reason) {
  const depot = await Depot.findByPk(depotId, {
    include: [{ model: User, as: 'owner' }]
  });
  if (!depot) throw new Error('Depot not found');

  await depot.update({ status: 'REJECTED', rejection_reason: reason || null });

  if (depot.owner?.email) {
    await mailService.sendDepotRejectedEmail(depot.owner.email, depot.title, reason).catch(() => {});
  }

  return getDepotById(depotId);
}

async function archiveDepot(depotId) {
  const depot = await Depot.findByPk(depotId);
  if (!depot) throw new Error('Depot not found');

  await depot.update({ status: 'ARCHIVED' });
  return getDepotById(depotId);
}

async function unarchiveDepot(depotId) {
  const depot = await Depot.findByPk(depotId);
  if (!depot) throw new Error('Depot not found');

  await depot.update({ status: 'PUBLISHED' });
  return getDepotById(depotId);
}

async function addDocumentToDepot(depotId, file, userId) {
  const depot = await Depot.findByPk(depotId);
  if (!depot) throw new Error('Depot not found');

  const url = await minioService.upload(file, `depot-${depotId}`);
  return Document.create({
    depot_id:      depotId,
    uploader_id:   userId,
    filename:      file.originalname,
    original_name: file.originalname,
    url,
    file_type:     file.mimetype,
    file_size:     file.size
  });
}

async function getDepotDocuments(depotId) {
  const depot = await Depot.findByPk(depotId);
  if (!depot) throw new Error('Depot not found');

  return Document.findAll({
    where: { depot_id: depotId },
    order: [['created_at', 'DESC']]
  });
}

module.exports = {
  getDepotById,
  getAllDepots,
  createDepot,
  updateDepot,
  deleteDepot,
  submitDepotForReview,
  approveDepot,
  rejectDepot,
  archiveDepot,
  unarchiveDepot,
  addDocumentToDepot,
  getDepotDocuments
};
