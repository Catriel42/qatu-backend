import fs from 'fs';
import path from 'path';
import db from './src/domain/models/index.js';
import { connectDB, disconnectDB, sequelize } from './src/infrastructure/database/index.js';

beforeAll(async () => {
  await connectDB({ sync: false });
  const typesSql = fs.readFileSync(path.resolve('./src/scripts/types.sql'), 'utf8');
  await sequelize.query(typesSql);
  // Sync without force, just to ensure tables exist
  await sequelize.sync();
});

// Run before each test case
beforeEach(async () => {
  // Truncate all tables
  await db.sequelize.truncate({ cascade: true, restartIdentity: true });
});

afterAll(async () => {
  await disconnectDB();
});
