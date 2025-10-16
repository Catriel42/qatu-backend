import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/index.js';

class ProductImage extends Model {}

ProductImage.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    }
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  altText: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'ProductImage',
  tableName: 'product_images',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

export default ProductImage;
