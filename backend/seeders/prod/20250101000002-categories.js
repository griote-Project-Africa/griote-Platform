'use strict';

// Seed de production — idempotent
// Catégories fixes de la plateforme. Jamais en dev seulement.
module.exports = {
  async up(queryInterface) {
    const categories = [
      { name: 'Littérature', slug: 'litterature', description: 'Œuvres littéraires' },
      { name: 'Histoire',    slug: 'histoire',    description: 'Documents historiques' },
      { name: 'Science',     slug: 'science',     description: 'Documents scientifiques' },
      { name: 'Art',         slug: 'art',         description: 'Œuvres artistiques' },
      { name: 'Technologie', slug: 'technologie', description: 'Ressources technologiques' },
    ];

    for (const cat of categories) {
      await queryInterface.sequelize.query(`
        INSERT INTO categories (name, slug, description, created_at, updated_at)
        VALUES (:name, :slug, :description, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, { replacements: cat });
    }
  },

  async down(queryInterface) {
    const names = ['Littérature', 'Histoire', 'Science', 'Art', 'Technologie'];
    await queryInterface.sequelize.query(
      `DELETE FROM categories WHERE name IN (:names)`,
      { replacements: { names } }
    );
  },
};
