import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB, sequelize } from '../infrastructure/database/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // 1. Connect and force sync (drop tables and recreate)
    await connectDB({ sync: true, force: true });
    console.log('Database schema synchronized (tables dropped and recreated).');

    // 2. Read and execute seed.sql
    const seedSqlPath = path.join(__dirname, 'seed.sql');
    const seedSql = await fs.readFile(seedSqlPath, 'utf-8');
    await sequelize.query(seedSql);
    console.log('seed.sql executed successfully.');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

seedDatabase();
