import SellerRequestRepository from '../repositories/SellerRequestRepository.js';
import UserRepository from '../repositories/UserRepository.js';
import StoreRepository from '../repositories/StoreRepository.js';

class CreateSellerRequest {
  constructor() {
    this.sellerRequestRepository = SellerRequestRepository;
    this.userRepository = UserRepository;
    this.storeRepository = StoreRepository;
  }

  async execute({ userId }) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found.');
      error.name = 'NotFoundError';
      throw error;
    }

    if (user.role === 'seller') {
      const error = new Error('User is already a seller.');
      error.name = 'ConflictError';
      throw error;
    }

    const existingStore = await this.storeRepository.findBySellerId(userId);
    if (existingStore) {
      const error = new Error('User already has a store.');
      error.name = 'ConflictError';
      throw error;
    }

    const existingRequest = await this.sellerRequestRepository.findByUserId(userId);
    if (existingRequest && existingRequest.status === 'pending') {
      const error = new Error('A pending seller request already exists for this user.');
      error.name = 'ConflictError';
      throw error;
    }

    const newRequest = await this.sellerRequestRepository.create({
      userId,
      status: 'pending',
    });

    return newRequest;
  }
}

export default new CreateSellerRequest();
