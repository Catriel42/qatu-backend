import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
});

export const conversationIdParamSchema = Joi.object({
  conversationId: Joi.string().uuid().required(),
});

export const listMessagesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(50),
});
