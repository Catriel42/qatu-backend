import { Router } from 'express';
import MessageController from './message.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import {
  sendMessageSchema,
  conversationIdParamSchema,
  listMessagesQuerySchema,
} from './message.validator.js';

const router = Router();

router.post(
  '/:conversationId/messages',
  authenticate,
  validate({ params: conversationIdParamSchema, body: sendMessageSchema }),
  MessageController.send
);

router.get(
  '/:conversationId/messages',
  authenticate,
  validate({ params: conversationIdParamSchema, query: listMessagesQuerySchema }),
  MessageController.listByConversation
);

export default router;
