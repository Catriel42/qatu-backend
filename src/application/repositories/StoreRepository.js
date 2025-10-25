import db from '../../domain/models/index.js';
import { Op } from 'sequelize';

const { Store } = db;

class StoreRepository {
  async findById(id) {
    return Store.findByPk(id);
  }

  async isNameTaken(name, excludeStoreId = null) {
    const where = excludeStoreId
      ? { name, id: { [Op.ne]: excludeStoreId } }
      : { name };
    const found = await Store.findOne({ where });
    return !!found;
  }

  async updateById(id, payload) {
    await Store.update(payload, { where: { id } });
    return this.findById(id);
  }
}

export default new StoreRepository();
