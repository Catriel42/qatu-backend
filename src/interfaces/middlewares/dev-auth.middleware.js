export const devAuth = (req, _res, next) => {
  const sellerId = req.headers['x-dev-seller-id'];
  if (sellerId) req.user = { id: sellerId };
  next();
};
