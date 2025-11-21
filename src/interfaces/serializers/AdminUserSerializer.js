import { Serializer } from 'jsonapi-serializer';

class AdminUserSerializer {
    serialize(data, options = {}) {
        const { included = [] } = options;

        const serializerOptions = {
            attributes: [
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
            keyForAttribute: 'camelCase',
            pluralizeType: false,
            typeForAttribute: (attribute) => {
                if (attribute === 'stores') return 'store';
                if (attribute === 'sellerRequests') return 'sellerRequest';
                return attribute;
            },
        };

        // Add relationships if included
        if (included.includes('stores')) {
            serializerOptions.attributes.push('stores');
            serializerOptions.stores = {
                ref: 'id',
                attributes: ['name', 'slug', 'description', 'isActive'],
            };
        }

        if (included.includes('sellerRequests')) {
            serializerOptions.attributes.push('sellerRequests');
            serializerOptions.sellerRequests = {
                ref: 'id',
                attributes: ['status', 'storeName', 'createdAt'],
            };
        }

        const UserSerializer = new Serializer('user', serializerOptions);
        return UserSerializer.serialize(data);
    }
}

export default new AdminUserSerializer();
