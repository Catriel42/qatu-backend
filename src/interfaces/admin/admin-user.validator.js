import Joi from 'joi';

export const listUsersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('').optional(),
    role: Joi.string().valid('buyer', 'seller', 'admin').optional(),
    isActive: Joi.boolean().optional(),
});

export const updateUserSchema = Joi.object({
    fullName: Joi.string().min(1).max(255).optional(),
    email: Joi.string().email().max(255).optional(),
    role: Joi.string().valid('buyer', 'seller', 'admin').optional(),
    phone: Joi.string().max(50).allow('', null).optional(),
    address: Joi.string().allow('', null).optional(),
    profilePictureUrl: Joi.string().uri().max(500).allow('', null).optional(),
    isActive: Joi.boolean().optional(),
}).min(1); // At least one field must be provided

export const idParamSchema = Joi.object({
    id: Joi.string().uuid().required(),
});
