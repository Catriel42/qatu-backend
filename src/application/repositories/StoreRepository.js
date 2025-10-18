import db from '../../domain/models/index.js';

const { Store } = db;

class StoreRepository {
  /**
   * Creates a new store in the database.
   * @param {object} storeData - The data for the new store.
   * @returns {Promise<Store>} The created store instance.
   */
  async create(storeData) {
    try {
      const store = await Store.create(storeData);
      return store;
    } catch (error) {
      // In a real app, you'd want to handle specific DB errors
      console.error('Error creating store in repository:', error);
      throw new Error('Could not create store.');
    }
  }

  /**
   * Finds a store by its seller's ID.
   * @param {string} sellerId - The ID of the seller.
   * @returns {Promise<Store|null>} The store instance if found, otherwise null.
   */
  async findBySellerId(sellerId) {
    return Store.findOne({ where: { sellerId } });
  }
}

export default new StoreRepository();
