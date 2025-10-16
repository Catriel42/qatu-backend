import { Router } from 'express';
import ProductController from './product.controller.js';
import { validate } from '../middlewares/validator.middleware.js';
import { createProductSchema } from './product.validator.js';

const router = Router();

router.post(
  '/',
  validate(createProductSchema),
  ProductController.create
);

export default router;
