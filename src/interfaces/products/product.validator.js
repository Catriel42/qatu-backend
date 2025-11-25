import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
  storeId: Joi.string().uuid().optional(),
  categoryId: Joi.string().uuid().allow(null).optional(),
  imageUrls: Joi.array().items(Joi.string().uri()).max(5).optional(),
});

export const getProductDetailsSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(3).max(255),
  description: Joi.string().min(10),
  price: Joi.number().positive().precision(2),
  stock: Joi.number().integer().min(0),
  categoryId: Joi.string().uuid().allow(null),
  imagesToDelete: Joi.string().optional(),
}).min(1);
