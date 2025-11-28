import SendMessage from '../../application/use-cases/SendMessage.js';
import ListConversationMessages from '../../application/use-cases/ListConversationMessages.js';
import MessageSerializer from '../serializers/MessageSerializer.js';
import { AuthenticationError } from '../../domain/errors/httpErrors.js';

class MessageController {
  async send(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-dev-user-id'];
      if (!userId) throw new AuthenticationError('Unauthorized');

      const { conversationId } = req.params;
      const { content } = req.body;

      const { message } = await SendMessage.execute({
        conversationId,
        senderId: userId,
        content,
      });

      const serializer = new MessageSerializer();
      const payload = serializer.serialize(message);

      res.status(201).json(payload);
    } catch (err) {
      next(err);
    }
  }

  async listByConversation(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-dev-user-id'];
      if (!userId) throw new AuthenticationError('Unauthorized');

      const { conversationId } = req.params;

      const result = await ListConversationMessages.execute({
        userId: req.user.id,
        conversationId,
        query: req.query,
      });

      const serializer = new MessageSerializer();
      const response = serializer.serialize(result.data);

      res.json({
        ...response,
        meta: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new MessageController();
