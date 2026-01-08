'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing enum types if they exist (from previous migrations)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_payment_method" CASCADE');

    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      conversation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: []
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      delivery_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      payment_method: {
        type: Sequelize.ENUM('pix', 'card', 'cash'),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Index for fetching orders by client
    await queryInterface.addIndex('orders', ['client_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
    // Drop enum types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_payment_method" CASCADE');
  }
};
