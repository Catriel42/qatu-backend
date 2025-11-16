import { Router } from 'express';
import SellerRequestController from './seller-request.controller.js';
import { validate } from '../middlewares/validator.middleware.js';
import { createSellerRequestSchema, reviewSellerRequestSchema } from './seller-request.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';

const router = Router();

// Endpoint para que un administrador obtenga todas las solicitudes de vendedor
router.get(
  '/',
  // Auth middleware for route protection
  authenticate,
  authorize(['admin']),
  SellerRequestController.list
);

// Endpoint para que un comprador cree una solicitud de vendedor
router.post(
  '/',
  // Auth middleware for route protection
  authenticate,
  authorize(['buyer']),
  validate(createSellerRequestSchema),
  SellerRequestController.create
);

// Endpoint para que un administrador revise una solicitud de vendedor
router.patch(
  '/:id/review',
  // Auth middleware for route protection
  authenticate,
  authorize(['admin']),
  validate(reviewSellerRequestSchema),
  SellerRequestController.review
);

export default router;
