import { Serializer } from 'jsonapi-serializer';

class SellerRequestSerializer {
  constructor(options = {}) {
    const { include = [] } = options;
    this.serializer = new Serializer('seller-requests', {
      attributes: [
        'status',
        'rejectionReason',
        'createdAt',
        'updatedAt',
        'user', 
      ],
      id: 'id',
      keyForAttribute: 'camelCase',
      user: { 
        ref: 'id',
        attributes: ['name', 'email', 'role'],
      },
      include: include.includes('user') ? ['user'] : [],
    });
  }

  serialize(data) {
    return this.serializer.serialize(data);
  }
}

export default SellerRequestSerializer;