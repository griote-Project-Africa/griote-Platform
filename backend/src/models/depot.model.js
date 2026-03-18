const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Depot = sequelize.define('Depot', {
  depot_id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  owner_id:        { type: DataTypes.INTEGER, allowNull: false },
  category_id:     { type: DataTypes.INTEGER, allowNull: true },
  title:           { type: DataTypes.STRING(255), allowNull: false },
  slug:            { type: DataTypes.STRING(255), allowNull: true, unique: true },
  description:     { type: DataTypes.TEXT },
  cover_image_url: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'ARCHIVED'),
    defaultValue: 'DRAFT',
    allowNull: false
  },
  rejection_reason: { type: DataTypes.TEXT, allowNull: true },
  view_count:      { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
  download_count:  { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
  published_at:    { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'depots',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Depot;
