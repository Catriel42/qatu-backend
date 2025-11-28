import { Serializer } from 'jsonapi-serializer';

const ProductRatingSerializer = new Serializer('product-ratings', {
  attributes: [
    'rating',
    'comment',
    'createdAt',
    'buyer'
  ],
  buyer: {
    ref: 'id',
    attributes: ['fullName', 'profilePictureUrl'],
  },
  keyForAttribute: 'camelCase',
});

export default ProductRatingSerializer;
