class HttpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends HttpError {
  constructor(message = 'Authentication failed.') {
    super(message, 401);
  }
}

export class AuthorizationError extends HttpError {
  constructor(message = 'Forbidden.') {
    super(message, 403);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Resource not found.') {
    super(message, 404);
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict.') {
    super(message, 409);
  }
}

export class ValidationError extends HttpError {
  constructor(message = 'Validation Error.') {
    super(message, 400);
  }
}
