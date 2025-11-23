import ListMyConversations from '../../application/use-cases/ListMyConversations.js';
import ConversationSerializer from '../serializers/ConversationSerializer.js';
import { AuthenticationError } from '../../domain/errors/httpErrors.js';
import GetOrCreateConversation from '../../application/use-cases/GetOrCreateConversation.js';

class ConversationController {
  // GET /api/conversations/mine
  async listMine(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-dev-user-id'];
      if (!userId) {
        throw new AuthenticationError('Unauthorized');
      }

      const result = await ListMyConversations.execute({
        userId,
        query: req.query,
      });

      const serializer = new ConversationSerializer({ currentUserId: userId });
      const payload = serializer.serialize(result.data);

      payload.meta = {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      };

      res.json(payload);
    } catch (err) {
      next(err);
    }
  }

  async start(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-dev-user-id'];
      if (!userId) {
        throw new AuthenticationError('Unauthorized');
      }

      const { productId } = req.body;

      const { conversation, isNew } = await GetOrCreateConversation.execute({
        userId,
        productId,
      });

      const serializer = new ConversationSerializer({ currentUserId: userId });
      const payload = serializer.serialize(conversation);

      res.status(isNew ? 201 : 200).json(payload);
    } catch (err) {
      next(err);
    }
  }
}

export default new ConversationController();
