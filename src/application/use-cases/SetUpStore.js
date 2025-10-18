import StoreRepository from '../repositories/StoreRepository.js';

class SetUpStore {
  constructor() {
    this.storeRepository = StoreRepository;
  }

  /**
   * Executes the use case to set up a new store.
   * @param {object} storeData - The data for the new store.
   * @param {string} storeData.sellerId - The ID of the seller setting up the store.
   * @param {string} storeData.name - The name of the store.
   * @param {string} storeData.description - The description of the store.
   * @param {string} [storeData.logoUrl] - The URL for the store's logo.
   * @param {string} [storeData.bannerUrl] - The URL for the store's banner.
   * @param {string} [storeData.shippingPolicy] - The store's shipping policy.
   * @param {string} [storeData.returnPolicy] - The store's return policy.
   * @returns {Promise<Store>} The created store.
   * @throws {Error} If the seller already has a store.
   * @throws {Error} If the store fails to be created.
   */
  async execute(storeData) {
    const { sellerId } = storeData;

    // 1. Check if the seller already has a store
    const existingStore = await this.storeRepository.findBySellerId(sellerId);
    if (existingStore) {
      throw new Error('Seller already has a store.');
    }

    // 2. Generate a slug from the store name
    const slug = storeData.name
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, ''); // Remove all non-word chars

    const storeToCreate = {
      ...storeData,
      slug,
    };

    // 3. Create the store
    try {
      const newStore = await this.storeRepository.create(storeToCreate);
      return newStore;
    } catch (error) {
      console.error('Error in SetUpStore use case:', error);
      throw new Error('Failed to set up store.');
    }
  }
}

export default new SetUpStore();
