const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/article.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireAdmin }   = require('../middleware/role.middleware');
const upload             = require('../middleware/upload.middleware');

// Public
router.get('/',        ctrl.getArticles);
router.get('/count',   ctrl.countArticles);
router.get('/:id',     ctrl.getArticleById);

// Authenticated users
router.post('/',       authMiddleware, upload.single('cover'), ctrl.createArticle);
router.patch('/:id',   authMiddleware, upload.single('cover'), ctrl.updateArticle);
router.patch('/:id/submit', authMiddleware, ctrl.submitArticle);

// Admin only
router.patch('/:id/approve', authMiddleware, requireAdmin, ctrl.approveArticle);
router.patch('/:id/reject',  authMiddleware, requireAdmin, ctrl.rejectArticle);
router.patch('/:id/archive', authMiddleware, requireAdmin, ctrl.archiveArticle);
router.delete('/:id',        authMiddleware, requireAdmin, ctrl.deleteArticle);

module.exports = router;
