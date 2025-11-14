import { Serializer } from 'jsonapi-serializer';

const SellerRequestSerializer = new Serializer('seller-requests', {
  attributes: [
    'userId',
    'status',
    'rejectionReason',
    'createdAt',
    'updatedAt',
  ],
  id: 'id',
});

export default SellerRequestSerializer;
