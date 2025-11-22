import Joi from 'joi';

export const startConversationSchema = Joi.object({
  productId: Joi.string().uuid().required(),
});
