const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/depot.controller');
const statsController = require('../controllers/stats.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

const depotUpload = upload.fields([
  { name: 'preview_image', maxCount: 1 },
  { name: 'documents' },
]);

router.post('/', authMiddleware, depotUpload, ctrl.createDepotController);
router.get('/', authMiddleware, ctrl.listDepotsController);

// Admin stats routes (must be before /:id routes)
router.get('/stats/total-depots', authMiddleware, requireAdmin, statsController.getTotalDepots);
router.get('/stats/total-documents', authMiddleware, requireAdmin, statsController.getTotalDocuments);

// Submit depot for review
router.patch('/:id/submit', authMiddleware, ctrl.submitDepotController);
// Approve depot (admin only)
router.patch('/:id/approve', authMiddleware, requireAdmin, ctrl.approveDepotController);
// Reject depot (admin only)
router.patch('/:id/reject', authMiddleware, requireAdmin, ctrl.rejectDepotController);
// Archive depot (admin only)
router.patch('/:id/archive', authMiddleware, requireAdmin, ctrl.archiveDepotController);
// Unarchive depot (admin only)
router.patch('/:id/unarchive', authMiddleware, requireAdmin, ctrl.unarchiveDepotController);

router.get('/:id', authMiddleware, ctrl.getDepotController);
router.put('/:id', authMiddleware, depotUpload, ctrl.updateDepotController);
router.delete('/:id', authMiddleware, ctrl.deleteDepotController);
router.post('/:id/documents', authMiddleware, upload.single('document'), ctrl.addDocumentController);
router.get('/:id/documents', authMiddleware, ctrl.listDepotDocumentsController);

module.exports = router;
