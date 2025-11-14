import PublishProduct from '../../application/use-cases/PublishProduct.js';
import ListMyProducts from '../../application/use-cases/ListMyProducts.js';
import DeleteProduct from '../../application/use-cases/DeleteProduct.js';
import SearchProducts from '../../application/use-cases/SearchProducts.js';
import ListCatalogProducts from '../../application/use-cases/ListCatalogProducts.js';
import GetProductDetails from '../../application/use-cases/GetProductDetails.js';
import ProductSerializer from '../serializers/ProductSerializer.js';
import { AuthenticationError, NotFoundError, AuthorizationError } from '../../domain/errors/httpErrors.js';

class ProductController {
  async create(req, res, next) {
    try {
      const userId = req.user?.id || req.headers['x-dev-seller-id'];
      if (!userId) throw new AuthenticationError('Unauthorized');

      const imageUrls = req.files ? req.files.map(file => `/uploads/product-assets/${file.filename}`) : [];

      const result = await PublishProduct.execute({ ...req.body, userId, imageUrls });
      res.status(201).json(ProductSerializer.serialize(result));
    } catch (err) {
      next(err);
    }
  }

  async listMine(req, res, next) {
    try {
      const sellerId = req.user?.id || req.headers['x-dev-seller-id'];
      if (!sellerId) throw new AuthenticationError('Unauthorized');

      const result = await ListMyProducts.execute({ sellerId, query: req.query });
      res.json(ProductSerializer.serialize(result));
    } catch (err) {
      next(err);
    }
  }

  async listPublic(req, res, next) {
    try {
      const result = await ListCatalogProducts.execute(req.query);
      res.json(ProductSerializer.serialize(result));
    } catch (err) {
      next(err);
    }
  }

  // US-016: Search Products by Keyword
  async search(req, res, next) {
    try {
      const { q, ...query } = req.query;
      const result = await SearchProducts.execute({ q, query });
      res.json(ProductSerializer.serialize(result));
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await GetProductDetails.execute({ productId: req.params.id });
      res.status(200).json(ProductSerializer.serialize(result));
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const sellerId = req.user?.id || req.headers['x-dev-seller-id'];
      if (!sellerId) throw new AuthenticationError('Unauthorized');

      const { id: productId } = req.params;

      await DeleteProduct.execute({ productId, sellerId });

      res.status(204).send(); // 204 No Content
    } catch (err) {
      if (err.name === 'NotFoundError') {
        return next(new NotFoundError(err.message));
      }
      if (err.name === 'ForbiddenError') {
        return next(new AuthorizationError(err.message));
      }
      next(err);
    }
  }
}

export default new ProductController();
