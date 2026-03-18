const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/announcement.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireAdmin }   = require('../middleware/role.middleware');
const upload             = require('../middleware/upload.middleware');

// Public
router.get('/',    ctrl.getAllPublished);
router.get('/:id', ctrl.getById);

// Admin — auth + role required
router.post('/',   authMiddleware, requireAdmin, upload.single('cover'), ctrl.create);
router.patch('/:id',        authMiddleware, requireAdmin, upload.single('cover'), ctrl.update);
router.delete('/:id',       authMiddleware, requireAdmin, ctrl.remove);
router.patch('/:id/publish', authMiddleware, requireAdmin, ctrl.publish);
router.patch('/:id/archive', authMiddleware, requireAdmin, ctrl.archive);

// Admin list (all statuses)
router.get('/admin/all', authMiddleware, requireAdmin, ctrl.getAll);

module.exports = router;
