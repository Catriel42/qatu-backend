import { Serializer } from 'jsonapi-serializer';

class MessageSerializer {
  constructor() {
    this.serializer = new Serializer('messages', {
      id: 'id',
      keyForAttribute: 'camelCase',
      attributes: [
        'conversationId',
        'senderId',
        'content',
        'status',
        'readAt',
        'createdAt',
      ],
      transform: record =>
        record.get ? record.get({ plain: true }) : { ...record },
    });
  }

  serialize(data) {
    return this.serializer.serialize(data);
  }
}

export default MessageSerializer;
