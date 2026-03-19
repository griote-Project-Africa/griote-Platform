'use strict';

const bcrypt = require('bcrypt');

// Seed de production — idempotent (INSERT ... ON CONFLICT DO NOTHING)
// Crée l'admin si il n'existe pas déjà.
module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin2024', 10);

    await queryInterface.sequelize.query(`
      INSERT INTO users
        (first_name, last_name, email, password_hash, role, is_email_verified, created_at, updated_at)
      VALUES
        ('Admin', 'Griote', 'admin@griote.com', :hash, 'ADMIN', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, {
      replacements: { hash: passwordHash },
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE email = 'admin@griote.com'`
    );
  },
};
