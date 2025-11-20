import PublishProduct from '../../application/use-cases/PublishProduct.js';
import ListMyProducts from '../../application/use-cases/ListMyProducts.js';
import DeleteProduct from '../../application/use-cases/DeleteProduct.js';
import SearchProducts from '../../application/use-cases/SearchProducts.js';
import ListCatalogProducts from '../../application/use-cases/ListCatalogProducts.js';
import GetProductDetails from '../../application/use-cases/GetProductDetails.js';
import ProductSerializer from '../serializers/ProductSerializer.js';
import UpdateProduct from '../../application/use-cases/UpdateProduct.js';
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
      const { include, ...query } = req.query;
      const includes = include ? include.split(',').map(i => i.trim()) : [];

      const result = await ListCatalogProducts.execute({ ...query, includes });

      const serialized = ProductSerializer.serialize(result.data, { included: includes });

      res.json(serialized);
    } catch (err) {
      next(err);
    }
  }

  async search(req, res, next) {
    try {
      const { q, ...query } = req.query;
      const result = await SearchProducts.execute({ q, query });
      res.json(ProductSerializer.serialize(result.data));
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const result = await GetProductDetails.execute({ productId: req.params.id });
      res.status(200).json(ProductSerializer.serialize(result, { included: ['store'] }));
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const sellerId = req.user?.id || req.headers['x-dev-seller-id'];
      const { id: productId } = req.params;

      if (!sellerId) {
        throw new AuthenticationError('Unauthorized: missing seller id.');
      }

      const imageUrls = req.files ? req.files.map(file => `/uploads/product-assets/${file.filename}`) : [];

      const updatedProduct = await UpdateProduct.execute({
        productId,
        sellerId,
        payload: req.body,
        imageUrls,
      });

      res.status(200).json(ProductSerializer.serialize(updatedProduct));
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
