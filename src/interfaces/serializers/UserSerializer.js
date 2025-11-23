import { Serializer } from 'jsonapi-serializer';

const UserSerializer = new Serializer('users', {
  attributes: [
    'iamId',
    'email',
    'fullName',
    'phone',
    'address',
    'profilePictureUrl',
    'role',
    'isActive',
    'emailVerified',
    'lastLogin',
    'createdAt',
    'updatedAt',
  ],
  id: 'id',
});

export default UserSerializer;
