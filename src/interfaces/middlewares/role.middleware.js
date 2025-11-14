import { AuthenticationError, AuthorizationError } from '../../domain/errors/httpErrors.js';

export const authorize = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required.'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new AuthorizationError('Forbidden: Insufficient role privileges.'));
  }

  next();
};
