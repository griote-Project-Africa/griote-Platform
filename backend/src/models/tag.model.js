const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Tag = sequelize.define('Tag', {
  tag_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:   { type: DataTypes.STRING(50), allowNull: false, unique: true },
  slug:   { type: DataTypes.STRING(50), allowNull: true, unique: true }
}, {
  tableName: 'tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Tag;
