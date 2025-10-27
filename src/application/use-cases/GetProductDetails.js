import ProductRepository from '../repositories/ProductRepository.js';

class GetProductDetails {
  async execute({ productId }) {
    const product = await ProductRepository.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }
}

export default new GetProductDetails();
