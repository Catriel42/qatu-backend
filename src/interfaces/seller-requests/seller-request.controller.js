import CreateSellerRequest from '../../application/use-cases/CreateSellerRequest.js';
import ReviewSellerRequest from '../../application/use-cases/ReviewSellerRequest.js';
import listSellerRequests from '../../application/use-cases/ListSellerRequests.js';
import SellerRequestSerializer from '../serializers/SellerRequestSerializer.js';
import { AuthenticationError, NotFoundError, ConflictError, AuthorizationError, ValidationError } from '../../domain/errors/httpErrors.js';

class SellerRequestController {
  async list(req, res, next) {
    try {
      const requests = await listSellerRequests.execute();
      res.status(200).json(SellerRequestSerializer.serialize(requests));
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AuthenticationError('Unauthorized');

      const result = await CreateSellerRequest.execute({ ...req.body, userId });
      res.status(201).json(SellerRequestSerializer.serialize(result));
    } catch (err) {
      if (err.name === 'NotFoundError') {
        return next(new NotFoundError(err.message));
      }
      if (err.name === 'ConflictError') {
        return next(new ConflictError(err.message));
      }
      next(err);
    }
  }

  async review(req, res, next) {
    try {
      const adminId = req.user?.id; // Asume que el adminId está disponible en req.user
      if (!adminId) throw new AuthenticationError('Unauthorized');

      const { id: requestId } = req.params;
      const { status, rejectionReason } = req.body;

      const result = await ReviewSellerRequest.execute({ requestId, status, rejectionReason, adminId });
      res.status(200).json(SellerRequestSerializer.serialize(result));
    } catch (err) {
      if (err.name === 'NotFoundError') {
        return next(new NotFoundError(err.message));
      }
      if (err.name === 'ForbiddenError') {
        return next(new AuthorizationError(err.message));
      }
      if (err.name === 'ValidationError') {
        return next(new ValidationError(err.message));
      }
      next(err);
    }
  }
}

export default new SellerRequestController();
