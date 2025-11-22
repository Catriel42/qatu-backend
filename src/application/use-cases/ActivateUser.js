import UserRepository from '../repositories/UserRepository.js';
import AuditLogRepository from '../repositories/AuditLogRepository.js';
import { NotFoundError } from '../../domain/errors/httpErrors.js';

class ActivateUser {
    constructor() {
        this.userRepository = UserRepository;
        this.auditLogRepository = AuditLogRepository;
    }

    /**
     * Execute the use case to activate a user
     * @param {object} params - Parameters
     * @param {string} params.userId - User ID to activate
     * @param {string} params.adminId - Admin performing the action
     * @param {string} params.ipAddress - Request IP address
     * @param {string} params.userAgent - Request user agent
     * @returns {Promise<User>} Updated user
     */
    async execute({ userId, adminId, ipAddress, userAgent }) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found.');
        }

        // Set isActive to true
        const updatedUser = await this.userRepository.setActive(userId, true);

        // Log the action
        await this.auditLogRepository.create({
            userId: adminId,
            action: 'user_activate',
            entityType: 'user',
            entityId: userId,
            details: {
                previousStatus: user.is_active,
                newStatus: true,
            },
            ipAddress,
            userAgent,
        });

        return updatedUser;
    }
}

export default new ActivateUser();
