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
    // Fix: Use the correct snake_case column name
    return User.findOne({ where: { iam_id: iamId } });
  }

  async findByColumn(column, value) {
    return User.findOne({ where: { [column]: value } });
  }
}

export default new UserRepository();
