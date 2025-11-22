// This middleware validates the request against Joi schemas.
// Can validate body, query, params, or a combination
export const validate = (...args) => (req, res, next) => {
  // Support legacy single schema format: validate(schema, 'body')
  if (args.length === 2 && typeof args[1] === 'string') {
    const [schema, target] = args;
    const { error } = schema.validate(req[target]);
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.details.map(d => d.message),
      });
    }
    return next();
  }

  // New format: validate({ body: schema, query: schema2, params: schema3 })
  const [schemas] = args;
  const errors = [];

  if (schemas.body) {
    const { error } = schemas.body.validate(req.body);
    if (error) errors.push(...error.details.map(d => ({ field: 'body', message: d.message })));
  }

  if (schemas.query) {
    const { error } = schemas.query.validate(req.query);
    if (error) errors.push(...error.details.map(d => ({ field: 'query', message: d.message })));
  }

  if (schemas.params) {
    const { error } = schemas.params.validate(req.params);
    if (error) errors.push(...error.details.map(d => ({ field: 'params', message: d.message })));
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.map(e => e.message),
    });
  }

  next();
};
