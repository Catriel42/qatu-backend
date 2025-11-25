import { Router } from 'express';
import ConversationController from './conversation.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { startConversationSchema } from './conversation.validator.js';

const router = Router();

router.get('/mine', authenticate, ConversationController.listMine);

router.post(
  '/',
  authenticate,
  validate({ body: startConversationSchema }),
  ConversationController.start
);

export default router;
