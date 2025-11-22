import db from '../../domain/models/index.js';

const { User } = db;

class UserRepository {
  async create(userData) {
    return User.create(userData);
  }

  async findById(id) {
    return User.findByPk(id);
  }

  async findByIamId(iamId) {
    return User.findOne({ where: { iam_id: iamId } });
  }

  async findByColumn(column, value) {
    return User.findOne({ where: { [column]: value } });
  }

  /**
   * Find all users with pagination and filters
   * @param {object} options - Query options
   * @param {number} options.page - Page number (1-indexed)
   * @param {number} options.limit - Items per page
   * @param {string} options.search - Search term (fullName or email)
   * @param {string} options.role - Filter by role
   * @param {boolean} options.isActive - Filter by active status
   * @returns {Promise<{users: Array, total: number}>}
   */
  async findAll(options = {}) {
    const { page = 1, limit = 10, search, role, isActive } = options;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      const { Op } = await import('sequelize');
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.is_active = isActive;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['iam_id'] },
    });

    return { users: rows, total: count };
  }

  /**
   * Count users matching filters
   * @param {object} filters - Filter criteria
   * @returns {Promise<number>}
   */
  async count(filters = {}) {
    return User.count({ where: filters });
  }

  /**
   * Update user by ID
   * @param {string} userId - User ID
   * @param {object} updates - Fields to update
   * @returns {Promise<User>}
   */
  async updateById(userId, updates) {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }
    return user.update(updates);
  }

  /**
   * Delete user by ID (hard delete)
   * @param {string} userId - User ID
   * @returns {Promise<number>} Number of rows deleted
   */
  async deleteById(userId) {
    return User.destroy({ where: { id: userId } });
  }

  /**
   * Set user active status
   * @param {string} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<User>}
   */
  async setActive(userId, isActive) {
    return this.updateById(userId, { isActive: isActive });
  }
}

export default new UserRepository();
