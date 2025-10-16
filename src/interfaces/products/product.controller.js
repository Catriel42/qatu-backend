import PublishProduct from '../../application/use-cases/PublishProduct.js';

class ProductController {
  async create(req, res, next) {
    try {
      const productData = req.body;
      // In a real-world scenario, the storeId should be derived from the
      // authenticated user's session or token to ensure they can only publish
      // to their own store. For now, we'll use the one from the request body.
      // e.g., productData.storeId = req.user.storeId;

      const newProduct = await PublishProduct.execute(productData);
      
      res.status(201).json(newProduct);
    } catch (error) {
      // A more sophisticated error-handling middleware, maybe monads, could be used here.
      next(error);
    }
  }
}

export default new ProductController();
