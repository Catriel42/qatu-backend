import db from '../../domain/models/index.js';

const { AuditLog } = db;

class AuditLogRepository {
    /**
     * Create an audit log entry
     * @param {object} auditData - The audit data
     * @param {string} auditData.userId - Admin user ID
     * @param {string} auditData.action - Action performed
     * @param {string} auditData.entityType - Type of entity (e.g., 'user')
     * @param {string} auditData.entityId - ID of the entity affected
     * @param {object} auditData.details - Additional details (changes, metadata)
     * @param {string} auditData.ipAddress - IP address of the request
     * @param {string} auditData.userAgent - User agent string
     * @returns {Promise<AuditLog>} Created audit log entry
     */
    async create(auditData) {
        return AuditLog.create(auditData);
    }

    /**
     * Find audit logs by entity
     * @param {string} entityType - Entity type
     * @param {string} entityId - Entity ID
     * @returns {Promise<Array<AuditLog>>} Audit log entries
     */
    async findByEntity(entityType, entityId) {
        return AuditLog.findAll({
            where: { entityType, entityId },
            order: [['created_at', 'DESC']],
            include: [{
                association: 'user',
                attributes: ['id', 'fullName', 'email'],
            }],
        });
    }
}

export default new AuditLogRepository();
