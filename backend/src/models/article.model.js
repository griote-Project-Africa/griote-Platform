const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Article = sequelize.define('Article', {
  article_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'author_id'
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true, len: [3, 255] }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  subtitle: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  cover_image_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'ARCHIVED'),
    defaultValue: 'DRAFT',
    allowNull: false
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  read_time_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'articles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Calcule le temps de lecture estimé depuis le contenu HTML/texte (~200 mots/min)
Article.beforeSave((article) => {
  if (article.changed('content') && article.content) {
    const wordCount = article.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    article.read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));
  }
});

// Le slug est généré dans le service avant Article.create() — ce hook ne s'active
// que si aucun slug n'a été fourni (sécurité de fallback).
Article.beforeCreate((article) => {
  if (!article.slug && article.title) {
    article.slug = article.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() || `article-${Date.now()}`;
  }
});

module.exports = Article;
