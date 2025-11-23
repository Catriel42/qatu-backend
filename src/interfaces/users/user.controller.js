import CreateUser from '../../application/use-cases/CreateUser.js';
import UpdateUser from '../../application/use-cases/UpdateUser.js';
import UserSerializer from '../serializers/UserSerializer.js';
import { NotFoundError } from '../../domain/errors/httpErrors.js';

class UserController {
  async create(req, res, next) {
    try {
      // Data now comes from the verified token, not the request body
      const { uid: iamId, email } = req.decodedToken;
      const { fullName } = req.body;

      const user = await CreateUser.execute({ iamId, email, fullName });
      res.status(201).json(UserSerializer.serialize(user));
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      if (!req.user) {
        throw new NotFoundError('User not found.');
      }
      res.status(200).json(UserSerializer.serialize(req.user));
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req, res, next) {
    try {
      if (!req.user) {
        throw new NotFoundError('User not found.');
      }

      const { fullName, phone, address, profilePictureUrl } = req.body;
      const updates = {};

      if (fullName !== undefined) updates.fullName = fullName;
      if (phone !== undefined) updates.phone = phone;
      if (address !== undefined) updates.address = address;
      if (profilePictureUrl !== undefined) updates.profilePictureUrl = profilePictureUrl;

      const updatedUser = await UpdateUser.execute({
        userId: req.user.id,
        adminId: req.user.id,
        updates,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(200).json(UserSerializer.serialize(updatedUser));
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
