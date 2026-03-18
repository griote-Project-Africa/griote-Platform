// server.js
// Load environment variables - gracefully handle missing .env file (for Docker/Production)
const result = require('dotenv').config({ path: process.env.ENV_FILE_PATH || undefined });

if (result.error) {
  // Only warn if we're in development mode, otherwise silently use env vars from Docker
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Warning: .env file not found. Using environment variables.');
  }
}

// Log environment info - in production, vars come from Docker, not .env file
if (process.env.NODE_ENV !== 'production' && result.parsed) {
  console.log(`Loaded ${Object.keys(result.parsed).length} environment variables from .env file`);
}

const app = require('./app');
const sequelize = require('./config/db.config');
const minioService = require('./services/minio.service');
const logger = require('./config/logger.config');
const bcrypt = require('bcrypt');
const { User, Category, Tag } = require('./models');

const PORT = process.env.PORT || 3000;

async function seedInitialData() {
  try {
    const adminPassword = await bcrypt.hash('Admin2024', 10);
    const userPassword = await bcrypt.hash('Griote2024', 10);


    await User.create({
      email: 'admin@griote.com',
      password_hash: adminPassword,
      first_name: 'Admin',
      last_name: 'Griote',
      role: 'ADMIN',
      is_email_verified: true
    });

    await User.create({
      email: 'user1@griote.com',
      password_hash: userPassword,
      first_name: 'user1',
      last_name: 'name1',
      role: 'USER',
      is_email_verified: true
    });

    await User.create({
      email: 'user2@griote.com',
      password_hash: userPassword,
      first_name: 'user2',
      last_name: 'name2',
      role: 'USER',
      is_email_verified: true
    });

    await Category.bulkCreate([
      { name: 'Littérature', description: 'Œuvres littéraires' },
      { name: 'Histoire',    description: 'Documents historiques' },
      { name: 'Science',     description: 'Documents scientifiques' },
      { name: 'Art',         description: 'Œuvres artistiques' },
      { name: 'Technologie', description: 'Ressources technologiques' }
    ]);

    await Tag.bulkCreate([
      { name: 'Afrique' },
      { name: 'Tradition' },
      { name: 'Moderne' },
      { name: 'Éducation' },
      { name: 'Culture' },
      { name: 'Innovation' },
      { name: 'Jeunesse' }
    ]);
 } catch (error) {
   // Reason: Logging directive prohibits logging in seeding
 }
}

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { context: { error: err.message, stack: err.stack } });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { context: { reason: reason?.message || reason, promise: promise.toString() } });
  process.exit(1);
});

async function startServer() {
  try {
    await minioService.initialize();
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
    await seedInitialData();

    const server = app.listen(PORT, () => {
      logger.info('Server started', { context: { port: PORT } });
    });

    process.on('SIGTERM', () => {
      server.close(() => {
        process.exit(0);
      });
    });

  } catch (err) {
    logger.error('Fatal error: cannot start server', { context: { error: err.message } });
    process.exit(1);
  }
}

startServer();