import { Op } from 'sequelize';
import db from '../../domain/models/index.js';

const { Product, ProductImage, Store, Category } = db;

const SORT_WHITELIST = new Set([
  'price:asc', 'price:desc',
  'average_rating:asc', 'average_rating:desc',
  'created_at:asc', 'created_at:desc',
  'name:asc', 'name:desc'
]);

function parseSort(sortStr, fallback = 'created_at:desc') {
  const raw = String(sortStr || fallback).toLowerCase();
  if (!SORT_WHITELIST.has(raw)) {
    const [fField, fDir] = fallback.split(':');
    return [fField, (fDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')];
  }
  const [field, dir] = raw.split(':');
  return [field, (dir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC')];
}

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



  async updateStatus(productId, status) {
    const product = await Product.findByPk(productId);
    if (product) {
      product.status = status;
      await product.save();
    }
    return product;
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
    const store = await Store.findOne({ where: { sellerId } });
    if (!store) {
      return { rows: [], count: 0 };
    }

    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const [sortField, sortDir] = parseSort(sort, 'created_at:desc');

    const where = { storeId: store.id };
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (q) where.name = { [Op.iLike]: `%${q}%` };

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
      ],
      order: [[sortField, sortDir]],
      limit,
      offset,
      distinct: true,
    });

    return { rows, count };
  }

  async findById(productId) {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'logo_url'],
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'image_url', 'display_order'],
          order: [['display_order', 'ASC']],
        },
      ],
    });

    if (!product) {
      return null;
    }

    const plainProduct = product.get({ plain: true });
    return {
      ...plainProduct,
      imageUrls: plainProduct.images ? plainProduct.images.map(img => img.image_url) : [],
    };
  }



  async listPublic({
    page = 1,
    pageSize = 20,
    q,
    categoryId,
    minPrice,
    maxPrice,
    minRating,
    sort = 'created_at:desc'   
  } = {}) {
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const where = { status: 'active' };

    if (q) where.name = { [Op.iLike]: `%${q}%` };
    if (categoryId) where.category_id = categoryId;

    if (minPrice != null || maxPrice != null) {
      where.price = {};
      if (minPrice != null) where.price[Op.gte] = minPrice;
      if (maxPrice != null) where.price[Op.lte] = maxPrice;
    }

    if (minRating != null) where.average_rating = { [Op.gte]: minRating };

    const [sortField, sortDir] = parseSort(sort, 'created_at:desc');

    const { rows, count } = await Product.findAndCountAll({
      where,
      include: [
        { model: ProductImage, as: 'images', attributes: ['id', 'image_url', 'display_order', 'is_primary'] },
        { model: Store, as: 'store', attributes: ['id', 'name'] },
      ],
      order: [[sortField, sortDir]],
      limit,
      offset,
      distinct: true,
    });

    const productsWithImageUrls = rows.map(product => {
      const plainProduct = product.get({ plain: true });
      return {
        ...plainProduct,
        imageUrls: plainProduct.images ? plainProduct.images.map(img => img.image_url) : [],
      };
    });

    return { rows: productsWithImageUrls, count };
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

    const productsWithImageUrls = rows.map(product => {
      const plainProduct = product.get({ plain: true });
      return {
        ...plainProduct,
        imageUrls: plainProduct.images ? plainProduct.images.map(img => img.image_url) : [],
      };
    });

    return { rows: productsWithImageUrls, count };
  }
}

export default new ProductRepository();