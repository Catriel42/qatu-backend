import { Serializer } from 'jsonapi-serializer';

const StoreSerializer = new Serializer('stores', {
  attributes: [
    'name',
    'description',
    'sellerId',
    'logoUrl',
    'bannerUrl',
    'createdAt',
    'updatedAt',
  ],
  id: 'id',
});

export default StoreSerializer;
