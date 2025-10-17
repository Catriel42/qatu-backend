import ProductRepository from '../repositories/ProductRepository.js';

class PublishProduct {
  constructor() {
    this.productRepository = ProductRepository;
  }

  /**
   * Executes the use case to publish a new product.
   * @param {object} productData - The data for the new product.
   * @param {string} productData.name - The name of the product.
   * @param {string} productData.description - The description of the product.
   * @param {number} productData.price - The price of the product.
   * @param {number} productData.stock - The stock quantity of the product.
   * @param {string} productData.storeId - The ID of the store this product belongs to.
   * @param {string} [productData.categoryId] - The ID of the category.
   * @param {Array<string>} [productData.imageUrls] - An array of image URLs.
   * @returns {Promise<Product>} The created product.
   */
  async execute({ name, description, price, stock, storeId, categoryId, imageUrls }) {
    
    const productToCreate = {
      name,
      description,
      price,
      stock,
      storeId,
      categoryId,
    };

    try {
      const newProduct = await this.productRepository.create(productToCreate, imageUrls);
      return newProduct;
    } catch (error) {
      
      console.error('Error in PublishProduct use case:', error);
      
      throw new Error('Failed to publish product.');
    }
  }
}

export default new PublishProduct();
