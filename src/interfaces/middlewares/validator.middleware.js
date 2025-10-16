// This middleware validates the request body against a Joi schema.
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.details.map(d => d.message),
    });
  }
  next();
};
