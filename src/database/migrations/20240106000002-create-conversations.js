'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
      customer_phone: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('ongoing', 'completed', 'abandoned', 'transferred'),
        allowNull: false,
        defaultValue: 'ongoing'
      },
      transfer_reason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      last_message_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

    // Index for finding conversations by client and customer phone
    await queryInterface.addIndex('conversations', ['client_id', 'customer_phone']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('conversations');
  }
};
