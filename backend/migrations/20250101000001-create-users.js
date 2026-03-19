'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      user_id:           { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      first_name:        { type: Sequelize.STRING, allowNull: false },
      last_name:         { type: Sequelize.STRING, allowNull: false },
      email:             { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash:     { type: Sequelize.STRING, allowNull: false },
      role:              { type: Sequelize.ENUM('USER', 'ADMIN'), defaultValue: 'USER' },
      is_email_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      bio:               { type: Sequelize.TEXT, allowNull: true },
      date_of_birth:     { type: Sequelize.DATEONLY, allowNull: true },
      linkedin_url:      { type: Sequelize.STRING, allowNull: true },
      github_url:        { type: Sequelize.STRING, allowNull: true },
      website_url:       { type: Sequelize.STRING, allowNull: true },
      country:           { type: Sequelize.STRING(100), allowNull: true },
      created_at:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at:        { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
