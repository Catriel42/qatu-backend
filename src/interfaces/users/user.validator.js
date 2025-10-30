import Joi from 'joi';

export const createUserSchema = Joi.object({
  iamId: Joi.string().required(),
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
});
