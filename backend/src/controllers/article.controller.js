const articleService = require('../services/article.service');
const { trackEvent } = require('../middleware/analytics.middleware');

async function getArticles(req, res) {
  try {
    const articles = await articleService.getArticles({
      status:      req.query.status,
      category_id: req.query.category_id,
      author_id:   req.query.author_id
    });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getArticleById(req, res) {
  try {
    const article = await articleService.getArticleById(req.params.id);
    trackEvent('view', { req, entityType: 'article', entityId: parseInt(req.params.id) });
    res.json(article);
  } catch (err) {
    const status = err.message === 'Article not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

async function createArticle(req, res) {
  try {
    const { title, subtitle, content, category_id, status, tags } = req.body;
    const tagIds = tags ? JSON.parse(tags) : [];
    const article = await articleService.createArticle(
      { title, subtitle, content, category_id, status },
      req.user.id,
      req.file || null,
      tagIds
    );
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateArticle(req, res) {
  try {
    const { title, subtitle, content, category_id, tags } = req.body;
    const tagIds = tags !== undefined ? JSON.parse(tags) : undefined;
    const article = await articleService.updateArticle(
      req.params.id,
      { title, subtitle, content, category_id },
      req.user.id,
      req.file || null,
      tagIds
    );
    res.json(article);
  } catch (err) {
    const status = err.message === 'Article not found' ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
}

async function submitArticle(req, res) {
  try {
    const article = await articleService.submitArticle(req.params.id, req.user.id);
    res.json(article);
  } catch (err) {
    const status = err.message === 'Article not found' ? 404
      : err.message === 'Not authorized' ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
}

async function approveArticle(req, res) {
  try {
    const article = await articleService.approveArticle(req.params.id);
    res.json(article);
  } catch (err) {
    const status = err.message === 'Article not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

async function rejectArticle(req, res) {
  try {
    const article = await articleService.rejectArticle(req.params.id, req.body.reason);
    res.json(article);
  } catch (err) {
    const status = err.message === 'Article not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

async function archiveArticle(req, res) {
  try {
    const article = await articleService.archiveArticle(req.params.id);
    res.json(article);
  } catch (err) {
    const status = err.message === 'Article not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

async function deleteArticle(req, res) {
  try {
    await articleService.deleteArticle(req.params.id);
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    const status = err.message === 'Article not found' ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
}

async function countArticles(req, res) {
  try {
    const count = await articleService.countArticles({
      status:      req.query.status,
      category_id: req.query.category_id,
      author_id:   req.query.author_id
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getArticles, getArticleById, createArticle, updateArticle,
  submitArticle, approveArticle, rejectArticle, archiveArticle,
  deleteArticle, countArticles
};
