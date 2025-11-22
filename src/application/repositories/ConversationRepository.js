import { Op } from 'sequelize';
import db from '../../domain/models/index.js';

const { Conversation, Message, User, Product, sequelize } = db;

const SORT_WHITELIST = new Set([
  'lastMessageAt:desc',
  'lastMessageAt:asc',
  'createdAt:desc',
  'createdAt:asc',
]);

function parseSort(sortStr, fallback = 'lastMessageAt:desc') {
  const raw = String(sortStr || fallback).toLowerCase();

  if (!SORT_WHITELIST.has(raw)) {
    const [fField, fDir] = fallback.split(':');
    return [fField, fDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'];
  }

  const [field, dir] = raw.split(':');
  return [field, dir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'];
}

function getMessageTableSql() {
  const t = Message.getTableName();

  if (typeof t === 'string') {
    return `"${t}"`;
  }

  if (t && t.schema) {
    return `"${t.schema}"."${t.tableName}"`;
  }

  return `"${t.tableName}"`;
}

const MESSAGE_TABLE_SQL = getMessageTableSql();

class ConversationRepository {
  async listByUser(
    userId,
    {
      page = 1,
      pageSize = 20,
      q,
      sort = 'lastMessageAt:desc',
      isActive = true,
    } = {}
  ) {
    const limit = Number(pageSize);
    const offset = (Number(page) - 1) * limit;

    const [sortField, sortDir] = parseSort(sort, 'lastMessageAt:desc');

    const where = {
      [Op.or]: [{ buyerId: userId }, { sellerId: userId }],
    };

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const attributes = {
      include: [
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM ${MESSAGE_TABLE_SQL} AS m
            WHERE
              m.conversation_id = "Conversation"."id"
              AND m.sender_id <> '${userId}'
              AND (m.status <> 'read' OR m.read_at IS NULL)
          )`),
          'unreadCount',
        ],
        [
          sequelize.literal(`(
            SELECT m.content
            FROM ${MESSAGE_TABLE_SQL} AS m
            WHERE m.conversation_id = "Conversation"."id"
            ORDER BY m.created_at DESC
            LIMIT 1
          )`),
          'lastMessage',
        ],
      ],
    };

    const include = [
      {
        model: User,
        as: 'buyer',
        attributes: ['id', 'fullName', 'profilePictureUrl', 'role'],
      },
      {
        model: User,
        as: 'seller',
        attributes: ['id', 'fullName', 'profilePictureUrl', 'role'],
      },
      {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'slug'],
      },
    ];

    if (q) {
      include[2].where = {
        name: { [Op.iLike]: `%${q}%` },
      };
      include[2].required = false;
    }

    const { rows, count } = await Conversation.findAndCountAll({
      where,
      attributes,
      include,
      order: [
        [sortField, sortDir],  
        ['createdAt', 'DESC'], 
      ],
      limit,
      offset,
      distinct: true,
    });

    return { rows, count };
  }

  async findById(conversationId) {
    return Conversation.findByPk(conversationId);
  }

  async findByParticipantsAndProduct(buyerId, sellerId, productId) {
    return Conversation.findOne({
      where: {
        buyerId,
        sellerId,
        productId,
      },
    });
  }

  async create({ buyerId, sellerId, productId }) {
    return Conversation.create({
      buyerId,
      sellerId,
      productId: productId || null,
    });
  }

  async updateLastMessageAt(conversationId, date) {
    await Conversation.update(
      { lastMessageAt: date },
      { where: { id: conversationId } }
    );
  }
}

export default new ConversationRepository();
