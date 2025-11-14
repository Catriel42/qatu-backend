import { Serializer } from 'jsonapi-serializer';

const ProductSerializer = new Serializer('products', {
  attributes: [
    'name',
    'description',
    'price',
    'category',
    'stock',
    'sellerId',
    'imageUrls',
    'createdAt',
    'updatedAt',
  ],
  id: 'id',
  // You can add relationships here if you need, for example:
  // relationships: {
  //   seller: {
  //     type: 'users',
  //     attributes: ['username', 'email'],
  //   },
  // },
  // For more options, refer to the jsonapi-serializer documentation: https://github.com/SeyZ/jsonapi-serializer
  // Cato
});

export default ProductSerializer;
