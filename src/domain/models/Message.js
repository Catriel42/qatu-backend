import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/index.js';

class Message extends Model {}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'conversation_id',
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sender_id',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('sent', 'delivered', 'read'),
      allowNull: false,
      defaultValue: 'sent',
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'read_at',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: false,   
    underscored: true,
  }
);

export default Message;
