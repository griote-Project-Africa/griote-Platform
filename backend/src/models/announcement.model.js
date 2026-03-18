const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Announcement = sequelize.define('Announcement', {
  announcement_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  author_id:       { type: DataTypes.INTEGER, allowNull: false },
  title:           { type: DataTypes.STRING(255), allowNull: false },
  content:         { type: DataTypes.TEXT, allowNull: false },
  cover_image_url: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
    defaultValue: 'DRAFT',
    allowNull: false
  },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
  priority:    { type: DataTypes.SMALLINT, defaultValue: 0, allowNull: false },
  published_at: { type: DataTypes.DATE, allowNull: true },
  archived_at:  { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'announcements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Announcement;
