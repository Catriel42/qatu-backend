import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).allow('', null),
  parentId: Joi.string().uuid().allow(null),
  iconUrl: Joi.string().uri().allow('', null),
  slug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(1000).allow('', null),
  parentId: Joi.string().uuid().allow(null),
  iconUrl: Joi.string().uri().allow('', null),
  isActive: Joi.boolean(),
  slug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(100),
}).min(1);
