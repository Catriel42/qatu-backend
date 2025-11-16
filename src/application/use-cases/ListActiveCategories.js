import CategoryRepository from '../repositories/CategoryRepository.js';

class ListActiveCategories {
  async execute() {
    const categories = await CategoryRepository.listActive();
    return categories;
  }
}

export default new ListActiveCategories();
