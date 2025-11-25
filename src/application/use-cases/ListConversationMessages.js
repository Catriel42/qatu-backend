import ConversationRepository from '../repositories/ConversationRepository.js';
import MessageRepository from '../repositories/MessageRepository.js';
import {
  NotFoundError,
  AuthorizationError,
} from '../../domain/errors/httpErrors.js';

class ListConversationMessages {
  async execute({ userId, conversationId, query }) {
    const conversation = await ConversationRepository.findById(conversationId);

    if (!conversation || conversation.isActive === false) {
      throw new NotFoundError('Conversation not found or inactive');
    }

    if (
      conversation.buyerId !== userId &&
      conversation.sellerId !== userId
    ) {
      throw new AuthorizationError(
        'You are not a participant in this conversation'
      );
    }

    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 50);

    const { rows, count } = await MessageRepository.listByConversation(
      conversationId,
      { page, pageSize }
    );

    return {
      data: rows,
      page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
    };
  }
}

export default new ListConversationMessages();
