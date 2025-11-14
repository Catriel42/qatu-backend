import { Serializer } from 'jsonapi-serializer';

const UserSerializer = new Serializer('users', {
  attributes: [
    'iamId',
    'email',
    'fullName',
    'role',
    'createdAt',
    'updatedAt',
  ],
  id: 'id',
});

export default UserSerializer;
