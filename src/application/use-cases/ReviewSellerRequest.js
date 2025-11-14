import SellerRequestRepository from '../repositories/SellerRequestRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import db from '../../domain/models/index.js';

class ReviewSellerRequest {
  constructor() {
    this.sellerRequestRepository = SellerRequestRepository;
    this.userRepository = UserRepository;
  }

  async execute({ requestId, status, rejectionReason, adminId }) {
    const transaction = await db.sequelize.transaction();
    try {
      const request = await this.sellerRequestRepository.findById(requestId);
      if (!request) {
        const error = new Error('Seller request not found.');
        error.name = 'NotFoundError';
        throw error;
      }

      if (request.status !== 'pending') {
        const error = new Error('Seller request has already been reviewed.');
        error.name = 'ValidationError';
        throw error;
      }

      if (status === 'rejected' && !rejectionReason) {
        const error = new Error('Rejection reason is required when rejecting a request.');
        error.name = 'ValidationError';
        throw error;
      }

      const updatedRequest = await this.sellerRequestRepository.updateStatus(
        requestId,
        status,
        rejectionReason,
        adminId,
        { transaction }
      );

      if (status === 'approved') {
        const user = await this.userRepository.findById(request.userId);
        if (!user) {
          const error = new Error('User associated with seller request not found.');
          error.name = 'NotFoundError';
          throw error;
        }
        user.role = 'seller';
        await user.save({ transaction });
      }

      await transaction.commit();
      return updatedRequest;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new ReviewSellerRequest();
