import CreateUser from '../../application/use-cases/CreateUser.js';

class UserController {
  async create(req, res, next) {
    try {
      // Data now comes from the verified token, not the request body
      const { uid: iamId, email } = req.decodedToken;
      const { fullName } = req.body;

      const user = await CreateUser.execute({ iamId, email, fullName });
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      // The user object is attached to the request by the authenticate middleware
      if (!req.user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json(req.user);
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
