import CreateUser from '../../application/use-cases/CreateUser.js';

class UserController {
  async create(req, res, next) {
    try {
      const { iamId, email, fullName } = req.body;
      const user = await CreateUser.execute({ iamId, email, fullName });
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
