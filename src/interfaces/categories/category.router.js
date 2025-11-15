import { Router } from 'express';
import CategoryController from './category.controller.js';
import { validate } from '../middlewares/validator.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from './category.validator.js';

const router = Router();

// Publico: listar activas
router.get('/', CategoryController.listPublic);

// Admin: crear 
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validate(createCategorySchema),
  CategoryController.create
);

// Admin: actualizar
router.patch(
  '/:id',
  authenticate,
  authorize(['admin']),
  validate(updateCategorySchema),
  CategoryController.update
);

export default router;
