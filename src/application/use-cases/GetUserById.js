import UserRepository from '../repositories/UserRepository.js';
import { NotFoundError } from '../../domain/errors/httpErrors.js';

class GetUserById {
    constructor() {
        this.userRepository = UserRepository;
    }

    /**
     * Execute the use case to get user details by ID
     * @param {object} params - Parameters
     * @param {string} params.userId - User ID
     * @returns {Promise<User>} User with relationships
     */
    async execute({ userId }) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError('User not found.');
        }

        // Return user as-is - relationships should be loaded by repository if needed
        // For now, just attach empty arrays to satisfy serializer
        if (!user.dataValues) {
            user.dataValues = {};
        }

        if (!user.dataValues.stores) {
            user.dataValues.stores = [];
        }

        if (!user.dataValues.sellerRequests) {
            user.dataValues.sellerRequests = [];
        }

        return user;
    }
}

export default new GetUserById();
