import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/index.js';

class AuditLog extends Model { }

AuditLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    entityType: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    entityId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    ipAddress: {
        type: DataTypes.INET,
        allowNull: true,
    },
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
});

export default AuditLog;
