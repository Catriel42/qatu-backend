import { Op } from 'sequelize';
import db from '../../domain/models/index.js';

const { Product, ProductImage, Store, Category } = db;

class ProductRepository {
  async create(productData, imageUrls = []) {
    const transaction = await db.sequelize.transaction();
    try {
      const product = await Product.create(productData, { transaction });

      if (imageUrls && imageUrls.length > 0) {
        const images = imageUrls.map((url, index) => ({
          productId: product.id,
          imageUrl: url,
          displayOrder: index,
          isPrimary: index === 0,
        }));
        await ProductImage.bulkCreate(images, { transaction });
      }

      await transaction.commit();
      return Product.findByPk(product.id, { include: ['images'] });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async listBySeller(
    sellerId,
    {
      page = 1,
      pageSize = 20,
      status = 'active',
      q,
      categoryId,
      sort = 'created_at:desc',
    } = {}
  ) {
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const [sortFieldRaw, sortDirRaw] = String(sort).split(':');
    const sortField = sortFieldRaw || 'created_at';
    const sortDir = (String(sortDirRaw || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC');

    const where = {};
    if (status) where.status = status;
    if (categoryId) where.category_id = categoryId;
    if (q) where.name = { [Op.iLike]: `%${q}%` };

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name'],
          where: { seller_id: sellerId },
          required: true,
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'image_url', 'display_order', 'is_primary'],
        },
      ],
      order: [[sortField, sortDir]],
      limit,
      offset,
      distinct: true,
    });

    return { rows, count };
  }

  async findById(productId, sellerId) {
    return Product.findOne({
      where: {
        id: productId,
        status: { [Op.ne]: 'deleted' },
      },
      include: [
        {
          model: Store,
          as: 'store',
          where: { seller_id: sellerId },
          attributes: [],
        },
      ],
    });
  }

  async deleteById(productId) {
    const product = await Product.findByPk(productId);

    if (product) {
      product.status = 'deleted';
      await product.save();
    }

    return product;
  }

  async search(q, { page = 1, pageSize = 20, sort = 'created_at:desc' } = {}) {
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const [sortFieldRaw, sortDirRaw] = String(sort).split(':');
    const sortField = sortFieldRaw || 'created_at';
    const sortDir = (String(sortDirRaw || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC');

    const where = {
      status: 'active',
      [Op.or]: [
        { name: { [Op.iLike]: `%${q}%` } },
        { description: { [Op.iLike]: `%${q}%` } },
        { '$category.name$': { [Op.iLike]: `%${q}%` } },
      ],
    };

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name'],
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'image_url', 'display_order', 'is_primary'],
        },
        {
          model: Category,
          as: 'category',
          attributes: [],
          required: false,
        },
      ],
      order: [[sortField, sortDir]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    return { rows, count };
  }
}

export default new ProductRepository();
