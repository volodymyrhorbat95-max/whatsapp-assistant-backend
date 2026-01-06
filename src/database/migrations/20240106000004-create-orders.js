'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
        type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'delivered', 'cancelled'),
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
  }
};
