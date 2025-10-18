import { Router } from 'express';
import StoreController from './store.controller.js';
import { validate } from '../middlewares/validator.middleware.js';
import { createStoreSchema } from './store.validator.js';

const router = Router();

// US-012: Set Up My Store
router.post('/', validate(createStoreSchema), StoreController.create);

export default router;
