import PublishProduct from '../../application/use-cases/PublishProduct.js';
import ListMyProducts from '../../application/use-cases/ListMyProducts.js';
import SearchProducts from '../../application/use-cases/SearchProducts.js';

class ProductController {
  async create(req, res, next) {
    try {
      const result = await PublishProduct.execute({ body: req.body, user: req.user });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // US-008: View My Products
  async listMine(req, res, next) {
    try {
      const sellerId = req.user?.id || req.headers['x-dev-seller-id'];
      if (!sellerId) return res.status(401).json({ message: 'Unauthorized' });

      const result = await ListMyProducts.execute({
        sellerId,
        query: req.query,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // US-016: Search Products by Keyword
  async search(req, res, next) {
    try {
      const { q, ...query } = req.query;
      const result = await SearchProducts.execute({ q, query });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new ProductController();
