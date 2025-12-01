import CreateSellerRequest from '../../application/use-cases/CreateSellerRequest.js';
import ReviewSellerRequest from '../../application/use-cases/ReviewSellerRequest.js';
import listSellerRequests from '../../application/use-cases/ListSellerRequests.js';
import GetMySellerRequest from '../../application/use-cases/GetMySellerRequest.js';
import SellerRequestSerializer from '../serializers/SellerRequestSerializer.js';
import { AuthenticationError, NotFoundError, ConflictError, AuthorizationError, ValidationError } from '../../domain/errors/httpErrors.js';

class SellerRequestController {
  async list(req, res, next) {
    try {
      const { include } = req.query;
      const options = { include: include ? include.split(',') : [] };

      const requests = await listSellerRequests.execute(options);

      const serializer = new SellerRequestSerializer(options);
      res.status(200).json(serializer.serialize(requests));
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AuthenticationError('Unauthorized');

      const result = await CreateSellerRequest.execute({ userId });
      const serializer = new SellerRequestSerializer();
      res.status(201).json(serializer.serialize(result));
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
      const adminId = req.user?.id;
      if (!adminId) throw new AuthenticationError('Unauthorized');

      const { id: requestId } = req.params;
      const { status, rejectionReason } = req.body;

      const result = await ReviewSellerRequest.execute({ requestId, status, rejectionReason, adminId });
      const serializer = new SellerRequestSerializer();
      res.status(200).json(serializer.serialize(result));
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

  async getMyRequest(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AuthenticationError('Unauthorized');

      const result = await GetMySellerRequest.execute(userId);
      if (!result) {
        return res.status(404).json({ message: 'No seller request found' });
      }

      const serializer = new SellerRequestSerializer();
      res.status(200).json(serializer.serialize(result));
    } catch (err) {
      next(err);
    }
  }
}

export default new SellerRequestController();
