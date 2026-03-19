'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      category_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name:        { type: Sequelize.STRING(100), allowNull: false, unique: true },
      slug:        { type: Sequelize.STRING(100), allowNull: true, unique: true },
      description: { type: Sequelize.TEXT },
      color:       { type: Sequelize.STRING(7), allowNull: true },
      created_at:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at:  { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categories');
  },
};
