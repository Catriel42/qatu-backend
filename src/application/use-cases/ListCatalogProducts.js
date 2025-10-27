import ProductRepository from '../repositories/ProductRepository.js';

class ListCatalogProducts {
  async execute(query) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize || 24)));
    const sort = query.sort; 
    
    const filters = {
      q: query.q,
      categoryId: query.categoryId,
      minPrice: query.minPrice ? Number(query.minPrice) : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
      minRating: query.minRating ? Number(query.minRating) : undefined,
    };

    const { rows, count } = await ProductRepository.listPublic({
      page, pageSize, ...filters, sort
    });

    return {
      data: rows,
      page,
      pageSize,
      total: count,
      totalPages: Math.ceil(count / pageSize),
      filters: {
        q: filters.q || null,
        categoryId: filters.categoryId || null,
        minPrice: filters.minPrice ?? null,
        maxPrice: filters.maxPrice ?? null,
        minRating: filters.minRating ?? null,
      }
    };
  }
}

export default new ListCatalogProducts();
