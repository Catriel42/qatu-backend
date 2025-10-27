import StoreRepository from '../repositories/StoreRepository.js';

class SetUpStore {
  constructor() {
    this.storeRepository = StoreRepository;
  }

  async execute(storeData) {
    try {
      const { sellerId } = storeData;

      const existingStore = await this.storeRepository.findBySellerId(sellerId);
      if (existingStore) {
        const error = new Error('Seller already has a store.');
        error.name = 'ConflictError';
        throw error;
      }

      const slug = storeData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '');

      const storeToCreate = {
        ...storeData,
        slug,
      };

      const newStore = await this.storeRepository.create(storeToCreate);
      return newStore;

    } catch (error) {
      if (error.name === 'ConflictError') {
        throw error;
      }
      console.error('Error in SetUpStore use case:', error);
      throw new Error('Failed to set up store.');
    }
  }
}

export default new SetUpStore();
