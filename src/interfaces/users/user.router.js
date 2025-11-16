import { Router } from 'express';
import UserController from './user.controller.js';
import { verifyToken } from '../middlewares/verify-token.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Get the currently authenticated user's profile
// Auth middleware for route protection
router.get('/me', authenticate, UserController.getMe);

// Auth middleware for route protection
router.post(
  '/',
  verifyToken,
  UserController.create
);

export default router;
