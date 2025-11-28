
import 'dotenv/config';
import { connectDB, sequelize } from '../src/infrastructure/database/index.js';

async function checkSchemas() {
    try {
        await connectDB();

        console.log('--- Checking Row Counts ---');

        const schemas = ['public', 'qatu-database'];
        const tables = ['users', 'products', 'conversations', 'messages'];

        for (const schema of schemas) {
            console.log(`\nSchema: ${schema}`);
            for (const table of tables) {
                try {
                    const [results] = await sequelize.query(`SELECT count(*) as count FROM "${schema}"."${table}"`);
                    console.log(`  ${table}: ${results[0].count}`);
                } catch (err) {
                    console.log(`  ${table}: [Error/Not Found] ${err.message}`);
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

checkSchemas();
