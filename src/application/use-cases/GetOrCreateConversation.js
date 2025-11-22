import ConversationRepository from '../repositories/ConversationRepository.js';
import ProductRepository from '../repositories/ProductRepository.js';
import {
  ValidationError,
  NotFoundError,
} from '../../domain/errors/httpErrors.js';

/**
 * Inicia una conversación (o reutiliza una existente) entre
 * el usuario actual (buyer) y el seller del producto.
 */
class GetOrCreateConversation {
  async execute({ userId, productId }) {
    if (!productId) {
      throw new ValidationError('Product ID is required to start a conversation.');
    }

    const product = await ProductRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    if (!product.store || !product.store.sellerId) {
      throw new ValidationError('Product is not associated with a valid seller.');
    }

    const sellerId = product.store.sellerId;
    const buyerId = userId;

    if (buyerId === sellerId) {
      throw new ValidationError('You cannot start a conversation with yourself.');
    }

    let conversation = await ConversationRepository.findByParticipantsAndProduct(
      buyerId,
      sellerId,
      productId
    );

    const isNew = !conversation;

    if (!conversation) {
      conversation = await ConversationRepository.create({
        buyerId,
        sellerId,
        productId,
      });
    }

    return { conversation, isNew };
  }
}

export default new GetOrCreateConversation();
