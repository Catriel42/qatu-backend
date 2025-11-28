import ProductRatingRepository from '../repositories/ProductRatingRepository.js';
import { NotFoundError } from '../../domain/errors/httpErrors.js';
import ProductRepository from '../repositories/ProductRepository.js';

class ListProductRatings {
  constructor() {
    this.productRatingRepository = ProductRatingRepository;
    this.productRepository = ProductRepository;
  }

  async execute({ productId, page, limit, sortBy, sortOrder }) {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    const result = await this.productRatingRepository.findByProductId(productId, {
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return result;
  }
}

export default new ListProductRatings();
