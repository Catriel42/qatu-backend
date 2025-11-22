import ConversationRepository from '../repositories/ConversationRepository.js';

/**
 * US-022: View My Conversations
 */
class ListMyConversations {
  async execute({ userId, query }) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 20);
    const sort = query.sort || 'last_message_at:desc';
    const q = query.q;

    const isActive =
      typeof query.isActive !== 'undefined'
        ? String(query.isActive).toLowerCase() === 'true'
        : true;

    const { rows, count } = await ConversationRepository.listByUser(userId, {
      page,
      pageSize,
      sort,
      q,
      isActive,
    });

    return {
      data: rows,
      page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
    };
  }
}

export default new ListMyConversations();
