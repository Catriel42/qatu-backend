// backend/src/interfaces/serializers/ProductSerializer.js

import { Serializer } from 'jsonapi-serializer';

// Función para crear el serializador con opciones dinámicas
const createProductSerializer = (includedRelations = []) => {
  const baseConfig = {
    id: 'id',
    attributes: [
      'name',
      'description',
      'price',
      'stock',
      'createdAt',
      'updatedAt',
      'imageUrls' // Added back as a direct attribute
    ],
    keyForAttribute: 'camelCase',
    pluralizeType: true,
  };

  // Solo incluir las relaciones solicitadas explícitamente
  includedRelations.forEach(relation => {
    if (!baseConfig.attributes.includes(relation)) {
      baseConfig.attributes.push(relation);
    }
  });

  // Configurar cada relación solo si está en includedRelations
  // Configurar cada relación solo si está en includedRelations
  if (includedRelations.includes('store')) {
    baseConfig.store = {
      ref: 'id',
      included: true,
      attributes: ['name', 'logoUrl', 'description', 'sellerId']
    };
  }

  if (includedRelations.includes('images')) {
    baseConfig.images = {
      ref: 'id',
      included: true,
      attributes: ['imageUrl', 'displayOrder', 'isPrimary']
    };
  }

  if (includedRelations.includes('category')) {
    baseConfig.category = {
      ref: 'id',
      included: true,
      attributes: ['name']
    };
  }

  // Mapeo de tipos
  baseConfig.typeForAttribute = (attribute) => {
    switch (attribute) {
      case 'store':
        return 'stores';
      case 'category':
        return 'categories';
      case 'images':
        return 'product_images';
      default:
        return attribute;
    }
  };

  return new Serializer('products', baseConfig);
};

// Exportar la función en lugar del serializador
export default {
  serialize: (data, options = {}) => {
    const includes = options.included || [];
    const serializer = createProductSerializer(includes);
    return serializer.serialize(data);
  }
};
