import ProductRepository from '../repositories/ProductRepository.js';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../../domain/errors/httpErrors.js';

class UpdateProduct {
  async execute({ productId, sellerId, payload }) {
    if (!productId || !sellerId) {
      throw new ValidationError('Product ID and Seller ID are required.');
    }

    const product = await ProductRepository.findById(productId);

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    if (!product.store || product.store.sellerId !== sellerId) {
      throw new AuthorizationError(
        'You do not have permission to edit this product.'
      );
    }

    const allowedFields = ['name', 'description', 'price', 'stock', 'categoryId'];
    const updateData = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        updateData[field] = payload[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid fields provided for update.');
    }

    const updatedProduct = await ProductRepository.updateById(
      productId,
      updateData
    );
    return updatedProduct;
  }
}

export default new UpdateProduct();
