import ProductRepository from '../repositories/ProductRepository.js';

class DeleteProduct {
  constructor() {
    this.productRepository = ProductRepository;
  }

  async execute({ productId, sellerId }) {
    if (!productId || !sellerId) {
      const error = new Error('Product ID and Seller ID are required.');
      error.name = 'ValidationError';
      throw error;
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
      const error = new Error('Product not found.');
      error.name = 'NotFoundError';
      throw error;
    }

    if (product.store.sellerId !== sellerId) {
      const error = new Error('Forbidden: You do not own this product.');
      error.name = 'ForbiddenError';
      throw error;
    }

    // TODO: Add validation for pending orders or products in active carts

    const updatedProduct = await this.productRepository.updateStatus(
      productId,
      'deleted'
    );

    return updatedProduct;
  }
}

export default new DeleteProduct();
