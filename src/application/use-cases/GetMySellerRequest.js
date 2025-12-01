import sellerRequestRepository from '../repositories/SellerRequestRepository.js';

class GetMySellerRequest {
    constructor() {
        this.sellerRequestRepository = sellerRequestRepository;
    }

    async execute(userId) {
        return await this.sellerRequestRepository.findByUserId(userId);
    }
}

export default new GetMySellerRequest();
