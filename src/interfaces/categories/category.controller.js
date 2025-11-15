import CreateCategory from '../../application/use-cases/CreateCategory.js';
import UpdateCategory from '../../application/use-cases/UpdateCategory.js';
import ListActiveCategories from '../../application/use-cases/ListActiveCategories.js';
import CategorySerializer from '../serializers/CategorySerializer.js';

class CategoryController {
  // Publico: lista activas
  async listPublic(req, res, next) {
    try {
      const categories = await ListActiveCategories.execute();
      res.status(200).json(CategorySerializer.serialize(categories));
    } catch (err) {
      next(err);
    }
  }

  // Admin: crear 
  async create(req, res, next) {
    try {
      const category = await CreateCategory.execute(req.body);
      res.status(201).json(CategorySerializer.serialize(category));
    } catch (err) {
      next(err);
    }
  }

  // Admin: actualizar 
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const category = await UpdateCategory.execute({
        categoryId: id,
        payload: req.body,
      });

      res.status(200).json(CategorySerializer.serialize(category));
    } catch (err) {
      next(err);
    }
  }
}

export default new CategoryController();
