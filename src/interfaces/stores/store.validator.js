import Joi from 'joi';

// US-012: Set Up My Store
export const createStoreSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': '"name" should be a type of \'string\'',
      'string.empty': '"name" cannot be an empty field',
      'string.min': '"name" should have a minimum length of {#limit}',
      'string.max': '"name" should have a maximum length of {#limit}',
      'any.required': '"name" is a required field'
    }),
  description: Joi.string().max(5000).optional().allow('', null)
    .messages({
      'string.max': '"description" should have a maximum length of {#limit}'
    }),
  logoUrl: Joi.string().uri().optional().allow('', null)
    .messages({
      'string.uri': '"logoUrl" must be a valid uri'
    }),
  bannerUrl: Joi.string().uri().optional().allow('', null)
    .messages({
      'string.uri': '"bannerUrl" must be a valid uri'
    }),
  shippingPolicy: Joi.string().max(10000).optional().allow('', null)
    .messages({
      'string.max': '"shippingPolicy" should have a maximum length of {#limit}'
    }),
  returnPolicy: Joi.string().max(10000).optional().allow('', null)
    .messages({
      'string.max': '"returnPolicy" should have a maximum length of {#limit}'
    }),
});
