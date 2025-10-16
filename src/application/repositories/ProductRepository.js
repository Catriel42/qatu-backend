import db from '../../domain/models/index.js';

const { Product, ProductImage } = db;

class ProductRepository {
  /**
   * Creates a new product in the database.
   * @param {object} productData - The data for the new product.
   * @param {Array<string>} imageUrls - An array of image URLs for the product.
   * @returns {Promise<Product>} The created product instance.
   */
  async create(productData, imageUrls = []) {
    const transaction = await db.sequelize.transaction();
    try {
      const product = await Product.create(productData, { transaction });

      if (imageUrls && imageUrls.length > 0) {
        const images = imageUrls.map((url, index) => ({
          productId: product.id,
          imageUrl: url,
          displayOrder: index,
          isPrimary: index === 0, // Mark the first image as primary
        }));
        await ProductImage.bulkCreate(images, { transaction });
      }

      await transaction.commit();
      
      // Return the product with its images
      return Product.findByPk(product.id, { include: ['images'] });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new ProductRepository();
