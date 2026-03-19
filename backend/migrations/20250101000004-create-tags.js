'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tags', {
      tag_id:     { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:       { type: Sequelize.STRING(50), allowNull: false, unique: true },
      slug:       { type: Sequelize.STRING(50), allowNull: true, unique: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tags');
  },
};
