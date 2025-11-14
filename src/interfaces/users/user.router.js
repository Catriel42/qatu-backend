import { Router } from 'express';
import UserController from './user.controller.js';
import { verifyToken } from '../middlewares/verify-token.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Get the currently authenticated user's profile
router.get('/me', authenticate, UserController.getMe);

router.post(
  '/',
  verifyToken,
  UserController.create
);

export default router;
