import db from '../../domain/models/index.js';

const { User } = db;

class UserRepository {
  async create(userData) {
    return User.create(userData);
  }

  async findByIamId(iamId) {
    return User.findOne({ where: { iamId } });
  }
}

export default new UserRepository();
