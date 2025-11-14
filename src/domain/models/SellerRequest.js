import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/index.js';

class SellerRequest extends Model {}

SellerRequest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    }
  },
  storeName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  storeDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  businessDocuments: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    }
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'SellerRequest',
  tableName: 'seller_requests',
  timestamps: true,
  underscored: true,
});

export default SellerRequest;
