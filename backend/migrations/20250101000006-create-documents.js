'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      document_id:    { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      depot_id:       {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'depots', key: 'depot_id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      owner_id:       {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      filename:       { type: Sequelize.STRING(255), allowNull: false },
      url:            { type: Sequelize.STRING(512), allowNull: false },
      file_type:      { type: Sequelize.STRING(50), allowNull: true },
      file_size:      { type: Sequelize.BIGINT, allowNull: true },
      description:    { type: Sequelize.TEXT, allowNull: true },
      preview_url:    { type: Sequelize.STRING(512), allowNull: true },
      download_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      file_extension: { type: Sequelize.STRING(20), allowNull: true },
      created_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, { ifNotExists: true });

    await queryInterface.addIndex('documents', ['depot_id'], { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('documents');
  },
};
