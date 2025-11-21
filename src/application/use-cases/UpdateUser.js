import UserRepository from '../repositories/UserRepository.js';
import AuditLogRepository from '../repositories/AuditLogRepository.js';
import { NotFoundError, AuthorizationError } from '../../domain/errors/httpErrors.js';

class UpdateUser {
    constructor() {
        this.userRepository = UserRepository;
        this.auditLogRepository = AuditLogRepository;
    }

    /**
     * Execute the use case to update a user
     * @param {object} params - Parameters
     * @param {string} params.userId - User ID to update
     * @param {string} params.adminId - Admin performing the action
     * @param {object} params.updates - Fields to update
     * @param {string} params.ipAddress - Request IP address
     * @param {string} params.userAgent - Request user agent
     * @returns {Promise<User>} Updated user
     */
    async execute({ userId, adminId, updates, ipAddress, userAgent }) {
        // Fetch the user to update
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found.');
        }

        // Prevent admin from modifying their own role or isActive status
        if (userId === adminId) {
            if (updates.role !== undefined || updates.is_active !== undefined || updates.isActive !== undefined) {
                throw new AuthorizationError('Admins cannot modify their own role or active status.');
            }
        }

        // Store old values for audit
        const oldValues = {
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            profilePictureUrl: user.profile_picture_url,
            isActive: user.is_active,
        };

        // Normalize field names (handle both camelCase and snake_case)
        const normalizedUpdates = {};
        if (updates.fullName !== undefined) normalizedUpdates.full_name = updates.fullName;
        if (updates.email !== undefined) normalizedUpdates.email = updates.email;
        if (updates.role !== undefined) normalizedUpdates.role = updates.role;
        if (updates.phone !== undefined) normalizedUpdates.phone = updates.phone;
        if (updates.address !== undefined) normalizedUpdates.address = updates.address;
        if (updates.profilePictureUrl !== undefined) normalizedUpdates.profile_picture_url = updates.profilePictureUrl;
        if (updates.isActive !== undefined) normalizedUpdates.is_active = updates.isActive;
        if (updates.is_active !== undefined) normalizedUpdates.is_active = updates.is_active;

        // Update the user
        const updatedUser = await this.userRepository.updateById(userId, normalizedUpdates);

        // Calculate changes diff
        const changes = {};
        Object.keys(normalizedUpdates).forEach(key => {
            const oldKey = key === 'full_name' ? 'fullName' :
                key === 'is_active' ? 'isActive' :
                    key === 'profile_picture_url' ? 'profilePictureUrl' : key;
            if (oldValues[oldKey] !== normalizedUpdates[key]) {
                changes[key] = { old: oldValues[oldKey], new: normalizedUpdates[key] };
            }
        });

        // Log the action
        await this.auditLogRepository.create({
            userId: adminId,
            action: 'user_update',
            entityType: 'user',
            entityId: userId,
            details: { changes },
            ipAddress,
            userAgent,
        });

        return updatedUser;
    }
}

export default new UpdateUser();
