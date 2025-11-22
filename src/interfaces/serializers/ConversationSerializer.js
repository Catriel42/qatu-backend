import { Serializer } from 'jsonapi-serializer';

class ConversationSerializer {
  constructor(options = {}) {
    const currentUserId = options.currentUserId;

    this.serializer = new Serializer('conversations', {
      id: 'id',
      keyForAttribute: 'camelCase',
      attributes: [
        'buyerId',
        'sellerId',
        'productId',
        'lastMessageAt',
        'isActive',
        'unreadCount',
        'lastMessage',
        'otherUser',
        'product',
      ],
      transform: (record) => {
        const plain = record.get ? record.get({ plain: true }) : { ...record };

        const unreadCount = Number(plain.unreadCount || 0);

        const isBuyer = plain.buyerId === currentUserId;
        const otherUser = isBuyer ? plain.seller : plain.buyer;

        return {
          ...plain,
          unreadCount,
          otherUser: otherUser
            ? {
                id: otherUser.id,
                fullName: otherUser.fullName,
                profilePictureUrl: otherUser.profilePictureUrl,
                role: otherUser.role,
              }
            : null,
          product: plain.product
            ? {
                id: plain.product.id,
                name: plain.product.name,
                slug: plain.product.slug,
              }
            : null,
        };
      },
    });
  }

  serialize(data) {
    return this.serializer.serialize(data);
  }
}

export default ConversationSerializer;
