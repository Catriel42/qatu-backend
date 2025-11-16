import CategoryRepository from '../repositories/CategoryRepository.js';
import {
  ValidationError,
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

class CreateCategory {
  async execute({ name, description, parentId, iconUrl, slug }) {
    if (!name) {
      throw new ValidationError('Category name is required.');
    }

    const finalSlug =
      slug && slug.trim().length > 0
        ? slug.trim().toLowerCase()
        : slugify(name);

    const slugTaken = await CategoryRepository.isSlugTaken(finalSlug);
    if (slugTaken) {
      throw new ConflictError('Category slug already in use.');
    }

    const category = await CategoryRepository.create({
      name,
      description,
      parentId: parentId || null,
      iconUrl: iconUrl || null,
      slug: finalSlug,
    });

    return category;
  }
}

export default new CreateCategory();
