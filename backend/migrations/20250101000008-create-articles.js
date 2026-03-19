'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('articles', {
      article_id:       { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      author_id:        {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      category_id:      {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'categories', key: 'category_id' },
        onUpdate: 'CASCADE', onDelete: 'SET NULL',
      },
      title:            { type: Sequelize.STRING(255), allowNull: false },
      slug:             { type: Sequelize.STRING(255), allowNull: false, unique: true },
      subtitle:         { type: Sequelize.STRING(500), allowNull: true },
      content:          { type: Sequelize.TEXT('long'), allowNull: false },
      cover_image_url:  { type: Sequelize.TEXT, allowNull: true },
      status:           {
        type: Sequelize.ENUM('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED', 'ARCHIVED'),
        defaultValue: 'DRAFT', allowNull: false,
      },
      rejection_reason: { type: Sequelize.TEXT, allowNull: true },
      read_time_minutes:{ type: Sequelize.INTEGER, allowNull: true },
      view_count:       { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
      published_at:     { type: Sequelize.DATE, allowNull: true },
      created_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at:       { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('articles');
  },
};
