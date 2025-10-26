import ProductRepository from '../repositories/ProductRepository.js';

class DeleteProduct {
  async execute(productId, sellerId) {
    const product = await ProductRepository.findById(productId, sellerId);

    if (!product) {
      const error = new Error('Product not found or you do not have permission to delete it.');
      error.statusCode = 404;
      throw error;
    }

    return ProductRepository.deleteById(productId);
  }
}

export default new DeleteProduct();
