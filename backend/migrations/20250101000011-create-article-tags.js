'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('article_tags', {
      article_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'articles', key: 'article_id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      tag_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'tags', key: 'tag_id' },
        onUpdate: 'CASCADE', onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    }, {
      ifNotExists: true,
    });

    await queryInterface.addConstraint('article_tags', {
      fields: ['article_id', 'tag_id'],
      type: 'primary key',
      name: 'article_tags_pkey',
    }).catch(() => {});
  },

  async down(queryInterface) {
    await queryInterface.dropTable('article_tags');
  },
};
