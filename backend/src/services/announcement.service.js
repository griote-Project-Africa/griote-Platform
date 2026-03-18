const { Announcement, User } = require('../models');
const minioService = require('./minio.service');

async function getAll() {
  return Announcement.findAll({
    include: [{ model: User, as: 'author', attributes: ['user_id', 'first_name', 'last_name'] }],
    order: [['created_at', 'DESC']]
  });
}

async function getAllPublished() {
  return Announcement.findAll({
    where: { status: 'PUBLISHED' },
    include: [{ model: User, as: 'author', attributes: ['user_id', 'first_name', 'last_name'] }],
    order: [['published_at', 'DESC']]
  });
}

async function getById(id) {
  const announcement = await Announcement.findByPk(id, {
    include: [{ model: User, as: 'author', attributes: ['user_id', 'first_name', 'last_name'] }]
  });
  if (!announcement) throw new Error('Announcement not found');
  return announcement;
}

async function create(data, authorId, coverFile) {
  const { title, content, is_featured, priority } = data;
  if (!title || !content) throw new Error('Title and content are required');

  let cover_image_url = null;
  if (coverFile) {
    cover_image_url = await minioService.upload(coverFile, 'announcement-covers');
  }

  const announcement = await Announcement.create({
    author_id: authorId,
    title,
    content,
    cover_image_url,
    status: 'DRAFT',
    is_featured: is_featured === 'true' || is_featured === true || false,
    priority: parseInt(priority, 10) || 0
  });

  return getById(announcement.announcement_id);
}

async function update(id, data, coverFile) {
  const announcement = await Announcement.findByPk(id);
  if (!announcement) throw new Error('Announcement not found');

  const updates = {};
  if (data.title   !== undefined) updates.title   = data.title;
  if (data.content !== undefined) updates.content = data.content;
  if (data.is_featured !== undefined) updates.is_featured = data.is_featured === 'true' || data.is_featured === true;
  if (data.priority    !== undefined) updates.priority    = parseInt(data.priority, 10) || 0;

  if (coverFile) {
    if (announcement.cover_image_url) {
      await minioService.deleteFile(announcement.cover_image_url).catch(() => {});
    }
    updates.cover_image_url = await minioService.upload(coverFile, 'announcement-covers');
  }

  await announcement.update(updates);
  return getById(id);
}

async function publish(id) {
  const announcement = await Announcement.findByPk(id);
  if (!announcement) throw new Error('Announcement not found');
  if (announcement.status === 'PUBLISHED') throw new Error('Already published');

  await announcement.update({ status: 'PUBLISHED', published_at: new Date() });
  return getById(id);
}

async function archive(id) {
  const announcement = await Announcement.findByPk(id);
  if (!announcement) throw new Error('Announcement not found');

  await announcement.update({ status: 'ARCHIVED', archived_at: new Date() });
  return getById(id);
}

async function remove(id) {
  const announcement = await Announcement.findByPk(id);
  if (!announcement) throw new Error('Announcement not found');

  if (announcement.cover_image_url) {
    await minioService.deleteFile(announcement.cover_image_url).catch(() => {});
  }

  await announcement.destroy();
}

module.exports = { getAll, getAllPublished, getById, create, update, publish, archive, remove };
