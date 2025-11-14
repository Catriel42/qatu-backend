import CreateSellerRequest from '../../application/use-cases/CreateSellerRequest.js';
import ReviewSellerRequest from '../../application/use-cases/ReviewSellerRequest.js';
import listSellerRequests from '../../application/use-cases/ListSellerRequests.js';

class SellerRequestController {
  async list(req, res, next) {
    try {
      const requests = await listSellerRequests.execute();
      res.status(200).json(requests);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const userId = req.user?.id; // Asume que el userId está disponible en req.user después de la autenticación
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const result = await CreateSellerRequest.execute({ ...req.body, userId });
      res.status(201).json(result);
    } catch (err) {
      if (err.name === 'NotFoundError') {
        return res.status(404).json({ message: err.message });
      }
      if (err.name === 'ConflictError') {
        return res.status(409).json({ message: err.message });
      }
      next(err);
    }
  }

  async review(req, res, next) {
    try {
      const adminId = req.user?.id; // Asume que el adminId está disponible en req.user
      if (!adminId) return res.status(401).json({ message: 'Unauthorized' });

      const { id: requestId } = req.params;
      const { status, rejectionReason } = req.body;

      const result = await ReviewSellerRequest.execute({ requestId, status, rejectionReason, adminId });
      res.status(200).json(result);
    } catch (err) {
      if (err.name === 'NotFoundError') {
        return res.status(404).json({ message: err.message });
      }
      if (err.name === 'ForbiddenError') {
        return res.status(403).json({ message: err.message });
      }
      if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
      }
      next(err);
    }
  }
}

export default new SellerRequestController();
