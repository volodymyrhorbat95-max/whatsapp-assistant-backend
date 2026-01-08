'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing enum types if they exist (from previous migrations)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_direction" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_message_type" CASCADE');

    await queryInterface.createTable('messages', {
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
      direction: {
        type: Sequelize.ENUM('incoming', 'outgoing'),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      message_type: {
        type: Sequelize.ENUM('text', 'audio'),
        allowNull: false,
        defaultValue: 'text'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Index for fetching messages by conversation
    await queryInterface.addIndex('messages', ['conversation_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
    // Drop enum types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_direction" CASCADE');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_messages_message_type" CASCADE');
  }
};
