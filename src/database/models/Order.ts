import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';
import Conversation from './Conversation';
import Client from './Client';

// OrderItem interface matching types/index.ts
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

// Interface matching database schema
interface OrderAttributes {
  id: number;
  conversationId: number;
  clientId: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: OrderItem[];
  totalAmount: number | null;
  deliveryAddress: string | null;
  paymentMethod: 'pix' | 'card' | 'cash' | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status' | 'items' | 'totalAmount' | 'deliveryAddress' | 'paymentMethod' | 'createdAt' | 'updatedAt'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public conversationId!: number;
  public clientId!: number;
  public status!: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  public items!: OrderItem[];
  public totalAmount!: number | null;
  public deliveryAddress!: string | null;
  public paymentMethod!: 'pix' | 'card' | 'cash' | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
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
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'client_id',
      references: {
        model: 'clients',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'total_amount'
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'delivery_address'
    },
    paymentMethod: {
      type: DataTypes.ENUM('pix', 'card', 'cash'),
      allowNull: true,
      field: 'payment_method'
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
    tableName: 'orders',
    underscored: true
  }
);

// Associations
// RESTRICT prevents accidental deletion of conversations/clients with existing orders
Order.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation', onDelete: 'RESTRICT' });
Order.belongsTo(Client, { foreignKey: 'clientId', as: 'client', onDelete: 'RESTRICT' });
Conversation.hasOne(Order, { foreignKey: 'conversationId', as: 'order', onDelete: 'RESTRICT' });
Client.hasMany(Order, { foreignKey: 'clientId', as: 'orders', onDelete: 'RESTRICT' });

export default Order;
