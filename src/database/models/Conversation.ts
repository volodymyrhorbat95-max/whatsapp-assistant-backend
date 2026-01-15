import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';
import Client from './Client';
import { CollectedData } from '../../types';

// Interface matching database schema
interface ConversationAttributes {
  id: number;
  clientId: number;
  customerPhone: string;
  status: 'ongoing' | 'completed' | 'abandoned' | 'transferred';
  transferReason: string | null;
  currentState: string | null;
  collectedData: CollectedData | null;
  flowType: 'delivery' | 'clothing' | null;
  startedAt: Date;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'status' | 'transferReason' | 'currentState' | 'collectedData' | 'flowType' | 'startedAt' | 'lastMessageAt' | 'createdAt' | 'updatedAt'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: number;
  public clientId!: number;
  public customerPhone!: string;
  public status!: 'ongoing' | 'completed' | 'abandoned' | 'transferred';
  public transferReason!: string | null;
  public currentState!: string | null;
  public collectedData!: CollectedData | null;
  public flowType!: 'delivery' | 'clothing' | null;
  public startedAt!: Date;
  public lastMessageAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'client_id',
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'customer_phone'
    },
    status: {
      type: DataTypes.ENUM('ongoing', 'completed', 'abandoned', 'transferred'),
      allowNull: false,
      defaultValue: 'ongoing'
    },
    transferReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'transfer_reason'
    },
    currentState: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'current_state'
    },
    collectedData: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'collected_data'
    },
    flowType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'flow_type'
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'started_at'
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_message_at'
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'conversations',
    underscored: true
  }
);

// Associations
// RESTRICT prevents accidental deletion of clients with existing conversations
Conversation.belongsTo(Client, { foreignKey: 'clientId', as: 'client', onDelete: 'RESTRICT' });
Client.hasMany(Conversation, { foreignKey: 'clientId', as: 'conversations', onDelete: 'RESTRICT' });

export default Conversation;
