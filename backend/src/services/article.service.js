const { Article, Category, Tag, User, sequelize } = require('../models');
const minioService = require('./minio.service');
const mailService  = require('./mail.service');

function buildIncludes() {
  return [
    { model: User,     as: 'author',   attributes: ['user_id', 'first_name', 'last_name', 'email'] },
    { model: Category, as: 'category', attributes: ['category_id', 'name', 'slug'] },
    { model: Tag,      as: 'tags',     attributes: ['tag_id', 'name', 'slug'], through: { attributes: [] } }
  ];
}

async function getArticleById(id) {
  const article = await Article.findByPk(id, { include: buildIncludes() });
  if (!article) throw new Error('Article not found');
  return article;
}

async function getArticles(filters = {}) {
  const where = {};
  if (filters.status)     where.status      = filters.status;
  if (filters.category_id) where.category_id = filters.category_id;
  if (filters.author_id)  where.author_id   = filters.author_id;

  return Article.findAll({
    where,
    include: buildIncludes(),
    order: [['created_at', 'DESC']]
  });
}

async function generateUniqueSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  let slug = baseSlug;
  let counter = 1;
  while (await Article.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

async function createArticle(data, authorId, coverFile, tagIds = []) {
  const { title, subtitle, content, category_id, status } = data;

  const slug = await generateUniqueSlug(title);

  let cover_image_url = null;
  if (coverFile) {
    cover_image_url = await minioService.upload(coverFile, 'article-covers');
  }

  const article = await Article.create({
    author_id:   authorId,
    category_id: category_id ? parseInt(category_id, 10) : null,
    title,
    slug,
    subtitle:    subtitle || null,
    content,
    cover_image_url,
    status:      status || 'DRAFT'
  });

  if (tagIds.length > 0) {
    const tags = await Tag.findAll({ where: { tag_id: tagIds } });
    await article.setTags(tags);
  }

  return getArticleById(article.article_id);
}

async function updateArticle(id, data, authorId, coverFile, tagIds) {
  const article = await Article.findByPk(id);
  if (!article) throw new Error('Article not found');

  const updates = {};
  if (data.title       !== undefined) updates.title       = data.title;
  if (data.subtitle    !== undefined) updates.subtitle    = data.subtitle;
  if (data.content     !== undefined) updates.content     = data.content;
  if (data.category_id !== undefined) updates.category_id = data.category_id ? parseInt(data.category_id, 10) : null;

  if (coverFile) {
    if (article.cover_image_url) {
      await minioService.deleteFile(article.cover_image_url).catch(() => {});
    }
    updates.cover_image_url = await minioService.upload(coverFile, 'article-covers');
  }

  await article.update(updates);

  if (tagIds !== undefined) {
    const tags = tagIds.length > 0 ? await Tag.findAll({ where: { tag_id: tagIds } }) : [];
    await article.setTags(tags);
  }

  return getArticleById(id);
}

async function submitArticle(id, authorId) {
  const article = await Article.findByPk(id);
  if (!article) throw new Error('Article not found');
  if (Number(article.author_id) !== Number(authorId)) throw new Error('Not authorized');
  if (!['DRAFT', 'REJECTED'].includes(article.status)) throw new Error('Cannot submit from current status');

  await article.update({ status: 'PENDING' });
  return getArticleById(id);
}

async function approveArticle(id) {
  const article = await Article.findByPk(id, {
    include: [{ model: User, as: 'author' }]
  });
  if (!article) throw new Error('Article not found');

  await article.update({ status: 'PUBLISHED', published_at: new Date(), rejection_reason: null });

  if (article.author?.email) {
    await mailService.sendDepotApprovedEmail(article.author.email, article.title).catch(() => {});
  }

  return getArticleById(id);
}

async function rejectArticle(id, reason) {
  const article = await Article.findByPk(id, {
    include: [{ model: User, as: 'author' }]
  });
  if (!article) throw new Error('Article not found');

  await article.update({ status: 'REJECTED', rejection_reason: reason || null });

  if (article.author?.email) {
    await mailService.sendDepotRejectedEmail(article.author.email, article.title, reason).catch(() => {});
  }

  return getArticleById(id);
}

async function archiveArticle(id) {
  const article = await Article.findByPk(id);
  if (!article) throw new Error('Article not found');

  await article.update({ status: 'ARCHIVED' });
  return getArticleById(id);
}

async function deleteArticle(id) {
  const article = await Article.findByPk(id);
  if (!article) throw new Error('Article not found');

  if (article.cover_image_url) {
    await minioService.deleteFile(article.cover_image_url).catch(() => {});
  }

  await article.destroy();
}

async function countArticles(filters = {}) {
  const where = {};
  if (filters.status)      where.status      = filters.status;
  if (filters.category_id) where.category_id = filters.category_id;
  if (filters.author_id)   where.author_id   = filters.author_id;

  return Article.count({ where });
}

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  submitArticle,
  approveArticle,
  rejectArticle,
  archiveArticle,
  deleteArticle,
  countArticles
};
