'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('images', {
      image_id:       { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      url:            { type: Sequelize.STRING, allowNull: false },
      description:    { type: Sequelize.STRING, allowNull: true },
      imageable_type: {
        type: Sequelize.ENUM('announcement', 'user', 'depot'),
        allowNull: false,
      },
      imageable_id:   { type: Sequelize.INTEGER, allowNull: true },
      created_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at:     { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('images');
  },
};
