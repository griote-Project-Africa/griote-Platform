'use strict';

// Seed de production — idempotent
// Tags de base de la plateforme.
module.exports = {
  async up(queryInterface) {
    const tags = [
      { name: 'Afrique',    slug: 'afrique' },
      { name: 'Tradition',  slug: 'tradition' },
      { name: 'Moderne',    slug: 'moderne' },
      { name: 'Éducation',  slug: 'education' },
      { name: 'Culture',    slug: 'culture' },
      { name: 'Innovation', slug: 'innovation' },
      { name: 'Jeunesse',   slug: 'jeunesse' },
    ];

    for (const tag of tags) {
      await queryInterface.sequelize.query(`
        INSERT INTO tags (name, slug, created_at, updated_at)
        VALUES (:name, :slug, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, { replacements: tag });
    }
  },

  async down(queryInterface) {
    const names = ['Afrique', 'Tradition', 'Moderne', 'Éducation', 'Culture', 'Innovation', 'Jeunesse'];
    await queryInterface.sequelize.query(
      `DELETE FROM tags WHERE name IN (:names)`,
      { replacements: { names } }
    );
  },
};
