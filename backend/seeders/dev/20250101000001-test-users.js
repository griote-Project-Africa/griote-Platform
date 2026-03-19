'use strict';

const bcrypt = require('bcrypt');

// Seed de développement UNIQUEMENT — ne jamais exécuter en production.
// Crée des utilisateurs de test pour faciliter le développement local.
module.exports = {
  async up(queryInterface) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[seed:dev] Skipped — cannot run dev seeds in production.');
      return;
    }

    const passwordHash = await bcrypt.hash('Griote2024', 10);

    const users = [
      { email: 'user1@griote.com', first_name: 'user1', last_name: 'name1' },
      { email: 'user2@griote.com', first_name: 'user2', last_name: 'name2' },
    ];

    for (const u of users) {
      await queryInterface.sequelize.query(`
        INSERT INTO users
          (first_name, last_name, email, password_hash, role, is_email_verified, created_at, updated_at)
        VALUES
          (:firstName, :lastName, :email, :hash, 'USER', true, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
      `, {
        replacements: {
          firstName: u.first_name,
          lastName:  u.last_name,
          email:     u.email,
          hash:      passwordHash,
        },
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE email IN ('user1@griote.com', 'user2@griote.com')`
    );
  },
};
