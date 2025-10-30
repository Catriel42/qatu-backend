import Joi from 'joi';

export const createStoreSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().max(10000).allow('', null),
  shippingPolicy: Joi.string().allow('', null),
  returnPolicy: Joi.string().allow('', null),
  logoUrl: Joi.string().uri().allow('', null),
  bannerUrl: Joi.string().uri().allow('', null),
  address: Joi.string().allow('', null),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null)
});

export const updateStoreSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  description: Joi.string().max(10000).allow('', null),
  logoUrl: Joi.string().uri().allow('', null),
  bannerUrl: Joi.string().uri().allow('', null),
  address: Joi.string().allow('', null),
  phone: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  is_active: Joi.boolean()
}).min(1);
