// src/domain/models/index.js
import { sequelize } from '../../infrastructure/database/index.js';
import User from './User.js';
import Store from './Store.js';
import Category from './Category.js';
import Product from './Product.js';
import ProductImage from './ProductImage.js';
import SellerRequest from './SellerRequest.js';

const models = { User, Store, Category, Product, ProductImage, SellerRequest };

/**
 * Associations (según tu ERD):
 * users (id) 1---* stores (seller_id)
 * users (id) 1---* seller_requests (user_id)
 * stores (id) 1---* products (store_id)
 * categories (id) 1---* products (category_id)
 * products (id) 1---* product_images (product_id)
 */

// User 1..* Store (seller)
User.hasMany(Store, {
  foreignKey: 'sellerId',
  as: 'stores',
});

// User 1..* SellerRequest
User.hasMany(SellerRequest, {
  foreignKey: 'userId',
  as: 'sellerRequests',
});
SellerRequest.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
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
