import Joi from 'joi';

export const createProductSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).required(),
  storeId: Joi.string().uuid().required(),
  categoryId: Joi.string().uuid().allow(null).optional(), // allow null for optional categories
  imageUrls: Joi.array().items(Joi.string().uri()).optional().max(5), // Max 5 images
});
