'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('depot_tags', {
      depot_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'depots', key: 'depot_id' },
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

    await queryInterface.addConstraint('depot_tags', {
      fields: ['depot_id', 'tag_id'],
      type: 'primary key',
      name: 'depot_tags_pkey',
    }).catch(() => {});
  },

  async down(queryInterface) {
    await queryInterface.dropTable('depot_tags');
  },
};
