import { sequelize } from '../../infrastructure/database/index.js';
import User from './User.js';
import Store from './Store.js';
import Category from './Category.js';
import Product from './Product.js';
import ProductImage from './ProductImage.js';
import SellerRequest from './SellerRequest.js';
import AuditLog from './AuditLog.js';
import Conversation from './Conversation.js';
import Message from './Message.js';
import ProductRating from './ProductRating.js';

const models = {
  User,
  Store,
  Category,
  Product,
  ProductImage,
  SellerRequest,
  AuditLog,
  Conversation,
  Message,
  ProductRating,
};

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

// Product 1..* ProductRating
Product.hasMany(ProductRating, {
  foreignKey: 'productId',
  as: 'ratings',
});
ProductRating.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// User 1..* ProductRating (as buyer)
User.hasMany(ProductRating, {
  foreignKey: 'buyerId',
  as: 'ratings',
});
ProductRating.belongsTo(User, {
  foreignKey: 'buyerId',
  as: 'buyer',
});

// AuditLog belongsTo User (admin)
AuditLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Conversations
Conversation.belongsTo(User, {
  foreignKey: 'buyerId',
  as: 'buyer',
});

Conversation.belongsTo(User, {
  foreignKey: 'sellerId',
  as: 'seller',
});

Conversation.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Messages
Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation',
});

Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender',
});

Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages',
});

const db = { ...models, sequelize };
export default db;
