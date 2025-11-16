import { AuthenticationError, AuthorizationError } from '../../domain/errors/httpErrors.js';

// Middleware to check if the user has one of the allowed roles
export const authorize = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required.'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new AuthorizationError('Forbidden: Insufficient role privileges.'));
  }

  next();
};
