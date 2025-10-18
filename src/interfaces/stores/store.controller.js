import SetUpStore from '../../application/use-cases/SetUpStore.js';
import multer from 'multer';

const MAX_LOGO_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_BANNER_SIZE = 5 * 1024 * 1024; // 5MB

class StoreController {
  // US-012: Set Up My Store
  async create(req, res, next) {
    try {
      // In a real application, this would come from a JWT or session.
      const sellerId = req.user?.id || req.headers['x-dev-seller-id'];
      if (!sellerId) {
        return res.status(401).json({ message: 'Unauthorized: Seller ID is missing.' });
      }

      // Check file sizes
      if (req.files?.logo && req.files.logo[0].size > MAX_LOGO_SIZE) {
        return res.status(400).json({ message: 'Logo file size exceeds the limit of 1MB.' });
      }
      if (req.files?.banner && req.files.banner[0].size > MAX_BANNER_SIZE) {
        return res.status(400).json({ message: 'Banner file size exceeds the limit of 5MB.' });
      }

      const storeData = {
        ...req.body,
        sellerId, // Add sellerId to the data object
        logoUrl: req.files?.logo ? `/uploads/store-assets/${req.files.logo[0].filename}` : null,
        bannerUrl: req.files?.banner ? `/uploads/store-assets/${req.files.banner[0].filename}` : null,
      };

      const result = await SetUpStore.execute(storeData);
      
      res.status(201).json({
        message: 'Store set up successfully!',
        store: result,
      });

    } catch (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      }
      // Custom error handling
      if (err.message === 'Seller already has a store.') {
        return res.status(409).json({ message: err.message }); // 409 Conflict
      }
      next(err);
    }
  }
}

export default new StoreController();
