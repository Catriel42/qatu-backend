import PublishProduct from '../../application/use-cases/PublishProduct.js';
import ListMyProducts from '../../application/use-cases/ListMyProducts.js';
import DeleteProduct from '../../application/use-cases/DeleteProduct.js';
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

  async search(req, res, next) {
    try {
      const { q, ...query } = req.query;
      const result = await SearchProducts.execute({ q, query });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const sellerId = req.user?.id || req.headers['x-dev-seller-id'];
      if (!sellerId) return res.status(401).json({ message: 'Unauthorized' });

      const { id: productId } = req.params;

      await DeleteProduct.execute({ productId, sellerId });

      res.status(204).send(); // 204 No Content
    } catch (err) {
      if (err.name === 'NotFoundError') {
        return res.status(404).json({ message: err.message });
      }
      if (err.name === 'ForbiddenError') {
        return res.status(403).json({ message: err.message });
      }
      next(err);
    }
  }
}

export default new ProductController();
