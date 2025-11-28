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

    // Publish to MQTT
    try {
      const { mqttService } = await import('../../infrastructure/mqtt/mqttService.js');
      const recipientId = conversation.buyerId === senderId ? conversation.sellerId : conversation.buyerId;

      // Publish to recipient's topic
      mqttService.publish(`qatu/user/${recipientId}/messages`, {
        conversationId,
        message
      });

      // Also publish to sender's topic so they see it in other tabs/devices
      mqttService.publish(`qatu/user/${senderId}/messages`, {
        conversationId,
        message
      });

    } catch (error) {
      console.error('Failed to publish MQTT message:', error);
      // Don't fail the request if MQTT fails
    }

    return { message, conversation };
  }
}

export default new SendMessage();
