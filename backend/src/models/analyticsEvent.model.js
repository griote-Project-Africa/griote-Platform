const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const AnalyticsEvent = sequelize.define('AnalyticsEvent', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  event_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    // 'download' | 'view' | 'signup' | 'login' | 'upload' | 'api_request' | 'error'
  },
  entity_type: {
    type: DataTypes.STRING(30),
    allowNull: true,
    // 'depot' | 'article' | 'announcement' | 'document'
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // null = anonymous
  },
  ip_address: {
    type: DataTypes.STRING(45), // supports IPv4 + IPv6
    allowNull: true,
  },
  country_code: {
    type: DataTypes.CHAR(2),
    allowNull: true,
  },
  country_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    // ex: { response_ms, status_code, file_size, error_message }
  },
}, {
  tableName: 'analytics_events',
  timestamps: true,
  underscored: true,
  updatedAt: false, // append-only — jamais modifié
  indexes: [
    { fields: ['event_type', 'created_at'] },
    { fields: ['entity_type', 'entity_id', 'created_at'] },
    { fields: ['user_id', 'created_at'] },
    { fields: ['country_code', 'created_at'] },
    { fields: ['created_at'] },
  ],
});

module.exports = AnalyticsEvent;
