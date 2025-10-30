import UserRepository from '../repositories/UserRepository.js';

class CreateUser {
  constructor() {
    this.userRepository = UserRepository;
  }

  async execute({ iamId, email, fullName }) {
    // Check if user already exists in our DB (e.g., if Firebase sync failed previously)
    const existingUser = await this.userRepository.findByIamId(iamId);
    if (existingUser) {
      console.log(`User with iamId ${iamId} already exists in our DB. Skipping creation.`);
      return existingUser;
    }

    const newUser = await this.userRepository.create({
      iamId,
      email,
      fullName,
      // Default role is 'buyer' as per User model
      // emailVerified is false by default
    });
    return newUser;
  }
}

export default new CreateUser();
