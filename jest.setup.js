import fs from 'fs';
import path from 'path';
import db from './src/domain/models/index.js';
import { connectDB, disconnectDB, sequelize } from './src/infrastructure/database/index.js';

beforeAll(async () => {
  await connectDB({ sync: false });
  const typesSql = fs.readFileSync(path.resolve('./src/scripts/types.sql'), 'utf8');
  await sequelize.query(typesSql);
}, 60000); // Aumentado a 60 segundos

// Run before each test case
beforeEach(async () => {
  // Truncate all tables
  await db.sequelize.truncate({ cascade: true, restartIdentity: true });
}, 30000); // 30 segundos para truncate

afterAll(async () => {
  await disconnectDB();
}, 10000); // 10 segundos para desconectar
