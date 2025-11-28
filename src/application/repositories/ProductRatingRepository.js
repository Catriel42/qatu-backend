import db from '../../domain/models/index.js';

const { ProductRating, User } = db;

class ProductRatingRepository {
  async findByProductId(productId, { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' }) {
    const offset = (page - 1) * limit;

    const { count, rows } = await ProductRating.findAndCountAll({
      where: { productId },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'fullName', 'profilePictureUrl'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      ratings: rows,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  }
}

export default new ProductRatingRepository();
