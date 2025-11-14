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

  async findAll() {
    return SellerRequest.findAll();
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
