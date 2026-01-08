'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing enum types if they exist (from previous migrations)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_clients_segment" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_clients_status" CASCADE');

    await queryInterface.createTable('clients', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      segment: {
        type: Sequelize.ENUM('delivery', 'clothing'),
        allowNull: false
      },
      whatsapp_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      configuration: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('clients');
    // Drop enum types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_clients_segment" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_clients_status" CASCADE');
  }
};
