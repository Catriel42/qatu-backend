import db from '../../domain/models/index.js';

const { SellerRequest, User } = db;

class SellerRequestRepository {
  async create(requestData) {
    return SellerRequest.create(requestData);
  }

  async findByUserId(userId) {
    return SellerRequest.findOne({ where: { userId } });
  }

  async findById(id) {
    return SellerRequest.findByPk(id);
  }

  async findAll(options = {}) {
    const queryOptions = {
      order: [['createdAt', 'DESC']],
    };
    if (options.include && options.include.includes('user')) {
      queryOptions.include = [{ model: User, as: 'user' }];
    }
    return SellerRequest.findAll(queryOptions);
  }

  async updateStatus(id, status, rejectionReason = null, reviewedBy = null) {
    const updateData = { status };
    if (rejectionReason) updateData.rejectionReason = rejectionReason;
    if (reviewedBy) updateData.reviewedBy = reviewedBy;
    updateData.reviewedAt = new Date();

    await SellerRequest.update(updateData, { where: { id } });
    return this.findById(id);
  }
}

export default new SellerRequestRepository();
