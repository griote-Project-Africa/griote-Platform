'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('announcements', {
      announcement_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      author_id:       {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      title:           { type: Sequelize.STRING(255), allowNull: false },
      content:         { type: Sequelize.TEXT, allowNull: false },
      cover_image_url: { type: Sequelize.TEXT, allowNull: true },
      status:          {
        type: Sequelize.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
        defaultValue: 'DRAFT', allowNull: false,
      },
      is_featured:     { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
      priority:        { type: Sequelize.SMALLINT, defaultValue: 0, allowNull: false },
      published_at:    { type: Sequelize.DATE, allowNull: true },
      archived_at:     { type: Sequelize.DATE, allowNull: true },
      created_at:      { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at:      { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, { ifNotExists: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('announcements');
  },
};
