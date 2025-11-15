import CategoryRepository from '../repositories/CategoryRepository.js';
import {
  NotFoundError,
  ConflictError,
} from '../../domain/errors/httpErrors.js';

const slugify = (name) =>
  name
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

class UpdateCategory {
  async execute({ categoryId, payload }) {
    const category = await CategoryRepository.findById(categoryId);

    if (!category) {
      throw new NotFoundError('Category not found.');
    }

    const updates = { ...payload };

    if (updates.name && !updates.slug) {
      updates.slug = slugify(updates.name);
    }

    if (updates.slug && updates.slug !== category.slug) {
      const taken = await CategoryRepository.isSlugTaken(
        updates.slug,
        categoryId
      );
      if (taken) {
        throw new ConflictError(
          'Category slug already in use by another category.'
        );
      }
    }

    const updatedCategory = await CategoryRepository.updateById(
      categoryId,
      updates
    );
    return updatedCategory;
  }
}

export default new UpdateCategory();
