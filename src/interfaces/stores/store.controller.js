import SetUpStore from '../../application/use-cases/SetUpStore.js';
import UpdateStore from '../../application/use-cases/UpdateStore.js';
import multer from 'multer';

const MAX_LOGO_SIZE = 1 * 1024 * 1024;
const MAX_BANNER_SIZE = 5 * 1024 * 1024;

class StoreController {
  async create(req, res, next) {
    try {
      const sellerId = req.user?.id || req.headers['x-dev-seller-id'];
      if (!sellerId) return res.status(401).json({ message: 'Unauthorized' });

      const files = req.files || {};
      const body = { ...req.body, sellerId };

      if (files.logo?.[0]) {
        if (files.logo[0].size > MAX_LOGO_SIZE) return res.status(400).json({ message: 'Logo file too large (max 1MB).' });
        body.logoUrl = `/uploads/store-assets/${files.logo[0].filename}`;
      }
      if (files.banner?.[0]) {
        if (files.banner[0].size > MAX_BANNER_SIZE) return res.status(400).json({ message: 'Banner file too large (max 5MB).' });
        body.bannerUrl = `/uploads/store-assets/${files.banner[0].filename}`;
      }

      const store = await SetUpStore.execute(body);
      res.status(201).json(store);
    } catch (err) {
      if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const sellerId = req.user?.id || req.headers['x-dev-seller-id'];
      if (!sellerId) return res.status(401).json({ message: 'Unauthorized' });

      const { id } = req.params;
      const files = req.files || {};
      const payload = { ...req.body };

      if (files.logo?.[0]) {
        if (files.logo[0].size > MAX_LOGO_SIZE) return res.status(400).json({ message: 'Logo file too large (max 1MB).' });
        payload.logoUrl = `/uploads/store-assets/${files.logo[0].filename}`;
      }
      if (files.banner?.[0]) {
        if (files.banner[0].size > MAX_BANNER_SIZE) return res.status(400).json({ message: 'Banner file too large (max 5MB).' });
        payload.bannerUrl = `/uploads/store-assets/${files.banner[0].filename}`;
      }

      const updated = await UpdateStore.execute({ sellerId, storeId: id, payload });
      res.json(updated);
    } catch (err) {
      if (err.code === 'DUPLICATE_NAME') return res.status(409).json({ message: err.message });
      if (err.status) return res.status(err.status).json({ message: err.message });
      next(err);
    }
  }
}

export default new StoreController();
