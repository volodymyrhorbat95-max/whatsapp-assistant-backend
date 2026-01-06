import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';
import Conversation from './Conversation';

// Interface matching database schema
interface MessageAttributes {
  id: number;
  conversationId: number;
  direction: 'incoming' | 'outgoing';
  content: string;
  messageType: 'text' | 'audio';
  createdAt: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'messageType' | 'createdAt'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public conversationId!: number;
  public direction!: 'incoming' | 'outgoing';
  public content!: string;
  public messageType!: 'text' | 'audio';
  public readonly createdAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'conversation_id',
      references: {
        model: 'conversations',
        key: 'id'
      }
    },
    direction: {
      type: DataTypes.ENUM('incoming', 'outgoing'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    messageType: {
      type: DataTypes.ENUM('text', 'audio'),
      allowNull: false,
      defaultValue: 'text',
      field: 'message_type'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    }
  },
  {
    sequelize,
    tableName: 'messages',
    underscored: true,
    updatedAt: false
  }
);

// Associations
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });
Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });

export default Message;
