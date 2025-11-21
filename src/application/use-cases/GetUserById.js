import UserRepository from '../repositories/UserRepository.js';
import { NotFoundError } from '../../domain/errors/httpErrors.js';
import db from '../../domain/models/index.js';

const { Store, SellerRequest } = db;

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

        // Eager load relationships
        const userWithRelations = await this.userRepository.findById(userId);

        // Manually load stores and seller requests if needed
        const stores = await Store.findAll({ where: { seller_id: userId } });
        const sellerRequests = await SellerRequest.findAll({ where: { user_id: userId } });

        // Attach relations to user object
        userWithRelations.dataValues.stores = stores;
        userWithRelations.dataValues.sellerRequests = sellerRequests;

        return userWithRelations;
    }
}

export default new GetUserById();
