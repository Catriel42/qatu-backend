import CreateUser from '../../application/use-cases/CreateUser.js';
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
      // The user object is attached to the request by the authenticate middleware
      if (!req.user) {
        throw new NotFoundError('User not found.');
      }
      res.status(200).json(UserSerializer.serialize(req.user));
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
