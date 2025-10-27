import ProductRepository from '../repositories/ProductRepository.js';

/**
 * US-016: Search Products by Keyword
 */
class SearchProducts {
  async execute({ q, query }) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 20);

    const { rows, count } = await ProductRepository.search(q, {
      page,
      pageSize,
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

export default new SearchProducts();
