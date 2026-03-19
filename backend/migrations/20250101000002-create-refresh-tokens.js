'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      token_id:   { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      token:      { type: Sequelize.STRING, allowNull: false, unique: true },
      user_id:    {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  },
};
