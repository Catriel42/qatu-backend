import db from '../../domain/models/index.js';
import { Op } from 'sequelize';

const { Category } = db;

class CategoryRepository {
  async findById(id) {
    return Category.findByPk(id);
  }

  async create(payload) {
    return Category.create(payload);
  }

  async updateById(id, payload) {
    await Category.update(payload, { where: { id } });
    return this.findById(id);
  }

  async isSlugTaken(slug, excludeCategoryId) {
    const where = excludeCategoryId
      ? { slug, id: { [Op.ne]: excludeCategoryId } }
      : { slug };

    const category = await Category.findOne({ where });
    return !!category;
  }

  async listAll() {
    return Category.findAll({
      order: [['name', 'ASC']],
    });
  }

  async listActive() {
    return Category.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }
}

export default new CategoryRepository();
