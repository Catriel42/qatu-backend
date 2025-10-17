import ProductRepository from '../repositories/ProductRepository.js';

/**
 * US-008: View My Products
 */
class ListMyProducts {
  async execute({ sellerId, query }) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 20);

    const { rows, count } = await ProductRepository.listBySeller(sellerId, {
      page,
      pageSize,
      status: query.status || 'active',
      q: query.q,
      categoryId: query.categoryId,
      sort: query.sort || 'created_at:desc',
    });

    return {
      data: rows,
      page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
    };
  }
}

export default new ListMyProducts();
