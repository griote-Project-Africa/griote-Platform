const depotService = require('../services/depot.service');
const { trackEvent } = require('../middleware/analytics.middleware');

const createDepotController = async (req, res) => {
  try {
    const { title, description, category_id, tag_ids, status } = req.body;
    const previewImageFile = req.files?.['preview_image']?.[0] || null;
    const documentFiles = req.files?.['documents'] || [];
    const depot = await depotService.createDepot(
      { title, description, category_id, tag_ids, status, previewImageFile, documentFiles },
      req.user.id
    );
    res.status(201).json(depot);
  } catch (error) {
    console.error('Error creating depot:', error);
    res.status(500).json({ error: error.message });
  }
};

const submitDepotController = async (req, res) => {
  try {
    const { id } = req.params;
    const depot = await depotService.submitDepotForReview(id, req.user.id);
    res.json(depot);
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else if (error.message === 'Not authorized to submit this depot') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const approveDepotController = async (req, res) => {
  try {
    const { id } = req.params;
    const depot = await depotService.approveDepot(id);
    res.json(depot);
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const rejectDepotController = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const depot = await depotService.rejectDepot(id, reason);
    res.json(depot);
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const archiveDepotController = async (req, res) => {
  try {
    const { id } = req.params;
    const depot = await depotService.archiveDepot(id);
    res.json(depot);
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const unarchiveDepotController = async (req, res) => {
  try {
    const { id } = req.params;
    const depot = await depotService.unarchiveDepot(id);
    res.json(depot);
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const getDepotController = async (req, res) => {
  try {
    const { id } = req.params;
    const depot = await depotService.getDepotById(id);
    trackEvent('view', { req, entityType: 'depot', entityId: parseInt(id) });
    res.json(depot);
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const listDepotsController = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    // Handle owner_id filter - 'me' means current user's depots
    if (req.query.owner_id) {
      if (req.query.owner_id === 'me' && req.user) {
        filters.owner_id = req.user.id;
      } else {
        filters.owner_id = req.query.owner_id;
      }
    }
    if (req.query.category_id) filters.category_id = req.query.category_id;
    const depots = await depotService.getAllDepots(filters);
    res.json(depots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateDepotController = async (req, res) => {
  try {
    const { id } = req.params;
    const previewImageFile = req.files?.['preview_image']?.[0] || null;
    const documentFiles = req.files?.['documents'] || [];
    const depot = await depotService.updateDepot(
      id,
      { ...req.body, previewImageFile, documentFiles },
      req.user.id
    );
    res.json(depot);
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const deleteDepotController = async (req, res) => {
  try {
    const { id } = req.params;
    await depotService.deleteDepot(id);
    res.json({ message: 'Depot deleted successfully' });
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const addDocumentController = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file provided' });
    const document = await depotService.addDocumentToDepot(id, { file }, req.user.id);
    res.status(201).json(document);
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const listDepotDocumentsController = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await depotService.getDepotDocuments(id);
    res.json(documents);
  } catch (error) {
    if (error.message === 'Depot not found') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = {
  createDepotController,
  getDepotController,
  listDepotsController,
  updateDepotController,
  deleteDepotController,
  addDocumentController,
  listDepotDocumentsController,
  submitDepotController,
  approveDepotController,
  rejectDepotController,
  archiveDepotController,
  unarchiveDepotController
};