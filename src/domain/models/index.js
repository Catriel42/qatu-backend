import { sequelize } from '../../infrastructure/database/index.js';
import User from './User.js';
import Store from './Store.js';
import Category from './Category.js';
import Product from './Product.js';
import ProductImage from './ProductImage.js';

const models = {
  User,
  Store,
  Category,
  Product,
  ProductImage,
};

// Define associations
// User has one Store
User.hasOne(Store, {
  foreignKey: 'sellerId',
  as: 'store',
});
Store.belongsTo(User, {
  foreignKey: 'sellerId',
  as: 'seller',
});

// Store has many Products
Store.hasMany(Product, {
  foreignKey: 'storeId',
  as: 'products',
});
Product.belongsTo(Store, {
  foreignKey: 'storeId',
  as: 'store',
});

// Category has many Products
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products',
});
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

// Category has a self-referencing association for sub-categories
Category.hasMany(Category, {
  foreignKey: 'parentId',
  as: 'subCategories',
});
Category.belongsTo(Category, {
  foreignKey: 'parentId',
  as: 'parentCategory',
});

// Product has many ProductImages
Product.hasMany(ProductImage, {
  foreignKey: 'productId',
  as: 'images',
});
ProductImage.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});


const db = {
  ...models,
  sequelize,
};

export default db;
