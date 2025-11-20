import Joi from 'joi';

export const createSellerRequestSchema = Joi.object({
  storeName: Joi.string().min(3).max(255).required(),
  storeDescription: Joi.string().max(10000).allow('', null),
  businessDocuments: Joi.array().items(Joi.string().uri()).optional(),
});

export const reviewSellerRequestSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
  rejectionReason: Joi.string().when('status', {
    is: 'rejected',
    then: Joi.string().min(1).required(),
    otherwise: Joi.string().allow('', null),
  }),
});
