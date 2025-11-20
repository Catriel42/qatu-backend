import sellerRequestRepository from '../repositories/SellerRequestRepository.js';

class ListSellerRequests {
  constructor() {
    this.sellerRequestRepository = sellerRequestRepository;
  }

  async execute(options = {}) {
    return await this.sellerRequestRepository.findAll(options);
  }
}

export default new ListSellerRequests();
