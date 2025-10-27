// This middleware validates the request body against a Joi schema.
export const validate = (schema, target = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[target]);
  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map(d => d.message),
    });
  }
  next();
};
