/**
 * Middleware to deserialize JSON:API request bodies.
 * If the request body follows the JSON:API structure ({ data: { attributes: ... } }),
 * it replaces `req.body` with the `attributes` object.
 * This allows the controllers and use cases to work with plain objects without
 * needing to know about the JSON:API structure.
 */
export const deserializeJsonApi = (req, res, next) => {
  if (req.body && req.body.data && req.body.data.attributes) {
    // Extract the attributes and assign them to the body.
    req.body = req.body.data.attributes;
  }
  next();
};
