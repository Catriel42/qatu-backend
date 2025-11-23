import { Router } from 'express';
import UserController from './user.controller.js';
import { verifyToken } from '../middlewares/verify-token.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', authenticate, UserController.getMe);

router.patch('/me', authenticate, UserController.updateMe);

router.post(
  '/',
  verifyToken,
  UserController.create
);

export default router;
