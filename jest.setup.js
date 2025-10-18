import fs from 'fs';
import path from 'path';
import './src/domain/models/index.js';
import { connectDB, disconnectDB, sequelize } from './src/infrastructure/database/index.js';

beforeAll(async () => {
  await connectDB({ sync: false });
  const typesSql = fs.readFileSync(path.resolve('./src/scripts/types.sql'), 'utf8');
  await sequelize.query(typesSql);
  await sequelize.sync();
});

afterAll(async () => {
  await disconnectDB();
});
