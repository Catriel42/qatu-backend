import StoreRepository from '../repositories/StoreRepository.js';

class UpdateStore {
  async execute({ sellerId, storeId, payload }) {
    const store = await StoreRepository.findById(storeId);
    if (!store) throw new Error('Store not found');
    if (store.sellerId !== sellerId) {
      const err = new Error('Forbidden');
      err.status = 403;
      throw err;
    }

    if (payload.name && payload.name !== store.name) {
      const taken = await StoreRepository.isNameTaken(payload.name, storeId);
      if (taken) {
        const err = new Error('Store name already in use by another store.');
        err.code = 'DUPLICATE_NAME';
        err.status = 409;
        throw err;
      }
    }

    const updated = await StoreRepository.updateById(storeId, payload);
    return updated;
  }
}

export default new UpdateStore();
