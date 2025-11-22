import UserRepository from '../repositories/UserRepository.js';
import AuditLogRepository from '../repositories/AuditLogRepository.js';
import { NotFoundError, AuthorizationError } from '../../domain/errors/httpErrors.js';

class SuspendUser {
    constructor() {
        this.userRepository = UserRepository;
        this.auditLogRepository = AuditLogRepository;
    }

    /**
     * Execute the use case to suspend a user
     * @param {object} params - Parameters
     * @param {string} params.userId - User ID to suspend
     * @param {string} params.adminId - Admin performing the action
     * @param {string} params.ipAddress - Request IP address
     * @param {string} params.userAgent - Request user agent
     * @returns {Promise<User>} Updated user
     */
    async execute({ userId, adminId, ipAddress, userAgent }) {
        // Prevent self-suspension
        if (userId === adminId) {
            throw new AuthorizationError('Admins cannot suspend themselves.');
        }

        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found.');
        }

        // Set isActive to false
        const updatedUser = await this.userRepository.setActive(userId, false);

        // Log the action
        await this.auditLogRepository.create({
            userId: adminId,
            action: 'user_suspend',
            entityType: 'user',
            entityId: userId,
            details: {
                previousStatus: user.is_active,
                newStatus: false,
            },
            ipAddress,
            userAgent,
        });

        return updatedUser;
    }
}

export default new SuspendUser();
