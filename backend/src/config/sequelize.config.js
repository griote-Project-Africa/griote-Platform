// Configuration pour sequelize-cli (db:migrate, db:seed, etc.)
// Lit DB_URI depuis les variables d'environnement (Docker ou .env)
require('dotenv').config({ path: process.env.ENV_FILE_PATH || undefined });

if (!process.env.DB_URI) {
  throw new Error('DB_URI environment variable is required');
}

module.exports = {
  development: {
    use_env_variable: 'DB_URI',
    dialect: 'postgres',
    define: { timestamps: true, underscored: true },
  },
  test: {
    use_env_variable: 'DB_URI',
    dialect: 'postgres',
    define: { timestamps: true, underscored: true },
  },
  production: {
    use_env_variable: 'DB_URI',
    dialect: 'postgres',
    define: { timestamps: true, underscored: true },
  },
};
