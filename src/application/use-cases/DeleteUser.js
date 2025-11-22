import UserRepository from '../repositories/UserRepository.js';
import AuditLogRepository from '../repositories/AuditLogRepository.js';
import { NotFoundError, AuthorizationError, ValidationError } from '../../domain/errors/httpErrors.js';

class DeleteUser {
    constructor() {
        this.userRepository = UserRepository;
        this.auditLogRepository = AuditLogRepository;
    }

    /**
     * Execute the use case to delete a user (hard delete)
     * @param {object} params - Parameters
     * @param {string} params.userId - User ID to delete
     * @param {string} params.adminId - Admin performing the action
     * @param {string} params.ipAddress - Request IP address
     * @param {string} params.userAgent - Request user agent
     * @returns {Promise<void>}
     */
    async execute({ userId, adminId, ipAddress, userAgent }) {
        // Prevent self-deletion
        if (userId === adminId) {
            throw new AuthorizationError('Admins cannot delete themselves.');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found.');
        }

        // Prevent deleting the last admin
        if (user.role === 'admin') {
            const adminCount = await this.userRepository.count({ role: 'admin' });
            if (adminCount <= 1) {
                throw new ValidationError('Cannot delete the last admin user in the system.');
            }
        }

        // Store user data for audit log before deletion
        const userData = {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
        };

        // Log the action BEFORE deletion
        await this.auditLogRepository.create({
            userId: adminId,
            action: 'user_delete',
            entityType: 'user',
            entityId: userId,
            details: { deletedUser: userData },
            ipAddress,
            userAgent,
        });

        // Hard delete the user (foreign key constraints will handle cascades)
        await this.userRepository.deleteById(userId);
    }
}

export default new DeleteUser();
