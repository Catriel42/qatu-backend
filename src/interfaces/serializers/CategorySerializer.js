import { Serializer } from 'jsonapi-serializer';

const CategorySerializer = new Serializer('categories', {
  id: 'id',
  attributes: [
    'name',
    'slug',
    'description',
    'parentId',
    'iconUrl',
    'isActive',
    'createdAt',
    'updatedAt',
  ],
});

export default CategorySerializer;
