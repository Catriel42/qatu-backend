import { Serializer } from 'jsonapi-serializer';

const ProductSerializer = new Serializer('products', {
  attributes: [
    'name',
    'description',
    'price',
    'category',
    'stock',
    'imageUrls',
    'createdAt',
    'updatedAt',
  ],
  id: 'id',
  relationships: {
    store: {
      type: 'stores',
      ref: 'store.id', // Indica dónde encontrar el ID de la tienda en el objeto producto
      included: true,  // Asegura que la tienda se incluya en el array 'included'
      attributes: ['name', 'logoUrl'], // Atributos de la tienda que queremos incluir
    },
  },
});

export default ProductSerializer;
