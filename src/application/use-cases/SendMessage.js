import ConversationRepository from '../repositories/ConversationRepository.js';
import MessageRepository from '../repositories/MessageRepository.js';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from '../../domain/errors/httpErrors.js';

class SendMessage {
  async execute({ conversationId, senderId, content }) {
    if (!content || !content.trim()) {
      throw new ValidationError('Message content is required');
    }

    const conversation = await ConversationRepository.findById(conversationId);
    if (!conversation || conversation.isActive === false) {
      throw new NotFoundError('Conversation not found or inactive');
    }

    if (
      conversation.buyerId !== senderId &&
      conversation.sellerId !== senderId
    ) {
      throw new AuthorizationError(
        'You are not a participant in this conversation'
      );
    }

    const message = await MessageRepository.create({
      conversationId,
      senderId,
      content: content.trim(),
    });

    await ConversationRepository.updateLastMessageAt(
      conversationId,
      message.createdAt
    );

    return { message, conversation };
  }
}

export default new SendMessage();
