import { Router } from 'express';
import UserController from './user.controller.js';
import { validate } from '../middlewares/validator.middleware.js';
import { createUserSchema } from './user.validator.js';

const router = Router();

router.post(
  '/',
  validate(createUserSchema),
  UserController.create
);

export default router;
