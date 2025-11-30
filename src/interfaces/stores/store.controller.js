import SetUpStore from '../../application/use-cases/SetUpStore.js';
import UpdateStore from '../../application/use-cases/UpdateStore.js';
import StoreSerializer from '../serializers/StoreSerializer.js';
import multer from 'multer';
import { ValidationError, ConflictError, NotFoundError } from '../../domain/errors/httpErrors.js';
import StoreRepository from '../../application/repositories/StoreRepository.js';

const MAX_LOGO_SIZE = 1 * 1024 * 1024;
const MAX_BANNER_SIZE = 5 * 1024 * 1024;

class StoreController {
  async create(req, res, next) {
    try {
      const sellerId = req.user.id;

      const files = req.files || {};
      const body = { ...req.body, sellerId };

      if (files.logo?.[0]) {
        if (files.logo[0].size > MAX_LOGO_SIZE) throw new ValidationError('Logo file too large (max 1MB).');
        body.logoUrl = `/uploads/store-assets/${files.logo[0].filename}`;
      }
      if (files.banner?.[0]) {
        if (files.banner[0].size > MAX_BANNER_SIZE) throw new ValidationError('Banner file too large (max 5MB).');
        body.bannerUrl = `/uploads/store-assets/${files.banner[0].filename}`;
      }

      const store = await SetUpStore.execute(body);
      res.status(201).json(StoreSerializer.serialize(store));
    } catch (err) {
      if (err instanceof multer.MulterError) return next(new ValidationError(err.message));
      next(err);
    }
  }

  async getMyStore(req, res, next) {
    try {
      const sellerId = req.user.id;
      const store = await StoreRepository.findBySellerId(sellerId);

      if (!store) {
        throw new NotFoundError('No store found for the current user.');
      }

      res.status(200).json(StoreSerializer.serialize(store));
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const sellerId = req.user.id;

      const { id } = req.params;
      const files = req.files || {};
      const payload = { ...req.body };

      if (files.logo?.[0]) {
        if (files.logo[0].size > MAX_LOGO_SIZE) throw new ValidationError('Logo file too large (max 1MB).');
        payload.logoUrl = `/uploads/store-assets/${files.logo[0].filename}`;
      }
      if (files.banner?.[0]) {
        if (files.banner[0].size > MAX_BANNER_SIZE) throw new ValidationError('Banner file too large (max 5MB).');
        payload.bannerUrl = `/uploads/store-assets/${files.banner[0].filename}`;
      }

      const updated = await UpdateStore.execute({ sellerId, storeId: id, payload });
      res.json(StoreSerializer.serialize(updated));
    } catch (err) {
      if (err.code === 'DUPLICATE_NAME') return next(new ConflictError(err.message));
      if (err.status) return next(err);
      next(err);
    }
  }
}

export default new StoreController();

