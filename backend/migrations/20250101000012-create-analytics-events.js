'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('analytics_events', {
      id:           { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
      event_type:   { type: Sequelize.STRING(50), allowNull: false },
      entity_type:  { type: Sequelize.STRING(30), allowNull: true },
      entity_id:    { type: Sequelize.INTEGER, allowNull: true },
      user_id:      { type: Sequelize.INTEGER, allowNull: true },
      ip_address:   { type: Sequelize.STRING(45), allowNull: true },
      country_code: { type: Sequelize.CHAR(2), allowNull: true },
      country_name: { type: Sequelize.STRING(100), allowNull: true },
      city:         { type: Sequelize.STRING(100), allowNull: true },
      user_agent:   { type: Sequelize.TEXT, allowNull: true },
      metadata:     { type: Sequelize.JSONB, allowNull: true, defaultValue: {} },
      created_at:   { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, { ifNotExists: true });

    const indexes = [
      { fields: ['event_type', 'created_at'] },
      { fields: ['entity_type', 'entity_id', 'created_at'] },
      { fields: ['user_id', 'created_at'] },
      { fields: ['country_code', 'created_at'] },
      { fields: ['created_at'] },
    ];

    for (const idx of indexes) {
      await queryInterface.addIndex('analytics_events', idx.fields, { ifNotExists: true });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('analytics_events');
  },
};
