import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './index';
import { ClientConfiguration } from '../../types';

// Interface matching database schema
// CRITICAL: Must use ClientConfiguration type for type safety across the stack (rule.txt requirement)
interface ClientAttributes {
  id: number;
  name: string;
  segment: 'delivery' | 'clothing';
  whatsappNumber: string;
  status: 'active' | 'inactive';
  configuration: ClientConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientCreationAttributes extends Optional<ClientAttributes, 'id' | 'status' | 'configuration' | 'createdAt' | 'updatedAt'> {}

class Client extends Model<ClientAttributes, ClientCreationAttributes> implements ClientAttributes {
  public id!: number;
  public name!: string;
  public segment!: 'delivery' | 'clothing';
  public whatsappNumber!: string;
  public status!: 'active' | 'inactive';
  public configuration!: ClientConfiguration;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Client.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    segment: {
      type: DataTypes.ENUM('delivery', 'clothing'),
      allowNull: false
    },
    whatsappNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'whatsapp_number'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active'
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
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
    tableName: 'clients',
    underscored: true
  }
);

export default Client;
