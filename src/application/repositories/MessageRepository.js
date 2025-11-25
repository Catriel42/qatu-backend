import db from '../../domain/models/index.js';

const { Message } = db;

class MessageRepository {
  async create({ conversationId, senderId, content }) {
    return Message.create({
      conversationId,
      senderId,
      content,
    });
  }

  async listByConversation(conversationId, { page = 1, pageSize = 50 } = {}) {
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const { rows, count } = await Message.findAndCountAll({
      where: { conversationId },
      order: [['createdAt', 'ASC']], 
      limit,
      offset,
    });

    return { rows, count };
  }
}

export default new MessageRepository();
