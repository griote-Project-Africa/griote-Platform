const announcementService = require('../services/announcement.service');

exports.getAll = async (req, res) => {
  try {
    const announcements = await announcementService.getAll();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPublished = async (req, res) => {
  try {
    const announcements = await announcementService.getAllPublished();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const announcement = await announcementService.getById(req.params.id);
    res.json(announcement);
  } catch (err) {
    const status = err.message === 'Announcement not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const announcement = await announcementService.create(req.body, req.user.id, req.file || null);
    res.status(201).json(announcement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const announcement = await announcementService.update(req.params.id, req.body, req.file || null);
    res.json(announcement);
  } catch (err) {
    const status = err.message === 'Announcement not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
};

exports.publish = async (req, res) => {
  try {
    const announcement = await announcementService.publish(req.params.id);
    res.json(announcement);
  } catch (err) {
    const status = err.message === 'Announcement not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
};

exports.archive = async (req, res) => {
  try {
    const announcement = await announcementService.archive(req.params.id);
    res.json(announcement);
  } catch (err) {
    const status = err.message === 'Announcement not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await announcementService.remove(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    const status = err.message === 'Announcement not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
};
