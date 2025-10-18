import SetUpStore from '../../application/use-cases/SetUpStore.js';

class StoreController {
  // US-012: Set Up My Store
  async create(req, res, next) {
    try {
      // In a real application, this would come from a JWT or session.
      const sellerId = req.user?.id || req.headers['x-dev-seller-id'];
      if (!sellerId) {
        return res.status(401).json({ message: 'Unauthorized: Seller ID is missing.' });
      }

      const storeData = {
        ...req.body,
        sellerId, // Add sellerId to the data object
      };

      const result = await SetUpStore.execute(storeData);
      
      res.status(201).json({
        message: 'Store set up successfully!',
        store: result,
      });

    } catch (err) {
      // Custom error handling
      if (err.message === 'Seller already has a store.') {
        return res.status(409).json({ message: err.message }); // 409 Conflict
      }
      next(err);
    }
  }
}

export default new StoreController();
