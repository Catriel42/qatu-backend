// src/domain/models/index.js
import { sequelize } from '../../infrastructure/database/index.js';
import User from './User.js';
import Store from './Store.js';
import Category from './Category.js';
import Product from './Product.js';
import ProductImage from './ProductImage.js';

const models = { User, Store, Category, Product, ProductImage };

/**
 * Associations (según tu ERD):
 * users (id) 1---* stores (seller_id)
 * stores (id) 1---* products (store_id)
 * categories (id) 1---* products (category_id)
 * products (id) 1---* product_images (product_id)
 */

// User 1..* Store (seller)
User.hasMany(Store, {
  foreignKey: 'sellerId',
  as: 'stores',
});
Store.belongsTo(User, {
  foreignKey: 'sellerId',
  as: 'seller',
});

// Store 1..* Product
Store.hasMany(Product, {
  foreignKey: 'storeId',
  as: 'products',
});
Product.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store',
});

// Category 1..* Product
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products',
});
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

// Product 1..* ProductImage
Product.hasMany(ProductImage, {
  foreignKey: 'productId',
  as: 'images',
});
ProductImage.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

const db = { ...models, sequelize };
export default db;
