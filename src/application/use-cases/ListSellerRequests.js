import sellerRequestRepository from '../repositories/SellerRequestRepository.js';

class ListSellerRequests {
  constructor() {
    this.sellerRequestRepository = sellerRequestRepository;
  }

  async execute() {
    return await this.sellerRequestRepository.findAll();
  }
}

export default new ListSellerRequests();
