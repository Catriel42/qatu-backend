import UserRepository from '../repositories/UserRepository.js';

class ListUsers {
    constructor() {
        this.userRepository = UserRepository;
    }

    /**
     * Execute the use case to list users with pagination and filters
     * @param {object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @param {string} params.search - Search term
     * @param {string} params.role - Filter by role
     * @param {boolean} params.isActive - Filter by active status
     * @returns {Promise<{users: Array, total: number, page: number, totalPages: number}>}
     */
    async execute(params = {}) {
        const { page = 1, limit = 10, search, role, isActive } = params;

        const { users, total } = await this.userRepository.findAll({
            page,
            limit,
            search,
            role,
            isActive,
        });

        const totalPages = Math.ceil(total / limit);

        return {
            users,
            total,
            page: parseInt(page),
            totalPages,
        };
    }
}

export default new ListUsers();
