
import 'dotenv/config';
import { connectDB } from '../src/infrastructure/database/index.js';
import ConversationRepository from '../src/application/repositories/ConversationRepository.js';
import MessageRepository from '../src/application/repositories/MessageRepository.js';

async function listMessages() {
    try {
        await connectDB();

        // 1. Get a conversation
        // 2. List ALL messages raw
        const { sequelize } = await import('../src/infrastructure/database/index.js');
        const [messages] = await sequelize.query("SELECT * FROM messages LIMIT 10");
        console.log(`Found ${messages.length} messages in DB.`);
        console.log(JSON.stringify(messages, null, 2));

        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

listMessages();
